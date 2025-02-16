Asset Management in Expo SDK 52 with Three.js

Overview

Using Three.js in a React Native Expo (SDK 52) project requires special handling for assets like textures, 3D models, and sounds. The Metro bundler doesn’t natively handle arbitrary asset types (e.g. .glb models) and file URIs, so you need a robust asset management strategy. We’ll implement an Asset Manager module that uses Expo’s asset system to load and cache assets from both local and remote sources, then integrate these assets with Three.js (via expo-three and expo-gl) for rendering. This approach follows Expo’s latest recommendations and community best practices for Expo SDK 52, ensuring compatibility and optimal performance.

Required Libraries and Setup

To set up Three.js with Expo and manage assets efficiently, make sure to install the following libraries:
	•	expo-asset – Expo’s asset system for downloading and caching assets (images, models, etc.) at runtime ￼.
	•	expo-file-system – Low-level file access. Often used internally by expo-asset for downloading files from URLs ￼ ￼.
	•	expo-gl – Provides a GLView component (OpenGL ES context) to render 2D/3D graphics in Expo ￼.
	•	expo-three – Bridges Three.js with Expo’s GLView, abstracting away browser/DOM specifics ￼. This allows Three.js (three package) to run in React Native.
	•	three – The Three.js library itself (a peer dependency of expo-three) ￼.
	•	expo-av – Expo’s audio/video API for loading and playing sound files in React Native ￼.

Install these in your project (using expo install for Expo SDK modules and yarn/npm for others). For example:

npx expo install expo-asset expo-file-system expo-gl expo-av
npm install three expo-three    # or yarn add three expo-three

Metro bundler configuration: To load non-standard asset types (GLTF/GLB models, sound files, etc.), update your metro.config.js to include those file extensions. Expo’s Three.js docs note that by default Metro may not bundle files like .obj, .glb, .mp3 etc. ￼. For example, you can extend the asset resolver like so:

metro.config.js:

const { getDefaultConfig } = require('@expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push(
  'glb', 'gltf', // 3D model formats
  'mp3', 'wav', 'ogg' // audio formats
);

module.exports = defaultConfig;

This ensures Metro treats these files as assets (not code) and makes them available at runtime.

Note: If you use Expo’s development build or EAS, you might also configure the expo-asset plugin in app.json to embed certain assets at build time (optional). For example, to bundle a large model in the app, you can list it in the plugin config so it’s available by resource name ￼. This is not required when using require(...) in code, but it’s an option for assets you want included without explicitly requiring them.

Implementing the Asset Manager Module

The Asset Manager will provide a unified interface to load textures (images), 3D models, and sound files from either local bundler assets or remote URLs. It will handle:
	•	Resolving URIs for Expo: Expo requires a file URI or module reference for assets. We’ll use expo-asset to convert a local asset (via require) or remote URL into a local file URI that Three.js can use. According to Expo’s Three.js utilities, “All assets require a local URI to be loaded. You can resolve a local URI with expo-asset.” ￼. This is crucial because Three.js loaders cannot directly use the module number from require or a remote URL in this environment.
	•	Caching: Assets will be cached both on disk (by expo-asset) and in memory. Expo’s asset system will avoid re-downloading files if they are already in the cache (it only downloads if an up-to-date file isn’t present) ￼. We’ll also keep in-memory references (e.g. loaded THREE.Texture or parsed model) to avoid duplicate parsing or object creation if the same asset is requested multiple times.
	•	Async loading: All loading functions return Promises, making it easy to await asset loads. This is important to, for example, preload assets on app startup or show a loading indicator until assets are ready.
	•	Integration with Three.js: The manager will use Three.js loaders (from three or expo-three) to parse assets once we have a file URI. For textures, we can use Three’s TextureLoader. For GLTF/GLB models, we use Three’s GLTFLoader. Expo-three provides some conveniences here (like the ability to accept an Expo asset directly in their TextureLoader and a universal ExpoTHREE.loadAsync loader), but we’ll explicitly manage the process for clarity.
	•	Sound loading: We’ll use expo-av’s Audio.Sound to load sound files. The manager will ensure the file is available (downloaded) and then create a sound object. Expo-av can handle both local module and remote URIs (passing an { uri: "https://..." } source) ￼. We’ll use the same expo-asset approach to get a local URI for consistency.

AssetManager Module Code

Below is the full implementation of the Asset Manager (AssetManager.ts). It exports a class with static methods to load textures, models, and sounds. You can place this file in your project (for example, in a utils or lib directory). The code is in TypeScript for type safety (you can adapt to JavaScript if needed):

AssetManager.ts:

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
// Three.js loaders
import { TextureLoader } from 'expo-three';  // using expo-three's enhanced TextureLoader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// Three.js core (for types and potential global usage)
import { THREE } from 'expo-three';

// Ensure global THREE is set (necessary in some Expo/Three environments) [oai_citation_attribution:12‡github.com](https://github.com/expo/expo-three#:~:text=emulators%20do%20not%20work%20well,js%20%2B%20EXGL)
global.THREE = global.THREE || THREE;

type AssetSource = string | number | Asset;
// AssetSource can be a require() result (number), a URI string, or an Expo Asset object.

export class AssetManager {
  // In-memory caches to avoid duplicate loads/parses
  private static textureCache: Map<string, THREE.Texture> = new Map();
  private static modelCache: Map<string, any> = new Map();      // will store parsed GLTF or Object3D
  private static soundCache: Map<string, Audio.Sound> = new Map();

  /** Resolves an asset source to an Expo Asset and ensures it's downloaded. */
  private static async resolveAsset(source: AssetSource): Promise<Asset> {
    let asset: Asset;
    if (source instanceof Asset) {
      asset = source;
    } else {
      // Asset.fromModule handles both module (number) and URI (string) sources
      asset = Asset.fromModule(source);
    }
    // Download asset if not already downloaded (expo-asset caches based on hash) [oai_citation_attribution:13‡docs.expo.dev](https://docs.expo.dev/versions/latest/sdk/asset/#:~:text=Web)
    if (!asset.localUri) {
      await asset.downloadAsync();  // ensures remote assets are downloaded to local cache
    }
    return asset;
  }

  /** Loads an image (texture) and returns a THREE.Texture, using caching. */
  static async loadTexture(source: AssetSource): Promise<THREE.Texture> {
    // Use the string (URI or module ID) as a key for caching
    const cacheKey = source instanceof Asset ? source.uri : source.toString();
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }
    // Resolve the asset to ensure we have a local file URI
    const asset = await this.resolveAsset(source);
    const assetUri = asset.localUri || asset.uri;  // prefer localUri if available
    // Use Three.js TextureLoader to load the image file into a texture
    const loader = new TextureLoader();
    let texture: THREE.Texture;
    // TextureLoader from expo-three can accept a URI directly. We use loadAsync if available.
    if (loader.loadAsync) {
      texture = await loader.loadAsync(assetUri);
    } else {
      // Fallback to callback-based load (older API)
      texture = await new Promise((resolve, reject) => {
        loader.load(
          assetUri,
          (tex) => resolve(tex),
          undefined,
          (err) => reject(err)
        );
      });
    }
    // Optionally, you could configure texture properties here (e.g., texture.wrapS = THREE.RepeatWrapping, etc.)
    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  /** Loads a GLTF/GLB 3D model and returns the parsed result (with scene, animations, etc.), using caching. */
  static async loadModel(source: AssetSource): Promise<import('three/examples/jsm/loaders/GLTFLoader').GLTF> {
    const cacheKey = source instanceof Asset ? source.uri : source.toString();
    if (this.modelCache.has(cacheKey)) {
      return this.modelCache.get(cacheKey);
    }
    const asset = await this.resolveAsset(source);
    const assetUri = asset.localUri || asset.uri;
    // GLTFLoader can load from a URI. Use loadAsync for convenience (Three r116+ supports promise-based loading).
    const loader = new GLTFLoader();
    // If the model is a .gltf with external resources, GLTFLoader will attempt to load those.
    // They should be in the same folder and accessible. (For remote GLTF, ensure resources are available or use GLB.)
    const gltf = await loader.loadAsync(assetUri);
    this.modelCache.set(cacheKey, gltf);
    return gltf;
  }

  /** Loads a sound file (audio) and returns an Expo Audio.Sound object, using caching. */
  static async loadSound(source: AssetSource): Promise<Audio.Sound> {
    const cacheKey = source instanceof Asset ? source.uri : source.toString();
    if (this.soundCache.has(cacheKey)) {
      return this.soundCache.get(cacheKey)!;
    }
    const asset = await this.resolveAsset(source);
    const assetUri = asset.localUri || asset.uri;
    // Create and load the sound. Audio.Sound.createAsync can accept an Asset or URI.
    const { sound } = await Audio.Sound.createAsync(
      asset,  // we can pass the Asset directly, expo-av will use its localUri internally
      { shouldPlay: false }  // initial status: don't play immediately (we'll control when to play)
    );
    // Alternatively, could use: Audio.Sound.createAsync({ uri: assetUri })
    this.soundCache.set(cacheKey, sound);
    return sound;
  }

  /** Optionally, a method to clear caches (e.g., on memory warning or app exit) */
  static clearCache() {
    // Dispose of textures and sounds to free memory (Three.js objects need explicit disposal)
    this.textureCache.forEach(tex => tex.dispose());
    this.textureCache.clear();
    this.modelCache.clear();
    // Unload sounds from memory
    this.soundCache.forEach(sound => sound.unloadAsync());
    this.soundCache.clear();
  }
}

How it works: Each loadX method uses resolveAsset to get an Asset with a local URI. Expo’s asset system will handle downloading remote files and storing them in the cache directory, and for local bundled files it provides a file URI that can be accessed at runtime ￼. We then use the appropriate Three.js loader or Expo AV API:
	•	For textures, we use TextureLoader to load the image file into a THREE.Texture. We prefer TextureLoader.loadAsync (available in modern Three.js) to await the load completion. The expo-three version of TextureLoader is used here because it includes some internal fixes for React Native (it allows passing the URI and handles image decoding behind the scenes) ￼. The loaded texture is cached in memory.
	•	For 3D models, we use Three’s GLTFLoader. After obtaining the file URI (which could be a local file:// path or an HTTP URL on the Metro dev server in development), we call loadAsync to get the parsed GLTF. The result (which contains gltf.scene, gltf.animations, etc.) is cached. If the model references external files (e.g. a .gltf plus separate textures), ensure those are also available (if local, they should be in your assets and listed in assetExts; if remote, GLTFLoader will try to fetch them relative to the model URI). Using .glb (binary glTF) is simpler since it’s self-contained.
	•	For sounds, we use Expo’s Audio.Sound. We pass the resolved Asset to Audio.Sound.createAsync; Expo-av will load it (download if needed, or use the local file). We do not aggressively reuse the same Sound object for multiple calls because playing the same Audio.Sound concurrently isn’t supported – if you need to play a sound simultaneously multiple times, you should create separate sound instances. However, by caching we ensure we don’t redownload the file multiple times. (Expo’s downloadFirst option is true by default for local/Asset sources ￼ ￼, so passing the Asset ensures the file is ready before playing.) The returned sound is an Audio.Sound instance that you can play or loop as needed.

Feel free to extend the AssetManager (for example, add support for other model loaders like OBJ/MTL if needed, or add progress callback support). Expo-three also provides a generic ExpoTHREE.loadAsync() that can load various assets with one call ￼, but using specific loaders as above gives you more control and type safety.

Integration with Three.js – Usage Examples

Now that we have our AssetManager, let’s integrate it into a React Native component using Three.js. We’ll set up a basic Three.js scene in Expo and demonstrate loading a texture onto a material, loading a GLTF model into the scene, and playing a sound.

First, ensure you have a <GLView> from expo-gl in your component to obtain a WebGL rendering context. Using expo-three, you can create a Three.js renderer from this context. For example, in your main App or a dedicated 3D scene component:

App.js (excerpt):

import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { AmbientLight, PerspectiveCamera, Scene, Mesh, MeshBasicMaterial, BoxGeometry } from 'three';
import { AssetManager } from './AssetManager';

export default function App() {
  const glViewRef = useRef(null);

  // Example: function to initialize Three.js scene when GLView context is created
  const onContextCreate = async (gl) => {
    // Create Three.js renderer with the Expo GL context
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    // Create a basic Three.js scene
    const scene = new Scene();
    const camera = new PerspectiveCamera(75, gl.drawingBufferWidth/gl.drawingBufferHeight, 0.1, 1000);
    camera.position.z = 2;

    // Lighting
    const light = new AmbientLight(0xffffff, 1);
    scene.add(light);

    // Create a mesh with a textured material
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial();
    // Load a texture (PNG/JPG) from assets (local or remote)
    const texture = await AssetManager.loadTexture(require('./assets/textures/crate.png'));
    material.map = texture;                  // apply the loaded texture
    material.needsUpdate = true;             // ensure material knows it has a new texture

    const cube = new Mesh(geometry, material);
    scene.add(cube);

    // Load a 3D model (GLTF/GLB) and add to scene
    const gltf = await AssetManager.loadModel(require('./assets/models/example.glb'));
    scene.add(gltf.scene);
    // (Optional: adjust position/scale of gltf.scene if needed)

    // Start rendering loop
    const renderLoop = () => {
      requestAnimationFrame(renderLoop);
      // Update any animations or rotations
      cube.rotation.y += 0.01;
      // Render the scene
      renderer.render(scene, camera);
      gl.endFrameEXP(); // tell Expo GL that we are done drawing this frame
    };
    renderLoop();

    // Play a sound after loading (e.g., background music or an effect)
    const sound = await AssetManager.loadSound(require('./assets/sounds/background.mp3'));
    await sound.playAsync();
  };

  return (
    <View style={{ flex: 1 }}>
      <GLView
        style={{ flex: 1 }}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}

In this example:
	•	We create a Three.js Renderer tied to the Expo GLView context. We set the renderer size to match the GLView.
	•	We set up a basic scene with a camera and an ambient light.
	•	Loading and applying a texture: We call AssetManager.loadTexture(require('./assets/textures/crate.png')) to load a local image from the Expo assets (you could also put a URL here for a remote image). This returns a THREE.Texture object. We assign it to a material (material.map = texture) and mark material.needsUpdate = true to ensure Three.js uses the updated texture. Now any mesh using that material will show the texture. The AssetManager under the hood used Expo’s asset system to resolve the file and loaded it into a GPU texture via Three.js ￼.
	•	Loading a 3D model: We call AssetManager.loadModel(require('./assets/models/example.glb')) to load a GLB model that was placed in the project’s assets. (Make sure .glb is listed in metro.config.js so it’s bundled, as shown earlier.) This returns a parsed GLTF object. We then add gltf.scene (the root Three.js object of the model) into our scene graph. If the model had animations, you could access them via gltf.animations. You might also adjust the scale or position of the model if needed (e.g., gltf.scene.position.set(0, -1, 0)). By using expo-asset under the hood, we ensured the GLB file was accessible via a URI that GLTFLoader could load ￼.
	•	Playing a sound: We use AssetManager.loadSound with a local MP3 file. This returns an Audio.Sound object from expo-av. We then call sound.playAsync() to start playback. Expo’s audio API handles the playback in the background. (If the sound is large or remote, ensure it’s fully loaded before playing; our AssetManager does load it fully first. You could also use sound.setIsLoopingAsync(true) or other expo-av methods on the sound as needed.)

Note: The above code runs asset loading sequentially for simplicity. In a real app, you might want to load assets in parallel before starting the render loop or showing the 3D scene to avoid stalls. For example, you could kick off texture, model, and sound loading concurrently with Promise.all and then, once ready, add them to the scene or play sound. Also, consider using Expo’s splash screen or a loading indicator while assets are loading to improve user experience.

Performance Considerations

Handling assets efficiently is crucial for performance, especially with large media files and 3D content:
	•	Disk Caching: By using expo-asset (and expo-av for audio), we leverage persistent caching. Remote assets are downloaded once and stored on the device. Subsequent app launches or navigations will reuse the cached file if it hasn’t changed ￼. This reduces network calls and speeds up asset retrieval.
	•	Memory Caching and Reuse: The AssetManager caches loaded THREE.Texture and GLTF objects in memory. This avoids parsing the same model or creating duplicate textures if you use them in multiple places. However, be mindful of memory – caching many large textures or models can increase RAM usage. Use the clearCache() method (or custom logic) to dispose of assets that are no longer needed (e.g., when leaving a heavy 3D scene) to free up memory. Three.js textures should be disposed with texture.dispose() when you’re done with them to free GPU memory ￼. In our clearCache, we dispose textures and unload sounds to prevent memory leaks.
	•	Bundling vs. On-Demand Loading: For local assets (using require), Expo will bundle them in the app binary. This makes them available offline and faster to load (no network delay), but increases app download size. For remote assets, your app stays smaller and you can update assets via network, but the user will incur a download delay (and need internet access). Choose what to bundle based on your offline requirements and size constraints. Often, large 3D models can be kept remote if they are optional, or you can use Expo Updates/OTA to lazy-load them. In either case, expo-asset will cache the result after the first load.
	•	Asset Compression: Optimize your asset files to reduce load times. For images, use appropriate formats and compression (Expo’s docs suggest tools like pngcrush, OptiPNG, etc. to reduce image size without quality loss) ￼. For 3D models, consider using binary glTF (.glb) which is more compact than JSON .gltf, and compress meshes or textures in the model (e.g., use Draco or Meshopt compression if feasible). Ensure that if you use these, the Three.js GLTFLoader is configured with the corresponding decoder (Draco decoder, etc.) – this can involve additional setup and including decoder files. In our example, we kept it simple without Draco. Also remove unused parts of models (meshes, bones, animations) to keep them lean.
	•	Loading Strategy: Avoid blocking the UI thread while assets load. Since we’re using async loading, the React Native UI will remain responsive. Still, large assets (big models or many large textures) can take noticeable time to load. It’s often best to preload critical assets at app startup or before a 3D scene is shown. You can show a splash screen or spinner during this preload. Expo’s SplashScreen API allows you to delay hiding the launch screen until your loading is done. For example, call SplashScreen.preventAutoHideAsync() at startup, load necessary assets with AssetManager (perhaps using Promise.all for parallelism), then call SplashScreen.hideAsync() once finished. This way, the user sees a loading screen instead of an empty or laggy UI.
	•	Rendering Performance: Once assets are loaded, ensure your Three.js scene is optimized for rendering on mobile. This includes limiting the polygon count of models, using fewer large textures (or lower resolution textures) if possible, and controlling the frequency of updates (using requestAnimationFrame as shown is standard). The asset manager primarily helps with loading, but overall app performance will also depend on how you use the assets (e.g., too many high-resolution textures can hurt GPU performance and memory). Use profiling tools or Expo’s performance monitors if you notice frame drops.

Expo Best Practices and References

The approach above aligns with Expo’s recommendations for handling static assets and using Three.js in a React Native environment:
	•	Expo Documentation Guidance: Expo encourages using the expo-asset module to manage static assets, as it integrates with React Native’s asset system and provides caching and easy importing with require() ￼. We utilized Asset.loadAsync (which under the hood calls Asset.fromModule(...).downloadAsync) to handle both local and remote cases uniformly ￼ ￼. Expo’s docs note that the asset system will only download if the file isn’t already cached or up-to-date ￼, which we rely on for efficiency. For audio, Expo’s recommended approach is using expo-av’s Audio.Sound API, which we demonstrated. The expo-av docs show examples of loading sounds from both local files (via require) and remote URIs ￼ – our AssetManager simply makes this more convenient by ensuring the file is ready and cached.
	•	Expo-Three Integration: The expo-three library (maintained by Expo) is the established way to run Three.js in an Expo app. It provides the GLView context and utilities. Our solution uses expo-three’s Renderer and TextureLoader. Notably, expo-three’s README highlights that Metro cannot directly bundle certain file types and that one should use Asset to resolve a local URI for Three.js to load ￼ ￼. Our implementation follows this advice exactly – we never feed a raw require or remote URL directly to Three.js loaders without first getting a valid URI. This avoids common pitfalls (for example, trying to use a raw require ID in GLTFLoader will fail). The expo-three documentation also provided inspiration for texture loading; it demonstrates using Asset.loadAsync and then TextureLoader().load(localUri) ￼, which our AssetManager automates.
	•	Community Best Practices: The React Native Three.js community often uses react-three-fiber (R3F) for a declarative approach to Three.js. Expo even provides a template for R3F (npx create-react-native-app -t with-react-three-fiber) and expo-three works under the hood with it. The asset handling principles remain the same – in fact, our AssetManager can be used in R3F projects as well. In R3F, one might use the useLoader hook to load assets, which also needs a resolved URI. For example, a community solution for Expo + R3F suggests using Asset.fromModule(...).uri in the useLoader hook. However, as noted in a Three.js forum discussion, it’s safer to load the asset first (with Asset.loadAsync) to get a stable file URI, especially on Android ￼ ￼. By pre-resolving and caching with AssetManager, we avoid issues like the “undefined ‘match’” error that can occur if the loader tries to fetch an unstable_path in development.
	•	Expo Config Plugins: Starting with SDK 51+, Expo introduced config plugins for assets and audio. We mentioned the expo-asset config plugin which can embed assets at build time ￼. In practice, our approach with require covers most needs, but it’s good to be aware of this for cases where you want to reference assets by name (for example, in native code or if you prefer not to scatter require calls in code). For audio, the expo-av plugin can set up background modes or permissions (like iOS silent mode behavior) ￼ – ensure you configure that if your app requires it (e.g., background audio).
	•	Maintaining Efficiency: The Expo team and community emphasize balancing app size and performance. A recommendation is to only load what you need – our AssetManager facilitates lazy loading of assets on demand (e.g., only load a model when the user navigates to the 3D view). It’s also wise to monitor performance on real devices; e.g., test loading times on slower networks for remote assets, and use Expo’s OTA updates if you need to push new assets without app store releases.

By following the above practices – using Expo’s asset caching, integrating properly with Three.js via expo-three, and minding performance – you can create a smooth experience even with asset-heavy 3D content in an Expo app. This AssetManager module provides a solid foundation for managing your textures, models, and sounds in Expo SDK 52 and beyond, leveraging the latest Expo ecosystem tools to do so.

Sources: Expo documentation and community insights were used to ensure this implementation is aligned with current best practices (Expo SDK 52). Key references include Expo’s official docs on assets ￼, expo-three’s README for Three.js integration ￼ ￼, and Expo-AV usage for audio ￼, among others, as cited throughout the text. With this setup, you should be well-equipped to load and display 3D models with textures and play audio in your React Native Expo application. Enjoy your asset-managed 3D experience on mobile!

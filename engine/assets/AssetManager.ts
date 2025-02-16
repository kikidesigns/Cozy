import { Asset } from "expo-asset"
import * as FileSystem from "expo-file-system"
import { TextureLoader } from "expo-three"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

type AssetSource = number | string;

export class AssetManager {
  // Cache to store loaded assets (textures/models) by key to avoid duplicate loads.
  private assets: Map<string, any> = new Map();

  /**
   * Resolves an asset using Expo's Asset system.
   * For local files (via require) or remote URLs, this ensures a local URI is available.
   */
  private async resolveAsset(source: AssetSource): Promise<Asset> {
    const asset = Asset.fromModule(source);
    if (!asset.localUri) {
      console.log("AssetManager: Downloading asset...");
      await asset.downloadAsync();
      console.log("AssetManager: Download complete.");
    } else {
      console.log("AssetManager: Asset already downloaded.");
    }
    return asset;
  }

  /**
   * Loads an image as a THREE.Texture.
   */
  async loadTexture(source: AssetSource): Promise<THREE.Texture> {
    const cacheKey = typeof source === "string" ? source : source.toString();
    if (this.assets.has(cacheKey)) {
      console.log("AssetManager: Returning cached texture for", cacheKey);
      return this.assets.get(cacheKey);
    }
    const asset = await this.resolveAsset(source);
    const textureUri = asset.localUri || asset.uri;
    console.log("AssetManager: Loading texture from URI:", textureUri);
    const loader = new TextureLoader();
    const texture = await loader.loadAsync(textureUri);
    this.assets.set(cacheKey, texture);
    return texture;
  }

  /**
   * Loads a GLTF/GLB model and returns the parsed result.
   */
  async loadModel(source: AssetSource): Promise<any> {
    const cacheKey = typeof source === "string" ? source : source.toString();
    if (this.assets.has(cacheKey)) {
      console.log("AssetManager: Returning cached model for", cacheKey);
      return this.assets.get(cacheKey);
    }

    console.log("AssetManager: Resolving model asset...");
    const modelAsset = await this.resolveAsset(source);
    const modelUri = modelAsset.localUri || modelAsset.uri;

    // Check if this is a GLB file
    const isGlb = modelUri.toLowerCase().endsWith('.glb');

    // Create the GLTFLoader
    const loader = new GLTFLoader();
    console.log("AssetManager: Starting model load from:", modelUri);

    // Create a promise for the GLTF/GLB load with progress logging
    const loadPromise = new Promise((resolve, reject) => {
      loader.load(
        modelUri,
        async (gltf) => {
          console.log("AssetManager: Model loaded successfully.");
          console.log("AssetManager: Model details:", {
            animations: gltf.animations.length,
            scenes: gltf.scenes.length,
            materials: gltf.scene.children.length,
            position: gltf.scene.position,
            scale: gltf.scene.scale,
          });

          // Ensure the model is visible by default
          gltf.scene.position.set(0, 0, 0);  // Center the model
          gltf.scene.scale.set(1, 1, 1);     // Reset scale to 1

          resolve(gltf);
        },
        (progressEvent) => {
          if (progressEvent.total) {
            const percent = (progressEvent.loaded / progressEvent.total) * 100;
            console.log(`AssetManager: Loading progress: ${percent.toFixed(2)}%`);
          } else {
            console.log(`AssetManager: Loaded ${progressEvent.loaded} bytes...`);
          }
        },
        (error) => {
          console.error("AssetManager: Error loading model:", error);
          reject(error);
        }
      );
    });

    // Create a timeout promise
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Model load timeout"));
      }, 30000);
    });

    // Wait for either the load or timeout
    const gltf = await Promise.race([loadPromise, timeoutPromise]);
    this.assets.set(cacheKey, gltf);
    return gltf;
  }

  /**
   * Returns a cached asset by key.
   */
  getAsset(key: string): any {
    return this.assets.get(key);
  }
}

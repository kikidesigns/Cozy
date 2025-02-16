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

    // Create a dedicated directory for this model
    const modelDir = `${FileSystem.cacheDirectory}model/`;
    await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });
    console.log("AssetManager: Created model directory:", modelDir);

    // Resolve the model asset
    console.log("AssetManager: Resolving model asset...");
    const modelAsset = await this.resolveAsset(source);
    const originalUri = modelAsset.localUri || modelAsset.uri;
    console.log("AssetManager: Original model URI:", originalUri);

    // Determine if this is a GLB or GLTF file
    const isGlb = originalUri.toLowerCase().endsWith('.glb');

    if (isGlb) {
      // For GLB files, we can load them directly
      console.log("AssetManager: Loading GLB file directly");

      // Create the GLTFLoader
      const loader = new GLTFLoader();

      // Clean up the path to avoid double file:// prefixes
      const cleanUri = originalUri.replace(/^file:\/\//, '');
      console.log("AssetManager: Loading from clean URI:", cleanUri);

      // Load the model
      try {
        const gltf = await new Promise((resolve, reject) => {
          loader.load(
            cleanUri,
            (gltf) => {
              console.log("AssetManager: GLB loaded successfully");
              if (!gltf.scene) {
                console.error("AssetManager: Loaded GLB has no scene!");
                reject(new Error("GLB has no scene"));
                return;
              }
              console.log("AssetManager: Model details:", {
                animations: gltf.animations?.length || 0,
                scenes: gltf.scenes?.length || 0,
                materials: gltf.scene.children?.length || 0,
                position: gltf.scene.position.toArray(),
                scale: gltf.scene.scale.toArray(),
              });
              resolve(gltf);
            },
            (progress) => {
              console.log("AssetManager: Loading progress:", {
                total: progress.total,
                loaded: progress.loaded,
                percent: ((progress.loaded / progress.total) * 100).toFixed(2) + '%'
              });
            },
            (error) => {
              console.error("AssetManager: Error loading GLB:", error);
              console.error("AssetManager: Error details:", {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : 'No stack trace available',
                type: error instanceof Error ? error.constructor.name : typeof error
              });
              reject(error);
            }
          );
        });

        this.assets.set(cacheKey, gltf);
        return gltf;
      } catch (error) {
        console.error("AssetManager: Failed to load GLB:", error);
        throw error;
      }
    } else {
      // First, let's check the original files
      console.log("AssetManager: Resolving model asset...");
      const modelAsset = await this.resolveAsset(source);
      const originalGltfUri = modelAsset.localUri || modelAsset.uri;
      console.log("AssetManager: Original GLTF URI:", originalGltfUri);

      // Try loading the original GLTF first to see if it works
      const originalGltfContent = await FileSystem.readAsStringAsync(originalGltfUri);
      let gltfJson;
      try {
        gltfJson = JSON.parse(originalGltfContent);
        console.log("AssetManager: Original GLTF parsed successfully");
      } catch (error) {
        console.error("AssetManager: Failed to parse original GLTF:", error);
        throw error;
      }

      // Static mapping of texture filenames to their require statements
      const textureMap: { [key: string]: number } = {
        "madeira_baseColor.jpeg": require("../../assets/models/villa/textures/madeira_baseColor.jpeg"),
        "madeira_normal.jpeg": require("../../assets/models/villa/textures/madeira_normal.jpeg"),
        "tecido_baseColor.jpeg": require("../../assets/models/villa/textures/tecido_baseColor.jpeg"),
        "tecido_normal.jpeg": require("../../assets/models/villa/textures/tecido_normal.jpeg"),
        "material_baseColor.jpeg": require("../../assets/models/villa/textures/material_baseColor.jpeg"),
        "material_normal.jpeg": require("../../assets/models/villa/textures/material_normal.jpeg"),
        "telhado_baseColor.jpeg": require("../../assets/models/villa/textures/telhado_baseColor.jpeg"),
        "telhado_normal.jpeg": require("../../assets/models/villa/textures/telhado_normal.jpeg"),
        "pedra_baseColor.jpeg": require("../../assets/models/villa/textures/pedra_baseColor.jpeg"),
        "pedra_normal.jpeg": require("../../assets/models/villa/textures/pedra_normal.jpeg"),
      };

      // Copy and verify the GLTF file
      const gltfPath = `${modelDir}model.gltf`;
      await FileSystem.copyAsync({
        from: originalGltfUri,
        to: gltfPath
      });
      console.log("AssetManager: Copied GLTF to:", gltfPath);

      // Check if binary file exists in original location
      if (gltfJson.buffers && gltfJson.buffers.length > 0) {
        const binAsset = await this.resolveAsset(require("../../assets/models/villa/scene.bin"));
        const originalBinUri = binAsset.localUri || binAsset.uri;
        console.log("AssetManager: Original binary file URI:", originalBinUri);

        const originalBinInfo = await FileSystem.getInfoAsync(originalBinUri);
        console.log("AssetManager: Original binary file info:", originalBinInfo);

        if (originalBinInfo.exists) {
          // Copy binary file to model directory
          const binPath = `${modelDir}model.bin`;
          await FileSystem.copyAsync({
            from: originalBinUri,
            to: binPath
          });

          const fileInfo = await FileSystem.getInfoAsync(binPath, { size: true });
          console.log("AssetManager: Copied binary file info:", fileInfo);

          // Update the GLTF to point to local binary - use just the filename
          gltfJson.buffers[0].uri = "model.bin";

          // Verify binary file size matches
          if (fileInfo.exists && 'size' in fileInfo) {
            gltfJson.buffers[0].byteLength = fileInfo.size;
            console.log("AssetManager: Updated binary file size to:", fileInfo.size);
          }
        } else {
          console.error("AssetManager: Original binary file not found!");
          throw new Error("Binary file not found");
        }
      }

      // Copy all textures to the model directory
      if (gltfJson.images) {
        for (const image of gltfJson.images) {
          const textureName = image.uri.split('/').pop() || '';
          const textureSource = textureMap[textureName];
          if (textureSource) {
            const textureAsset = await this.resolveAsset(textureSource);
            const originalTextureUri = textureAsset.localUri || textureAsset.uri;

            // Copy texture to model directory
            const texturePath = `${modelDir}${textureName}`;
            await FileSystem.copyAsync({
              from: originalTextureUri,
              to: texturePath
            });

            const textureInfo = await FileSystem.getInfoAsync(texturePath);
            console.log(`AssetManager: Copied texture ${textureName} info:`, textureInfo);

            // Update GLTF to point to local texture
            image.uri = textureName;
          }
        }
      }

      // Write the updated GLTF
      await FileSystem.writeAsStringAsync(gltfPath, JSON.stringify(gltfJson, null, 2), {
        encoding: FileSystem.EncodingType.UTF8
      });

      // Verify all files exist in the model directory
      console.log("AssetManager: Final directory contents:");
      const dirContents = await FileSystem.readDirectoryAsync(modelDir);
      console.log(dirContents);

      // Create the GLTFLoader with resource path
      const loader = new GLTFLoader();

      // Clean up the paths to avoid double file:// prefixes
      const cleanModelDir = modelDir.replace(/^file:\/\//, '');
      loader.resourcePath = cleanModelDir;

      // Use clean paths without file:// prefixes
      const cleanGltfPath = gltfPath.replace(/^file:\/\//, '');
      console.log("AssetManager: Loading GLTF from:", cleanGltfPath);
      console.log("AssetManager: Using resource path:", loader.resourcePath);

      // Read the binary file directly and embed it
      const binPath = `${cleanModelDir}model.bin`;
      const binData = await FileSystem.readAsStringAsync(binPath, { encoding: FileSystem.EncodingType.Base64 });
      console.log("AssetManager: Read binary file, size:", binData.length);

      // Read and parse the GLTF
      const gltfContent = await FileSystem.readAsStringAsync(cleanGltfPath);
      const gltfData = JSON.parse(gltfContent);

      // Embed the binary data directly in the GLTF
      if (gltfData.buffers && gltfData.buffers.length > 0) {
        gltfData.buffers[0].uri = `data:application/octet-stream;base64,${binData}`;
      }

      // Embed all textures as base64
      if (gltfData.images) {
        for (const image of gltfData.images) {
          const texturePath = `${cleanModelDir}${image.uri}`;
          const textureData = await FileSystem.readAsStringAsync(texturePath, { encoding: FileSystem.EncodingType.Base64 });
          // Determine MIME type from file extension
          const mimeType = image.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
          image.uri = `data:${mimeType};base64,${textureData}`;
          console.log(`AssetManager: Embedded texture ${image.uri.substring(0, 50)}...`);
        }
      }

      // Parse the model with everything embedded
      const loadPromise = new Promise((resolve, reject) => {
        try {
          loader.parse(
            JSON.stringify(gltfData),
            '',  // Empty resource path since everything is embedded
            (gltf) => {
              console.log("AssetManager: Model parsed successfully.");
              if (!gltf.scene) {
                console.error("AssetManager: Loaded GLTF has no scene!");
                reject(new Error("GLTF has no scene"));
                return;
              }
              console.log("AssetManager: Model details:", {
                animations: gltf.animations?.length || 0,
                scenes: gltf.scenes?.length || 0,
                materials: gltf.scene.children?.length || 0,
                position: gltf.scene.position.toArray(),
                scale: gltf.scene.scale.toArray(),
              });
              resolve(gltf);
            },
            (error) => {
              console.error("AssetManager: Error parsing model:", error);
              console.error("AssetManager: Error details:", {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : 'No stack trace available',
                type: error instanceof Error ? error.constructor.name : typeof error
              });
              reject(error);
            }
          );
        } catch (error) {
          console.error("AssetManager: Exception during model parsing:", error);
          reject(error);
        }
      });

      // Create a timeout promise with shorter duration
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          console.error("AssetManager: Model parse timed out after 10 seconds");
          reject(new Error("Model parse timeout - model may be too complex"));
        }, 10000);  // 10 seconds timeout since parsing should be faster than loading
      });

      try {
        // Wait for either the load or timeout
        const gltf = await Promise.race([loadPromise, timeoutPromise]);
        if (!gltf) {
          throw new Error("No GLTF data returned");
        }
        this.assets.set(cacheKey, gltf);
        return gltf;
      } catch (error) {
        console.error("AssetManager: Failed to load model:", error);
        console.error("AssetManager: Model path was:", gltfPath);
        console.error("AssetManager: Directory contents were:", await FileSystem.readDirectoryAsync(modelDir));
        throw error;
      }
    }
  }

  /**
   * Returns a cached asset by key.
   */
  getAsset(key: string): any {
    return this.assets.get(key);
  }
}

import { Asset } from "expo-asset"
import { TextureLoader } from "expo-three"
import * as THREE from "three"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
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
   * Provides a DRACOLoader to decode Draco-compressed models.
   * Includes a timeout in case loading hangs.
   */
  async loadModel(source: AssetSource): Promise<any> {
    const cacheKey = typeof source === "string" ? source : source.toString();
    if (this.assets.has(cacheKey)) {
      console.log("AssetManager: Returning cached model for", cacheKey);
      return this.assets.get(cacheKey);
    }
    console.log("AssetManager: Resolving model asset...");
    const asset = await this.resolveAsset(source);
    console.log(
      "AssetManager: Asset resolved. localUri:",
      asset.localUri,
      "uri:",
      asset.uri
    );
    const assetUri = asset.localUri || asset.uri;

    // Create the GLTFLoader and set up DRACOLoader for compressed data.
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    dracoLoader.preload(); // Preload the decoder files
    loader.setDRACOLoader(dracoLoader);
    console.log("AssetManager: Starting model load from:", assetUri);

    // Create a promise for the GLTF load with progress logging.
    const gltfPromise = new Promise((resolve, reject) => {
      loader.load(
        assetUri,
        (gltf) => {
          console.log("AssetManager: GLTF loaded successfully.");
          resolve(gltf);
        },
        (progressEvent) => {
          if (progressEvent.total) {
            const percent = (progressEvent.loaded / progressEvent.total) * 100;
            console.log(
              `AssetManager: Loading progress: ${percent.toFixed(2)}%`
            );
          } else {
            console.log(
              `AssetManager: Loaded ${progressEvent.loaded} bytes...`
            );
          }
        },
        (error) => {
          console.error("AssetManager: Error loading GLTF model:", error);
          reject(error);
        }
      );
    });

    // Create a timeout promise (e.g., 30 seconds).
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("GLTF load timeout"));
      }, 30000);
    });

    // Wait for either the GLTF load or timeout.
    const gltf = await Promise.race([gltfPromise, timeoutPromise]);
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

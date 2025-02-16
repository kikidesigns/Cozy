import { Asset } from "expo-asset"
import { TextureLoader } from "expo-three"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

type AssetSource = number | string;

export class AssetManager {
  // Cache to store loaded assets by key (to avoid duplicate loads)
  private assets: Map<string, any> = new Map();

  /**
   * Resolves an asset using Expo’s Asset system.
   * For local files (via require) or remote URLs, this ensures a local URI is available.
   */
  private async resolveAsset(source: AssetSource): Promise<Asset> {
    const asset = Asset.fromModule(source);
    if (!asset.localUri) {
      await asset.downloadAsync();
    }
    return asset;
  }

  /**
   * Loads an image as a THREE.Texture.
   */
  async loadTexture(source: AssetSource): Promise<THREE.Texture> {
    const cacheKey = typeof source === "string" ? source : source.toString();
    if (this.assets.has(cacheKey)) {
      return this.assets.get(cacheKey);
    }
    const asset = await this.resolveAsset(source);
    const textureUri = asset.localUri || asset.uri;
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
      return this.assets.get(cacheKey);
    }
    const asset = await this.resolveAsset(source);
    const assetUri = asset.localUri || asset.uri;
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(assetUri);
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

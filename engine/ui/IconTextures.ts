import { Asset } from "expo-asset"
import { TextureLoader } from "expo-three"
// engine/ui/IconTextures.ts
import * as THREE from "three"

export async function loadChatIconTexture(): Promise<THREE.Texture> {
  const asset = Asset.fromModule(require("../../assets/images/chat-icon.png"));
  if (!asset.localUri) {
    await asset.downloadAsync();
  }
  const texture = await new TextureLoader().loadAsync(asset.localUri);
  return texture;
}

export async function loadTradeIconTexture(): Promise<THREE.Texture> {
  const asset = Asset.fromModule(require("../../assets/images/trade-icon.png"));
  if (!asset.localUri) {
    await asset.downloadAsync();
  }
  const texture = await new TextureLoader().loadAsync(asset.localUri);
  return texture;
}

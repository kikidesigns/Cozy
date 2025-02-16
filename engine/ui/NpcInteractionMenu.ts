import * as THREE from "three"
import { createChatIconTexture, createTradeIconTexture } from "./IconTextures"

export class NpcInteractionMenu extends THREE.Object3D {
  public onChat: () => void = () => { };
  public onTrade: () => void = () => { };

  constructor() {
    super();
    // Mark this object for identification.
    this.userData.isNpcInteractionMenu = true;
    // Disable frustum culling so the menu is always rendered.
    this.frustumCulled = false;
    console.log("[NpcInteractionMenu] Creating NPC Interaction Menu");

    // For debugging: Add a basic visible red box so we can see something.
    const debugGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const debugMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const debugBox = new THREE.Mesh(debugGeometry, debugMaterial);
    debugBox.name = "DebugBox";
    this.add(debugBox);
    console.log("[NpcInteractionMenu] Debug box added");

    // Create a round Chat icon using an SVG-generated texture.
    try {
      const chatGeometry = new THREE.CircleGeometry(0.5, 32);
      const chatTexture = createChatIconTexture();
      const chatMaterial = new THREE.MeshBasicMaterial({
        map: chatTexture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });
      const chatIcon = new THREE.Mesh(chatGeometry, chatMaterial);
      chatIcon.position.set(-0.7, 0, 0);
      chatIcon.userData.interactionOption = "chat";
      chatIcon.name = "ChatIcon";
      this.add(chatIcon);
      console.log("[NpcInteractionMenu] Chat icon added");
    } catch (error) {
      console.error("[NpcInteractionMenu] Error creating Chat icon", error);
    }

    // Create a round Trade icon using an SVG-generated texture.
    try {
      const tradeGeometry = new THREE.CircleGeometry(0.5, 32);
      const tradeTexture = createTradeIconTexture();
      const tradeMaterial = new THREE.MeshBasicMaterial({
        map: tradeTexture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });
      const tradeIcon = new THREE.Mesh(tradeGeometry, tradeMaterial);
      tradeIcon.position.set(0.7, 0, 0);
      tradeIcon.userData.interactionOption = "trade";
      tradeIcon.name = "TradeIcon";
      this.add(tradeIcon);
      console.log("[NpcInteractionMenu] Trade icon added");
    } catch (error) {
      console.error("[NpcInteractionMenu] Error creating Trade icon", error);
    }
  }
}

// engine/ui/NpcInteractionMenu.ts
import * as THREE from "three"

export class NpcInteractionMenu extends THREE.Object3D {
  public onChat: () => void = () => { };
  public onTrade: () => void = () => { };

  constructor() {
    super();
    // Mark this object as the NPC interaction menu.
    this.userData.isNpcInteractionMenu = true;

    // Create a round Chat icon.
    const chatGeometry = new THREE.CircleGeometry(0.5, 32);
    const chatMaterial = new THREE.MeshBasicMaterial({
      color: 0x008800,
      transparent: true,
      opacity: 0.9,
    });
    const chatIcon = new THREE.Mesh(chatGeometry, chatMaterial);
    chatIcon.position.set(-0.7, 0, 0);
    chatIcon.userData.interactionOption = "chat";
    chatIcon.name = "ChatIcon";
    this.add(chatIcon);

    // Create a round Trade icon.
    const tradeGeometry = new THREE.CircleGeometry(0.5, 32);
    const tradeMaterial = new THREE.MeshBasicMaterial({
      color: 0x000088,
      transparent: true,
      opacity: 0.9,
    });
    const tradeIcon = new THREE.Mesh(tradeGeometry, tradeMaterial);
    tradeIcon.position.set(0.7, 0, 0);
    tradeIcon.userData.interactionOption = "trade";
    tradeIcon.name = "TradeIcon";
    this.add(tradeIcon);
  }
}

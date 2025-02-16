// engine/ui/NpcInteractionMenu.ts
import * as THREE from "three"
import { loadChatIconTexture, loadTradeIconTexture } from "./IconTextures"

export class NpcInteractionMenu extends THREE.Object3D {
  public onChat: () => void = () => { };
  public onTrade: () => void = () => { };

  // Private constructor – use createAsync() to build an instance.
  private constructor() {
    super();
    console.log("[NpcInteractionMenu] Creating new menu");
    this.userData.isNpcInteractionMenu = true;
    this.frustumCulled = false;
  }

  /**
   * Asynchronously creates an instance of NpcInteractionMenu with image textures.
   */
  public static async createAsync(): Promise<NpcInteractionMenu> {
    const menu = new NpcInteractionMenu();

    // --- Chat Background ---
    const chatBgGeometry = new THREE.CircleGeometry(0.5, 32);
    const chatBgMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    const chatBg = new THREE.Mesh(chatBgGeometry, chatBgMaterial);
    chatBg.position.set(-0.7, 0, -0.01); // Slightly behind the icon
    chatBg.name = "ChatBackground";
    menu.add(chatBg);
    console.log("[NpcInteractionMenu] Chat background added.");

    // --- Chat Icon ---
    const chatGeometry = new THREE.CircleGeometry(0.4, 32); // Slightly smaller than background
    const chatTexture = await loadChatIconTexture();
    console.log("[NpcInteractionMenu] Chat texture loaded:", chatTexture);
    const chatMaterial = new THREE.MeshBasicMaterial({
      map: chatTexture,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    const chatIcon = new THREE.Mesh(chatGeometry, chatMaterial);
    chatIcon.position.set(-0.7, 0, 0);
    chatIcon.userData.interactionOption = "chat";
    chatIcon.name = "ChatIcon";
    menu.add(chatIcon);
    console.log("[NpcInteractionMenu] Chat icon added.");

    // --- Trade Background ---
    const tradeBgGeometry = new THREE.CircleGeometry(0.5, 32);
    const tradeBgMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    const tradeBg = new THREE.Mesh(tradeBgGeometry, tradeBgMaterial);
    tradeBg.position.set(0.7, 0, -0.01); // Slightly behind the icon
    tradeBg.name = "TradeBackground";
    menu.add(tradeBg);
    console.log("[NpcInteractionMenu] Trade background added.");

    // --- Trade Icon ---
    const tradeGeometry = new THREE.CircleGeometry(0.4, 32);
    const tradeTexture = await loadTradeIconTexture();
    console.log("[NpcInteractionMenu] Trade texture loaded:", tradeTexture);
    const tradeMaterial = new THREE.MeshBasicMaterial({
      map: tradeTexture,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    const tradeIcon = new THREE.Mesh(tradeGeometry, tradeMaterial);
    tradeIcon.position.set(0.7, 0, 0);
    tradeIcon.userData.interactionOption = "trade";
    tradeIcon.name = "TradeIcon";
    menu.add(tradeIcon);
    console.log("[NpcInteractionMenu] Trade icon added.");

    console.log("[NpcInteractionMenu] Menu created with children:", menu.children.map(child => child.name));
    return menu;
  }
}

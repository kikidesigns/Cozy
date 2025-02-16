import {
  BoxGeometry, Camera, Mesh, MeshStandardMaterial, Object3D, Vector3
} from "three"
import { NpcInteractionMenu } from "../ui/NpcInteractionMenu"

export class NpcAgent extends Object3D {
  private mesh: Mesh;
  private material: MeshStandardMaterial;
  private targetPosition: Vector3;
  public speed: number = 2;
  private floatTime: number = 0;
  private baseHeight: number;
  public isInteracting: boolean = false;
  public interactionMenu: NpcInteractionMenu | null = null;
  private interactionCamera: Camera | null = null; // stored camera reference

  constructor() {
    super();
    // Mark this object as an NPC.
    this.userData.isNpc = true;
    console.log("[NpcAgent] Creating NPC agent");

    // Create a simple box mesh to represent the NPC.
    const geometry = new BoxGeometry(1, 1, 1);
    this.material = new MeshStandardMaterial({
      color: 0x800080,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });
    this.mesh = new Mesh(geometry, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    // Tag the mesh as well.
    this.mesh.userData.isNpc = true;
    this.mesh.name = "NpcMesh";
    this.add(this.mesh);

    // Set the NPC's base height.
    this.baseHeight = 3;
    this.position.y = this.baseHeight;
    this.targetPosition = this.position.clone();

    console.log(`[NpcAgent] NPC created at position: ${this.position.toArray()}`);
  }

  // Chooses a new random target position.
  private chooseNewTarget() {
    const minX = -25, maxX = -15;
    const minZ = -20, maxZ = -10;
    const randomX = Math.random() * (maxX - minX) + minX;
    const randomZ = Math.random() * (maxZ - minZ) + minZ;
    this.targetPosition.set(randomX, this.baseHeight, randomZ);
    console.log(`[NpcAgent] New target chosen: ${this.targetPosition.toArray()}`);
  }

  update(delta: number) {
    if (!this.isInteracting) {
      const currentHorizontal = new Vector3(this.position.x, 0, this.position.z);
      const targetHorizontal = new Vector3(this.targetPosition.x, 0, this.targetPosition.z);
      const direction = new Vector3().subVectors(targetHorizontal, currentHorizontal);
      const distance = direction.length();
      if (distance < 0.1) {
        this.chooseNewTarget();
      } else {
        direction.normalize();
        const moveDistance = Math.min(this.speed * delta, distance);
        this.position.x += direction.x * moveDistance;
        this.position.z += direction.z * moveDistance;
      }
    }
    // Bobbing (floating) effect.
    this.floatTime += delta;
    const amplitude = 0.5;
    const frequency = 1;
    this.mesh.position.y = amplitude * Math.sin(frequency * this.floatTime);

    // If interacting, update the menu's orientation to face the camera.
    if (this.isInteracting && this.interactionMenu && this.interactionCamera) {
      const worldCamPos = new Vector3();
      this.interactionCamera.getWorldPosition(worldCamPos);
      const localCamPos = this.worldToLocal(worldCamPos.clone());
      this.interactionMenu.lookAt(localCamPos);
      console.log(`[NpcAgent] Updated menu orientation: localCamPos = ${localCamPos.toArray()}`);
    }
  }

  // Toggles the interaction menu. Pass the camera so the menu can face it.
  startInteraction(camera: Camera) {
    if (this.isInteracting) {
      console.log("[NpcAgent] Already interacting. Ending interaction.");
      this.endInteraction();
      return;
    }
    console.log(`[NpcAgent] NPC at ${this.position.toArray()} starting interaction.`);
    this.isInteracting = true;
    this.interactionCamera = camera; // store the camera reference
    this.targetPosition.copy(this.position);
    if (!this.interactionMenu) {
      this.interactionMenu = new NpcInteractionMenu();
      this.interactionMenu.onChat = () => {
        console.log("[NpcAgent] Chat action selected for NPC");
        this.endInteraction();
      };
      this.interactionMenu.onTrade = () => {
        console.log("[NpcAgent] Trade action selected for NPC");
        this.endInteraction();
      };
      // Position the menu above the NPC (local coordinates).
      this.interactionMenu.position.set(0, 2, 0);
      // Scale up the menu to make it visible.
      this.interactionMenu.scale.set(2, 2, 2);
      // Disable culling on the menu.
      this.interactionMenu.frustumCulled = false;
      this.add(this.interactionMenu);
      // Force an update.
      this.interactionMenu.visible = true;
      this.interactionMenu.updateMatrixWorld(true);
      console.log("[NpcAgent] Interaction menu added. Menu children:", this.interactionMenu.children.map(child => child.name));
    }
    if (this.interactionMenu && camera) {
      const worldCamPos = new Vector3();
      camera.getWorldPosition(worldCamPos);
      const localCamPos = this.worldToLocal(worldCamPos.clone());
      this.interactionMenu.lookAt(localCamPos);
      console.log("[NpcAgent] Interaction menu oriented to face the camera.");
    }
  }

  endInteraction() {
    console.log(`[NpcAgent] NPC at ${this.position.toArray()} ending interaction.`);
    this.isInteracting = false;
    this.interactionCamera = null;
    if (this.interactionMenu) {
      this.remove(this.interactionMenu);
      console.log("[NpcAgent] Interaction menu removed.");
      this.interactionMenu = null;
    }
  }
}

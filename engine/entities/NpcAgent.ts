// engine/entities/NpcAgent.ts
import {
  BoxGeometry, Mesh, MeshStandardMaterial, Object3D, Vector3
} from "three"
import { NpcInteractionMenu } from "../ui/NpcInteractionMenu"

export class NpcAgent extends Object3D {
  private mesh: Mesh;
  private material: MeshStandardMaterial;
  private targetPosition: Vector3;
  public speed: number = 2; // NPC movement speed.
  private floatTime: number = 0;
  private baseHeight: number;
  public isInteracting: boolean = false;
  public interactionMenu: NpcInteractionMenu | null = null;

  constructor() {
    super();
    // Mark the NPC container.
    this.userData.isNpc = true;

    // Create a simple box mesh for the NPC.
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
    // Also tag the mesh.
    this.mesh.userData.isNpc = true;
    this.mesh.name = "NpcMesh";
    this.add(this.mesh);

    // Set the NPC's base height.
    this.baseHeight = 3;
    this.position.y = this.baseHeight;
    this.targetPosition = this.position.clone();
  }

  // Chooses a new random target position.
  private chooseNewTarget() {
    const minX = -25,
      maxX = -15;
    const minZ = -20,
      maxZ = -10;
    const randomX = Math.random() * (maxX - minX) + minX;
    const randomZ = Math.random() * (maxZ - minZ) + minZ;
    this.targetPosition.set(randomX, this.baseHeight, randomZ);
  }

  update(delta: number) {
    // If not interacting, move toward the target.
    if (!this.isInteracting) {
      const currentHorizontal = new Vector3(this.position.x, 0, this.position.z);
      const targetHorizontal = new Vector3(
        this.targetPosition.x,
        0,
        this.targetPosition.z
      );
      const direction = new Vector3().subVectors(
        targetHorizontal,
        currentHorizontal
      );
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
    // Bobbing effect.
    this.floatTime += delta;
    const amplitude = 0.5;
    const frequency = 1;
    this.mesh.position.y = amplitude * Math.sin(frequency * this.floatTime);

    // If the interaction menu is open, update its rotation to face the camera.
    // (Assumes the camera is stored in the agent when interaction is started.)
    // Optionally, you could update this from a higher-level system.
  }

  // Toggle the interaction menu. Pass the camera so the menu can face it.
  startInteraction(camera: THREE.Camera) {
    if (this.isInteracting) {
      // If already interacting, close the menu.
      this.endInteraction();
      return;
    }
    console.log(`[NpcAgent] NPC at ${this.position.toArray()} starting interaction.`);
    this.isInteracting = true;
    // Halt movement.
    this.targetPosition.copy(this.position);
    if (!this.interactionMenu) {
      this.interactionMenu = new NpcInteractionMenu();
      this.interactionMenu.onChat = () => {
        console.log("[NpcAgent] Chat action selected for NPC");
        // Insert chat logic here.
        this.endInteraction();
      };
      this.interactionMenu.onTrade = () => {
        console.log("[NpcAgent] Trade action selected for NPC");
        // Insert trade logic here.
        this.endInteraction();
      };
      // Position the menu above the NPC.
      this.interactionMenu.position.set(0, 2, 0);
      this.add(this.interactionMenu);
    }
    // Make the menu face the camera.
    this.interactionMenu.lookAt(camera.position);
  }

  endInteraction() {
    console.log(`[NpcAgent] NPC at ${this.position.toArray()} ending interaction.`);
    this.isInteracting = false;
    if (this.interactionMenu) {
      this.remove(this.interactionMenu);
      this.interactionMenu = null;
    }
  }

  setColor(color: number) {
    this.material.color.setHex(color);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

// engine/entities/NpcAgent.ts
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
  private currentCamera: Camera | null = null;

  constructor() {
    super();
    this.userData.isNpc = true;
    console.log("[NpcAgent] Creating NPC agent");

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
    this.mesh.userData.isNpc = true;
    this.mesh.name = "NpcMesh";
    this.add(this.mesh);

    this.baseHeight = 3;
    this.position.y = this.baseHeight;
    this.targetPosition = this.position.clone();
    console.log(`[NpcAgent] NPC created at position: ${this.position.toArray()}`);
  }

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
    this.floatTime += delta;
    const amplitude = 0.5;
    const frequency = 1;
    this.mesh.position.y = amplitude * Math.sin(frequency * this.floatTime);

    if (this.isInteracting && this.interactionMenu && this.currentCamera) {
      this.interactionMenu.lookAt(this.currentCamera.position);
    }
  }

  // Make this method async so we can await texture loading.
  public async startInteraction(camera: Camera): Promise<void> {
    if (this.isInteracting) {
      console.log("[NpcAgent] Already interacting. Ending interaction.");
      this.endInteraction();
      return;
    }
    console.log(`[NpcAgent] NPC at ${this.position.toArray()} starting interaction.`);
    this.isInteracting = true;
    this.currentCamera = camera;
    this.targetPosition.copy(this.position);
    if (!this.interactionMenu) {
      // Use our async factory to create the menu.
      this.interactionMenu = await NpcInteractionMenu.createAsync();
      this.interactionMenu.onChat = () => {
        console.log("[NpcAgent] Chat action selected for NPC");
        this.endInteraction();
      };
      this.interactionMenu.onTrade = () => {
        console.log("[NpcAgent] Trade action selected for NPC");
        this.endInteraction();
      };
      // Position the menu above the NPC.
      this.interactionMenu.position.set(0, 2, 0);
      this.interactionMenu.scale.set(2, 2, 2);
      this.interactionMenu.frustumCulled = false;
      this.add(this.interactionMenu);
      console.log("[NpcAgent] Interaction menu added. Children:", this.interactionMenu.children.map(child => child.name));
    }
    if (this.interactionMenu && camera) {
      this.interactionMenu.lookAt(camera.position);
      console.log("[NpcAgent] Interaction menu oriented to face the camera.");
    }
  }

  public endInteraction(): void {
    console.log(`[NpcAgent] NPC at ${this.position.toArray()} ending interaction.`);
    this.isInteracting = false;
    this.currentCamera = null;
    if (this.interactionMenu) {
      this.remove(this.interactionMenu);
      console.log("[NpcAgent] Interaction menu removed.");
      this.interactionMenu = null;
    }
  }

  public setColor(color: number) {
    this.material.color.setHex(color);
  }

  public dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

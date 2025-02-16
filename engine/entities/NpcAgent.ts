// engine/entities/NpcAgent.ts
import {
  BoxGeometry, Camera, Mesh, MeshStandardMaterial, Object3D, Vector3
} from "three"
import { useChatStore } from "../chat/ChatStore" // Import chat store
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
  private agentName: string;

  constructor(agentName: string = "Agent 1") {
    super();
    this.agentName = agentName; // Assign NPC a name
    this.userData.isNpc = true;

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
  }

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
    if (!this.isInteracting) {
      const currentHorizontal = new Vector3(this.position.x, 0, this.position.z);
      const targetHorizontal = new Vector3(
        this.targetPosition.x,
        0,
        this.targetPosition.z
      );
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

  public async startInteraction(camera: Camera): Promise<void> {
    if (this.isInteracting) {
      this.endInteraction();
      return;
    }
    this.isInteracting = true;
    this.currentCamera = camera;
    this.targetPosition.copy(this.position);
    if (!this.interactionMenu) {
      this.interactionMenu = await NpcInteractionMenu.createAsync();
      this.interactionMenu.onChat = () => {
        this.triggerPrivateChat();
        this.endInteraction();
      };
      this.interactionMenu.onTrade = () => {
        this.triggerTradeChat();
        this.endInteraction();
      };
      this.interactionMenu.position.set(0, 2, 0);
      this.interactionMenu.scale.set(2, 2, 2);
      this.interactionMenu.frustumCulled = false;
      this.add(this.interactionMenu);
    }
    if (this.interactionMenu && camera) {
      this.interactionMenu.lookAt(camera.position);
    }
  }

  private triggerPrivateChat(): void {
    const chatStore = useChatStore.getState();
    chatStore.setCurrentChannel("Private");

    const npcGreetings = [
      "Hello, traveler!",
      "Nice to meet you!",
      "Welcome to our town!",
      "Good to see you!",
      "Hey there! Need anything?",
    ];
    const randomGreeting =
      npcGreetings[Math.floor(Math.random() * npcGreetings.length)];

    chatStore.sendChatMessage("Private", randomGreeting, this.agentName);
  }

  private triggerTradeChat(): void {
    const chatStore = useChatStore.getState();
    chatStore.setCurrentChannel("Private");

    const tradeMessage =
      "What are you looking for - and what do you have to trade?";
    chatStore.sendChatMessage("Private", tradeMessage, this.agentName);
  }

  public endInteraction(): void {
    this.isInteracting = false;
    this.currentCamera = null;
    if (this.interactionMenu) {
      this.remove(this.interactionMenu);
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

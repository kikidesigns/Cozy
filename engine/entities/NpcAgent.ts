import {
    BoxGeometry, Camera, Mesh, MeshStandardMaterial, Object3D, Vector3
} from "three"
import { getProfile } from "../../utils/auth" // ensure this path is correct
import { useChatStore } from "../chat/ChatStore"
import { NpcInteractionMenu } from "../ui/NpcInteractionMenu"
import { createTextMesh } from "../utils/createTextMesh"

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
  public agentId: string; // must match the Supabase profile id for this agent

  // Balance label properties.
  public balanceLabel: THREE.Mesh | null = null;
  public currentBalance: number = 0;

  constructor(agentId: string, agentName: string = "Agent 1", initialBalance: number = 0) {
    super();
    this.agentId = agentId;
    this.agentName = agentName;
    this.currentBalance = initialBalance;
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

    // Initialize the balance label.
    this.initBalanceLabel(`${initialBalance} sats`);
  }

  private async initBalanceLabel(text: string) {
    try {
      const label = await createTextMesh(text, {
        size: 0.5,
        height: 0.05,
        color: 0xff00ff,
      });
      label.position.set(0, 3.5, 0);
      this.balanceLabel = label;
      this.add(label);
    } catch (e) {
      console.error("Error creating NPC balance label:", e);
    }
  }

  public async updateBalance(newBalance: number) {
    this.currentBalance = newBalance;
    if (this.balanceLabel) {
      this.remove(this.balanceLabel);
      this.balanceLabel.geometry.dispose();
      (this.balanceLabel.material as THREE.Material).dispose();
      this.balanceLabel = null;
    }
    try {
      const label = await createTextMesh(`Balance: ${newBalance} sats`, {
        size: 0.5,
        height: 0.05,
        color: 0xff00ff,
      });
      label.position.set(0, 3.5, 0);
      this.balanceLabel = label;
      this.add(label);
    } catch (e) {
      console.error("Error updating NPC balance label:", e);
    }
  }

  private chooseNewTarget() {
    const minX = -25, maxX = -15;
    const minZ = -20, maxZ = -10;
    const randomX = Math.random() * (maxX - minX) + minX;
    const randomZ = Math.random() * (maxZ - minZ) + minZ;
    this.targetPosition.set(randomX, this.baseHeight, randomZ);
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
      // Set the trade callback to trigger the trade action.
      this.interactionMenu.onTrade = async () => {
        await this.triggerTradeChat();
        this.endInteraction();
      };
      // Chat callback remains similar.
      this.interactionMenu.onChat = () => {
        this.triggerPrivateChat();
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
    const randomGreeting = npcGreetings[Math.floor(Math.random() * npcGreetings.length)];
    chatStore.sendChatMessage("Private", randomGreeting, this.agentName);
  }

  // Trigger the trade action: send 1 sat from the current user to this NPC.
  private async triggerTradeChat(): Promise<void> {
    try {
      const currentUserProfile = await getProfile();
      const currentUserId = currentUserProfile.id;
      const response = await fetch("https://<YOUR-SUPABASE-PROJECT>.functions.supabase.co/send-sats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: currentUserId,
          recipient_id: this.agentId,
          amount: 1,
        }),
      });
      const result = await response.json();
      if (result.success) {
        const chatStore = useChatStore.getState();
        chatStore.sendChatMessage("Private", "Sent 1 sat!", this.agentName);
        // If new balances are returned, update this NPC’s label.
        if (result.transferData) {
          this.updateBalance(result.transferData.recipient_balance);
          // Optionally, update the player's pawn label as well.
        }
      } else {
        console.error("Trade failed:", result.error);
      }
    } catch (error) {
      console.error("Trade failed:", error);
    }
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

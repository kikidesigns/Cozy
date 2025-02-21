import * as THREE from "three"
import { supabase } from "../../utils/supabase"
// engine/entities/NpcAgent.ts
import { useChatStore } from "../chat/ChatStore"
import { GameController } from "../entities/GameController"
import { NpcInteractionMenu } from "../ui/NpcInteractionMenu"
import { createTextMesh } from "../utils/createTextMesh"

export class NpcAgent extends THREE.Object3D {
  private agentId: string;
  private agentName: string;
  private currentBalance: number;
  private chatStore: typeof useChatStore;
  private interactionMenu: NpcInteractionMenu | null = null;
  private mesh: THREE.Mesh;
  private usernameLabel: THREE.Object3D | null = null;
  private balanceLabel: THREE.Object3D | null = null;

  // Movement properties
  private targetPosition: THREE.Vector3;
  private speed: number = 2; // units per second
  private patrolPoints: THREE.Vector3[] = [];
  private currentPatrolIndex: number = 0;
  private waitTime: number = 0;
  private isPatrolling: boolean = false;

  constructor(id: string, name: string, initialBalance: number = 0, shouldPatrol: boolean = false) {
    super();
    this.agentId = id;
    this.agentName = name;
    this.currentBalance = initialBalance;
    this.chatStore = useChatStore;
    this.isPatrolling = shouldPatrol;

    // Create a simple cylinder mesh for the NPC
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.userData.isNpc = true;
    this.add(this.mesh);

    // Set name for debugging
    this.name = `NPC_${name}`;

    // Initialize movement
    this.targetPosition = this.position.clone();
    if (shouldPatrol) {
      this.initializePatrolPath();
    }

    // Initialize username label
    this.initUsernameLabel();
  }

  private async initUsernameLabel() {
    try {
      // Create username label
      this.usernameLabel = await createTextMesh(this.agentName, {
        size: 0.3,
        height: 0.05,
        color: 0xffffff, // White text
      });
      // Position the label above the NPC
      this.usernameLabel.position.set(0, 2.5, 0);
      // Make sure label doesn't inherit parent's rotation
      this.usernameLabel.matrixAutoUpdate = true;
      this.add(this.usernameLabel);

      // Create balance label
      this.balanceLabel = await createTextMesh(`${this.currentBalance} sats`, {
        size: 0.25, // Slightly smaller than username
        height: 0.05,
        color: 0xffff00, // Yellow text like player balance
      });
      // Position the balance label below the username
      this.balanceLabel.position.set(0, 2.2, 0);
      // Make sure label doesn't inherit parent's rotation
      this.balanceLabel.matrixAutoUpdate = true;
      this.add(this.balanceLabel);
    } catch (e) {
      console.error("Error creating labels:", e);
    }
  }

  private initializePatrolPath() {
    // Create a patrol path (can be customized per NPC)
    const radius = 10;
    const numPoints = 4;
    for (let i = 0; i < numPoints; i++) {
      const angle = (2 * Math.PI * i) / numPoints;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      this.patrolPoints.push(new THREE.Vector3(x, 1, z));
    }
    this.targetPosition.copy(this.patrolPoints[0]);
  }

  public async startInteraction(camera: THREE.Camera, playerId: string): Promise<void> {
    if (!this.interactionMenu) {
      this.interactionMenu = await NpcInteractionMenu.createAsync();
      this.interactionMenu.position.set(0, 2.5, 0); // Above the NPC
      this.interactionMenu.onChat = () => this.triggerPrivateChat(playerId);
      this.add(this.interactionMenu);
    }

    // Make menu face the camera
    this.interactionMenu.lookAt(camera.position);
  }

  public update(delta: number): void {
    // Get the camera from the game controller
    const scene = this.parent as THREE.Scene;
    if (!scene) return;

    const gameController = scene.children.find(
      child => child instanceof GameController
    ) as GameController;

    if (gameController?.camera) {
      if (this.interactionMenu) {
        this.interactionMenu.lookAt(gameController.camera.position);
      }
      if (this.usernameLabel) {
        // Make label face camera directly using quaternion
        this.usernameLabel.quaternion.copy(gameController.camera.quaternion);
      }
      if (this.balanceLabel) {
        // Make label face camera directly using quaternion
        this.balanceLabel.quaternion.copy(gameController.camera.quaternion);
      }
    }

    // Update movement if patrolling
    if (this.isPatrolling) {
      if (this.waitTime > 0) {
        this.waitTime -= delta;
        return;
      }

      const distance = this.position.distanceTo(this.targetPosition);
      if (distance > 0.1) {
        // Move towards target
        const direction = new THREE.Vector3()
          .subVectors(this.targetPosition, this.position)
          .normalize();
        const moveAmount = Math.min(this.speed * delta, distance);
        this.position.add(direction.multiplyScalar(moveAmount));

        // Rotate to face movement direction
        const angle = Math.atan2(direction.x, direction.z);
        this.rotation.y = angle;
      } else {
        // Reached target, set next patrol point
        this.waitTime = 2; // Wait 2 seconds at each point
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
        this.targetPosition.copy(this.patrolPoints[this.currentPatrolIndex]);
      }
    }
  }

  public async setKnowledgeBase(knowledge: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ knowledge_base: knowledge })
        .eq('id', this.agentId);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to update knowledge base:", error);
    }
  }

  public async getKnowledgeBase(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('knowledge_base')
        .eq('id', this.agentId)
        .single();

      if (error) throw error;
      return data?.knowledge_base || null;
    } catch (error) {
      console.error("Failed to get knowledge base:", error);
      return null;
    }
  }

  private async callLlmChat(message: string, playerId: string): Promise<string> {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase.functions.invoke("chat-llm", {
          body: {
            npc_id: this.agentId,
            message,
            context: {
              npc_name: this.agentName,
              npc_balance: this.currentBalance,
              player_id: playerId
            }
          }
        });

        if (error) {
          throw error;
        }

        if (!data.success) {
          throw new Error(data.error || "Failed to get LLM response");
        }

        return data.message;
      } catch (error) {
        console.error(`LLM chat attempt ${retryCount + 1} failed:`, error);
        retryCount++;

        if (retryCount === maxRetries) {
          // If all retries failed, return a fallback response based on the message type
          if (message === "INITIAL_GREETING") {
            return `Hello traveler! I am ${this.agentName}. I have ${this.currentBalance} sats. How can I help you today?`;
          } else {
            return "I understand what you're saying, but I'm having trouble formulating a proper response right now. Perhaps we could try a simpler conversation?";
          }
        }

        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    // This should never be reached due to the fallback in the catch block
    return "I apologize, I'm having trouble communicating right now.";
  }

  public async triggerPrivateChat(playerId: string): Promise<void> {
    const chatStore = this.chatStore.getState();
    chatStore.setCurrentChannel("Private");

    try {
      // First try to send a simple greeting without LLM
      const { error: insertError } = await supabase
        .from("chat_messages")
        .insert({
          channel: "Private",
          sender_id: this.agentId,
          recipient_id: playerId,
          text: `Hello traveler! I am ${this.agentName}.`,
          is_llm_response: false
        });

      if (insertError) {
        console.error("Failed to send initial greeting:", insertError);
        throw insertError;
      }

      // Then try the LLM response
      const response = await this.callLlmChat("INITIAL_GREETING", playerId);
      const { error: llmInsertError } = await supabase
        .from("chat_messages")
        .insert({
          channel: "Private",
          sender_id: this.agentId,
          recipient_id: playerId,
          text: response,
          is_llm_response: true
        });

      if (llmInsertError) {
        console.error("Failed to send LLM response:", llmInsertError);
      }
    } catch (error) {
      console.error("Failed to trigger private chat:", error);
      // Don't use chatStore.sendChatMessage as it might not handle the DB correctly
      const { error: fallbackError } = await supabase
        .from("chat_messages")
        .insert({
          channel: "Private",
          sender_id: this.agentId,
          recipient_id: playerId,
          text: "Hello traveler! (Sorry, I'm having trouble with my advanced responses right now)",
          is_llm_response: false
        });

      if (fallbackError) {
        console.error("Failed to send fallback message:", fallbackError);
      }
    }
  }

  public async respondToChat(message: string, playerId: string): Promise<void> {
    try {
      // First send a simple acknowledgment
      const { error: ackError } = await supabase
        .from("chat_messages")
        .insert({
          channel: "Private",
          sender_id: this.agentId,
          recipient_id: playerId,
          text: "...",
          is_llm_response: false
        });

      if (ackError) {
        console.error("Failed to send acknowledgment:", ackError);
        throw ackError;
      }

      // Then try the LLM response
      const response = await this.callLlmChat(message, playerId);
      const { error: llmInsertError } = await supabase
        .from("chat_messages")
        .insert({
          channel: "Private",
          sender_id: this.agentId,
          recipient_id: playerId,
          text: response,
          is_llm_response: true
        });

      if (llmInsertError) {
        console.error("Failed to send LLM response:", llmInsertError);
        throw llmInsertError;
      }
    } catch (error) {
      console.error("Failed to respond to chat:", error);
      // Send a fallback response
      const { error: fallbackError } = await supabase
        .from("chat_messages")
        .insert({
          channel: "Private",
          sender_id: this.agentId,
          recipient_id: playerId,
          text: "I'm sorry, I'm having trouble formulating a response right now.",
          is_llm_response: false
        });

      if (fallbackError) {
        console.error("Failed to send fallback message:", fallbackError);
      }
    }
  }

  public getBalance(): number {
    return this.currentBalance;
  }

  public updateBalance(amount: number): void {
    this.currentBalance = amount;
    // Update the balance label text
    if (this.balanceLabel) {
      this.remove(this.balanceLabel);
      const textMesh = this.balanceLabel.children[0] as THREE.Mesh;
      textMesh.geometry.dispose();
      if (textMesh.material instanceof THREE.Material) {
        textMesh.material.dispose();
      }
      this.initUsernameLabel(); // This will recreate both labels
    }
  }

  public getName(): string {
    return this.agentName;
  }

  public getId(): string {
    return this.agentId;
  }
}

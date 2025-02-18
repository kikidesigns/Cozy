import {
    BoxGeometry, Camera, Mesh, MeshStandardMaterial, Object3D, Vector3
} from "three"
import { getProfile, getProfileById } from "../../utils/auth"
import { supabase } from "../../utils/supabase"
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
  public agentName: string;
  public agentId: string; // must match the Supabase profile id for this agent

  // Balance label properties.
  public balanceLabel?: Object3D;
  public currentBalance: number = 0;

  constructor(agentId: string, agentName: string) {
    super();
    this.agentId = agentId;
    this.agentName = agentName;
    this.userData.isNpc = true;
    this.baseHeight = 3;
    this.position.y = this.baseHeight;
    this.targetPosition = this.position.clone();

    // Initialize the mesh
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

    // Fetch and set the actual balance for this NPC
    this.initBalance();
  }

  private async initBalance() {
    try {
      console.log(`Initializing balance for NPC ${this.agentName} (${this.agentId})`);

      // Try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.agentId)
        .single();

      if (fetchError) {
        console.log(`No existing profile found for ${this.agentName}, creating new one...`);

        // Create new profile
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: this.agentId,
            username: this.agentName,
            bitcoin_balance: 500,
            is_npc: true,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Failed to create profile for ${this.agentName}:`, insertError);
          throw insertError;
        }

        console.log(`Created new profile for ${this.agentName}:`, newProfile);
        this.currentBalance = newProfile.bitcoin_balance;
        await this.initBalanceLabel(`${newProfile.bitcoin_balance} sats`);
      } else {
        console.log(`Found existing profile for ${this.agentName}:`, existingProfile);
        this.currentBalance = existingProfile.bitcoin_balance;
        await this.initBalanceLabel(`${existingProfile.bitcoin_balance} sats`);
      }
    } catch (error) {
      console.error(`Failed to initialize balance for ${this.agentName}:`, error);
      this.currentBalance = 0;
      await this.initBalanceLabel("0 sats");
    }
  }

  private async initBalanceLabel(text: string) {
    if (this.balanceLabel) {
      this.remove(this.balanceLabel);
    }
    this.balanceLabel = await createTextMesh(text, {
      size: 0.3,
      height: 0.05,
      color: 0xFFFFFF,
      position: new Vector3(0, this.baseHeight + 1, 0)
    });
    this.add(this.balanceLabel);
  }

  public async updateBalance(newBalance: number) {
    this.currentBalance = newBalance;
    await this.initBalanceLabel(`${newBalance} sats`);
  }

  public getBalance(): number {
    return this.currentBalance;
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

  private async triggerPrivateChat(): Promise<void> {
    const chatStore = useChatStore.getState();
    chatStore.setCurrentChannel("Private");

    try {
      const currentUserProfile = await getProfile();
      const response = await fetch("/functions/chat-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npc_id: this.agentId,
          message: "INITIAL_GREETING",
          context: {
            npc_name: this.agentName,
            npc_balance: this.currentBalance,
            player_id: currentUserProfile.id
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        chatStore.sendChatMessage("Private", result.message, this.agentName);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("LLM chat failed:", error);
      // Fallback to basic greeting
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
  }

  private async triggerTradeChat(): Promise<void> {
    try {
      const currentUserProfile = await getProfile();
      const currentUserId = currentUserProfile.id;
      const response = await fetch("/functions/send-sats", {
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
        if (result.transferData) {
          this.updateBalance(result.transferData.recipient_balance);
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
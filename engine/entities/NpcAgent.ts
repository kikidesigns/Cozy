// engine/entities/NpcAgent.ts
import { useChatStore } from "../chat/ChatStore";
import { supabase } from "../../utils/supabase";

export class NpcAgent {
  private agentId: string;
  private agentName: string;
  private currentBalance: number;
  private chatStore: typeof useChatStore;

  constructor(id: string, name: string, initialBalance: number = 0) {
    this.agentId = id;
    this.agentName = name;
    this.currentBalance = initialBalance;
    this.chatStore = useChatStore;
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
    try {
      const response = await fetch("/functions/chat-llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          npc_id: this.agentId,
          message,
          context: {
            npc_name: this.agentName,
            npc_balance: this.currentBalance,
            player_id: playerId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to get LLM response");
      }

      return result.message;
    } catch (error) {
      console.error("LLM chat failed:", error);
      return "I apologize, I'm having trouble communicating right now.";
    }
  }

  public async triggerPrivateChat(playerId: string): Promise<void> {
    const chatStore = this.chatStore.getState();
    chatStore.setCurrentChannel("Private");
    
    try {
      const response = await this.callLlmChat("INITIAL_GREETING", playerId);
      chatStore.sendChatMessage("Private", response, this.agentName, playerId);
    } catch (error) {
      console.error("Failed to trigger private chat:", error);
      chatStore.sendChatMessage(
        "Private",
        "Hello traveler!",
        this.agentName,
        playerId
      );
    }
  }

  public async respondToChat(message: string, playerId: string): Promise<void> {
    const chatStore = this.chatStore.getState();
    
    try {
      const response = await this.callLlmChat(message, playerId);
      chatStore.sendChatMessage("Private", response, this.agentName, playerId);
    } catch (error) {
      console.error("Failed to respond to chat:", error);
      chatStore.sendChatMessage(
        "Private",
        "I'm not sure how to respond to that.",
        this.agentName,
        playerId
      );
    }
  }

  public getBalance(): number {
    return this.currentBalance;
  }

  public updateBalance(amount: number): void {
    this.currentBalance = amount;
  }

  public getName(): string {
    return this.agentName;
  }

  public getId(): string {
    return this.agentId;
  }
}
// engine/chat/ChatStore.ts
import { create } from "zustand"
import { supabase } from "../../utils/supabase"

export interface ChatMessage {
  id: string;
  channel: "World" | "Party" | "Guild" | "Private";
  sender: string; // Sender name (Player or NPC)
  text: string;
  timestamp: string;
  recipient?: string;
  is_llm_response?: boolean;
}

export interface TradeMessage {
  id: number;
  senderType: "NPC" | "Player";
  text: string;
  timestamp: string;
}

export type TradeStepKey =
  | "start"
  | "offer"
  | "buySword"
  | "buyShield"
  | "end"
  | "finish";

interface TradeOption {
  text: string;
  next: TradeStepKey;
}

interface TradeStep {
  npcText: string | null;
  options: TradeOption[];
}

const tradeDialogueScript: Record<TradeStepKey, TradeStep> = {
  start: {
    npcText: "Hello! I have some items for trade. Are you interested?",
    options: [
      { text: "Yes, show me what you have.", next: "offer" },
      { text: "No thanks.", next: "end" },
    ],
  },
  offer: {
    npcText: "I can offer you a Sword or a Shield. Which would you like?",
    options: [
      { text: "Buy Sword (100 gold)", next: "buySword" },
      { text: "Buy Shield (150 gold)", next: "buyShield" },
      { text: "Actually, never mind.", next: "end" },
    ],
  },
  buySword: {
    npcText: "Great choice! You bought the Sword. Thank you for trading.",
    options: [{ text: "Finish", next: "finish" }],
  },
  buyShield: {
    npcText: "Great choice! You bought the Shield. Thank you for trading.",
    options: [{ text: "Finish", next: "finish" }],
  },
  end: {
    npcText: "Alright, maybe another time. Safe travels!",
    options: [{ text: "Finish", next: "finish" }],
  },
  finish: {
    npcText: null,
    options: [],
  },
};

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

interface ChatState {
  messages: ChatMessage[];
  currentChannel: "World" | "Party" | "Guild" | "Private";
  isChatActive: boolean;
  isTradeActive: boolean;
  tradeMessages: TradeMessage[];
  tradeStep: TradeStepKey | null;
  sendChatMessage: (
    channel: "World" | "Party" | "Guild" | "Private",
    text: string,
    sender?: string,
    recipient?: string
  ) => Promise<void>;
  setCurrentChannel: (channel: "World" | "Party" | "Guild" | "Private") => void;
  startTradeConversation: (npcName?: string) => void;
  chooseTradeOption: (optionIndex: number) => void;
  endTradeConversation: () => void;
  setChatActive: (active: boolean) => void;
  loadMessages: () => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => {
  let messageSubscription: any = null;

  return {
    messages: [],
    currentChannel: "World",
    isChatActive: false,
    isTradeActive: false,
    tradeMessages: [],
    tradeStep: null,

    sendChatMessage: async (channel, text, sender = "Player", recipient?: string) => {
      console.log("ChatStore: Sending message:", { channel, text, sender, recipient });
      const timestamp = formatTime(new Date());
      const DEMO_PLAYER_ID = "00000000-0000-0000-0000-000000000000";

      // Only try to get recipient ID for private messages
      let targetRecipientId = undefined;
      if (channel === "Private") {
        // If recipient is provided directly, use it
        if (recipient) {
          targetRecipientId = recipient;
        } else {
          // Try to get recipient from last message
          const state = get();
          const lastMessage = [...state.messages].reverse().find(msg => msg.channel === "Private");
          if (lastMessage) {
            targetRecipientId = lastMessage.sender === "Player" ? lastMessage.recipient : lastMessage.sender;
          }
        }

        // If we still don't have a recipient for private chat, error out
        if (!targetRecipientId) {
          console.error("ChatStore: No recipient found for private message");
          return;
        }

        // If the recipient looks like a username instead of a UUID, look up the UUID
        if (!targetRecipientId.includes("-")) {
          const { data: recipientProfile, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", targetRecipientId)
            .single();

          if (profileError) {
            console.error("ChatStore: Failed to get recipient profile:", profileError);
            return;
          }

          targetRecipientId = recipientProfile.id;
        }
      }

      const newMessage = {
        channel,
        sender_id: DEMO_PLAYER_ID,
        text,
        created_at: new Date().toISOString(),
        recipient_id: targetRecipientId, // Will be undefined for non-private channels
      };

      try {
        console.log("ChatStore: Inserting message into database:", newMessage);
        // Insert into Supabase
        const { data, error } = await supabase
          .from("chat_messages")
          .insert([newMessage])
          .select(`
            *,
            sender:profiles!chat_messages_sender_id_fkey(username),
            recipient:profiles!chat_messages_recipient_id_fkey(username)
          `)
          .single();

        if (error) throw error;
        console.log("ChatStore: Message inserted successfully:", data);

        // Transform the response to match our ChatMessage interface
        const transformedMessage: ChatMessage = {
          id: data.id,
          channel: data.channel,
          sender: data.sender?.username || data.sender_id,
          text: data.text,
          timestamp: formatTime(new Date(data.created_at)),
          recipient: data.recipient?.username || data.recipient_id,
          is_llm_response: data.is_llm_response
        };

        // Update local state
        set((state) => {
          // Keep the last message and add the new one
          const existingMessages = state.messages.slice(-1);
          return {
            messages: [...existingMessages, transformedMessage],
          };
        });

        // If this is a private message to an NPC, trigger their response
        if (channel === "Private" && targetRecipientId) {
          // Get the NPC profile to check if it's an NPC
          const { data: recipientProfile } = await supabase
            .from("profiles")
            .select("is_npc")
            .eq("id", targetRecipientId)
            .single();

          if (recipientProfile?.is_npc) {
            console.log("ChatStore: Sending message to NPC, waiting for LLM response...");
            // Call the chat-llm function to get NPC response
            const { data: llmResponse, error: llmError } = await supabase.functions.invoke("chat-llm", {
              body: {
                npc_id: targetRecipientId,
                message: text,
                context: {
                  npc_name: data.recipient?.username || targetRecipientId,
                  player_id: DEMO_PLAYER_ID
                }
              }
            });

            if (llmError) {
              console.error("ChatStore: Error getting LLM response:", llmError);
              return;
            }

            if (!llmResponse.success) {
              console.error("ChatStore: LLM response failed:", llmResponse.error);
              return;
            }

            console.log("ChatStore: Got LLM response:", llmResponse);

            // Insert the NPC's response
            const npcResponse = {
              channel: "Private",
              sender_id: targetRecipientId,
              recipient_id: DEMO_PLAYER_ID,
              text: llmResponse.message,
              created_at: new Date().toISOString(),
              is_llm_response: true
            };

            console.log("ChatStore: Inserting NPC response:", npcResponse);
            const { data: responseData, error: responseError } = await supabase
              .from("chat_messages")
              .insert([npcResponse])
              .select(`
                *,
                sender:profiles!chat_messages_sender_id_fkey(username),
                recipient:profiles!chat_messages_recipient_id_fkey(username)
              `)
              .single();

            if (responseError) {
              console.error("ChatStore: Error saving NPC response:", responseError);
              return;
            }

            console.log("ChatStore: NPC response saved successfully:", responseData);

            // Immediately update UI with the NPC response
            const npcUiMessage: ChatMessage = {
              id: responseData.id,
              channel: responseData.channel,
              sender: responseData.sender?.username || responseData.sender_id,
              text: responseData.text,
              timestamp: formatTime(new Date(responseData.created_at)),
              recipient: responseData.recipient?.username || responseData.recipient_id,
              is_llm_response: true
            };

            set((state) => {
              // Keep the last message and add the new NPC response
              const existingMessages = state.messages.slice(-1);
              return {
                messages: [...existingMessages, npcUiMessage],
              };
            });
            console.log("ChatStore: UI state updated with NPC response");
          }
        }
      } catch (error) {
        console.error("ChatStore: Failed to send message:", error);
        // Still update local state for better UX
        set((state) => {
          const existingMessages = state.messages.slice(-1);
          return {
            messages: [...existingMessages, {
              id: Date.now().toString(),
              channel,
              sender: "Player",
              text,
              timestamp: formatTime(new Date()),
              recipient: targetRecipientId
            } as ChatMessage],
          };
        });
      }
    },

    loadMessages: async () => {
      try {
        console.log("ChatStore: Loading messages...");
        const { data, error } = await supabase
          .from("chat_messages")
          .select(`
            *,
            sender:profiles!chat_messages_sender_id_fkey(username, is_npc),
            recipient:profiles!chat_messages_recipient_id_fkey(username)
          `)
          .order("created_at", { ascending: true })  // Changed to ascending
          .limit(50);

        if (error) throw error;
        console.log("ChatStore: Raw messages from DB:", data);

        // Transform messages to match UI format
        const transformedMessages = (data || [])
          .filter(msg => {
            // Keep messages if:
            // 1. They're from a player, or
            // 2. They're an LLM response from an NPC
            return !msg.sender?.is_npc || (msg.sender?.is_npc && msg.is_llm_response);
          })
          .map(msg => ({
            id: msg.id,
            channel: msg.channel,
            sender: msg.sender?.username || msg.sender_id,
            text: msg.text,
            timestamp: formatTime(new Date(msg.created_at)),
            recipient: msg.recipient?.username || msg.recipient_id,
            is_llm_response: msg.is_llm_response
          }))
          // Take only the last 2 messages
          .slice(-2);

        console.log("ChatStore: Transformed and limited messages:", transformedMessages);
        set({ messages: transformedMessages });
      } catch (error) {
        console.error("ChatStore: Failed to load messages:", error);
      }
    },

    subscribeToMessages: () => {
      if (messageSubscription) {
        console.log("ChatStore: Removing existing subscription before creating new one");
        supabase.removeChannel(messageSubscription);
        messageSubscription = null;
      }

      console.log("ChatStore: Setting up message subscription...");
      messageSubscription = supabase
        .channel("chat_messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
          },
          async (payload) => {
            console.log("ChatStore: New message received from subscription:", payload.new);
            console.log("ChatStore: Current messages before update:", get().messages);

            // Get both sender and recipient profiles in a single query
            const { data: profiles, error: profilesError } = await supabase
              .from("profiles")
              .select("id, username, is_npc")
              .in("id", [payload.new.sender_id, payload.new.recipient_id]);

            if (profilesError) {
              console.error("ChatStore: Failed to fetch profiles:", profilesError);
              return;
            }

            console.log("ChatStore: Profiles fetched:", profiles);

            // Find sender and recipient profiles
            const senderProfile = profiles?.find(p => p.id === payload.new.sender_id);
            const recipientProfile = profiles?.find(p => p.id === payload.new.recipient_id);

            // Only skip non-LLM NPC messages if they're not the initial greeting
            if (senderProfile?.is_npc && !payload.new.is_llm_response) {
              console.log("ChatStore: Skipping non-LLM NPC message");
              return;
            }

            const newMessage = {
              id: payload.new.id,
              channel: payload.new.channel,
              sender: senderProfile?.username || payload.new.sender_id,
              text: payload.new.text,
              timestamp: formatTime(new Date(payload.new.created_at)),
              recipient: recipientProfile?.username || payload.new.recipient_id,
              is_llm_response: payload.new.is_llm_response
            };

            console.log("ChatStore: Adding new message to UI:", newMessage);

            set((state) => {
              // Keep only the last message (if any) and add the new one
              const existingMessages = state.messages.slice(-1);
              const updatedMessages = [...existingMessages, newMessage];
              console.log("ChatStore: Updated messages array:", updatedMessages);
              return {
                messages: updatedMessages,
              };
            });
          }
        )
        .subscribe((status) => {
          console.log("ChatStore: Subscription status:", status);
          if (status === "SUBSCRIBED") {
            console.log("ChatStore: Successfully subscribed to chat messages");
          } else if (status === "CLOSED") {
            console.log("ChatStore: Subscription closed");
          } else if (status === "CHANNEL_ERROR") {
            console.error("ChatStore: Subscription error");
          }
        });
    },

    unsubscribeFromMessages: () => {
      if (messageSubscription) {
        supabase.removeChannel(messageSubscription);
        messageSubscription = null;
      }
    },

    setCurrentChannel: (channel) => set({ currentChannel: channel }),

    startTradeConversation: (npcName = "Trader") => {
      const initialStep: TradeStepKey = "start";
      const initialNpcText = tradeDialogueScript[initialStep].npcText;
      const now = formatTime(new Date());
      set({
        isTradeActive: true,
        tradeStep: initialStep,
        tradeMessages: initialNpcText
          ? [
              {
                id: Date.now(),
                senderType: "NPC",
                text: `${npcName}: ${initialNpcText}`,
                timestamp: now,
              },
            ]
          : [],
      });
    },

    chooseTradeOption: (optionIndex: number) => {
      const state = get();
      const currentStep = state.tradeStep;
      if (!currentStep) return;
      const stepData = tradeDialogueScript[currentStep];
      const options = stepData.options;
      const chosenOption = options[optionIndex];
      if (!chosenOption) return;

      const now = formatTime(new Date());
      const playerMessage: TradeMessage = {
        id: Date.now(),
        senderType: "Player",
        text: `You: ${chosenOption.text}`,
        timestamp: now,
      };

      let newTradeMessages = [...state.tradeMessages, playerMessage];
      const nextStep = chosenOption.next;
      const nextStepData = tradeDialogueScript[nextStep];

      if (nextStepData && nextStepData.npcText) {
        const npcMsg: TradeMessage = {
          id: Date.now() + 1,
          senderType: "NPC",
          text: `NPC: ${nextStepData.npcText}`,
          timestamp: formatTime(new Date()),
        };
        newTradeMessages.push(npcMsg);
      }

      set({ tradeMessages: newTradeMessages, tradeStep: nextStep });
      if (nextStep === "finish") {
        set({ isTradeActive: false, tradeStep: null });
      }
    },

    endTradeConversation: () => {
      set({ isTradeActive: false, tradeStep: null, tradeMessages: [] });
    },

    setChatActive: (active) => set({ isChatActive: active }),
  };
});

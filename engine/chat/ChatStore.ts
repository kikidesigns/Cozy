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

    sendChatMessage: async (channel, text, sender = "Player", recipient?) => {
      const timestamp = formatTime(new Date());
      const newMessage: Partial<ChatMessage> = {
        channel,
        sender,
        text,
        timestamp,
        ...(recipient ? { recipient } : {}),
      };

      try {
        // Insert into Supabase
        const { data, error } = await supabase
          .from("chat_messages")
          .insert([newMessage])
          .select()
          .single();

        if (error) throw error;

        // Update local state
        set((state) => ({
          messages: [...state.messages, data as ChatMessage],
        }));
      } catch (error) {
        console.error("Failed to send message:", error);
        // Still update local state for better UX
        set((state) => ({
          messages: [...state.messages, { id: Date.now().toString(), ...newMessage } as ChatMessage],
        }));
      }
    },

    loadMessages: async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        set({ messages: data as ChatMessage[] });
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    },

    subscribeToMessages: () => {
      if (messageSubscription) return;

      messageSubscription = supabase
        .channel("chat_messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
          },
          (payload) => {
            const newMessage = payload.new as ChatMessage;
            set((state) => ({
              messages: [...state.messages, newMessage],
            }));
          }
        )
        .subscribe();
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
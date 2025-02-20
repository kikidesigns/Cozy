import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"
import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RequestBody {
  npc_id: string;
  message: string;
  context: {
    npc_name: string;
    npc_balance: number;
    player_id: string;
  };
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { npc_id, message, context } = await req.json() as RequestBody;
    
    if (!npc_id || !message || !context) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400 }
      );
    }

    // Get NPC profile including knowledge base
    const { data: npcProfile, error: profileError } = await supabase
      .from("profiles")
      .select("knowledge_base")
      .eq("id", npc_id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch NPC profile" }),
        { status: 400 }
      );
    }

    // Get recent conversation history
    const { data: history, error: historyError } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`sender_id.eq.${npc_id},recipient_id.eq.${context.player_id}`)
      .order("created_at", { ascending: true })
      .limit(10);

    if (historyError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch chat history" }),
        { status: 400 }
      );
    }

    // Format conversation history
    const conversationHistory = history
      ?.map(msg => `${msg.sender_id === npc_id ? "NPC" : "Player"}: ${msg.text}`)
      .join("\n") || "";

    // Generate response using Vercel AI SDK
    const { text: llmResponse, usage } = await generateText({
      model: groq('mixtral-8x7b-32768'),
      prompt: `You are ${context.npc_name}, an NPC in a cozy game world.
Your balance is ${context.npc_balance} sats.
${npcProfile?.knowledge_base ? `\nYour knowledge and background:\n${npcProfile.knowledge_base}` : ""}

Recent conversation:
${conversationHistory}

Player: ${message}

You should:
1. Respond naturally and conversationally
2. Keep responses concise (1-2 sentences usually)
3. Stay in character as ${context.npc_name}
4. When discussing trades, be specific about sat amounts
5. Be helpful and friendly, but also show personality

Remember you are an NPC in a game world, not an AI assistant.

Respond as ${context.npc_name}:`,
      temperature: 0.7,
      maxTokens: 150,
    });

    if (!llmResponse) {
      throw new Error("No response from LLM");
    }

    // Store the LLM response in chat_messages
    const { error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        channel: "Private",
        sender_id: npc_id,
        recipient_id: context.player_id,
        text: llmResponse,
        is_llm_response: true,
        metadata: {
          usage,
          model: 'mixtral-8x7b-32768'
        }
      });

    if (insertError) {
      console.error("Failed to store LLM response:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: llmResponse,
        usage
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("LLM chat error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
});
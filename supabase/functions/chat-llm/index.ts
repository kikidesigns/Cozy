// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

interface ChatMessage {
  sender_id: string;
  recipient_id: string;
  text: string;
  created_at: string;
}

interface RequestBody {
  npc_id: string;
  message: string;
  context: {
    npc_name: string;
    npc_balance: number;
    player_id: string;
  };
}

// Types for Groq API
interface GroqChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: any;
  model?: string;
}

// Initialize Groq client
async function generateGroqResponse(messages: GroqChatMessage[]): Promise<GroqResponse> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }

  console.log("Making request to Groq API...");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 150,
      top_p: 1,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq API error details:", {
      status: response.status,
      statusText: response.statusText,
      errorText,
    });
    throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Groq API response:", {
    status: response.status,
    model: data.model,
    usage: data.usage,
  });

  return data;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
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
    const conversationHistory = (history as ChatMessage[])
      ?.map(msg => `${msg.sender_id === npc_id ? "NPC" : "Player"}: ${msg.text}`)
      .join("\n") || "";

    // System message with context
    const systemMessage = {
      role: "system",
      content: `You are ${context.npc_name}, an NPC in a cozy game world.
Your balance is ${context.npc_balance} sats.
${npcProfile?.knowledge_base ? `\nYour knowledge and background:\n${npcProfile.knowledge_base}` : ""}

You should:
1. Respond naturally and conversationally
2. Keep responses concise (1-2 sentences usually)
3. Stay in character as ${context.npc_name}
4. When discussing trades, be specific about sat amounts
5. Be helpful and friendly, but also show personality

Remember you are an NPC in a game world, not an AI assistant.`
    };

    // Generate response using Groq
    const completion = await generateGroqResponse([
      systemMessage,
      ...(history as ChatMessage[])?.map(msg => ({
        role: msg.sender_id === npc_id ? "assistant" : "user" as const,
        content: msg.text
      })) || [],
      { role: "user", content: message }
    ]);

    const llmResponse = completion.choices[0]?.message?.content?.trim();

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
          usage: completion.usage,
          model: completion.model
        }
      });

    if (insertError) {
      console.error("Failed to store LLM response:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: llmResponse,
        usage: completion.usage
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("LLM chat error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500 }
    );
  }
});

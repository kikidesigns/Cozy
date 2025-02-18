import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

const openai = new OpenAIApi(new Configuration({
  apiKey: Deno.env.get("OPENAI_API_KEY")
}));

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { npc_id, message, context } = await req.json();
    
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
      .or(`sender_id.eq.${npc_id},recipient_id.eq.${npc_id}`)
      .order("created_at", { ascending: true })
      .limit(10);

    if (historyError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch chat history" }),
        { status: 400 }
      );
    }

    // Format prompt with context and history
    const prompt = `You are ${context.npc_name}, an NPC in a cozy game world.
Your balance is ${context.npc_balance} sats.
${npcProfile?.knowledge_base ? `\nYour knowledge and background:\n${npcProfile.knowledge_base}\n` : ""}
Recent conversation:
${history?.map(msg => `${msg.sender_id === npc_id ? "NPC" : "Player"}: ${msg.text}`).join("\n") || ""}

Player: ${message}

Respond naturally as ${context.npc_name}:`;

    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    const llmResponse = completion.data.choices[0].text.trim();

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
          prompt,
          completion: completion.data
        }
      });

    if (insertError) {
      console.error("Failed to store LLM response:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: llmResponse
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
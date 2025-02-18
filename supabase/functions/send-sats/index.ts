import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

// Load your Supabase environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// LNbits API base URL – here we use the demo instance
const LNBITS_BASE_URL = "https://demo.lnbits.com";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { sender_id, recipient_id, amount } = await req.json();
    if (!sender_id || !recipient_id || !amount) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }

    // Fetch sender's LNbits and balance info
    const { data: sender, error: senderError } = await supabase
      .from("profiles")
      .select("bitcoin_balance, lnbits_admin_key, lnbits_wallet_id")
      .eq("id", sender_id)
      .single();
    if (senderError || !sender) {
      return new Response(JSON.stringify({ error: senderError?.message || "Sender not found" }), { status: 400 });
    }

    // Fetch recipient's LNbits info
    const { data: recipient, error: recipientError } = await supabase
      .from("profiles")
      .select("lnbits_wallet_id")
      .eq("id", recipient_id)
      .single();
    if (recipientError || !recipient) {
      return new Response(JSON.stringify({ error: recipientError?.message || "Recipient not found" }), { status: 400 });
    }

    // Verify sender has enough balance
    if (sender.bitcoin_balance < amount) {
      return new Response(JSON.stringify({ error: "Insufficient balance" }), { status: 400 });
    }

    // Call LNbits API to initiate a payment from sender's wallet
    const lnBitsResponse = await fetch(`${LNBITS_BASE_URL}/api/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": sender.lnbits_admin_key,
      },
      body: JSON.stringify({
        out: true,
        amount: amount,
      }),
    });

    const lnBitsResult = await lnBitsResponse.json();
    if (!lnBitsResponse.ok) {
      return new Response(
        JSON.stringify({ error: "LNbits payment failed", details: lnBitsResult }),
        { status: 500 }
      );
    }

    // Update the database balances via our RPC (atomic transfer)
    const { data: transferData, error: transferError } = await supabase.rpc("transfer_sats", {
      sender_id,
      recipient_id,
      amount,
    });

    if (transferError) {
      return new Response(JSON.stringify({ error: transferError.message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({ success: true, lnBitsResult, transferData }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response("Internal server error", { status: 500 });
  }
});

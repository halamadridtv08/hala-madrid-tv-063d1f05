import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = await req.json();
    const { action, payload } = body;

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get n8n config
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: config, error: configError } = await serviceClient
      .from("n8n_config")
      .select("*")
      .limit(1)
      .single();

    if (configError || !config) {
      return new Response(JSON.stringify({ error: "n8n not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!config.is_enabled) {
      return new Response(JSON.stringify({ error: "n8n integration is disabled" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!config.webhook_url) {
      return new Response(JSON.stringify({ error: "Webhook URL not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const n8nSecret = Deno.env.get("N8N_WEBHOOK_SECRET") || config.webhook_secret;
    const startTime = Date.now();

    // Call n8n webhook
    const n8nResponse = await fetch(config.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(n8nSecret ? { "X-Webhook-Secret": n8nSecret } : {}),
      },
      body: JSON.stringify({ action, payload }),
    });

    const durationMs = Date.now() - startTime;
    let responseData: unknown;

    const responseText = await n8nResponse.text();
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { text: responseText };
    }

    const status = n8nResponse.ok ? "success" : "error";

    // Log the call
    await serviceClient.from("n8n_webhook_logs").insert({
      action,
      request_payload: { action, payload },
      response_payload: responseData,
      status,
      error_message: n8nResponse.ok ? null : `HTTP ${n8nResponse.status}`,
      duration_ms: durationMs,
    });

    // Update last_sync on success
    if (n8nResponse.ok) {
      await serviceClient
        .from("n8n_config")
        .update({ last_sync: new Date().toISOString() })
        .eq("id", config.id);
    }

    return new Response(JSON.stringify({
      success: n8nResponse.ok,
      data: responseData,
      duration_ms: durationMs,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Internal error",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

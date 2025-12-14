import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLang, sourceLang } = await req.json();

    // Input validation - prevent abuse
    const MAX_TEXT_LENGTH = 5000;
    const VALID_LANGS = ['fr', 'en', 'es', 'FR', 'EN', 'ES'];

    if (!text || typeof text !== 'string') {
      console.warn("Translation request rejected: missing or invalid text");
      return new Response(
        JSON.stringify({ error: "Text is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      console.warn(`Translation request rejected: text too long (${text.length} chars)`);
      return new Response(
        JSON.stringify({ error: `Text must not exceed ${MAX_TEXT_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (text.trim().length === 0) {
      console.warn("Translation request rejected: empty text");
      return new Response(
        JSON.stringify({ error: "Text cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!targetLang || typeof targetLang !== 'string') {
      console.warn("Translation request rejected: missing targetLang");
      return new Response(
        JSON.stringify({ error: "Target language is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!VALID_LANGS.includes(targetLang) && !VALID_LANGS.includes(targetLang.toLowerCase())) {
      console.warn(`Translation request rejected: invalid targetLang (${targetLang})`);
      return new Response(
        JSON.stringify({ error: "Invalid target language. Supported: fr, en, es" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing translation: ${text.length} chars to ${targetLang}`);

    // Get DeepL API key from integrations table
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select("config, is_enabled")
      .eq("integration_key", "deepl")
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: "DeepL integration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!integration.is_enabled) {
      return new Response(
        JSON.stringify({ error: "DeepL integration is disabled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = integration.config as { api_key?: string };
    const apiKey = config?.api_key;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "DeepL API key not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DeepL language codes mapping
    const langMap: Record<string, string> = {
      fr: "FR",
      en: "EN",
      es: "ES",
    };

    const deeplTargetLang = langMap[targetLang] || targetLang.toUpperCase();
    const deeplSourceLang = sourceLang ? (langMap[sourceLang] || sourceLang.toUpperCase()) : undefined;

    // Call DeepL API
    const deeplUrl = "https://api-free.deepl.com/v2/translate";
    
    const formData = new URLSearchParams();
    formData.append("text", text);
    formData.append("target_lang", deeplTargetLang);
    if (deeplSourceLang) {
      formData.append("source_lang", deeplSourceLang);
    }

    const deeplResponse = await fetch(deeplUrl, {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!deeplResponse.ok) {
      const errorText = await deeplResponse.text();
      console.error("DeepL API error:", errorText);
      return new Response(
        JSON.stringify({ error: "DeepL API error", details: errorText }),
        { status: deeplResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const deeplData = await deeplResponse.json();
    const translatedText = deeplData.translations?.[0]?.text || text;

    return new Response(
      JSON.stringify({ translatedText, detectedSourceLang: deeplData.translations?.[0]?.detected_source_language }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

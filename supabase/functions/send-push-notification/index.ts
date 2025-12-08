import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get OneSignal config from integrations table
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('config, is_enabled')
      .eq('integration_key', 'onesignal')
      .single();

    if (integrationError || !integration?.is_enabled) {
      console.error('OneSignal not enabled or config error:', integrationError);
      return new Response(
        JSON.stringify({ error: 'OneSignal integration not enabled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = integration.config as { app_id?: string; api_key?: string };
    const { app_id, api_key } = config;

    if (!app_id || !api_key) {
      console.error('OneSignal config incomplete');
      return new Response(
        JSON.stringify({ error: 'OneSignal configuration incomplete' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { title, message, data, segments } = await req.json();

    console.log('Sending notification:', { title, message, segments });

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id,
        included_segments: segments || ['Subscribed Users'],
        headings: { en: title, fr: title },
        contents: { en: message, fr: message },
        data: data || {},
        chrome_web_icon: '/favicon.ico',
      }),
    });

    const result = await response.json();
    console.log('OneSignal response:', result);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: result }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || null;

    console.log('Geo lookup for IP:', ip);

    // Skip for local/private IPs
    if (!ip || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::1') {
      console.log('Skipping local/private IP');
      return new Response(
        JSON.stringify({ country_code: null, reason: 'local_ip' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call ip-api.com (free, no API key required, 45 req/min limit)
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode,country`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!geoRes.ok) {
      console.error('GeoIP API error:', geoRes.status);
      return new Response(
        JSON.stringify({ country_code: null, reason: 'api_error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geoData = await geoRes.json();
    console.log('GeoIP response:', geoData);

    if (geoData.status === 'fail') {
      return new Response(
        JSON.stringify({ country_code: null, reason: geoData.message || 'lookup_failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        country_code: geoData.countryCode || null,
        country_name: geoData.country || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in geo-lookup:', error);
    return new Response(
      JSON.stringify({ country_code: null, error: 'internal_error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

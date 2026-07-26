// Notifies search engines when a new article is published.
// - IndexNow ping (Bing, Yandex, Seznam, Naver)
// - Re-submits the sitemap to Google Search Console via the connector gateway
//
// Invoked from the admin (after publishing) and from publish-scheduled-articles.
// Always returns 200 with a JSON payload so the caller can log results without throwing.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const SITE_HOST = 'www.hala-madrid-tv.com';
const SITE_ORIGIN = `https://${SITE_HOST}`;
const INDEXNOW_KEY = '3679a58ee4bbe5813d6d4a3134d805ba';
const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;
const GSC_PROPERTIES = [
  `https://${SITE_HOST}/`,
  'https://hala-madrid-tv.com/',
];

type Result = { step: string; ok: boolean; status?: number; detail?: string };

async function pingIndexNow(urls: string[]): Promise<Result> {
  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
    return { step: 'indexnow', ok: res.ok || res.status === 202, status: res.status };
  } catch (e) {
    return { step: 'indexnow', ok: false, detail: (e as Error).message };
  }
}

async function submitSitemap(property: string): Promise<Result> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  const connKey = Deno.env.get('GOOGLE_SEARCH_CONSOLE_API_KEY');
  if (!apiKey || !connKey) {
    return { step: `gsc-sitemap:${property}`, ok: false, detail: 'gsc connector not configured' };
  }
  const url =
    `https://connector-gateway.lovable.dev/google_search_console/webmasters/v3/sites/` +
    `${encodeURIComponent(property)}/sitemaps/${encodeURIComponent(SITEMAP_URL)}`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Connection-Api-Key': connKey,
      },
    });
    const text = res.ok ? '' : await res.text();
    return { step: `gsc-sitemap:${property}`, ok: res.ok, status: res.status, detail: text.slice(0, 300) };
  } catch (e) {
    return { step: `gsc-sitemap:${property}`, ok: false, detail: (e as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Auth: allow either a valid CRON secret (scheduled/edge callers) or an admin JWT.
    const cronSecret = Deno.env.get('CRON_SECRET');
    const providedCron =
      req.headers.get('x-cron-secret') ||
      req.headers.get('x-cron-key') ||
      '';
    const isCronAuthorized = !!cronSecret && providedCron === cronSecret;

    let isAdminAuthorized = false;
    const authHeader = req.headers.get('Authorization') || '';
    if (!isCronAuthorized && authHeader.startsWith('Bearer ')) {
      try {
        const authed = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_ANON_KEY')!,
          { global: { headers: { Authorization: authHeader } } },
        );
        const token = authHeader.replace('Bearer ', '');
        const { data: claims } = await authed.auth.getClaims(token);
        const userId = claims?.claims?.sub;
        if (userId) {
          const admin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
          );
          const { data: role } = await admin
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .maybeSingle();
          isAdminAuthorized = !!role;
        }
      } catch (_) { /* fall through to 401 */ }
    }

    if (!isCronAuthorized && !isAdminAuthorized) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders },
      );
    }

    const body = await req.json().catch(() => ({}));
    const incomingUrls: string[] = Array.isArray(body.urls) ? body.urls : body.url ? [body.url] : [];

    // Only accept URLs on our own site (prevents SEO-API abuse under our identity)
    const isOwnUrl = (u: string) => {
      try {
        const h = new URL(u).host.toLowerCase();
        return h === SITE_HOST || h === 'hala-madrid-tv.com' || h === 'hala-madrid-tv.lovable.app';
      } catch {
        return false;
      }
    };

    // Always include the home + news index so freshness signals propagate
    const urls = Array.from(new Set([
      `${SITE_ORIGIN}/`,
      `${SITE_ORIGIN}/news`,
      ...incomingUrls.filter((u) => typeof u === 'string' && u.startsWith('http') && isOwnUrl(u)),
    ]));

    const results: Result[] = [];
    results.push(await pingIndexNow(urls));
    for (const prop of GSC_PROPERTIES) {
      results.push(await submitSitemap(prop));
    }

    // Best-effort: log to n8n_webhook_logs-like table if it exists; otherwise just console
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );
      await supabase.from('admin_audit_logs').insert({
        action: 'notify_search_engines',
        entity_type: 'article',
        metadata: { urls, results } as any,
      }).then(() => null, () => null);
    } catch (_) { /* ignore logging failures */ }

    console.log('notify-search-engines', JSON.stringify({ urls, results }));
    return new Response(JSON.stringify({ success: true, urls, results }), { headers: corsHeaders });
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: (e as Error).message }),
      { status: 200, headers: corsHeaders },
    );
  }
});
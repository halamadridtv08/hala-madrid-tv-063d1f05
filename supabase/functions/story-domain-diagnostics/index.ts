import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

const targets = [
  { name: 'Domaine personnalisé', url: 'https://hala-madrid-tv.com/' },
  { name: 'Publication Lovable', url: 'https://hala-madrid-tv.lovable.app/' },
]

const readAsset = (html: string) => html.match(/(?:src|href)=["']([^"']*\/assets\/index-[^"']+\.(?:js|css))["']/)?.[1] ?? null

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const client = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: authHeader } },
  })
  const token = authHeader.slice(7)
  const { data: claimsData, error: claimsError } = await client.auth.getClaims(token)
  const userId = claimsData?.claims?.sub
  if (claimsError || typeof userId !== 'string') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const [{ data: isAdmin }, { data: isModerator }] = await Promise.all([
    client.rpc('has_role', { _user_id: userId, _role: 'admin' }),
    client.rpc('has_role', { _user_id: userId, _role: 'moderator' }),
  ])
  if (!isAdmin && !isModerator) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const results = await Promise.all(targets.map(async (target) => {
    try {
      const response = await fetch(target.url, { headers: { 'Cache-Control': 'no-cache' }, redirect: 'follow' })
      const html = await response.text()
      return {
        ...target,
        finalUrl: response.url,
        ok: response.ok,
        status: response.status,
        server: response.headers.get('server'),
        cacheControl: response.headers.get('cache-control'),
        asset: readAsset(html),
      }
    } catch (error) {
      return { ...target, ok: false, status: 0, error: error instanceof Error ? error.message : 'Fetch failed', asset: null }
    }
  }))

  const assetsMatch = Boolean(results[0]?.asset && results[0].asset === results[1]?.asset)
  return new Response(JSON.stringify({ checkedAt: new Date().toISOString(), assetsMatch, results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
})
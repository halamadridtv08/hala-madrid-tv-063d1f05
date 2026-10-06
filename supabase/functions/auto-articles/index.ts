import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const MODEL = 'openai/gpt-6-astra'
const KEYWORDS = /real[-\s_]?madrid|madrid|mbapp|vinicius|vini-jr|bellingham|valverde|rodrygo|courtois|militao|rudiger|guler|tchouameni|camavinga|huijsen|carvajal|alaba|mendy|endrick|mourinho|bernabeu|merengue|madridista|pitarch|lunin|ceballos|asencio|fran-garcia|alexander-arnold|mastantuono|carreras|brahim/i

const STYLE_PROMPT = `Tu es le rédacteur en chef de HALA MADRID TV, un média francophone 100 % Madridista.
On te donne un article source (texte brut). Réécris-le ENTIÈREMENT avec tes propres mots (jamais de copier-coller), en français, au format maison :

- title : titre SEO percutant (60-90 caractères), commence idéalement par "Real Madrid :" ou "Mercato Real Madrid :" quand c'est pertinent.
- viral_title : variante plus émotionnelle/virale avec 1 emoji (🔥, 💥, 😱...).
- description : excerpt d'accroche pour la page d'accueil (1-2 phrases, 140-220 caractères), sans HTML.
- content : corps en HTML simple (<p>, <h3>, <ul><li>, <strong>). Structure :
  * une introduction accrocheuse de 2-3 phrases courtes ;
  * 3 à 5 sous-titres <h3> commençant par un emoji thématique (🔴, ⚪, ⚡, 💰, 👑, 📊, 🗣️, ⚽) ;
  * paragraphes courts et aérés, chiffres clés en <strong>, listes à puces avec emojis quand utile ;
  * une section "🧠 Analyse Hala Madrid TV" avec un point de vue Madridista respectueux mais passionné ;
  * termine TOUJOURS par <p><strong>Hala Madrid ! 🤍🔥</strong></p>.
- slug : URL SEO en minuscules, mots séparés par des tirets, sans accents, 4 à 9 mots.
- meta_description : 140-160 caractères pour Google.
- category : une seule parmi "Mercato", "Liga", "Ligue des Champions", "Match", "Blessures", "Entraînement", "Club", "Actualités".
- tags : 3 à 8 tags courts (joueurs, compétitions, thèmes).
- read_time : ex "3 min".
- poll_question : question de sondage courte pour les supporters ; poll_options : 2 à 4 réponses courtes.
- thumbnail_text : accroche très courte (max 6 mots) pour miniature/story.
- relevant : false si l'article ne concerne PAS le Real Madrid (dans ce cas remplis les autres champs avec des chaînes vides / tableaux vides).
N'invente aucun fait, chiffre ou citation absent de la source. Ne cite pas le média source par son nom.`

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['relevant', 'title', 'viral_title', 'description', 'content', 'slug', 'meta_description', 'category', 'tags', 'read_time', 'poll_question', 'poll_options', 'thumbnail_text'],
  properties: {
    relevant: { type: 'boolean' },
    title: { type: 'string' },
    viral_title: { type: 'string' },
    description: { type: 'string' },
    content: { type: 'string' },
    slug: { type: 'string' },
    meta_description: { type: 'string' },
    category: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    read_time: { type: 'string' },
    poll_question: { type: 'string' },
    poll_options: { type: 'array', items: { type: 'string' } },
    thumbnail_text: { type: 'string' },
  },
}

class GatewayError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

async function rewrite(apiKey: string, sourceTitle: string, text: string) {
  const res = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'fetch' },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      store: false,
      reasoning: { effort: 'low', summary: 'auto' },
      include: ['reasoning.encrypted_content'],
      text: { format: { type: 'json_schema', name: 'article', strict: true, schema: SCHEMA } },
      input: [
        { role: 'system', content: STYLE_PROMPT },
        { role: 'user', content: `Titre source : ${sourceTitle}\n\nTexte source :\n${text.slice(0, 12000)}` },
      ],
    }),
  })
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => '')
    throw new GatewayError(res.status, body.slice(0, 300) || `HTTP ${res.status}`)
  }
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = '', out = '', refusal = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    const lines = buf.split('\n'); buf = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      const d = line.slice(5).trim()
      if (!d || d === '[DONE]') continue
      try {
        const ev = JSON.parse(d)
        if (ev.type === 'response.output_text.delta') out += ev.delta ?? ''
        else if (ev.type === 'response.refusal.delta') refusal += ev.delta ?? ''
        else if (ev.type === 'error' || ev.type === 'response.failed') throw new GatewayError(500, JSON.stringify(ev).slice(0, 300))
      } catch (e) { if (e instanceof GatewayError) throw e }
    }
  }
  if (refusal) throw new GatewayError(422, 'Refus du modèle : ' + refusal.slice(0, 200))
  if (!out) throw new GatewayError(500, 'Réponse IA vide')
  return JSON.parse(out)
}

function decode(s: string) {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'").replace(/<[^>]+>/g, '').trim()
}

async function extractLinks(pageUrl: string) {
  const r = await fetch(pageUrl, { headers: { 'User-Agent': 'Mozilla/5.0 HalaMadridTV-bot' } })
  if (!r.ok) throw new Error(`Source ${pageUrl} HTTP ${r.status}`)
  const html = await r.text()
  const host = new URL(pageUrl).host
  const found = new Map<string, string>()
  const re = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
  let m
  while ((m = re.exec(html))) {
    let url = decode(m[1])
    const title = decode(m[2])
    try {
      const u = new URL(url)
      if (u.host === host && !u.pathname.startsWith('/actualite/')) continue
      ;['utm_source', 'utm_medium', 'utm_campaign'].forEach((k) => u.searchParams.delete(k))
      u.hash = ''
      url = u.toString()
      if (u.pathname.split('/').filter(Boolean).length < 1 || u.pathname.length < 25) continue
    } catch { continue }
    if (!KEYWORDS.test(url) && !KEYWORDS.test(title)) continue
    if (!found.has(url)) found.set(url, title)
  }
  return [...found.entries()].map(([url, title]) => ({ url, title }))
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = (await r.text()).slice(0, 200000)
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    return m ? decode(m[1]) : null
  } catch { return null }
}

async function crawlTexts(apifyKey: string, urls: string[]) {
  const res = await fetch('https://api.apify.com/v2/acts/apify~website-content-crawler/run-sync-get-dataset-items?timeout=110', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apifyKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startUrls: urls.map((url) => ({ url })),
      crawlerType: 'cheerio',
      maxCrawlDepth: 0,
      maxCrawlPages: urls.length,
      saveMarkdown: false,
      removeCookieWarnings: true,
    }),
  })
  if (!res.ok) throw new Error(`Apify HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const items = await res.json()
  const map = new Map<string, { text: string; title: string }>()
  for (const it of items ?? []) {
    const key = it?.metadata?.canonicalUrl || it?.url
    const val = { text: String(it?.text ?? ''), title: String(it?.metadata?.title ?? '') }
    if (it?.url) map.set(it.url, val)
    if (it?.loadedUrl) map.set(it.loadedUrl, val)
    if (key) map.set(key, val)
  }
  return map
}

function slugify(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90)
}

function nowInTz(tz: string) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date())
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0) % 24
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return h * 60 + m
}

// deno-lint-ignore no-explicit-any
async function publishTick(db: any, s: any, force = false) {
  if (s.publish_mode === 'draft' && !force) return { published: null, reason: 'mode brouillon' }
  const last = s.last_publish_at ? new Date(s.last_publish_at).getTime() : 0
  if (!force) {
    if (s.publish_mode === 'interval') {
      if (Date.now() - last < s.interval_minutes * 60000) return { published: null, reason: 'intervalle non atteint' }
    } else if (s.publish_mode === 'fixed_times') {
      const cur = nowInTz(s.timezone)
      const slots = (s.fixed_times as string[]).map((t) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0) })
      const due = slots.find((sl) => cur >= sl && cur - sl < 30)
      if (due === undefined || Date.now() - last < 40 * 60000) return { published: null, reason: 'aucun créneau maintenant' }
    }
  }
  const { data: next } = await db.from('articles').select('id, title')
    .eq('auto_generated', true).eq('is_published', false).is('scheduled_at', null)
    .order('published_at', { ascending: true }).limit(1).maybeSingle()
  if (!next) return { published: null, reason: 'aucun brouillon en attente' }
  await db.from('articles').update({ is_published: true, published_at: new Date().toISOString() }).eq('id', next.id)
  await db.from('auto_article_settings').update({ last_publish_at: new Date().toISOString() }).eq('id', 1)
  return { published: next }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const url = Deno.env.get('SUPABASE_URL')!
  const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  let body: { action?: string } = {}
  try { body = await req.json() } catch { /* empty */ }
  const action = body.action ?? 'cron'
  if (!['cron', 'scrape', 'publish_next', 'status'].includes(action)) return json({ error: 'Action inconnue' }, 400)

  // Auth: cron secret or admin
  const auth = req.headers.get('Authorization') ?? ''
  const cronSecret = Deno.env.get('CRON_SECRET')
  const isCron = !!cronSecret && (auth === `Bearer ${cronSecret}` || req.headers.get('x-cron-secret') === cronSecret)
  // 'cron' is safe to call without admin: it only does what the saved settings allow,
  // guarded by the hourly scrape interval, publish interval and a DB lock.
  if (!isCron && action !== 'cron') {
    const uc = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } })
    const { data: { user } } = await uc.auth.getUser()
    if (!user) return json({ error: 'Authentification requise' }, 401)
    const { data: role } = await db.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle()
    if (!role) return json({ error: 'Accès admin requis' }, 403)
  }

  const { data: s } = await db.from('auto_article_settings').select('*').eq('id', 1).single()
  if (!s) return json({ success: false, error: 'Réglages introuvables' })

  if (action === 'publish_next') return json({ success: true, ...(await publishTick(db, s, true)) })
  if (action === 'status') return json({ success: true, settings: s })

  const result: Record<string, unknown> = { success: true }
  if (action === 'cron') result.publish = await publishTick(db, s)

  const shouldScrape = action === 'scrape' ||
    (s.scraping_enabled && !s.paused_reason && (!s.last_scrape_at || Date.now() - new Date(s.last_scrape_at).getTime() > 55 * 60000))
  if (!shouldScrape) return json(result)
  if (s.paused_reason && action === 'cron') return json({ ...result, paused: s.paused_reason })

  // single-flight lock
  const lockUntil = new Date(Date.now() + 5 * 60000).toISOString()
  const { data: locked } = await db.from('auto_article_settings').update({ lock_until: lockUntil })
    .eq('id', 1).or(`lock_until.is.null,lock_until.lt.${new Date().toISOString()}`).select('id')
  if (!locked?.length) return json({ ...result, scrape: { skipped: 'déjà en cours' } })

  const apifyKey = Deno.env.get('APIFY_ARTICLES_API_KEY')
  const aiKey = Deno.env.get('LOVABLE_API_KEY')
  const stats = { found: 0, newItems: 0, created: 0, skipped: 0, failed: 0, errors: [] as string[] }
  try {
    if (!apifyKey) throw new Error('Clé Apify articles (APIFY_ARTICLES_API_KEY) manquante')
    if (!aiKey) throw new Error('LOVABLE_API_KEY manquante')

    for (const src of s.source_urls as string[]) {
      try {
        const links = await extractLinks(src)
        stats.found += links.length
        if (links.length) {
          const { data: ins } = await db.from('auto_article_items')
            .upsert(links.slice(0, 40).map((l) => ({ source_url: l.url, source_title: l.title })), { onConflict: 'source_url', ignoreDuplicates: true })
            .select('id')
          stats.newItems += ins?.length ?? 0
        }
      } catch (e) { stats.errors.push(String((e as Error).message)) }
    }

    const { data: pending } = await db.from('auto_article_items').select('*').eq('status', 'pending')
      .order('created_at', { ascending: false }).limit(s.max_articles_per_run)
    if (pending?.length) {
      const texts = await crawlTexts(apifyKey, pending.map((p: { source_url: string }) => p.source_url))
      const { data: admin } = await db.from('user_roles').select('user_id').eq('role', 'admin').limit(1).single()

      for (const item of pending) {
        const src = texts.get(item.source_url)
        if (!src || src.text.length < 400) {
          await db.from('auto_article_items').update({ status: 'failed', error: 'Texte source introuvable ou trop court', processed_at: new Date().toISOString() }).eq('id', item.id)
          stats.failed++; continue
        }
        try {
          const a = await rewrite(aiKey, item.source_title || src.title, src.text)
          if (!a.relevant || !a.title || !a.content) {
            await db.from('auto_article_items').update({ status: 'skipped', error: 'Hors sujet Real Madrid', processed_at: new Date().toISOString() }).eq('id', item.id)
            stats.skipped++; continue
          }
          const image = await fetchOgImage(item.source_url)
          let slug = slugify(a.slug || a.title)
          const { data: exists } = await db.from('articles').select('id').eq('slug', slug).maybeSingle()
          if (exists) slug = `${slug}-${Date.now().toString(36).slice(-4)}`
          const { data: art, error } = await db.from('articles').insert({
            title: a.title, description: a.description, content: a.content, slug,
            meta_description: a.meta_description, tags: a.tags, category: a.category || s.default_category,
            read_time: a.read_time, image_url: image, author_id: admin.user_id, author_name: 'HALA MADRID TV',
            is_published: false, featured: false, auto_generated: true, source_url: item.source_url,
            published_at: new Date().toISOString(),
          }).select('id').single()
          if (error) throw error
          if (a.poll_question && a.poll_options?.length >= 2) {
            const { data: poll, error: pe } = await db.from('article_polls').insert({ article_id: art.id, question: a.poll_question, is_active: true }).select('id').single()
            if (pe) console.warn('poll insert', pe.message)
            else await db.from('poll_options').insert(a.poll_options.slice(0, 4).map((o: string) => ({ poll_id: poll.id, option_text: o })))
          }
          await db.from('auto_article_items').update({ status: 'done', article_id: art.id, error: null, processed_at: new Date().toISOString() }).eq('id', item.id)
          stats.created++
        } catch (e) {
          if (e instanceof GatewayError && [402, 403, 429].includes(e.status)) {
            const reason = e.status === 429 ? null : `IA indisponible (${e.status}) : ${e.message}`
            if (reason) await db.from('auto_article_settings').update({ paused_reason: reason }).eq('id', 1)
            stats.errors.push(e.message); break
          }
          await db.from('auto_article_items').update({ status: 'failed', error: String((e as Error).message).slice(0, 300), processed_at: new Date().toISOString() }).eq('id', item.id)
          stats.failed++
        }
      }
    }
  } catch (e) {
    stats.errors.push(String((e as Error).message))
  } finally {
    await db.from('auto_article_settings').update({ lock_until: null, last_scrape_at: new Date().toISOString() }).eq('id', 1)
  }
  return json({ ...result, scrape: stats })
})

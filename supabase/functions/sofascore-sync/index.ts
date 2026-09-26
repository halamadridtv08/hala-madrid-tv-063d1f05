// Real Madrid data sync via Flashscore (Apify actor extractify-labs~flashscore-extractor).
// Function name kept for backward compatibility.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/apify';
const ACTOR = 'extractify-labs~flashscore-extractor';
const RM_NAME = 'real madrid';
const DEFAULT_LEAGUES = ['LaLiga', 'Champions League', 'Copa del Rey', 'Super Cup', 'Club World Cup'];
const LIVE_MIN_INTERVAL_MS = 90_000;

type Json = Record<string, any>;

async function runActor(input: Json): Promise<Json[]> {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  const apifyKey = Deno.env.get('APIFY_API_KEY');
  if (!lovableKey) throw new Error('LOVABLE_API_KEY manquant');
  if (!apifyKey) throw new Error('APIFY_API_KEY manquant (connecteur Apify non lié)');
  const headers = {
    Authorization: `Bearer ${lovableKey}`,
    'X-Connection-Api-Key': apifyKey,
    'Content-Type': 'application/json',
  };
  const call = async (path: string, init: RequestInit = {}) => {
    const r = await fetch(`${GATEWAY_URL}${path}`, { ...init, headers });
    if (!r.ok) {
      const details = await r.text();
      console.error(`Apify gateway error [${r.status}] ${path}: ${details}`);
      throw new Error(`Apify [${r.status}]: ${details.slice(0, 500)}`);
    }
    return r.json();
  };
  const started = await call(`/acts/${ACTOR}/runs?waitForFinish=30`, {
    method: 'POST',
    body: JSON.stringify({ mode: 'score_mode', sports: ['football'], ...input }),
  });
  let run = started?.data;
  const deadline = Date.now() + 130_000;
  while (run && ['READY', 'RUNNING'].includes(run.status) && Date.now() < deadline) {
    run = (await call(`/actor-runs/${run.id}?waitForFinish=30`))?.data;
  }
  if (!run) throw new Error('Apify: exécution introuvable');
  if (run.status !== 'SUCCEEDED') throw new Error(`Apify: exécution ${run.status}`);
  const data = await call(`/datasets/${run.defaultDatasetId}/items?clean=true&limit=1000`);
  return Array.isArray(data) ? data : [];
}

const isRM = (name?: string) => (name ?? '').trim().toLowerCase() === RM_NAME;
const isRealMadrid = (m: Json) => isRM(m.home_team_name) || isRM(m.away_team_name);

function mapStatus(s?: string): string {
  const v = (s ?? '').toLowerCase();
  if (v === 'finished') return 'finished';
  if (v === 'live' || v.includes('half') || v.includes('progress')) return 'live';
  if (v.includes('postpon') || v.includes('cancel')) return 'postponed';
  return 'upcoming';
}

const num = (v: any) => (v === undefined || v === null || v === '' ? null : Number(v));
const toIso = (d: string) => new Date(d.replace(' ', 'T') + (d.endsWith('Z') ? '' : 'Z')).toISOString();

function matchPayload(m: Json) {
  return {
    home_team: isRM(m.home_team_name) ? 'Real Madrid' : m.home_team_name,
    away_team: isRM(m.away_team_name) ? 'Real Madrid' : m.away_team_name,
    match_date: toIso(m.match_date),
    competition: m.tournament_name ?? null,
    status: mapStatus(m.match_status),
    home_score: num(m.match_score_home_goals),
    away_score: num(m.match_score_away_goals),
    match_details: {
      flashscore_match_id: m.match_id,
      flashscore_url: m.match_url ?? null,
      flashscore_tournament: m.tournament_name ?? null,
      flashscore_status: m.match_status ?? null,
      synced_at: new Date().toISOString(),
    },
  };
}

function dayOffsets(back: number, ahead: number): string[] {
  const out: string[] = [];
  for (let d = -back; d <= ahead; d++) out.push(String(d));
  return out;
}

async function findExisting(admin: any, payload: ReturnType<typeof matchPayload>) {
  const { data: rows } = await admin
    .from('matches')
    .select('id, home_team, away_team, match_date, match_details, status, home_score, away_score');
  const fid = payload.match_details.flashscore_match_id;
  const byId = (rows ?? []).find((r: any) => r.match_details?.flashscore_match_id === fid);
  if (byId) return byId;
  const norm = (s: string) => (s ?? '').toLowerCase().replace(/[^a-z]/g, '');
  const t = new Date(payload.match_date).getTime();
  return (rows ?? []).find((r: any) => {
    const sameDay = Math.abs(new Date(r.match_date).getTime() - t) < 2 * 86400000;
    const other = isRM(payload.home_team) ? payload.away_team : payload.home_team;
    const rOther = isRM(r.home_team) ? r.away_team : r.home_team;
    const a = norm(other), b = norm(rOther);
    return sameDay && a && b && (a.includes(b) || b.includes(a) || a.slice(0, 4) === b.slice(0, 4));
  });
}

// ---- fixtures -----------------------------------------------------------

async function fixturesAction(admin: any, body: Json) {
  const back = Math.min(Math.max(Number(body.daysBack ?? 3), 0), 7);
  const ahead = Math.min(Math.max(Number(body.daysAhead ?? 7), 0), 7);
  const leagues: string[] = Array.isArray(body.leagues) && body.leagues.length ? body.leagues.map(String) : DEFAULT_LEAGUES;

  const items = await runActor({ matchStatuses: ['all'], leagues, dayOffsets: dayOffsets(back, ahead) });
  const madrid = items.filter(isRealMadrid);

  const preview: Json[] = [];
  let created = 0, updated = 0;
  for (const m of madrid) {
    const payload = matchPayload(m);
    const current = await findExisting(admin, payload);
    preview.push({ flashscore_match_id: m.match_id, existing_id: current?.id ?? null, action: current ? 'update' : 'create', ...payload });
    if (!body.apply) continue;
    if (current) {
      const { error } = await admin.from('matches').update({
        ...payload,
        match_details: { ...(current.match_details ?? {}), ...payload.match_details },
      }).eq('id', current.id);
      if (error) throw new Error(`Mise à jour match: ${error.message}`);
      updated++;
    } else {
      const { error } = await admin.from('matches').insert(payload);
      if (error) throw new Error(`Création match: ${error.message}`);
      created++;
    }
  }
  return { scanned: items.length, found: madrid.length, created, updated, preview };
}

// ---- live ---------------------------------------------------------------

function currentMinute(timer: any): number {
  if (!timer?.half_started_at) return 0;
  const elapsed = Math.floor((Date.now() - new Date(timer.half_started_at).getTime()) / 60000);
  return (timer.current_half === 2 ? 45 : 0) + Math.max(elapsed, 0) + 1;
}

async function applyLive(admin: any, match: any, fs: Json) {
  const payload = matchPayload(fs);
  const newStatus = payload.status;
  const rawStatus = String(fs.match_status ?? '').toLowerCase();
  const isHalfTime = rawStatus.includes('half') && !rawStatus.includes('2');
  const now = new Date().toISOString();
  const log: string[] = [];

  const { data: timer } = await admin.from('match_timer_settings').select('*').eq('match_id', match.id).maybeSingle();

  // Timer + status
  if (newStatus === 'live' && !isHalfTime) {
    if (!timer || !timer.timer_started_at) {
      const row = { match_id: match.id, timer_started_at: now, half_started_at: now, current_half: 1, is_timer_running: true, is_paused: false };
      if (timer) await admin.from('match_timer_settings').update(row).eq('id', timer.id);
      else await admin.from('match_timer_settings').insert(row);
      await admin.from('live_blog_entries').insert({ match_id: match.id, minute: 0, entry_type: 'kickoff', title: "Coup d'envoi !", content: 'Le match commence.', is_important: true });
      log.push('kickoff');
    } else if (timer.is_paused && timer.current_half === 1) {
      await admin.from('match_timer_settings').update({ current_half: 2, half_started_at: now, is_paused: false, is_timer_running: true }).eq('id', timer.id);
      await admin.from('live_blog_entries').insert({ match_id: match.id, minute: 46, entry_type: 'kickoff', title: 'Reprise !', content: 'La seconde période commence.', is_important: true });
      log.push('second_half');
    }
  } else if (isHalfTime && timer && !timer.is_paused) {
    await admin.from('match_timer_settings').update({ is_paused: true, paused_at_minute: 45, is_timer_running: false }).eq('id', timer.id);
    await admin.from('live_blog_entries').insert({ match_id: match.id, minute: 45, entry_type: 'halftime', title: 'Mi-temps', content: `Mi-temps : ${payload.home_score ?? 0} - ${payload.away_score ?? 0}`, is_important: true });
    log.push('halftime');
  } else if (newStatus === 'finished' && match.status !== 'finished') {
    if (timer) await admin.from('match_timer_settings').update({ is_timer_running: false, is_paused: true, paused_at_minute: 90 }).eq('id', timer.id);
    await admin.from('live_blog_entries').insert({ match_id: match.id, minute: 90, entry_type: 'fulltime', title: 'Fin du match', content: `Score final : ${payload.home_team} ${payload.home_score ?? 0} - ${payload.away_score ?? 0} ${payload.away_team}`, is_important: true });
    log.push('fulltime');
  }

  // Goals: compare scores
  const minute = currentMinute(timer);
  const sides: Array<['home' | 'away', number | null, number | null, string]> = [
    ['home', match.home_score, payload.home_score, match.home_team],
    ['away', match.away_score, payload.away_score, match.away_team],
  ];
  const goals: Json[] = [];
  for (const [side, before, after, team] of sides) {
    const diff = (after ?? 0) - (before ?? 0);
    for (let i = 0; i < diff; i++) {
      goals.push({
        match_id: match.id,
        minute,
        entry_type: 'goal',
        title: isRM(team) ? 'BUUUT du Real Madrid !' : `But de ${team}`,
        content: `Score : ${match.home_team} ${payload.home_score ?? 0} - ${payload.away_score ?? 0} ${match.away_team}`,
        team_side: side,
        is_important: true,
      });
    }
  }
  if (goals.length) {
    await admin.from('live_blog_entries').insert(goals);
    log.push(`${goals.length} but(s)`);
  }

  await admin.from('matches').update({
    status: newStatus === 'upcoming' ? match.status : newStatus,
    home_score: payload.home_score ?? match.home_score,
    away_score: payload.away_score ?? match.away_score,
    match_details: { ...(match.match_details ?? {}), ...payload.match_details, last_live_sync: now },
  }).eq('id', match.id);

  return { matchId: match.id, status: fs.match_status, score: `${payload.home_score ?? '-'}-${payload.away_score ?? '-'}`, changes: log };
}

async function liveAction(admin: any, body: Json) {
  const now = Date.now();
  const from = new Date(now - 4 * 3600_000).toISOString();
  const to = new Date(now + 10 * 60_000).toISOString();

  let q = admin.from('matches').select('*');
  if (body.matchId) q = q.eq('id', body.matchId);
  else q = q.or(`status.eq.live,and(match_date.gte.${from},match_date.lte.${to},status.neq.finished)`);
  const { data: candidates } = await q;

  const due = (candidates ?? []).filter((m: any) => {
    if (!m.match_details?.flashscore_match_id) return false;
    if (body.force) return true;
    const last = m.match_details?.last_live_sync ? new Date(m.match_details.last_live_sync).getTime() : 0;
    return now - last >= LIVE_MIN_INTERVAL_MS;
  });
  if (!due.length) return { checked: candidates?.length ?? 0, synced: 0, results: [] };

  const leagues = [...new Set(due.map((m: any) => m.match_details.flashscore_tournament).filter(Boolean))] as string[];
  const items = await runActor({ matchStatuses: ['all'], leagues: leagues.length ? leagues : DEFAULT_LEAGUES, dayOffsets: ['-1', '0'] });

  const results: Json[] = [];
  for (const m of due) {
    const fs = items.find((i) => i.match_id === m.match_details.flashscore_match_id);
    if (!fs) { results.push({ matchId: m.id, error: 'Match introuvable sur Flashscore' }); continue; }
    results.push(await applyLive(admin, m, fs));
  }
  return { checked: candidates?.length ?? 0, synced: results.length, results };
}

// ---- server -------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const json = (payload: Json, status = 200) =>
    new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const body: Json = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const action = String(body.action ?? 'fixtures');

    // Scheduled automatic live check: public, but only runs during a Real Madrid match window
    // and at most once every 90s per match (throttled in the database), no custom input.
    if (action === 'live-auto') {
      return json({ success: true, action, ...(await liveAction(admin, {})) });
    }

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return json({ error: 'Authentification requise' }, 401);
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: 'Session invalide' }, 401);
    const { data: role } = await admin.from('user_roles').select('role').eq('user_id', user.id).in('role', ['admin', 'moderator']).maybeSingle();
    if (!role) return json({ error: 'Accès administrateur requis' }, 403);

    let result: Json;
    if (action === 'fixtures') result = await fixturesAction(admin, body);
    else if (action === 'live') result = await liveAction(admin, { matchId: body.matchId, force: true });
    else return json({ error: `Action inconnue: ${action}` }, 400);

    return json({ success: true, action, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('sofascore-sync error:', message);
    return json({ success: false, error: message }, 200);
  }
});

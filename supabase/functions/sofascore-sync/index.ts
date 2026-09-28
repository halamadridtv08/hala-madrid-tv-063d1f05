// Real Madrid data sync via Flashscore (Apify actor extractify-labs~flashscore-extractor)
// + FotMob match details (events, scorer names). Function name kept for backward compatibility.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/apify';
const ACTOR = 'extractify-labs~flashscore-extractor';
const FOTMOB_DETAILS_ACTOR = 'incognito_mode~fotmob-match-details-scraper';
const RM_NAME = 'real madrid';
const DEFAULT_LEAGUES = ['LaLiga', 'Champions League', 'Copa del Rey', 'Super Cup', 'Club World Cup'];
const LIVE_MIN_INTERVAL_MS = 90_000;

type Json = Record<string, any>;

async function runActorRaw(actorId: string, input: Json): Promise<Json[]> {
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
  const started = await call(`/acts/${actorId}/runs?waitForFinish=30`, {
    method: 'POST',
    body: JSON.stringify(input),
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

function runActor(input: Json): Promise<Json[]> {
  return runActorRaw(ACTOR, { mode: 'score_mode', sports: ['football'], ...input });
}

function runFotMobDetails(matchIds: number[]): Promise<Json[]> {
  return runActorRaw(FOTMOB_DETAILS_ACTOR, { matchIds });
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
  const STOP = new Set(['fc', 'cf', 'club', 'de', 'del', 'la', 'real', 'madrid', 'cd', 'sc', 'ud', 'rc', 'ac']);
  const tokens = (s: string) => (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z ]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w));
  const similar = (x: string, y: string) => {
    const a = tokens(x), b = tokens(y);
    if (!a.length || !b.length) return (x ?? '').toLowerCase().trim() === (y ?? '').toLowerCase().trim();
    return a.some((p) => b.some((q) => p.startsWith(q.slice(0, 3)) || q.startsWith(p.slice(0, 3))));
  };
  const t = new Date(payload.match_date).getTime();
  const other = isRM(payload.home_team) ? payload.away_team : payload.home_team;
  return (rows ?? []).find((r: any) => {
    if (Math.abs(new Date(r.match_date).getTime() - t) > 2 * 86400000) return false;
    const rOther = isRM(r.home_team) ? r.away_team : r.home_team;
    return similar(other, rOther);
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
      // Existing match: keep your names/date/venue, only complete score, status and Flashscore link.
      const { error } = await admin.from('matches').update({
        status: payload.status === 'upcoming' ? current.status : payload.status,
        home_score: payload.home_score ?? current.home_score,
        away_score: payload.away_score ?? current.away_score,
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
    // Enrich goal entries with scorer names from FotMob when the match is linked.
    const fotmobId = match.match_details?.fotmob_match_id;
    if (fotmobId) {
      try {
        const details = await runFotMobDetails([Number(fotmobId)]);
        const events = mapFotMobEvents(details[0], match.home_team, match.away_team);
        const goalEvents = events.filter((e) => e.entry_type === 'goal' && e.player_name);
        for (const g of goals) {
          const ev = goalEvents.find((e) => e.team_side === g.team_side && Math.abs((e.minute ?? 0) - (g.minute ?? 0)) <= 3);
          if (ev?.player_name) {
            await admin.from('live_blog_entries')
              .update({ title: `${g.title} — ${ev.player_name}`, content: `${g.content} · Buteur : ${ev.player_name}` })
              .eq('match_id', match.id).eq('entry_type', 'goal').eq('minute', g.minute).eq('team_side', g.team_side);
          }
        }
      } catch (e) {
        console.error('FotMob scorer enrichment failed:', e);
      }
    }
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

// ---- FotMob match details (missing events, scorer names) ----------------

function parseFotMobId(raw: unknown): number | null {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  const m = s.match(/fotmob\.com\/match(?:es)?\/(\d+)/i) || s.match(/(\d{5,})/);
  return m ? Number(m[1]) : null;
}

// Tolerant mapping of FotMob events to live_blog_entries rows.
function mapFotMobEvents(detail: Json | undefined, homeTeam: string, awayTeam: string): Json[] {
  const rawEvents: Json[] = Array.isArray(detail?.events) ? detail.events : [];
  const out: Json[] = [];
  for (const e of rawEvents) {
    const type = String(e.type ?? e.eventType ?? '').toLowerCase();
    const minute = num(e.minute ?? e.time ?? e.min);
    const player = e.player?.name ?? e.playerName ?? e.name ?? e.player ?? null;
    const assist = e.assist?.name ?? e.assistName ?? e.assist ?? null;
    const teamName = e.team?.name ?? e.teamName ?? null;
    const sideRaw = String(e.homeAway ?? e.side ?? '').toLowerCase();
    let side: 'home' | 'away' | null = sideRaw === 'home' || sideRaw === 'away' ? sideRaw : null;
    if (!side && teamName) {
      side = similarName(teamName, homeTeam) ? 'home' : similarName(teamName, awayTeam) ? 'away' : null;
    }
    if (!side) continue;

    if (type.includes('goal')) {
      const isPen = type.includes('pen') && !type.includes('miss');
      const isOwn = type.includes('own');
      out.push({
        entry_type: isPen ? 'penalty_goal' : 'goal',
        minute,
        team_side: side,
        player_name: player,
        title: isOwn ? `But contre son camp (${player ?? '?'})` : side === (isRM(homeTeam) ? 'home' : 'away') && isRM(side === 'home' ? homeTeam : awayTeam)
          ? `BUUUT du Real Madrid ! — ${player ?? ''}`.trim()
          : `But de ${side === 'home' ? homeTeam : awayTeam} — ${player ?? ''}`.trim(),
        content: [player ? `Buteur : ${player}` : null, assist ? `Passe : ${assist}` : null].filter(Boolean).join(' · ') || 'But',
        is_important: true,
      });
    } else if (type.includes('card') || type.includes('yellow') || type.includes('red')) {
      const isRed = type.includes('red') || String(e.card ?? '').toLowerCase().includes('red');
      const isSecondYellow = type.includes('second') || String(e.card ?? '').toLowerCase().includes('second');
      out.push({
        entry_type: isSecondYellow ? 'second_yellow' : isRed ? 'red_card' : 'yellow_card',
        minute,
        team_side: side,
        player_name: player,
        title: `${isRed || isSecondYellow ? 'Carton rouge' : 'Carton jaune'} — ${player ?? side === 'home' ? homeTeam : awayTeam}`,
        content: player ?? '',
        is_important: isRed || isSecondYellow,
      });
    } else if (type.includes('sub')) {
      const playerIn = e.playerIn?.name ?? e.playerIn ?? null;
      const playerOut = e.playerOut?.name ?? e.playerOut ?? player;
      out.push({
        entry_type: 'substitution',
        minute,
        team_side: side,
        player_name: playerIn ?? playerOut,
        title: `Changement — ${side === 'home' ? homeTeam : awayTeam}`,
        content: [playerIn ? `Entrée : ${playerIn}` : null, playerOut ? `Sortie : ${playerOut}` : null].filter(Boolean).join(' · '),
        is_important: false,
      });
    } else if (type.includes('pen') && type.includes('miss')) {
      out.push({
        entry_type: 'penalty_missed', minute, team_side: side, player_name: player,
        title: `Penalty manqué — ${player ?? side === 'home' ? homeTeam : awayTeam}`,
        content: player ?? '', is_important: true,
      });
    }
  }
  return out;
}

function similarName(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, ' ').trim();
  const x = norm(a), y = norm(b);
  return x === y || x.includes(y) || y.includes(x);
}

async function fotmobDetailsAction(admin: any, body: Json) {
  const matchId = String(body.matchId ?? '');
  if (!matchId) throw new Error('matchId requis');
  const { data: match, error } = await admin.from('matches').select('*').eq('id', matchId).maybeSingle();
  if (error || !match) throw new Error('Match introuvable dans la base');

  const fotmobId = parseFotMobId(body.fotmobMatchId ?? body.fotmobUrl) ?? parseFotMobId(match.match_details?.fotmob_match_id);
  if (!fotmobId) throw new Error('Fournissez l’ID ou l’URL FotMob du match (ex. https://www.fotmob.com/match/1234567)');

  const details = await runFotMobDetails([fotmobId]);
  const detail = details[0];
  if (!detail) throw new Error('Match introuvable sur FotMob');

  const events = mapFotMobEvents(detail, match.home_team, match.away_team);
  const { data: existing } = await admin.from('live_blog_entries')
    .select('minute, entry_type, team_side').eq('match_id', match.id);
  const key = (e: Json) => `${e.entry_type}|${e.minute ?? -1}|${e.team_side ?? ''}`;
  const have = new Set((existing ?? []).map(key));
  const toAdd = events.filter((e) => !have.has(key(e)));

  const homeScore = num(detail.homeTeam?.score ?? detail.homeScore);
  const awayScore = num(detail.awayTeam?.score ?? detail.awayScore);
  const status = detail.finished ? 'finished' : detail.started ? 'live' : match.status;

  const preview = {
    fotmob_match_id: fotmobId,
    match_name: detail.matchName ?? `${match.home_team} – ${match.away_team}`,
    score: `${homeScore ?? '-'}-${awayScore ?? '-'}`,
    status,
    events_found: events.length,
    events_existing: events.length - toAdd.length,
    events_to_add: toAdd,
  };
  if (!body.apply) return preview;

  if (toAdd.length) {
    const rows = toAdd.map((e) => ({ ...e, match_id: match.id }));
    const { error: insErr } = await admin.from('live_blog_entries').insert(rows);
    if (insErr) throw new Error(`Insertion événements: ${insErr.message}`);
  }
  await admin.from('matches').update({
    status: status === 'upcoming' ? match.status : status,
    home_score: homeScore ?? match.home_score,
    away_score: awayScore ?? match.away_score,
    match_details: { ...(match.match_details ?? {}), fotmob_match_id: fotmobId, fotmob_url: detail.matchUrl ?? null, fotmob_synced_at: new Date().toISOString() },
  }).eq('id', match.id);

  return { ...preview, applied: true, inserted: toAdd.length };
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

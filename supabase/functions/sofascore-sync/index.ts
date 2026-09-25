import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/apify';
const ACTOR = 'scrapesmith~sofascore-scraper';
// Sofascore team id for Real Madrid (men)
const REAL_MADRID_ID = 2829;
// LaLiga, Champions League, Copa del Rey, Supercopa, Club World Cup, UEFA Super Cup
const DEFAULT_LEAGUES = ['8', '7', '329', '213', '357', '30'];

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

  // Async run + short polling: avoids gateway timeouts on long scrapes
  const started = await call(`/acts/${ACTOR}/runs?waitForFinish=30`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  let run = started?.data;
  const deadline = Date.now() + 130_000;
  while (run && ['READY', 'RUNNING'].includes(run.status) && Date.now() < deadline) {
    const polled = await call(`/actor-runs/${run.id}?waitForFinish=30`);
    run = polled?.data;
  }
  if (!run) throw new Error('Apify: exécution introuvable');
  if (run.status !== 'SUCCEEDED') {
    throw new Error(`Apify: exécution ${run.status === 'RUNNING' ? 'trop longue, réduisez la période' : run.status}`);
  }
  const data = await call(`/datasets/${run.defaultDatasetId}/items?clean=true&limit=1000`);
  return Array.isArray(data) ? data : [];
}

function isRealMadrid(match: Json): boolean {
  return match.homeTeamId === REAL_MADRID_ID || match.awayTeamId === REAL_MADRID_ID;
}

function mapStatus(statusType?: string): string {
  switch (statusType) {
    case 'finished':
      return 'finished';
    case 'inprogress':
      return 'live';
    case 'canceled':
    case 'postponed':
      return 'postponed';
    default:
      return 'upcoming';
  }
}

function matchPayload(m: Json) {
  return {
    home_team: m.homeTeamName,
    away_team: m.awayTeamName,
    match_date: m.startTime,
    venue: m.venue ?? null,
    competition: m.uniqueTournamentName ?? m.tournament ?? null,
    status: mapStatus(m.statusType),
    home_score: typeof m.homeScore === 'number' ? m.homeScore : null,
    away_score: typeof m.awayScore === 'number' ? m.awayScore : null,
    match_details: {
      sofascore_event_id: m.id,
      sofascore_custom_id: m.customId ?? null,
      sofascore_slug: m.eventSlug ?? null,
      sofascore_url: m.url ?? null,
      round: m.round ?? null,
      season: m.seasonName ?? null,
      referee: m.referee ?? null,
      attendance: m.attendance ?? null,
      venue_city: m.venueCity ?? null,
      status_description: m.statusDescription ?? null,
      synced_at: new Date().toISOString(),
    },
  };
}

function eventUrl(m: Json): string | null {
  if (m.sofascore_url) return m.sofascore_url;
  if (m.eventSlug && m.customId) {
    return `https://www.sofascore.com/football/match/${m.eventSlug}/${m.customId}`;
  }
  return null;
}

// ---- incidents -> live blog entries -------------------------------------

function incidentToEntry(inc: Json, homeName: string, awayName: string) {
  const side = inc.isHome ? 'home' : 'away';
  const teamName = inc.isHome ? homeName : awayName;
  const minute = typeof inc.time === 'number' ? inc.time : null;

  if (inc.incidentType === 'goal') {
    const scorer = inc.player?.name ?? 'Buteur inconnu';
    const assist = inc.assist1?.name;
    const cls = inc.incidentClass;
    let type = 'goal';
    let label = 'But';
    if (cls === 'penalty') { type = 'penalty_goal'; label = 'But sur penalty'; }
    else if (cls === 'ownGoal') { type = 'own_goal'; label = 'But contre son camp'; }
    return {
      entry_type: type,
      minute,
      title: `${label} — ${teamName}`,
      content: assist ? `${scorer} (passe décisive : ${assist})` : scorer,
      team_side: side,
      is_important: true,
    };
  }

  if (inc.incidentType === 'card') {
    const player = inc.player?.name ?? inc.playerName ?? 'Joueur';
    const cls = inc.incidentClass;
    const map: Record<string, [string, string]> = {
      yellow: ['yellow_card', 'Carton jaune'],
      yellowRed: ['second_yellow_card', 'Deuxième carton jaune'],
      red: ['red_card', 'Carton rouge'],
    };
    const [type, label] = map[cls] ?? ['yellow_card', 'Carton jaune'];
    return {
      entry_type: type,
      minute,
      title: `${label} — ${teamName}`,
      content: inc.reason ? `${player} (${inc.reason})` : player,
      team_side: side,
      card_type: cls === 'yellowRed' ? 'second_yellow' : cls === 'red' ? 'red' : 'yellow',
      card_reason: inc.reason ?? null,
      is_important: cls !== 'yellow',
    };
  }

  if (inc.incidentType === 'substitution') {
    return {
      entry_type: 'substitution',
      minute,
      title: `Remplacement — ${teamName}`,
      content: `${inc.playerIn?.name ?? '?'} remplace ${inc.playerOut?.name ?? '?'}`,
      team_side: side,
      is_important: false,
    };
  }

  if (inc.incidentType === 'varDecision') {
    return {
      entry_type: 'var',
      minute,
      title: `VAR — ${teamName}`,
      content: inc.incidentClass ?? 'Décision de l\'arbitrage vidéo',
      team_side: side,
      is_important: true,
    };
  }

  if (inc.incidentType === 'injuryTime') {
    return {
      entry_type: 'extra_time',
      minute,
      title: 'Temps additionnel',
      content: `${inc.length ?? 0} minute(s) de temps additionnel`,
      team_side: null,
      is_important: false,
    };
  }

  if (inc.incidentType === 'period') {
    const text = String(inc.text ?? '');
    const map: Record<string, [string, string]> = {
      HT: ['halftime', 'Mi-temps'],
      FT: ['fulltime', 'Fin du match'],
      AET: ['fulltime', 'Fin de la prolongation'],
    };
    const [type, label] = map[text] ?? ['update', text || 'Période'];
    return {
      entry_type: type,
      minute,
      title: label,
      content: `${label} : ${inc.homeScore ?? 0} - ${inc.awayScore ?? 0}`,
      team_side: null,
      is_important: true,
    };
  }

  return null;
}

// ---- actions -------------------------------------------------------------

async function fixturesAction(admin: any, body: Json) {
  const daysBack = Math.min(Math.max(Number(body.daysBack ?? 0), 0), 14);
  const daysAhead = Math.min(Math.max(Number(body.daysAhead ?? 14), 0), 14);
  const leagues: string[] = Array.isArray(body.leagues) && body.leagues.length
    ? body.leagues.map(String)
    : DEFAULT_LEAGUES;

  const start = new Date(Date.now() - daysBack * 86400000);
  const date = start.toISOString().slice(0, 10);

  const items = await runActor({
    mode: 'scheduled',
    sports: ['football'],
    date,
    daysAhead: Math.min(daysBack + daysAhead, 14),
    uniqueTournamentIds: leagues,
    maxItems: 400,
    includeStatistics: false,
    includeLineups: false,
    includeIncidents: false,
    includeStandings: false,
    includeOdds: false,
    includeVotes: false,
    includeVenueDetails: true,
  });

  const madrid = items.filter((i) => i.type === 'match' && isRealMadrid(i));

  const { data: existing } = await admin
    .from('matches')
    .select('id, home_team, away_team, match_date, home_score, away_score, status, match_details');

  const byEvent = new Map<number, any>();
  for (const row of existing ?? []) {
    const sid = row.match_details?.sofascore_event_id;
    if (sid) byEvent.set(Number(sid), row);
  }

  const preview: Json[] = [];
  let created = 0;
  let updated = 0;

  for (const m of madrid) {
    const payload = matchPayload(m);
    let current = byEvent.get(Number(m.id));
    if (!current) {
      // fallback: same teams within 2 days
      current = (existing ?? []).find((row: any) =>
        row.home_team?.toLowerCase() === payload.home_team?.toLowerCase() &&
        row.away_team?.toLowerCase() === payload.away_team?.toLowerCase() &&
        Math.abs(new Date(row.match_date).getTime() - new Date(payload.match_date).getTime()) < 2 * 86400000
      );
    }

    preview.push({
      sofascore_event_id: m.id,
      existing_id: current?.id ?? null,
      action: current ? 'update' : 'create',
      ...payload,
    });

    if (body.apply) {
      if (current) {
        const { error } = await admin
          .from('matches')
          .update({ ...payload, match_details: { ...(current.match_details ?? {}), ...payload.match_details } })
          .eq('id', current.id);
        if (error) throw new Error(`Mise à jour match: ${error.message}`);
        updated++;
      } else {
        const { error } = await admin.from('matches').insert(payload);
        if (error) throw new Error(`Création match: ${error.message}`);
        created++;
      }
    }
  }

  return { scanned: items.length, found: madrid.length, created, updated, preview };
}

async function matchAction(admin: any, body: Json) {
  const matchId: string | undefined = body.matchId;
  if (!matchId) throw new Error('matchId requis');

  const { data: match, error } = await admin
    .from('matches')
    .select('id, home_team, away_team, match_details')
    .eq('id', matchId)
    .single();
  if (error || !match) throw new Error('Match introuvable');

  const url = body.url ?? eventUrl(match.match_details ?? {});
  if (!url) throw new Error('Ce match n\'est pas encore lié à une page Sofascore. Lancez d\'abord l\'import du calendrier.');

  const items = await runActor({
    mode: 'url',
    urls: [url],
    maxItems: 1,
    includeStatistics: body.includeStatistics !== false,
    includeLineups: false,
    includeIncidents: true,
    includeStandings: false,
    includeOdds: false,
    includeVotes: false,
    includeVenueDetails: true,
  });

  const data = items.find((i) => i.type === 'match');
  if (!data) throw new Error('Aucune donnée renvoyée pour ce match');

  const incidents: Json[] = Array.isArray(data.incidents) ? data.incidents : [];
  const entries = incidents
    .map((inc) => incidentToEntry(inc, data.homeTeamName, data.awayTeamName))
    .filter(Boolean)
    .reverse() as Json[];

  let scoreUpdated = false;
  let entriesCreated = 0;

  if (body.apply) {
    const payload = matchPayload(data);
    const { error: upErr } = await admin
      .from('matches')
      .update({
        status: payload.status,
        home_score: payload.home_score,
        away_score: payload.away_score,
        match_details: { ...(match.match_details ?? {}), ...payload.match_details, statistics: data.statistics ?? null },
      })
      .eq('id', matchId);
    if (upErr) throw new Error(`Mise à jour score: ${upErr.message}`);
    scoreUpdated = true;

    if (body.syncEvents !== false) {
      const { data: current } = await admin
        .from('live_blog_entries')
        .select('minute, entry_type, content')
        .eq('match_id', matchId);
      const seen = new Set((current ?? []).map((e: any) => `${e.minute}|${e.entry_type}|${(e.content ?? '').trim()}`));

      const toInsert = entries
        .filter((e) => !seen.has(`${e.minute}|${e.entry_type}|${(e.content ?? '').trim()}`))
        .map((e) => ({ ...e, match_id: matchId }));

      if (toInsert.length) {
        const { error: insErr } = await admin.from('live_blog_entries').insert(toInsert);
        if (insErr) throw new Error(`Création des événements: ${insErr.message}`);
        entriesCreated = toInsert.length;
      }
    }
  }

  return {
    match: {
      home_team: data.homeTeamName,
      away_team: data.awayTeamName,
      home_score: data.homeScore,
      away_score: data.awayScore,
      status: mapStatus(data.statusType),
      status_description: data.statusDescription,
      competition: data.uniqueTournamentName ?? data.tournament,
      url: data.url,
    },
    statistics: data.statistics ?? null,
    entries,
    scoreUpdated,
    entriesCreated,
  };
}

async function squadAction() {
  const items = await runActor({
    mode: 'url',
    urls: [`https://www.sofascore.com/team/real-madrid/${REAL_MADRID_ID}`],
    maxItems: 60,
    includeSquad: true,
    includeStatistics: false,
    includeIncidents: false,
    includeStandings: false,
  });

  const players = items
    .filter((i) => i.type === 'player' || i.position)
    .map((p) => ({
      name: p.name,
      position: p.position ?? null,
      jerseyNumber: p.jerseyNumber ?? null,
      nationality: p.country ?? p.nationality ?? null,
      height: p.height ?? null,
      marketValue: p.proposedMarketValueRaw?.value ?? p.marketValue ?? null,
      dateOfBirth: p.dateOfBirthTimestamp
        ? new Date(p.dateOfBirthTimestamp * 1000).toISOString().slice(0, 10)
        : null,
      contractUntil: p.contractUntilTimestamp
        ? new Date(p.contractUntilTimestamp * 1000).toISOString().slice(0, 10)
        : null,
      url: p.url ?? null,
    }));

  const team = items.find((i) => i.type === 'team') ?? null;
  return { team, players };
}

async function standingsAction(body: Json) {
  const league = String(body.league ?? '8');
  const items = await runActor({
    mode: 'tournament',
    uniqueTournamentIds: [league],
    includePastMatches: false,
    includeUpcomingMatches: false,
    includeStandings: true,
    includeStatistics: false,
    includeIncidents: false,
    maxItems: 5,
  });
  const withStandings = items.find((i) => i.standings);
  return { standings: withStandings?.standings ?? null };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (payload: Json, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const cronSecret = Deno.env.get('CRON_SECRET');
    const isCron = Boolean(cronSecret && token === cronSecret);

    if (!isCron) {
      if (!token) return json({ error: 'Authentification requise' }, 401);
      const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: { user }, error: authError } = await userClient.auth.getUser();
      if (authError || !user) return json({ error: 'Session invalide' }, 401);

      const { data: role } = await admin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator'])
        .maybeSingle();
      if (!role) return json({ error: 'Accès administrateur requis' }, 403);
    }

    const body: Json = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const action = String(body.action ?? 'fixtures');

    let result: Json;
    switch (action) {
      case 'fixtures':
        result = await fixturesAction(admin, body);
        break;
      case 'match':
        result = await matchAction(admin, body);
        break;
      case 'squad':
        result = await squadAction();
        break;
      case 'standings':
        result = await standingsAction(body);
        break;
      default:
        return json({ error: `Action inconnue: ${action}` }, 400);
    }

    return json({ success: true, action, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('sofascore-sync error:', message);
    return json({ success: false, error: message }, 200);
  }
});

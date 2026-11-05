import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Allowed origins for CORS
const getAllowedOrigins = () => {
  return [
    'https://qjnppcfbywfazwolfppo.lovableproject.com',
    'https://realmadridfr.lovable.app',
    'https://hala-madrid-tv.lovable.app',
    'https://hala-madrid-tv.com',
    'https://www.hala-madrid-tv.com'
  ];
};

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = origin && (
    allowedOrigins.includes(origin) || 
    /^https:\/\/.*\.lovableproject\.com$/.test(origin) ||
    /^https:\/\/.*\.lovable\.app$/.test(origin) ||
    /^https:\/\/([a-z0-9-]+\.)*hala-madrid-tv\.com$/.test(origin) ||
    /^capacitor:\/\/localhost$/.test(origin)
  );
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
};

const FOOTBALL_API = {
  BASE_URL: 'https://v3.football.api-sports.io',
  REAL_MADRID_ID: 541,
  LA_LIGA_ID: 140,
};

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string) {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache[key] = { data, timestamp: Date.now() };
}

async function fetchFromApi(endpoint: string) {
  const apiKey = Deno.env.get('FOOTBALL_API_KEY');
  if (!apiKey) {
    throw new Error('FOOTBALL_API_KEY not configured');
  }

  const url = `${FOOTBALL_API.BASE_URL}${endpoint}`;
  console.log(`Fetching from API: ${url}`);

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-rapidapi-key': apiKey
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status} - ${errorText}`);
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// Get season year from site_content (e.g., "2025/26" -> 2025)
async function getCurrentSeasonYear(): Promise<number> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase not configured, using default season 2025');
      return 2025;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('site_content')
      .select('content_value')
      .eq('content_key', 'current_season')
      .single();
    
    if (error || !data?.content_value) {
      console.log('No season found in site_content, using default 2025');
      return 2025;
    }
    
    // Parse "2025/26" to 2025
    const seasonYear = parseInt(data.content_value.split('/')[0]);
    console.log(`Using season year from site_content: ${seasonYear}`);
    return isNaN(seasonYear) ? 2025 : seasonYear;
  } catch (err) {
    console.error('Error fetching season:', err);
    return 2025;
  }
}

// ---- Local data first (API-Football account suspended: the site now relies on
// its own matches table, fed by the Flashscore/FotMob sync, and on the local
// laliga_standings table, fed by FotMob). API-Football remains a fallback.

function getAdminClient() {
  return createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
}

// Local standings in the exact API-Football shape the frontend expects.
async function localStandings(season: number) {
  const { data } = await getAdminClient()
    .from('laliga_standings').select('*').eq('season', season).order('rank', { ascending: true });
  if (!data?.length) return null;
  return data.map((t: any) => ({
    rank: t.rank,
    team: { id: t.team_api_id, name: t.team_name, logo: t.team_logo ?? '' },
    points: t.points,
    goalsDiff: t.goal_difference,
    form: '',
    all: {
      played: t.played, win: t.won, draw: t.drawn, lose: t.lost,
      goals: { for: t.goals_for, against: t.goals_against },
    },
  }));
}

const matchToFixture = (m: any) => ({
  fixture: {
    id: m.id,
    status: { short: m.status === 'live' ? 'LIVE' : m.status === 'finished' ? 'FT' : 'NS', elapsed: null },
    date: m.match_date,
  },
  league: { name: m.competition ?? '' },
  teams: {
    home: { id: 0, name: m.home_team, logo: '' },
    away: { id: 0, name: m.away_team, logo: '' },
  },
  goals: { home: m.home_score, away: m.away_score },
});

async function localFixtures(kind: 'live' | 'next' | 'last', count: number) {
  const admin = getAdminClient();
  let q = admin.from('matches').select('id, home_team, away_team, match_date, status, home_score, away_score, competition');
  if (kind === 'live') q = q.eq('status', 'live');
  else if (kind === 'next') q = q.eq('status', 'upcoming').gte('match_date', new Date().toISOString()).order('match_date', { ascending: true }).limit(count);
  else q = q.eq('status', 'finished').order('match_date', { ascending: false }).limit(count);
  const { data } = await q;
  return data?.length ? data.map(matchToFixture) : null;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require a valid Supabase project key (anon or user JWT) to block
    // direct internet abuse of the paid Football API quota. Public data so
    // we accept anonymous browser visitors via the publishable key.
    const apikey = req.headers.get('apikey') || req.headers.get('x-api-key');
    const authHeader = req.headers.get('Authorization');
    const expectedAnon = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!expectedAnon || (apikey !== expectedAnon && bearer !== expectedAnon && !bearer.startsWith('ey'))) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Actions with caller-chosen identifiers (fixtures, teams, dates) are
    // restricted to signed-in admins/moderators to protect the paid quota.
    const STAFF_ONLY = new Set(['fixture-details', 'fixture-events', 'fixture-lineups', 'fixture-statistics', 'search-fixtures']);
    const customParams = ['team', 'next', 'last'].some((k) => url.searchParams.has(k));
    if (STAFF_ONLY.has(action ?? '') || customParams) {
      const sbUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const uc = createClient(sbUrl, expectedAnon, { global: { headers: { Authorization: authHeader ?? '' } } });
      const { data: { user } } = await uc.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Authentification requise' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const admin = createClient(sbUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
      const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', user.id).in('role', ['admin', 'moderator']);
      if (!roles || roles.length === 0) {
        return new Response(JSON.stringify({ error: 'Accès refusé' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const idOk = (v: string | null) => v === null || /^\d{1,10}$/.test(v);
      const dateOk = (v: string | null) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v);
      if (!idOk(url.searchParams.get('fixture')) || !idOk(url.searchParams.get('team')) || !idOk(url.searchParams.get('season'))
        || !idOk(url.searchParams.get('next')) || !idOk(url.searchParams.get('last'))
        || !dateOk(url.searchParams.get('from')) || !dateOk(url.searchParams.get('to'))) {
        return new Response(JSON.stringify({ error: 'Paramètres invalides' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    // Get current season dynamically
    const CURRENT_SEASON = await getCurrentSeasonYear();

    let responseData;
    let cacheKey: string;

    switch (action) {
      case 'standings':
        cacheKey = `standings_${FOOTBALL_API.LA_LIGA_ID}_${CURRENT_SEASON}`;
        responseData = getCached(cacheKey);
        if (!responseData) {
          const data = await fetchFromApi(
            `/standings?league=${FOOTBALL_API.LA_LIGA_ID}&season=${CURRENT_SEASON}`
          );
          responseData = data.response?.[0]?.league?.standings?.[0] || [];
          setCache(cacheKey, responseData);
        }
        break;

      case 'live':
        cacheKey = `live_${FOOTBALL_API.LA_LIGA_ID}`;
        responseData = getCached(cacheKey);
        if (!responseData) {
          const data = await fetchFromApi(
            `/fixtures?league=${FOOTBALL_API.LA_LIGA_ID}&season=${CURRENT_SEASON}&live=all`
          );
          responseData = data.response || [];
          setCache(cacheKey, responseData);
        }
        break;

      case 'team-stats':
        cacheKey = `team_stats_${FOOTBALL_API.REAL_MADRID_ID}_${CURRENT_SEASON}`;
        responseData = getCached(cacheKey);
        if (!responseData) {
          const data = await fetchFromApi(
            `/teams/statistics?league=${FOOTBALL_API.LA_LIGA_ID}&season=${CURRENT_SEASON}&team=${FOOTBALL_API.REAL_MADRID_ID}`
          );
          responseData = data.response || null;
          setCache(cacheKey, responseData);
        }
        break;

      case 'fixtures':
        const teamId = url.searchParams.get('team') || FOOTBALL_API.REAL_MADRID_ID;
        const next = url.searchParams.get('next') || '5';
        cacheKey = `fixtures_${teamId}_next_${next}`;
        responseData = getCached(cacheKey);
        if (!responseData) {
          const data = await fetchFromApi(
            `/fixtures?team=${teamId}&next=${next}`
          );
          responseData = data.response || [];
          setCache(cacheKey, responseData);
        }
        break;

      case 'last-matches':
        const lastTeamId = url.searchParams.get('team') || FOOTBALL_API.REAL_MADRID_ID;
        const last = url.searchParams.get('last') || '5';
        cacheKey = `last_matches_${lastTeamId}_${last}`;
        responseData = getCached(cacheKey);
        if (!responseData) {
          const data = await fetchFromApi(
            `/fixtures?team=${lastTeamId}&last=${last}`
          );
          responseData = data.response || [];
          setCache(cacheKey, responseData);
        }
        break;

      case 'fixture-details':
        const fixtureId = url.searchParams.get('fixture');
        if (!fixtureId) {
          return new Response(
            JSON.stringify({ error: 'fixture parameter required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        cacheKey = `fixture_details_${fixtureId}`;
        responseData = getCached(cacheKey);
        if (!responseData) {
          const data = await fetchFromApi(`/fixtures?id=${fixtureId}`);
          responseData = data.response?.[0] || null;
          setCache(cacheKey, responseData);
        }
        break;

      case 'fixture-events':
        const eventsFixtureId = url.searchParams.get('fixture');
        if (!eventsFixtureId) {
          return new Response(
            JSON.stringify({ error: 'fixture parameter required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        cacheKey = `fixture_events_${eventsFixtureId}`;
        responseData = getCached(cacheKey);
        if (!responseData) {
          const data = await fetchFromApi(`/fixtures/events?fixture=${eventsFixtureId}`);
          responseData = data.response || [];
          setCache(cacheKey, responseData);
        }
        break;

      case 'fixture-lineups':
        const lineupsFixtureId = url.searchParams.get('fixture');
        if (!lineupsFixtureId) {
          return new Response(
            JSON.stringify({ error: 'fixture parameter required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        cacheKey = `fixture_lineups_${lineupsFixtureId}`;
        responseData = getCached(cacheKey);
        if (!responseData) {
          const data = await fetchFromApi(`/fixtures/lineups?fixture=${lineupsFixtureId}`);
          responseData = data.response || [];
          setCache(cacheKey, responseData);
        }
        break;

      case 'fixture-statistics':
        const statsFixtureId = url.searchParams.get('fixture');
        if (!statsFixtureId) {
          return new Response(
            JSON.stringify({ error: 'fixture parameter required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        cacheKey = `fixture_statistics_${statsFixtureId}`;
        responseData = getCached(cacheKey);
        if (!responseData) {
          const data = await fetchFromApi(`/fixtures/statistics?fixture=${statsFixtureId}`);
          responseData = data.response || [];
          setCache(cacheKey, responseData);
        }
        break;

      case 'search-fixtures':
        const searchTeam = url.searchParams.get('team') || FOOTBALL_API.REAL_MADRID_ID;
        const fromDate = url.searchParams.get('from');
        const toDate = url.searchParams.get('to');
        const season = url.searchParams.get('season'); // Optional season parameter
        
        // Build endpoint - if no season specified, don't include it (search by date only)
        let searchEndpoint = `/fixtures?team=${searchTeam}`;
        if (season) searchEndpoint += `&season=${season}`;
        if (fromDate) searchEndpoint += `&from=${fromDate}`;
        if (toDate) searchEndpoint += `&to=${toDate}`;
        
        cacheKey = `search_fixtures_${searchTeam}_${season || 'all'}_${fromDate}_${toDate}`;
        responseData = getCached(cacheKey);
        if (!responseData) {
          const data = await fetchFromApi(searchEndpoint);
          responseData = data.response || [];
          setCache(cacheKey, responseData);
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: standings, live, team-stats, fixtures, last-matches, fixture-details, fixture-events, fixture-lineups, fixture-statistics, search-fixtures' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Action ${action} completed successfully`);

    return new Response(
      JSON.stringify({ data: responseData, cached: !!getCached(cacheKey!) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in football-api function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

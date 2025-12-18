import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FOOTBALL_API = {
  BASE_URL: 'https://v3.football.api-sports.io',
  REAL_MADRID_ID: 541,
  LA_LIGA_ID: 140,
  CURRENT_SEASON: 2025
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    let responseData;
    let cacheKey: string;

    switch (action) {
      case 'standings':
        cacheKey = `standings_${FOOTBALL_API.LA_LIGA_ID}_${FOOTBALL_API.CURRENT_SEASON}`;
        responseData = getCached(cacheKey);
        if (!responseData) {
          const data = await fetchFromApi(
            `/standings?league=${FOOTBALL_API.LA_LIGA_ID}&season=${FOOTBALL_API.CURRENT_SEASON}`
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
            `/fixtures?league=${FOOTBALL_API.LA_LIGA_ID}&season=${FOOTBALL_API.CURRENT_SEASON}&live=all`
          );
          responseData = data.response || [];
          setCache(cacheKey, responseData);
        }
        break;

      case 'team-stats':
        cacheKey = `team_stats_${FOOTBALL_API.REAL_MADRID_ID}_${FOOTBALL_API.CURRENT_SEASON}`;
        responseData = getCached(cacheKey);
        if (!responseData) {
          const data = await fetchFromApi(
            `/teams/statistics?league=${FOOTBALL_API.LA_LIGA_ID}&season=${FOOTBALL_API.CURRENT_SEASON}&team=${FOOTBALL_API.REAL_MADRID_ID}`
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
        let searchEndpoint = `/fixtures?team=${searchTeam}&season=${FOOTBALL_API.CURRENT_SEASON}`;
        if (fromDate) searchEndpoint += `&from=${fromDate}`;
        if (toDate) searchEndpoint += `&to=${toDate}`;
        
        cacheKey = `search_fixtures_${searchTeam}_${fromDate}_${toDate}`;
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

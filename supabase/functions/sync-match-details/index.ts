import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

async function fetchFromFootballApi(endpoint: string) {
  const apiKey = Deno.env.get('FOOTBALL_API_KEY');
  if (!apiKey) {
    throw new Error('FOOTBALL_API_KEY not configured');
  }

  const url = `${FOOTBALL_API.BASE_URL}${endpoint}`;
  console.log(`Fetching: ${url}`);

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-rapidapi-key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

function convertEventsToMatchDetails(events: any[], statistics: any[]) {
  const goals = events.filter((e: any) => e.type === 'Goal').map((e: any) => ({
    minute: e.time?.elapsed,
    extra_time: e.time?.extra,
    player: e.player?.name,
    assist: e.assist?.name || null,
    team: e.team?.name,
    type: e.detail
  }));

  const cards = events.filter((e: any) => e.type === 'Card').map((e: any) => ({
    minute: e.time?.elapsed,
    player: e.player?.name,
    team: e.team?.name,
    card_type: e.detail
  }));

  const substitutions = events.filter((e: any) => e.type === 'subst').map((e: any) => ({
    minute: e.time?.elapsed,
    player_out: e.player?.name,
    player_in: e.assist?.name || 'Unknown',
    team: e.team?.name
  }));

  const varDecisions = events.filter((e: any) => e.type === 'Var').map((e: any) => ({
    minute: e.time?.elapsed,
    decision: e.detail,
    team: e.team?.name
  }));

  const statsObject: Record<string, any> = {};
  (statistics || []).forEach((teamStats: any) => {
    if (teamStats?.team?.name) {
      const teamKey = teamStats.team.name.toLowerCase().replace(/\s+/g, '_');
      statsObject[teamKey] = {};
      (teamStats.statistics || []).forEach((stat: any) => {
        if (stat?.type) {
          const statKey = stat.type.toLowerCase().replace(/\s+/g, '_');
          statsObject[teamKey][statKey] = stat.value;
        }
      });
    }
  });

  return { goals, cards, substitutions, var_decisions: varDecisions, statistics: statsObject };
}

function generateLiveBlogEntries(events: any[], matchId: string) {
  return events.map((event: any) => {
    let entryType = 'update';
    let title = '';
    let content = '';
    let isImportant = false;

    const playerName = event.player?.name || 'Joueur inconnu';
    const teamName = event.team?.name || 'Équipe';
    const assistName = event.assist?.name;

    switch (event.type) {
      case 'Goal':
        entryType = 'goal';
        isImportant = true;
        if (event.detail === 'Penalty') {
          title = `⚽ BUT SUR PENALTY ! ${playerName}`;
          content = `${playerName} transforme le penalty pour ${teamName} !`;
        } else if (event.detail === 'Own Goal') {
          title = `⚽ BUT CONTRE SON CAMP !`;
          content = `${playerName} marque contre son camp.`;
        } else {
          title = `⚽ BUUUUT ! ${playerName}`;
          content = assistName 
            ? `${playerName} marque pour ${teamName} ! Passe décisive de ${assistName}.`
            : `${playerName} marque pour ${teamName} !`;
        }
        break;
      case 'Card':
        entryType = event.detail === 'Red Card' ? 'red_card' : 'yellow_card';
        isImportant = event.detail === 'Red Card';
        title = event.detail === 'Red Card' 
          ? `🟥 CARTON ROUGE ! ${playerName}`
          : `🟨 Carton jaune pour ${playerName}`;
        content = `${playerName} (${teamName}) reçoit un ${event.detail === 'Red Card' ? 'carton rouge' : 'carton jaune'}.`;
        break;
      case 'subst':
        entryType = 'substitution';
        title = `🔄 Changement ${teamName}`;
        content = `${assistName || 'Joueur'} entre à la place de ${playerName}.`;
        break;
      case 'Var':
        entryType = 'var';
        isImportant = true;
        title = `📺 Décision VAR`;
        content = `${event.detail} - ${teamName}`;
        break;
      default:
        title = event.type || 'Événement';
        content = event.detail || '';
    }

    return {
      match_id: matchId,
      minute: event.time?.elapsed || 0,
      entry_type: entryType,
      title,
      content,
      is_important: isImportant
    };
  });
}

// Normalize team name for comparison
function normalizeTeamName(name: string): string {
  return name.toLowerCase()
    .replace(/\s*(cf|fc|cd|ud|sd|rcd|rc)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const matchId = url.searchParams.get('matchId');
    const fixtureId = url.searchParams.get('fixtureId');

    if (matchId && fixtureId) {
      // Sync specific match
      console.log(`Syncing match ${matchId} with fixture ${fixtureId}`);

      const [eventsData, statsData] = await Promise.all([
        fetchFromFootballApi(`/fixtures/events?fixture=${fixtureId}`),
        fetchFromFootballApi(`/fixtures/statistics?fixture=${fixtureId}`)
      ]);

      const events = eventsData.response || [];
      const statistics = statsData.response || [];

      const matchDetails = convertEventsToMatchDetails(events, statistics);

      // Update match
      const { error: updateError } = await supabase
        .from('matches')
        .update({ match_details: matchDetails, updated_at: new Date().toISOString() })
        .eq('id', matchId);

      if (updateError) throw updateError;

      // Generate and insert live blog entries
      if (events.length > 0) {
        await supabase.from('live_blog_entries').delete().eq('match_id', matchId);
        
        const blogEntries = generateLiveBlogEntries(events, matchId);
        const { error: blogError } = await supabase.from('live_blog_entries').insert(blogEntries);
        if (blogError) console.error('Blog insert error:', blogError);
      }

      return new Response(
        JSON.stringify({ success: true, events: events.length, message: 'Match synchronized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auto-sync: Get ALL finished matches from database that don't have complete match_details
    console.log('Auto-syncing all finished matches from database...');
    
    const { data: dbMatches, error: dbError } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'finished')
      .order('match_date', { ascending: false })
      .limit(30);
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log(`Found ${dbMatches?.length || 0} finished matches in database`);

    // Filter matches that need sync (no goals array in match_details)
    const matchesToSync = (dbMatches || []).filter((m: any) => 
      !m.match_details?.goals || m.match_details.goals.length === 0
    );

    console.log(`${matchesToSync.length} matches need synchronization`);

    let syncedCount = 0;
    let checkedCount = 0;
    const errors: string[] = [];

    for (const match of matchesToSync) {
      checkedCount++;
      try {
        // Calculate search date range (+/- 5 days)
        const matchDate = new Date(match.match_date);
        const fromDate = new Date(matchDate);
        fromDate.setDate(fromDate.getDate() - 5);
        const toDate = new Date(matchDate);
        toDate.setDate(toDate.getDate() + 5);

        const from = fromDate.toISOString().split('T')[0];
        const to = toDate.toISOString().split('T')[0];

        console.log(`Searching API fixtures from ${from} to ${to} for: ${match.home_team} vs ${match.away_team}`);

        // Fetch fixtures from API for this date range
        const fixturesData = await fetchFromFootballApi(
          `/fixtures?team=${FOOTBALL_API.REAL_MADRID_ID}&season=${FOOTBALL_API.CURRENT_SEASON}&from=${from}&to=${to}`
        );

        const fixtures = fixturesData.response || [];
        console.log(`API returned ${fixtures.length} fixtures for date range`);

        if (fixtures.length === 0) {
          console.log(`No fixtures found in API for ${match.home_team} vs ${match.away_team}`);
          continue;
        }

        // Find matching fixture
        const homeNorm = normalizeTeamName(match.home_team);
        const awayNorm = normalizeTeamName(match.away_team);

        const matchingFixture = fixtures.find((f: any) => {
          const apiHomeNorm = normalizeTeamName(f.teams.home.name);
          const apiAwayNorm = normalizeTeamName(f.teams.away.name);
          
          // Check for Real Madrid match with matching opponent
          const isRealMadridHome = apiHomeNorm.includes('real madrid');
          const isRealMadridAway = apiAwayNorm.includes('real madrid');
          
          if (!isRealMadridHome && !isRealMadridAway) return false;
          
          // Check opponent match
          if (isRealMadridHome) {
            return apiAwayNorm.includes(awayNorm) || awayNorm.includes(apiAwayNorm);
          } else {
            return apiHomeNorm.includes(homeNorm) || homeNorm.includes(apiHomeNorm);
          }
        });

        if (!matchingFixture) {
          console.log(`No matching fixture found. Available: ${fixtures.map((f: any) => `${f.teams.home.name} vs ${f.teams.away.name}`).join(', ')}`);
          continue;
        }

        console.log(`Found matching fixture: ${matchingFixture.teams.home.name} vs ${matchingFixture.teams.away.name} (ID: ${matchingFixture.fixture.id})`);

        // Fetch events and statistics
        const [eventsData, statsData] = await Promise.all([
          fetchFromFootballApi(`/fixtures/events?fixture=${matchingFixture.fixture.id}`),
          fetchFromFootballApi(`/fixtures/statistics?fixture=${matchingFixture.fixture.id}`)
        ]);

        const events = eventsData.response || [];
        const statistics = statsData.response || [];

        console.log(`Got ${events.length} events and ${statistics.length} team stats`);

        const matchDetails = convertEventsToMatchDetails(events, statistics);

        // Update match with API data
        const { error: updateError } = await supabase
          .from('matches')
          .update({ 
            match_details: matchDetails,
            home_score: matchingFixture.goals?.home ?? match.home_score,
            away_score: matchingFixture.goals?.away ?? match.away_score,
            updated_at: new Date().toISOString() 
          })
          .eq('id', match.id);

        if (updateError) {
          console.error(`Update error for ${match.id}:`, updateError);
          errors.push(`${match.home_team} vs ${match.away_team}: ${updateError.message}`);
          continue;
        }

        // Generate and insert live blog entries
        if (events.length > 0) {
          await supabase.from('live_blog_entries').delete().eq('match_id', match.id);
          const blogEntries = generateLiveBlogEntries(events, match.id);
          const { error: blogError } = await supabase.from('live_blog_entries').insert(blogEntries);
          if (blogError) {
            console.error('Blog insert error:', blogError);
          } else {
            console.log(`Created ${blogEntries.length} live blog entries`);
          }
        }

        syncedCount++;
        console.log(`✅ Synced: ${match.home_team} vs ${match.away_team} with ${events.length} events`);

        // Rate limit - wait between API calls
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (err) {
        console.error(`Error syncing match ${match.id}:`, err);
        errors.push(`${match.home_team} vs ${match.away_team}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: syncedCount, 
        checked: checkedCount,
        total: dbMatches?.length || 0,
        needsSync: matchesToSync.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-match-details:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
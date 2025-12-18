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
    minute: e.time.elapsed,
    extra_time: e.time.extra,
    player: e.player.name,
    assist: e.assist?.name || null,
    team: e.team.name,
    type: e.detail
  }));

  const cards = events.filter((e: any) => e.type === 'Card').map((e: any) => ({
    minute: e.time.elapsed,
    player: e.player.name,
    team: e.team.name,
    card_type: e.detail
  }));

  const substitutions = events.filter((e: any) => e.type === 'subst').map((e: any) => ({
    minute: e.time.elapsed,
    player_out: e.player.name,
    player_in: e.assist?.name || 'Unknown',
    team: e.team.name
  }));

  const varDecisions = events.filter((e: any) => e.type === 'Var').map((e: any) => ({
    minute: e.time.elapsed,
    decision: e.detail,
    team: e.team.name
  }));

  const statsObject: Record<string, any> = {};
  statistics.forEach((teamStats: any) => {
    const teamKey = teamStats.team.name.toLowerCase().replace(/\s+/g, '_');
    statsObject[teamKey] = {};
    teamStats.statistics.forEach((stat: any) => {
      const statKey = stat.type.toLowerCase().replace(/\s+/g, '_');
      statsObject[teamKey][statKey] = stat.value;
    });
  });

  return { goals, cards, substitutions, var_decisions: varDecisions, statistics: statsObject };
}

function generateLiveBlogEntries(events: any[], matchId: string) {
  return events.map((event: any) => {
    let entryType = 'update';
    let title = '';
    let content = '';
    let isImportant = false;

    switch (event.type) {
      case 'Goal':
        entryType = 'goal';
        isImportant = true;
        if (event.detail === 'Penalty') {
          title = `⚽ BUT SUR PENALTY ! ${event.player.name}`;
          content = `${event.player.name} transforme le penalty pour ${event.team.name} !`;
        } else if (event.detail === 'Own Goal') {
          title = `⚽ BUT CONTRE SON CAMP !`;
          content = `${event.player.name} marque contre son camp.`;
        } else {
          title = `⚽ BUUUUT ! ${event.player.name}`;
          content = event.assist?.name 
            ? `${event.player.name} marque pour ${event.team.name} ! Passe décisive de ${event.assist.name}.`
            : `${event.player.name} marque pour ${event.team.name} !`;
        }
        break;
      case 'Card':
        entryType = event.detail === 'Red Card' ? 'red_card' : 'yellow_card';
        isImportant = event.detail === 'Red Card';
        title = event.detail === 'Red Card' 
          ? `🟥 CARTON ROUGE ! ${event.player.name}`
          : `🟨 Carton jaune pour ${event.player.name}`;
        content = `${event.player.name} (${event.team.name}) reçoit un ${event.detail === 'Red Card' ? 'carton rouge' : 'carton jaune'}.`;
        break;
      case 'subst':
        entryType = 'substitution';
        title = `🔄 Changement ${event.team.name}`;
        content = `${event.assist?.name || 'Joueur'} entre à la place de ${event.player.name}.`;
        break;
      case 'Var':
        entryType = 'var';
        isImportant = true;
        title = `📺 Décision VAR`;
        content = `${event.detail} - ${event.team.name}`;
        break;
      default:
        title = event.type;
        content = event.detail || '';
    }

    return {
      match_id: matchId,
      minute: event.time.elapsed,
      entry_type: entryType,
      title,
      content,
      is_important: isImportant
    };
  });
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

    // Auto-sync recent finished matches
    console.log('Auto-syncing recent finished matches...');
    
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get recent Real Madrid fixtures
    const fixturesData = await fetchFromFootballApi(
      `/fixtures?team=${FOOTBALL_API.REAL_MADRID_ID}&from=${weekAgo.toISOString().split('T')[0]}&to=${today.toISOString().split('T')[0]}`
    );

    const finishedFixtures = (fixturesData.response || []).filter(
      (f: any) => f.fixture.status.short === 'FT'
    );

    console.log(`Found ${finishedFixtures.length} finished fixtures`);

    let syncedCount = 0;

    for (const fixture of finishedFixtures) {
      const matchDate = fixture.fixture.date.split('T')[0];
      
      // Find matching match in our database
      const { data: matches } = await supabase
        .from('matches')
        .select('id, match_details')
        .or(`home_team.ilike.%real madrid%,away_team.ilike.%real madrid%`)
        .gte('match_date', `${matchDate}T00:00:00`)
        .lte('match_date', `${matchDate}T23:59:59`)
        .eq('status', 'finished');

      if (matches && matches.length > 0) {
        const match = matches[0];
        
        // Skip if already has detailed events
        if (match.match_details?.goals?.length > 0) {
          console.log(`Match ${match.id} already synced, skipping`);
          continue;
        }

        // Fetch and sync
        const [eventsData, statsData] = await Promise.all([
          fetchFromFootballApi(`/fixtures/events?fixture=${fixture.fixture.id}`),
          fetchFromFootballApi(`/fixtures/statistics?fixture=${fixture.fixture.id}`)
        ]);

        const events = eventsData.response || [];
        const statistics = statsData.response || [];
        const matchDetails = convertEventsToMatchDetails(events, statistics);

        await supabase
          .from('matches')
          .update({ match_details: matchDetails, updated_at: new Date().toISOString() })
          .eq('id', match.id);

        if (events.length > 0) {
          await supabase.from('live_blog_entries').delete().eq('match_id', match.id);
          const blogEntries = generateLiveBlogEntries(events, match.id);
          await supabase.from('live_blog_entries').insert(blogEntries);
        }

        syncedCount++;
        console.log(`Synced match ${match.id} with ${events.length} events`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, synced: syncedCount, checked: finishedFixtures.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-match-details:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

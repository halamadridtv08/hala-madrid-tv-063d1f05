import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

const FOOTBALL_API = {
  BASE_URL: 'https://v3.football.api-sports.io',
  REAL_MADRID_ID: 541,
};

interface AutomationSettings {
  id: string;
  match_id: string;
  automation_enabled: boolean;
  api_fixture_id: number | null;
  scraper_url: string | null;
  auto_timer: boolean;
  auto_live_blog: boolean;
  auto_score: boolean;
  events_synced: any[];
  last_known_status: string | null;
  last_known_period: string | null;
}

interface FixtureData {
  fixture: {
    id: number;
    status: {
      short: string;
      elapsed: number | null;
      extra: number | null;
    };
  };
  goals: {
    home: number;
    away: number;
  };
  events: any[];
}

async function fetchFromFootballApi(endpoint: string): Promise<any> {
  const apiKey = Deno.env.get('FOOTBALL_API_KEY');
  if (!apiKey) {
    throw new Error('FOOTBALL_API_KEY not configured');
  }

  const response = await fetch(`${FOOTBALL_API.BASE_URL}${endpoint}`, {
    headers: {
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-rapidapi-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.response?.[0] || null;
}

// Map API status to timer actions
function getTimerAction(status: string, currentPeriod: string | null): string | null {
  const statusMap: Record<string, string> = {
    '1H': 'start_first_half',
    'HT': 'end_first_half',
    '2H': 'start_second_half',
    'ET': 'start_extra_time_1',
    'BT': 'end_extra_time_1', // Break Time between extra time periods
    'P': 'penalties',
    'FT': 'end_match',
    'AET': 'end_match', // After Extra Time
    'PEN': 'end_match', // After Penalties
  };

  const action = statusMap[status];
  
  // Only return action if it's different from current state
  if (action && action !== currentPeriod) {
    return action;
  }
  
  return null;
}

// Convert API event to live blog entry
function eventToLiveBlogEntry(event: any, matchId: string): any {
  const playerName = event.player?.name || 'Joueur';
  const teamName = event.team?.name || '';
  const assistName = event.assist?.name;
  const minute = event.time?.elapsed || 0;

  let entryType = 'update';
  let title = '';
  let content = '';
  let isImportant = false;

  switch (event.type) {
    case 'Goal':
      entryType = 'goal';
      isImportant = true;
      if (event.detail === 'Penalty') {
        title = `⚽ BUT SUR PENALTY ! ${playerName}`;
        content = `${playerName} transforme le penalty pour ${teamName} !`;
      } else if (event.detail === 'Own Goal') {
        title = `⚽ BUT CONTRE SON CAMP`;
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
      return null;
  }

  return {
    match_id: matchId,
    minute,
    entry_type: entryType,
    title,
    content,
    is_important: isImportant,
    team_side: teamName.toLowerCase().includes('real madrid') ? 'home' : 'away',
  };
}

// Create event hash for deduplication
function getEventHash(event: any): string {
  return `${event.time?.elapsed || 0}_${event.type}_${event.player?.id || 'unknown'}_${event.detail || ''}`;
}

async function syncMatch(supabase: any, settings: AutomationSettings): Promise<{ success: boolean; message: string }> {
  const { match_id, api_fixture_id, auto_timer, auto_live_blog, auto_score, events_synced, last_known_status } = settings;

  if (!api_fixture_id) {
    return { success: false, message: 'No API fixture ID configured' };
  }

  try {
    // Fetch live fixture data
    const fixtureData: FixtureData = await fetchFromFootballApi(`/fixtures?id=${api_fixture_id}`);
    
    if (!fixtureData) {
      return { success: false, message: 'Fixture not found in API' };
    }

    const currentStatus = fixtureData.fixture.status.short;
    const elapsed = fixtureData.fixture.status.elapsed;
    const syncedHashes = new Set(events_synced || []);
    const newEvents: string[] = [];

    // 1. Handle Timer Automation
    if (auto_timer && currentStatus !== last_known_status) {
      const timerAction = getTimerAction(currentStatus, last_known_status);
      
      if (timerAction) {
        console.log(`Timer action: ${timerAction} for match ${match_id}`);
        
        // Get or create timer settings
        const { data: existingTimer } = await supabase
          .from('match_timer_settings')
          .select('*')
          .eq('match_id', match_id)
          .single();

        const now = new Date().toISOString();
        
        switch (timerAction) {
          case 'start_first_half':
            if (!existingTimer) {
              await supabase.from('match_timer_settings').insert({
                match_id,
                timer_started_at: now,
                current_half: 1,
                is_timer_running: true,
                is_paused: false,
              });
            } else {
              await supabase.from('match_timer_settings').update({
                timer_started_at: now,
                current_half: 1,
                is_timer_running: true,
                is_paused: false,
              }).eq('match_id', match_id);
            }
            
            // Update match status to live
            await supabase.from('matches').update({ status: 'live' }).eq('id', match_id);
            
            // Add kickoff entry
            if (auto_live_blog) {
              await supabase.from('live_blog_entries').insert({
                match_id,
                minute: 0,
                entry_type: 'kickoff',
                title: '▶️ Coup d\'envoi !',
                content: 'Le match commence !',
                is_important: true,
              });
            }
            break;

          case 'end_first_half':
            await supabase.from('match_timer_settings').update({
              is_paused: true,
              paused_at_minute: 45,
              current_half: 1,
              is_timer_running: false,
            }).eq('match_id', match_id);
            
            if (auto_live_blog) {
              await supabase.from('live_blog_entries').insert({
                match_id,
                minute: 45,
                entry_type: 'halftime',
                title: '⏸️ Mi-temps',
                content: 'Fin de la première période',
                is_important: true,
              });
            }
            break;

          case 'start_second_half':
            await supabase.from('match_timer_settings').update({
              second_half_started_at: now,
              current_half: 2,
              is_timer_running: true,
              is_paused: false,
            }).eq('match_id', match_id);
            
            if (auto_live_blog) {
              await supabase.from('live_blog_entries').insert({
                match_id,
                minute: 46,
                entry_type: 'kickoff',
                title: '▶️ Reprise !',
                content: 'La seconde période commence !',
                is_important: true,
              });
            }
            break;

          case 'end_match':
            await supabase.from('match_timer_settings').update({
              is_timer_running: false,
              is_paused: true,
              paused_at_minute: elapsed || 90,
            }).eq('match_id', match_id);
            
            await supabase.from('matches').update({ status: 'finished' }).eq('id', match_id);
            
            if (auto_live_blog) {
              await supabase.from('live_blog_entries').insert({
                match_id,
                minute: elapsed || 90,
                entry_type: 'fulltime',
                title: '⏹️ Fin du match !',
                content: 'Le match est terminé !',
                is_important: true,
              });
            }
            break;
        }
      }
    }

    // 2. Handle Score Automation
    if (auto_score && fixtureData.goals) {
      await supabase.from('matches').update({
        home_score: fixtureData.goals.home,
        away_score: fixtureData.goals.away,
      }).eq('id', match_id);
    }

    // 3. Handle Live Blog Events
    if (auto_live_blog && fixtureData.events) {
      const eventsToAdd: any[] = [];
      
      for (const event of fixtureData.events) {
        const hash = getEventHash(event);
        
        if (!syncedHashes.has(hash)) {
          const blogEntry = eventToLiveBlogEntry(event, match_id);
          if (blogEntry) {
            eventsToAdd.push(blogEntry);
            newEvents.push(hash);
          }
        }
      }

      if (eventsToAdd.length > 0) {
        const { error } = await supabase.from('live_blog_entries').insert(eventsToAdd);
        if (error) {
          console.error('Error inserting live blog entries:', error);
        } else {
          console.log(`Added ${eventsToAdd.length} new live blog entries`);
        }
      }
    }

    // 4. Update automation settings with sync info
    const allSyncedEvents = [...events_synced, ...newEvents];
    await supabase.from('match_automation_settings').update({
      last_api_sync: new Date().toISOString(),
      last_known_status: currentStatus,
      last_known_period: currentStatus,
      events_synced: allSyncedEvents,
    }).eq('id', settings.id);

    return {
      success: true,
      message: `Synced: status=${currentStatus}, new_events=${newEvents.length}`,
    };
  } catch (error) {
    console.error(`Error syncing match ${match_id}:`, error);
    
    // Log error to settings
    await supabase.from('match_automation_settings').update({
      sync_errors: [...(settings.sync_errors || []), {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }].slice(-10), // Keep last 10 errors
    }).eq('id', settings.id);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify CRON secret for scheduled calls
    const cronSecret = req.headers.get('x-cron-secret');
    const expectedSecret = Deno.env.get('CRON_SECRET');
    
    // Allow both CRON calls and authenticated admin calls
    const isCronCall = cronSecret && expectedSecret && cronSecret === expectedSecret;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body for specific match sync
    let specificMatchId: string | null = null;
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        specificMatchId = body.match_id || null;
      } catch {
        // No body or invalid JSON, sync all
      }
    }

    // Get matches with automation enabled
    let query = supabase
      .from('match_automation_settings')
      .select('*')
      .eq('automation_enabled', true);

    if (specificMatchId) {
      query = query.eq('match_id', specificMatchId);
    }

    const { data: automationSettings, error: settingsError } = await query;

    if (settingsError) {
      throw new Error(`Failed to fetch automation settings: ${settingsError.message}`);
    }

    if (!automationSettings || automationSettings.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No matches with automation enabled', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${automationSettings.length} matches with automation enabled`);

    // Sync each match
    const results: { matchId: string; result: any }[] = [];
    
    for (const settings of automationSettings) {
      console.log(`Syncing match ${settings.match_id}...`);
      const result = await syncMatch(supabase, settings as AutomationSettings);
      results.push({ matchId: settings.match_id, result });
      
      // Rate limit to avoid API throttling
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const successCount = results.filter(r => r.result.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        synced: successCount,
        total: automationSettings.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-live-match:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

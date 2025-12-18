import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SUPABASE_URL = 'https://qjnppcfbywfazwolfppo.supabase.co';

interface ApiFixtureEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
}

interface ApiFixtureStatistic {
  team: { id: number; name: string; logo: string };
  statistics: Array<{ type: string; value: number | string | null }>;
}

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    venue: { name: string; city: string };
    status: { long: string; short: string; elapsed: number | null };
  };
  league: { id: number; name: string; country: string; logo: string; season: number };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: any;
  events?: ApiFixtureEvent[];
  statistics?: ApiFixtureStatistic[];
  lineups?: any[];
}

async function callFootballApi<T>(action: string, params?: Record<string, string>): Promise<T | null> {
  try {
    const queryParams = new URLSearchParams({ action, ...params });
    const response = await fetch(`${SUPABASE_URL}/functions/v1/football-api?${queryParams}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }
    
    const result = await response.json();
    return result.data as T;
  } catch (error) {
    console.error('Football API error:', error);
    return null;
  }
}

export function useMatchApiData() {
  const [syncing, setSyncing] = useState(false);

  const fetchFixtureDetails = async (fixtureId: string) => {
    return callFootballApi<ApiFixture>('fixture-details', { fixture: fixtureId });
  };

  const fetchFixtureEvents = async (fixtureId: string) => {
    return callFootballApi<ApiFixtureEvent[]>('fixture-events', { fixture: fixtureId });
  };

  const fetchFixtureStatistics = async (fixtureId: string) => {
    return callFootballApi<ApiFixtureStatistic[]>('fixture-statistics', { fixture: fixtureId });
  };

  const searchFixtures = async (from: string, to: string) => {
    return callFootballApi<ApiFixture[]>('search-fixtures', { from, to });
  };

  const convertEventsToMatchDetails = (events: ApiFixtureEvent[], statistics: ApiFixtureStatistic[]) => {
    const goals = events.filter(e => e.type === 'Goal').map(e => ({
      minute: e.time.elapsed,
      extra_time: e.time.extra,
      player: e.player.name,
      assist: e.assist?.name || null,
      team: e.team.name,
      type: e.detail // Normal, Penalty, Own Goal
    }));

    const cards = events.filter(e => e.type === 'Card').map(e => ({
      minute: e.time.elapsed,
      player: e.player.name,
      team: e.team.name,
      card_type: e.detail // Yellow Card, Red Card
    }));

    const substitutions = events.filter(e => e.type === 'subst').map(e => ({
      minute: e.time.elapsed,
      player_out: e.player.name,
      player_in: e.assist?.name || 'Unknown',
      team: e.team.name
    }));

    const varDecisions = events.filter(e => e.type === 'Var').map(e => ({
      minute: e.time.elapsed,
      decision: e.detail,
      team: e.team.name
    }));

    // Convert statistics to a more usable format
    const statsObject: Record<string, any> = {};
    statistics.forEach(teamStats => {
      const teamKey = teamStats.team.name.toLowerCase().replace(/\s+/g, '_');
      statsObject[teamKey] = {};
      teamStats.statistics.forEach(stat => {
        const statKey = stat.type.toLowerCase().replace(/\s+/g, '_');
        statsObject[teamKey][statKey] = stat.value;
      });
    });

    return {
      goals,
      cards,
      substitutions,
      var_decisions: varDecisions,
      statistics: statsObject
    };
  };

  const generateLiveBlogEntries = (events: ApiFixtureEvent[], matchId: string) => {
    return events.map(event => {
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
  };

  const syncMatchFromApi = async (matchId: string, apiFixtureId: string) => {
    setSyncing(true);
    try {
      // Fetch events and statistics from API
      const [events, statistics] = await Promise.all([
        fetchFixtureEvents(apiFixtureId),
        fetchFixtureStatistics(apiFixtureId)
      ]);

      if (!events || !statistics) {
        throw new Error('Failed to fetch match data from API');
      }

      // Convert to match_details format
      const matchDetails = convertEventsToMatchDetails(events, statistics);

      // Update match with new details
      const { error: updateError } = await supabase
        .from('matches')
        .update({ 
          match_details: matchDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (updateError) throw updateError;

      // Generate and insert live blog entries
      const blogEntries = generateLiveBlogEntries(events, matchId);
      
      if (blogEntries.length > 0) {
        // First, delete existing auto-generated entries for this match
        await supabase
          .from('live_blog_entries')
          .delete()
          .eq('match_id', matchId);

        // Insert new entries
        const { error: blogError } = await supabase
          .from('live_blog_entries')
          .insert(blogEntries);

        if (blogError) {
          console.error('Error inserting blog entries:', blogError);
        }
      }

      toast.success(`Match synchronisé avec ${events.length} événements`);
      return true;
    } catch (error) {
      console.error('Error syncing match:', error);
      toast.error('Erreur lors de la synchronisation du match');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const findApiFixtureForMatch = async (homeTeam: string, awayTeam: string, matchDate: string) => {
    try {
      const date = new Date(matchDate);
      const from = date.toISOString().split('T')[0];
      const to = from; // Same day

      const fixtures = await searchFixtures(from, to);
      
      if (!fixtures || fixtures.length === 0) return null;

      // Try to find matching fixture
      const match = fixtures.find(f => {
        const homeMatch = f.teams.home.name.toLowerCase().includes('real madrid') || 
                          homeTeam.toLowerCase().includes('real madrid');
        const awayMatch = f.teams.away.name.toLowerCase().includes('real madrid') || 
                          awayTeam.toLowerCase().includes('real madrid');
        return homeMatch || awayMatch;
      });

      return match ? String(match.fixture.id) : null;
    } catch (error) {
      console.error('Error finding API fixture:', error);
      return null;
    }
  };

  return {
    syncing,
    fetchFixtureDetails,
    fetchFixtureEvents,
    fetchFixtureStatistics,
    searchFixtures,
    syncMatchFromApi,
    findApiFixtureForMatch
  };
}

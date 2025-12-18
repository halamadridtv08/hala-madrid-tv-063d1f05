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

  const searchFixtures = async (from: string, to: string, season?: string) => {
    const params: Record<string, string> = { from, to };
    if (season) params.season = season;
    return callFootballApi<ApiFixture[]>('search-fixtures', params);
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

  // Team name aliases for better matching
  const TEAM_ALIASES: Record<string, string[]> = {
    'real madrid': ['real madrid cf', 'real madrid c.f.', 'real madrid club de futbol'],
    'alavés': ['deportivo alavés', 'alaves', 'deportivo alaves', 'cd alavés'],
    'atlético madrid': ['atletico madrid', 'atlético de madrid', 'atletico de madrid', 'club atlético de madrid'],
    'barcelona': ['fc barcelona', 'barcelona fc', 'barça', 'barca'],
    'celta': ['rc celta', 'celta vigo', 'celta de vigo', 'real club celta'],
    'villarreal': ['villarreal cf', 'villarreal club de futbol'],
    'valencia': ['valencia cf', 'valencia club de futbol'],
    'sevilla': ['sevilla fc', 'sevilla futbol club'],
    'betis': ['real betis', 'real betis balompié', 'betis balompie'],
    'athletic': ['athletic club', 'athletic bilbao', 'athletic de bilbao'],
    'real sociedad': ['real sociedad de futbol', 'la real'],
    'getafe': ['getafe cf', 'getafe club de futbol'],
    'osasuna': ['ca osasuna', 'club atlético osasuna', 'osasuna pamplona'],
    'mallorca': ['rcd mallorca', 'real mallorca'],
    'rayo': ['rayo vallecano', 'rayo vallecano de madrid'],
    'las palmas': ['ud las palmas', 'union deportiva las palmas'],
    'girona': ['girona fc', 'girona futbol club'],
    'cadiz': ['cádiz cf', 'cadiz cf', 'cádiz club de futbol'],
    'almeria': ['ud almeria', 'almería', 'union deportiva almeria'],
    'manchester city': ['manchester city fc', 'man city'],
    'liverpool': ['liverpool fc'],
    'bayern': ['bayern munich', 'fc bayern', 'bayern münchen', 'fc bayern münchen'],
    'psg': ['paris saint-germain', 'paris saint germain', 'paris sg'],
    'juventus': ['juventus fc', 'juve'],
    'inter': ['inter milan', 'internazionale', 'fc internazionale'],
    'milan': ['ac milan'],
    'dortmund': ['borussia dortmund', 'bvb'],
    'salzburg': ['red bull salzburg', 'rb salzburg', 'fc salzburg'],
    'atalanta': ['atalanta bc', 'atalanta bergamo'],
    'brest': ['stade brestois', 'stade brestois 29'],
    'lille': ['losc lille', 'losc'],
    'leverkusen': ['bayer leverkusen', 'bayer 04 leverkusen'],
    'oviedo': ['real oviedo', 'oviedo fc', 'véritable oviedo', 'veritable oviedo'],
    'espanyol': ['rcd espanyol', 'espanyol barcelona', 'rcd espanyol de barcelona', 'español'],
    'leganes': ['leganés', 'cd leganés', 'cd leganes'],
    'valladolid': ['real valladolid', 'valladolid cf', 'pucela'],
  };

  const normalizeTeamName = (name: string) => {
    return name.toLowerCase()
      .replace(/\s*(cf|fc|cd|ud|sd|rcd|rc)\s*/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const teamsMatchLocal = (dbName: string, apiName: string): boolean => {
    const dbNorm = normalizeTeamName(dbName);
    const apiNorm = normalizeTeamName(apiName);
    
    if (dbNorm.includes(apiNorm) || apiNorm.includes(dbNorm)) return true;
    
    for (const [key, aliases] of Object.entries(TEAM_ALIASES)) {
      const allNames = [key, ...aliases].map(n => normalizeTeamName(n));
      const dbMatches = allNames.some(n => dbNorm.includes(n) || n.includes(dbNorm));
      const apiMatches = allNames.some(n => apiNorm.includes(n) || n.includes(apiNorm));
      if (dbMatches && apiMatches) return true;
    }
    
    return false;
  };

  const findApiFixtureForMatch = async (homeTeam: string, awayTeam: string, matchDate: string) => {
    try {
      const date = new Date(matchDate);
      const fromDate = new Date(date);
      fromDate.setDate(fromDate.getDate() - 5);
      const toDate = new Date(date);
      toDate.setDate(toDate.getDate() + 5);

      const from = fromDate.toISOString().split('T')[0];
      const to = toDate.toISOString().split('T')[0];

      console.log(`Searching fixtures from ${from} to ${to} for ${homeTeam} vs ${awayTeam}`);

      // 1) Try date-range search first
      let fixtures = await searchFixtures(from, to, '2025');
      if (!fixtures || fixtures.length === 0) {
        fixtures = await searchFixtures(from, to, '2024');
      }
      if (!fixtures || fixtures.length === 0) {
        fixtures = await searchFixtures(from, to);
      }

      // 2) Fallback: if no results, use last/next fixtures (covers wrong DB dates)
      if (!fixtures || fixtures.length === 0) {
        const [lastFixtures, nextFixtures] = await Promise.all([
          callFootballApi<ApiFixture[]>('last-matches', { team: '541', last: '200' }),
          callFootballApi<ApiFixture[]>('fixtures', { team: '541', next: '50' }),
        ]);

        const byId = new Map<number, ApiFixture>();
        for (const f of [...(lastFixtures || []), ...(nextFixtures || [])]) {
          if (f?.fixture?.id) byId.set(f.fixture.id, f);
        }
        fixtures = Array.from(byId.values());
        console.log(`Fallback fixtures list: ${fixtures.length}`);
      }

      if (!fixtures || fixtures.length === 0) {
        console.log('No fixtures available from API');
        return null;
      }

      const isDbRealMadridHome = teamsMatchLocal('Real Madrid', homeTeam);
      const isDbRealMadridAway = teamsMatchLocal('Real Madrid', awayTeam);
      if (!isDbRealMadridHome && !isDbRealMadridAway) {
        console.log(`Not a Real Madrid match: ${homeTeam} vs ${awayTeam}`);
        return null;
      }
      const opponentName = isDbRealMadridHome ? awayTeam : homeTeam;

      const candidates = fixtures
        .filter((f) => {
          const apiHome = f.teams.home.name;
          const apiAway = f.teams.away.name;

          const isApiRealMadridHome = teamsMatchLocal('Real Madrid', apiHome);
          const isApiRealMadridAway = teamsMatchLocal('Real Madrid', apiAway);
          if (!isApiRealMadridHome && !isApiRealMadridAway) return false;

          const apiOpponent = isApiRealMadridHome ? apiAway : apiHome;
          return teamsMatchLocal(opponentName, apiOpponent);
        })
        .map((f) => {
          const fixtureDate = new Date(f.fixture.date).getTime();
          const diff = Math.abs(fixtureDate - date.getTime());
          return { f, diff };
        })
        .sort((a, b) => a.diff - b.diff);

      const match = candidates[0]?.f;

      if (match) {
        console.log(`Found matching fixture: ${match.teams.home.name} vs ${match.teams.away.name} (ID: ${match.fixture.id})`);
      } else {
        console.log('No matching fixture found. Available fixtures:', fixtures.map((f) => `${f.teams.home.name} vs ${f.teams.away.name}`));
      }

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

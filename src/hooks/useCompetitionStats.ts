import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { normalizeCompetitionName } from '@/utils/competitionNormalizer';

interface PlayerStat {
  player_id: string;
  name: string;
  image_url: string | null;
  goals: number;
  assists: number;
  minutes_played: number;
  yellow_cards: number;
  red_cards: number;
  matches_played: number;
}

interface CompetitionStatsData {
  topScorers: PlayerStat[];
  topAssists: PlayerStat[];
  mostPlayed: PlayerStat[];
  wins: number;
  draws: number;
  losses: number;
  totalMatches: number;
  totalGoals: number;
}

export const useCompetitionStats = (competitionKey: string) => {
  const [stats, setStats] = useState<CompetitionStatsData>({
    topScorers: [],
    topAssists: [],
    mostPlayed: [],
    wins: 0,
    draws: 0,
    losses: 0,
    totalMatches: 0,
    totalGoals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mapping des clés vers les noms canoniques
  const competitionMapping: Record<string, string> = {
    laliga: 'LALIGA',
    cl: 'UEFA CHAMPIONS LEAGUE',
    copaDelRey: 'COPA DEL REY',
    supercoupeEurope: 'UEFA SUPER CUP',
    supercoupeEspagne: 'SUPERCOPA DE ESPAÑA'
  };

  useEffect(() => {
    const fetchCompetitionStats = async () => {
      if (competitionKey === 'global') {
        // Pour global, on récupère toutes les compétitions
        await fetchAllStats();
      } else {
        // Pour une compétition spécifique
        const canonicalName = competitionMapping[competitionKey];
        if (canonicalName) {
          await fetchStatsForCompetition(canonicalName);
        }
      }
    };

    fetchCompetitionStats();
  }, [competitionKey]);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer tous les matchs
      const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('*');

      if (matchError) throw matchError;

      // Calculer les statistiques d'équipe
      let wins = 0, draws = 0, losses = 0, totalGoals = 0;
      const matchIds = matches?.map(m => m.id) || [];

      matches?.forEach(match => {
        const isHome = match.home_team === 'Real Madrid';
        const ourScore = isHome ? match.home_score : match.away_score;
        const theirScore = isHome ? match.away_score : match.home_score;

        totalGoals += ourScore || 0;

        if (ourScore! > theirScore!) wins++;
        else if (ourScore === theirScore) draws++;
        else losses++;
      });

      // Récupérer les stats des joueurs
      const playerStats = await fetchPlayerStats(matchIds);

      setStats({
        ...playerStats,
        wins,
        draws,
        losses,
        totalMatches: matches?.length || 0,
        totalGoals
      });
    } catch (err) {
      console.error('Error fetching all stats:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatsForCompetition = async (canonicalName: string) => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer tous les matchs
      const { data: allMatches, error: matchError } = await supabase
        .from('matches')
        .select('*');

      if (matchError) throw matchError;

      // Filtrer les matchs par compétition normalisée
      const matchesWithNormalized = await Promise.all(
        (allMatches || []).map(async (match) => ({
          ...match,
          normalizedCompetition: await normalizeCompetitionName(match.competition || '')
        }))
      );

      const matches = matchesWithNormalized.filter(
        match => match.normalizedCompetition === canonicalName
      );

      // Calculer les statistiques d'équipe
      let wins = 0, draws = 0, losses = 0, totalGoals = 0;
      const matchIds = matches.map(m => m.id);

      matches.forEach(match => {
        const isHome = match.home_team === 'Real Madrid';
        const ourScore = isHome ? match.home_score : match.away_score;
        const theirScore = isHome ? match.away_score : match.home_score;

        totalGoals += ourScore || 0;

        if (ourScore! > theirScore!) wins++;
        else if (ourScore === theirScore) draws++;
        else losses++;
      });

      // Récupérer les stats des joueurs pour ces matchs
      const playerStats = await fetchPlayerStats(matchIds);

      setStats({
        ...playerStats,
        wins,
        draws,
        losses,
        totalMatches: matches.length,
        totalGoals
      });
    } catch (err) {
      console.error('Error fetching competition stats:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerStats = async (matchIds: string[]) => {
    if (matchIds.length === 0) {
      return {
        topScorers: [],
        topAssists: [],
        mostPlayed: []
      };
    }

    const { data: statsData, error: statsError } = await supabase
      .from('player_stats')
      .select(`
        *,
        players (
          name,
          image_url
        )
      `)
      .in('match_id', matchIds);

    if (statsError) throw statsError;

    // Agréger les stats par joueur
    const playerMap = new Map<string, PlayerStat>();

    statsData?.forEach(stat => {
      const playerId = stat.player_id;
      if (!playerMap.has(playerId)) {
        playerMap.set(playerId, {
          player_id: playerId,
          name: stat.players?.name || '',
          image_url: stat.players?.image_url || null,
          goals: 0,
          assists: 0,
          minutes_played: 0,
          yellow_cards: 0,
          red_cards: 0,
          matches_played: 0
        });
      }

      const player = playerMap.get(playerId)!;
      player.goals += stat.goals || 0;
      player.assists += stat.assists || 0;
      player.minutes_played += stat.minutes_played || 0;
      player.yellow_cards += stat.yellow_cards || 0;
      player.red_cards += stat.red_cards || 0;
      if (stat.minutes_played && stat.minutes_played > 0) {
        player.matches_played += 1;
      }
    });

    const players = Array.from(playerMap.values());

    return {
      topScorers: players
        .filter(p => p.goals > 0)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10),
      topAssists: players
        .filter(p => p.assists > 0)
        .sort((a, b) => b.assists - a.assists)
        .slice(0, 10),
      mostPlayed: players
        .filter(p => p.matches_played > 0)
        .sort((a, b) => b.matches_played - a.matches_played)
        .slice(0, 10)
    };
  };

  return { stats, loading, error };
};

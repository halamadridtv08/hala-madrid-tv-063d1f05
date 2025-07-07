
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RealStatsData {
  totalPlayers: number;
  activePlayers: number;
  totalGoals: number;
  totalAssists: number;
  totalMatches: number;
  upcomingMatches: number;
  finishedMatches: number;
  wins: number;
  draws: number;
  losses: number;
  topScorers: Array<{
    name: string;
    goals: number;
    assists: number;
    matches: number;
    image: string;
  }>;
  topAssists: Array<{
    name: string;
    assists: number;
    goals: number;
    matches: number;
    image: string;
  }>;
  mostPlayed: Array<{
    name: string;
    matches: number;
    minutes: number;
    image: string;
  }>;
}

export function useRealStats() {
  const [stats, setStats] = useState<RealStatsData>({
    totalPlayers: 0,
    activePlayers: 0,
    totalGoals: 0,
    totalAssists: 0,
    totalMatches: 0,
    upcomingMatches: 0,
    finishedMatches: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    topScorers: [],
    topAssists: [],
    mostPlayed: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRealStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les statistiques des joueurs
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*');

      if (playersError) throw playersError;

      // Récupérer les statistiques des matchs
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*');

      if (matchesError) throw matchesError;

      // Récupérer les statistiques des joueurs
      const { data: playerStats, error: statsError } = await supabase
        .from('player_stats')
        .select(`
          *,
          players (
            name,
            image_url,
            position
          )
        `);

      if (statsError) throw statsError;

      // Calculer les statistiques globales
      const totalPlayers = players?.length || 0;
      const activePlayers = players?.filter(p => p.is_active).length || 0;
      
      const totalMatches = matches?.length || 0;
      const upcomingMatches = matches?.filter(m => m.status === 'upcoming').length || 0;
      const finishedMatches = matches?.filter(m => m.status === 'finished').length || 0;
      
      // Calculer wins, draws, losses pour Real Madrid
      const realMadridMatches = matches?.filter(m => 
        m.home_team === 'Real Madrid' || m.away_team === 'Real Madrid'
      ) || [];
      
      let wins = 0, draws = 0, losses = 0;
      
      realMadridMatches.forEach(match => {
        if (match.status === 'finished' && match.home_score !== null && match.away_score !== null) {
          const isHome = match.home_team === 'Real Madrid';
          const ourScore = isHome ? match.home_score : match.away_score;
          const theirScore = isHome ? match.away_score : match.home_score;
          
          if (ourScore > theirScore) wins++;
          else if (ourScore === theirScore) draws++;
          else losses++;
        }
      });

      // Agréger les statistiques par joueur
      const playerStatsMap = new Map();
      
      playerStats?.forEach(stat => {
        const playerName = stat.players?.name;
        if (!playerName) return;
        
        if (!playerStatsMap.has(playerName)) {
          playerStatsMap.set(playerName, {
            name: playerName,
            goals: 0,
            assists: 0,
            matches: 0,
            minutes: 0,
            image: stat.players?.image_url || '/placeholder.svg'
          });
        }
        
        const playerData = playerStatsMap.get(playerName);
        playerData.goals += stat.goals || 0;
        playerData.assists += stat.assists || 0;
        playerData.minutes += stat.minutes_played || 0;
        if (stat.minutes_played && stat.minutes_played > 0) {
          playerData.matches += 1;
        }
      });

      const playersArray = Array.from(playerStatsMap.values());
      
      // Top buteurs
      const topScorers = playersArray
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10);

      // Top passeurs
      const topAssists = playersArray
        .sort((a, b) => b.assists - a.assists)
        .slice(0, 10);

      // Plus de matchs joués
      const mostPlayed = playersArray
        .sort((a, b) => b.matches - a.matches)
        .slice(0, 10);

      const totalGoals = playersArray.reduce((sum, player) => sum + player.goals, 0);
      const totalAssists = playersArray.reduce((sum, player) => sum + player.assists, 0);

      setStats({
        totalPlayers,
        activePlayers,
        totalGoals,
        totalAssists,
        totalMatches,
        upcomingMatches,
        finishedMatches,
        wins,
        draws,
        losses,
        topScorers,
        topAssists,
        mostPlayed
      });

    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Erreur lors du chargement des statistiques');
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealStats();

    // Configuration de la synchronisation temps réel
    const channel = supabase
      .channel('stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_stats'
        },
        () => {
          console.log('Changement détecté dans les statistiques');
          fetchRealStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => {
          console.log('Changement détecté dans les matchs');
          fetchRealStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players'
        },
        () => {
          console.log('Changement détecté dans les joueurs');
          fetchRealStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchRealStats
  };
}

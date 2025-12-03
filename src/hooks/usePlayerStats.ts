import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AggregatedStats {
  goals: number;
  assists: number;
  matches: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
  goalsConceded: number;
  saves: number;
  tackles: number;
  interceptions: number;
  passesCompleted: number;
  passAccuracy: number;
}

export function usePlayerStats(playerId?: string) {
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', playerId);

        if (error) throw error;

        if (data && data.length > 0) {
          const aggregated: AggregatedStats = {
            goals: data.reduce((sum, s) => sum + (s.goals || 0), 0),
            assists: data.reduce((sum, s) => sum + (s.assists || 0), 0),
            matches: data.length,
            minutesPlayed: data.reduce((sum, s) => sum + (s.minutes_played || 0), 0),
            yellowCards: data.reduce((sum, s) => sum + (s.yellow_cards || 0), 0),
            redCards: data.reduce((sum, s) => sum + (s.red_cards || 0), 0),
            cleanSheets: data.reduce((sum, s) => sum + (s.clean_sheets || 0), 0),
            goalsConceded: data.reduce((sum, s) => sum + (s.goals_conceded || 0), 0),
            saves: data.reduce((sum, s) => sum + (s.saves || 0), 0),
            tackles: data.reduce((sum, s) => sum + (s.tackles || 0), 0),
            interceptions: data.reduce((sum, s) => sum + (s.interceptions || 0), 0),
            passesCompleted: data.reduce((sum, s) => sum + (s.passes_completed || 0), 0),
            passAccuracy: data.length > 0 
              ? data.reduce((sum, s) => sum + (Number(s.pass_accuracy) || 0), 0) / data.length 
              : 0,
          };
          setStats(aggregated);
        } else {
          setStats({
            goals: 0,
            assists: 0,
            matches: 0,
            minutesPlayed: 0,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            goalsConceded: 0,
            saves: 0,
            tackles: 0,
            interceptions: 0,
            passesCompleted: 0,
            passAccuracy: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching player stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerId]);

  return { stats, loading };
}

// Hook pour récupérer les stats de tous les joueurs
export function useAllPlayersStats() {
  const [statsMap, setStatsMap] = useState<Record<string, AggregatedStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const { data, error } = await supabase
          .from('player_stats')
          .select('*');

        if (error) throw error;

        if (data) {
          const grouped = data.reduce((acc, stat) => {
            const playerId = stat.player_id;
            if (!acc[playerId]) {
              acc[playerId] = [];
            }
            acc[playerId].push(stat);
            return acc;
          }, {} as Record<string, any[]>);

          const aggregatedMap: Record<string, AggregatedStats> = {};
          
          Object.entries(grouped).forEach(([playerId, playerStats]) => {
            aggregatedMap[playerId] = {
              goals: playerStats.reduce((sum, s) => sum + (s.goals || 0), 0),
              assists: playerStats.reduce((sum, s) => sum + (s.assists || 0), 0),
              matches: playerStats.length,
              minutesPlayed: playerStats.reduce((sum, s) => sum + (s.minutes_played || 0), 0),
              yellowCards: playerStats.reduce((sum, s) => sum + (s.yellow_cards || 0), 0),
              redCards: playerStats.reduce((sum, s) => sum + (s.red_cards || 0), 0),
              cleanSheets: playerStats.reduce((sum, s) => sum + (s.clean_sheets || 0), 0),
              goalsConceded: playerStats.reduce((sum, s) => sum + (s.goals_conceded || 0), 0),
              saves: playerStats.reduce((sum, s) => sum + (s.saves || 0), 0),
              tackles: playerStats.reduce((sum, s) => sum + (s.tackles || 0), 0),
              interceptions: playerStats.reduce((sum, s) => sum + (s.interceptions || 0), 0),
              passesCompleted: playerStats.reduce((sum, s) => sum + (s.passes_completed || 0), 0),
              passAccuracy: playerStats.length > 0 
                ? playerStats.reduce((sum, s) => sum + (Number(s.pass_accuracy) || 0), 0) / playerStats.length 
                : 0,
            };
          });

          setStatsMap(aggregatedMap);
        }
      } catch (error) {
        console.error('Error fetching all player stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  return { statsMap, loading };
}

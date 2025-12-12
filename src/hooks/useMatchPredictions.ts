import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MatchPrediction {
  id: string;
  user_id: string;
  match_id: string;
  home_score_prediction: number;
  away_score_prediction: number;
  points_earned: number;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  total_points: number;
  correct_scores: number;
  correct_outcomes: number;
  total_predictions: number;
  current_streak: number;
  best_streak: number;
}

export const useMatchPredictions = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<MatchPrediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  const fetchPredictions = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('match_predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // Use the secure public view that excludes email addresses
      const { data, error } = await supabase
        .from('prediction_leaderboard_public')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLeaderboard(data || []);

      // Calculate user rank
      if (user && data) {
        const rank = data.findIndex(entry => entry.user_id === user.id);
        setUserRank(rank >= 0 ? rank + 1 : null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const submitPrediction = async (
    matchId: string,
    homeScore: number,
    awayScore: number
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Vous devez être connecté pour faire une prédiction');
      return false;
    }

    try {
      const { error } = await supabase
        .from('match_predictions')
        .upsert({
          user_id: user.id,
          match_id: matchId,
          home_score_prediction: homeScore,
          away_score_prediction: awayScore
        }, {
          onConflict: 'user_id,match_id'
        });

      if (error) throw error;

      toast.success('Prédiction enregistrée !');
      await fetchPredictions();
      return true;
    } catch (error) {
      console.error('Error submitting prediction:', error);
      toast.error('Erreur lors de l\'enregistrement de la prédiction');
      return false;
    }
  };

  const getPredictionForMatch = (matchId: string): MatchPrediction | undefined => {
    return predictions.find(p => p.match_id === matchId);
  };

  const getUserStats = () => {
    if (!user || !leaderboard.length) return null;
    return leaderboard.find(entry => entry.user_id === user.id);
  };

  useEffect(() => {
    fetchPredictions();
    fetchLeaderboard();
  }, [user]);

  return {
    predictions,
    leaderboard,
    isLoading,
    userRank,
    submitPrediction,
    getPredictionForMatch,
    getUserStats,
    refetch: () => {
      fetchPredictions();
      fetchLeaderboard();
    }
  };
};

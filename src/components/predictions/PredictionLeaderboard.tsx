import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp, Target, Zap } from 'lucide-react';
import { useMatchPredictions } from '@/hooks/useMatchPredictions';
import { useAuth } from '@/contexts/AuthContext';

export const PredictionLeaderboard = () => {
  const { leaderboard, userRank, isLoading, getUserStats } = useMatchPredictions();
  const { user } = useAuth();
  const userStats = getUserStats();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* User Stats Card */}
      {user && userStats && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Vos statistiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userStats.total_points}</div>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{userStats.correct_scores}</div>
                <p className="text-xs text-muted-foreground">Scores exacts</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.total_predictions}</div>
                <p className="text-xs text-muted-foreground">Prédictions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">#{userRank || '-'}</div>
                <p className="text-xs text-muted-foreground">Classement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            Classement des pronostiqueurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune prédiction pour le moment</p>
              <p className="text-sm">Soyez le premier à faire une prédiction !</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    entry.user_id === user?.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getRankIcon(index + 1)}
                    <div>
                      <p className="font-medium">
                        {`Player ${entry.user_id.slice(0, 6)}`}
                        {entry.user_id === user?.id && (
                          <Badge variant="outline" className="ml-2 text-xs">Vous</Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.total_predictions} prédictions · {entry.correct_scores} scores exacts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.current_streak > 2 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {entry.current_streak}
                      </Badge>
                    )}
                    <div className="text-right">
                      <div className="font-bold text-lg">{entry.total_points}</div>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

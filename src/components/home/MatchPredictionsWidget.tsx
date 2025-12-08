import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, ChevronRight, Target } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { useMatchPredictions } from '@/hooks/useMatchPredictions';
import { MatchPredictionCard } from '@/components/predictions/MatchPredictionCard';
import { useAuth } from '@/contexts/AuthContext';

export const MatchPredictionsWidget = () => {
  const { upcomingMatches, loading } = useMatches();
  const { predictions, leaderboard, userRank } = useMatchPredictions();
  const { user } = useAuth();

  // Get next 2 upcoming matches
  const nextMatches = upcomingMatches?.slice(0, 2) || [];
  const topPredictors = leaderboard.slice(0, 3);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-secondary/30">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-secondary" />
            Prédictions
          </CardTitle>
          <Link to="/predictions">
            <Button variant="ghost" size="sm">
              Voir tout <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Mini Leaderboard */}
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            <span className="text-sm font-medium">Top 3</span>
          </div>
          <div className="flex items-center gap-2">
            {topPredictors.map((entry, index) => (
              <Badge 
                key={entry.id} 
                variant={index === 0 ? 'default' : 'secondary'}
                className="text-xs"
              >
                {index + 1}. {entry.user_email?.split('@')[0]?.slice(0, 8) || 'User'} ({entry.total_points}pts)
              </Badge>
            ))}
          </div>
        </div>

        {/* User rank if logged in */}
        {user && userRank && (
          <div className="text-center text-sm">
            Votre classement: <span className="font-bold text-primary">#{userRank}</span>
          </div>
        )}

        {/* Next matches to predict */}
        {nextMatches.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Prochains matchs à pronostiquer
            </h4>
            {nextMatches.map((match) => (
              <MatchPredictionCard 
                key={match.id} 
                match={match}
                existingPrediction={predictions.find(p => p.match_id === match.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Aucun match à venir pour le moment</p>
          </div>
        )}

        <Link to="/predictions" className="block">
          <Button className="w-full" variant="outline">
            <Trophy className="w-4 h-4 mr-2" />
            Voir le classement complet
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

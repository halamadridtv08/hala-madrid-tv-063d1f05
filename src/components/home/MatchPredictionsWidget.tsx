import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, ChevronRight, Target } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { useMatchPredictions } from '@/hooks/useMatchPredictions';
import { MatchPredictionCard } from '@/components/predictions/MatchPredictionCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const MatchPredictionsWidget = () => {
  const { upcomingMatches, loading } = useMatches();
  const { predictions, leaderboard, userRank } = useMatchPredictions();
  const { user } = useAuth();
  const { t } = useLanguage();

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
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
            <span className="truncate">{t('predictions.title')}</span>
          </CardTitle>
          <Link to="/predictions">
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden xs:inline">{t('home.viewAll')}</span>
              <ChevronRight className="w-4 h-4 xs:ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Mini Leaderboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 bg-muted/50 rounded-lg p-2 sm:p-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{t('predictions.top3')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {topPredictors.map((entry, index) => (
              <Badge 
                key={entry.id} 
                variant={index === 0 ? 'default' : 'secondary'}
                className="text-[10px] sm:text-xs px-1.5 sm:px-2"
              >
                {index + 1}. {`Player ${entry.user_id.slice(0, 4)}`} ({entry.total_points}pts)
              </Badge>
            ))}
          </div>
        </div>

        {/* User rank if logged in */}
        {user && userRank && (
          <div className="text-center text-xs sm:text-sm">
            {t('predictions.yourRank')}: <span className="font-bold text-primary">#{userRank}</span>
          </div>
        )}

        {/* Next matches to predict */}
        {nextMatches.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">
              {t('predictions.nextMatches')}
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
            <p>{t('predictions.noMatches')}</p>
          </div>
        )}

        <Link to="/predictions" className="block">
          <Button className="w-full text-xs sm:text-sm" variant="outline" size="sm">
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {t('predictions.viewLeaderboard')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

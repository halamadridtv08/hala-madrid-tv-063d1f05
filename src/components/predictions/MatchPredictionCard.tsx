import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trophy, Check, Clock, Target } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMatchPredictions, MatchPrediction } from '@/hooks/useMatchPredictions';
import { useAuth } from '@/contexts/AuthContext';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string | null;
  away_team_logo?: string | null;
  match_date: string;
  status?: string | null;
  home_score?: number | null;
  away_score?: number | null;
  competition?: string | null;
}

interface MatchPredictionCardProps {
  match: Match;
  existingPrediction?: MatchPrediction;
}

export const MatchPredictionCard = ({ match, existingPrediction }: MatchPredictionCardProps) => {
  const { user } = useAuth();
  const { submitPrediction } = useMatchPredictions();
  const [homeScore, setHomeScore] = useState(existingPrediction?.home_score_prediction ?? 0);
  const [awayScore, setAwayScore] = useState(existingPrediction?.away_score_prediction ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUpcoming = match.status === 'upcoming';
  const isFinished = match.status === 'finished';
  const hasPrediction = !!existingPrediction;

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    await submitPrediction(match.id, homeScore, awayScore);
    setIsSubmitting(false);
  };

  const getPointsBadge = () => {
    if (!existingPrediction || !isFinished) return null;
    const points = existingPrediction.points_earned;
    
    if (points === 3) {
      return (
        <Badge className="bg-secondary text-secondary-foreground">
          <Trophy className="w-3 h-3 mr-1" />
          Score exact ! +3 pts
        </Badge>
      );
    } else if (points === 1) {
      return (
        <Badge className="bg-primary text-primary-foreground">
          <Check className="w-3 h-3 mr-1" />
          Bon résultat +1 pt
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <Target className="w-3 h-3 mr-1" />
        0 pt
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{match.competition || 'Match'}</Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            {format(new Date(match.match_date), 'dd MMM HH:mm', { locale: fr })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Teams and Prediction */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
          {/* Home Team */}
          <div className="flex-1 min-w-0 text-center">
            {match.home_team_logo && (
              <img 
                src={match.home_team_logo} 
                alt={match.home_team}
                className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 object-contain max-w-full"
              />
            )}
            <p className="text-xs sm:text-sm font-medium truncate">{match.home_team}</p>
          </div>

          {/* Score Input or Display */}
          <div className="flex items-center gap-2 shrink-0">
            {isUpcoming && !hasPrediction ? (
              <>
                <Input
                  type="number"
                  min="0"
                  max="15"
                  value={homeScore}
                  onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                  className="w-10 sm:w-12 text-center"
                  disabled={!user}
                />
                <span className="text-lg font-bold">-</span>
                <Input
                  type="number"
                  min="0"
                  max="15"
                  value={awayScore}
                  onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                  className="w-10 sm:w-12 text-center"
                  disabled={!user}
                />
              </>
            ) : hasPrediction ? (
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">
                  {existingPrediction.home_score_prediction} - {existingPrediction.away_score_prediction}
                </div>
                <p className="text-xs text-muted-foreground">Votre prédiction</p>
                {isFinished && (
                  <div className="mt-1 text-xs sm:text-sm">
                    Résultat: {match.home_score} - {match.away_score}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                {isFinished ? (
                  <div className="text-xl sm:text-2xl font-bold">
                    {match.home_score} - {match.away_score}
                  </div>
                ) : (
                  <span>VS</span>
                )}
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 min-w-0 text-center">
            {match.away_team_logo && (
              <img 
                src={match.away_team_logo} 
                alt={match.away_team}
                className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 object-contain max-w-full"
              />
            )}
            <p className="text-xs sm:text-sm font-medium truncate">{match.away_team}</p>
          </div>
        </div>

        {/* Points Badge */}
        {getPointsBadge() && (
          <div className="flex justify-center">
            {getPointsBadge()}
          </div>
        )}

        {/* Submit Button */}
        {isUpcoming && !hasPrediction && user && (
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Valider ma prédiction'}
          </Button>
        )}

        {!user && isUpcoming && (
          <p className="text-center text-sm text-muted-foreground">
            Connectez-vous pour faire une prédiction
          </p>
        )}
      </CardContent>
    </Card>
  );
};

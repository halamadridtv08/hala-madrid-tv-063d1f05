import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Goal, AlertCircle, ArrowDownUp, Users } from "lucide-react";

interface MatchEventsProps {
  matchDetails: any;
}

interface TimelineEvent {
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
  team: string;
  player?: string;
  scorer?: string;
  in?: string;
  out?: string;
}

export const MatchEvents = ({ matchDetails }: MatchEventsProps) => {
  if (!matchDetails) return null;

  // Créer une timeline combinée de tous les événements
  const timeline: TimelineEvent[] = [];

  // Ajouter les buts
  if (matchDetails.goals && Array.isArray(matchDetails.goals)) {
    matchDetails.goals.forEach((goal: any) => {
      timeline.push({
        minute: goal.minute,
        type: 'goal',
        team: goal.team,
        scorer: goal.scorer || goal.player
      });
    });
  }

  // Ajouter les cartons
  if (matchDetails.cards) {
    // Cartons jaunes
    if (matchDetails.cards.yellow) {
      Object.entries(matchDetails.cards.yellow).forEach(([team, count]) => {
        // Note: on n'a pas les minutes exactes pour tous les cartons, juste le nombre total
        // On pourrait améliorer cela si on a plus de détails dans le JSON
      });
    }
  }

  // Ajouter les remplacements
  if (matchDetails.substitutions && Array.isArray(matchDetails.substitutions)) {
    matchDetails.substitutions.forEach((sub: any) => {
      timeline.push({
        minute: sub.minute,
        type: 'substitution',
        team: sub.team,
        in: sub.in,
        out: sub.out
      });
    });
  }

  // Ajouter les fautes (qui peuvent indiquer des cartons)
  if (matchDetails.fouls && Array.isArray(matchDetails.fouls)) {
    matchDetails.fouls.forEach((foul: any) => {
      // On pourrait ajouter un indicateur visuel pour les fautes importantes
    });
  }

  // Trier par minute
  timeline.sort((a, b) => a.minute - b.minute);

  const formatPlayerName = (name: string) => {
    if (!name) return '';
    return name.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTeamName = (team: string) => {
    if (team === 'real_madrid') return 'Real Madrid';
    return team.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (timeline.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Événements du match
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {timeline.map((event, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <Badge variant="outline" className="min-w-[50px] justify-center">
                {event.minute}'
              </Badge>
              
              <div className="flex-1 flex items-start gap-3">
                {event.type === 'goal' && (
                  <>
                    <Goal className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">
                        {formatPlayerName(event.scorer || '')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTeamName(event.team)} - But
                      </div>
                    </div>
                  </>
                )}
                
                {event.type === 'substitution' && (
                  <>
                    <ArrowDownUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">
                          ↑ {formatPlayerName(event.in || '')}
                        </span>
                        {' '}
                        <span className="text-red-600 font-medium">
                          ↓ {formatPlayerName(event.out || '')}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTeamName(event.team)} - Remplacement
                      </div>
                    </div>
                  </>
                )}
                
                {(event.type === 'yellow_card' || event.type === 'red_card') && (
                  <>
                    <AlertCircle 
                      className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                        event.type === 'red_card' ? 'text-red-600' : 'text-yellow-600'
                      }`} 
                    />
                    <div>
                      <div className="font-semibold">
                        {formatPlayerName(event.player || '')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTeamName(event.team)} - {event.type === 'red_card' ? 'Carton rouge' : 'Carton jaune'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Statistiques des cartons */}
        {matchDetails.cards && (
          <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {String(Object.values(matchDetails.cards.yellow || {}).reduce((a: number, b: unknown) => a + (Number(b) || 0), 0))}
              </div>
              <div className="text-sm text-muted-foreground">Cartons jaunes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {String(Object.values(matchDetails.cards.red || {}).reduce((a: number, b: unknown) => a + (Number(b) || 0), 0))}
              </div>
              <div className="text-sm text-muted-foreground">Cartons rouges</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

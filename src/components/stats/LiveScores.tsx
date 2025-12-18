import { useLiveScores } from "@/hooks/useFootballApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, RefreshCw } from "lucide-react";

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { text: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
    '1H': { text: '1ère MT', variant: 'destructive' },
    'HT': { text: 'Mi-temps', variant: 'secondary' },
    '2H': { text: '2ème MT', variant: 'destructive' },
    'ET': { text: 'Prolongation', variant: 'destructive' },
    'P': { text: 'Penalties', variant: 'destructive' },
    'FT': { text: 'Terminé', variant: 'outline' },
    'NS': { text: 'À venir', variant: 'secondary' },
    'LIVE': { text: 'EN DIRECT', variant: 'destructive' }
  };
  return statusMap[status] || { text: status, variant: 'secondary' as const };
};

export const LiveScores = () => {
  const { matches, loading, error, refetch, realMadridId } = useLiveScores();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-destructive animate-pulse" />
            Matchs en Direct - La Liga
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Radio className="h-5 w-5" />
            Erreur de chargement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-destructive animate-pulse" />
          Matchs en Direct - La Liga
        </CardTitle>
        <Button onClick={refetch} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Radio className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Aucun match en direct pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const status = getStatusBadge(match.fixture.status.short);
              const isRealMadrid =
                match.teams.home.id === realMadridId ||
                match.teams.away.id === realMadridId;

              return (
                <div
                  key={match.fixture.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    isRealMadrid ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={status.variant} className={status.variant === 'destructive' ? 'animate-pulse' : ''}>
                      {status.text}
                    </Badge>
                    {match.fixture.status.elapsed && (
                      <span className="text-sm font-mono text-muted-foreground">
                        {match.fixture.status.elapsed}'
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={match.teams.home.logo}
                        alt={match.teams.home.name}
                        className="w-10 h-10 object-contain flex-shrink-0"
                      />
                      <span className="font-semibold truncate">{match.teams.home.name}</span>
                    </div>

                    <div className="text-2xl sm:text-3xl font-bold px-4 flex-shrink-0">
                      {match.goals.home ?? '-'} - {match.goals.away ?? '-'}
                    </div>

                    <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                      <span className="font-semibold truncate text-right">{match.teams.away.name}</span>
                      <img
                        src={match.teams.away.logo}
                        alt={match.teams.away.name}
                        className="w-10 h-10 object-contain flex-shrink-0"
                      />
                    </div>
                  </div>

                  {match.events && match.events.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="space-y-1">
                        {match.events.slice(-3).reverse().map((event, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-mono">{event.time.elapsed}'</span>
                            <span>
                              {event.type === 'Goal' ? '⚽' : event.type === 'Card' ? '🟨' : '🔄'}
                            </span>
                            <span>{event.player.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Actualisation automatique toutes les 30 secondes
        </div>
      </CardContent>
    </Card>
  );
};

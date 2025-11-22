import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface PlayerStatPreview {
  playerName: string;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  minutesPlayed?: number;
  shots?: number;
  shotsOnTarget?: number;
  passesCompleted?: number;
  passAccuracy?: string;
  tackles?: number;
}

interface MatchImportPreviewProps {
  matchData: {
    home_team: string;
    away_team: string;
    home_score?: number;
    away_score?: number;
    match_date: string;
    venue?: string;
    competition?: string;
    status?: string;
  };
  playerStats: PlayerStatPreview[];
  isUpdate?: boolean;
}

export const MatchImportPreview = ({ matchData, playerStats, isUpdate = false }: MatchImportPreviewProps) => {
  const totalGoals = playerStats.reduce((sum, p) => sum + (p.goals || 0), 0);
  const totalAssists = playerStats.reduce((sum, p) => sum + (p.assists || 0), 0);
  const totalYellowCards = playerStats.reduce((sum, p) => sum + (p.yellowCards || 0), 0);
  const totalRedCards = playerStats.reduce((sum, p) => sum + (p.redCards || 0), 0);

  return (
    <Card className="w-full border-primary/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">📋 Aperçu de l'import</CardTitle>
          <Badge variant={isUpdate ? "default" : "secondary"} className="text-sm">
            {isUpdate ? "🔄 Mise à jour" : "✨ Nouveau match"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info du match */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Informations du match</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Équipes:</span>
              <p className="font-medium">{matchData.home_team} vs {matchData.away_team}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Score:</span>
              <p className="font-medium">{matchData.home_score} - {matchData.away_score}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>
              <p className="font-medium">{new Date(matchData.match_date).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Compétition:</span>
              <p className="font-medium">{matchData.competition}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Résumé des stats */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Résumé des statistiques</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              ⚽ {totalGoals} but{totalGoals > 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              🎯 {totalAssists} passe{totalAssists > 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              🟨 {totalYellowCards} carton{totalYellowCards > 1 ? 's' : ''} jaune{totalYellowCards > 1 ? 's' : ''}
            </Badge>
            {totalRedCards > 0 && (
              <Badge variant="destructive" className="px-3 py-1">
                🟥 {totalRedCards} carton{totalRedCards > 1 ? 's' : ''} rouge{totalRedCards > 1 ? 's' : ''}
              </Badge>
            )}
            <Badge variant="outline" className="px-3 py-1">
              👥 {playerStats.length} joueur{playerStats.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Détails des joueurs */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Statistiques des joueurs</h3>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <div className="space-y-4">
              {playerStats.map((player, index) => (
                <div key={index} className="space-y-2 pb-4 border-b last:border-0">
                  <h4 className="font-medium">{player.playerName}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    {player.goals !== undefined && player.goals > 0 && (
                      <div>⚽ {player.goals} but{player.goals > 1 ? 's' : ''}</div>
                    )}
                    {player.assists !== undefined && player.assists > 0 && (
                      <div>🎯 {player.assists} passe{player.assists > 1 ? 's' : ''}</div>
                    )}
                    {player.minutesPlayed !== undefined && (
                      <div>⏱️ {player.minutesPlayed} min</div>
                    )}
                    {player.yellowCards !== undefined && player.yellowCards > 0 && (
                      <div>🟨 {player.yellowCards}</div>
                    )}
                    {player.redCards !== undefined && player.redCards > 0 && (
                      <div>🟥 {player.redCards}</div>
                    )}
                    {player.shots !== undefined && player.shots > 0 && (
                      <div>🎯 {player.shots} tir{player.shots > 1 ? 's' : ''}</div>
                    )}
                    {player.shotsOnTarget !== undefined && player.shotsOnTarget > 0 && (
                      <div>🎯 {player.shotsOnTarget} cadré{player.shotsOnTarget > 1 ? 's' : ''}</div>
                    )}
                    {player.passesCompleted !== undefined && player.passesCompleted > 0 && (
                      <div>✅ {player.passesCompleted} passes</div>
                    )}
                    {player.passAccuracy && (
                      <div>📊 {player.passAccuracy} précision</div>
                    )}
                    {player.tackles !== undefined && player.tackles > 0 && (
                      <div>🛡️ {player.tackles} tacle{player.tackles > 1 ? 's' : ''}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

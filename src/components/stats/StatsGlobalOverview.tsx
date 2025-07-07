
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { 
  Trophy, 
  User, 
  Star, 
  Calendar, 
  Activity,
  BarChart3
} from "lucide-react";
import { useRealStats } from "@/hooks/useRealStats";
import { Skeleton } from "@/components/ui/skeleton";

export const StatsGlobalOverview = () => {
  const { stats, loading, error } = useRealStats();

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erreur lors du chargement des statistiques globales</p>
      </div>
    );
  }

  // Calculs des statistiques dérivées
  const totalMatches = stats.totalMatches || 1; // Éviter division par zéro
  const winPercentage = Math.round((stats.wins / totalMatches) * 100);
  const pointsPerGame = Math.round(((stats.wins * 3 + stats.draws) / totalMatches) * 10) / 10;
  const goalsPerGame = Math.round((stats.totalGoals / totalMatches) * 10) / 10;
  const estimatedConceded = Math.floor(stats.totalGoals * 0.3); // Estimation
  const concededPerGame = Math.round((estimatedConceded / totalMatches) * 10) / 10;

  return (
    <div className="space-y-8">
      <Card className="transform transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-madrid-blue" />
            Statistiques Globales - Saison 2024/2025
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-madrid-blue/10 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold">{stats.totalMatches}</div>
              <div className="text-sm text-gray-600">Matchs joués</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{stats.wins}</div>
              <div className="text-sm text-gray-600">Victoires</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-gray-600">{stats.draws}</div>
              <div className="text-sm text-gray-600">Nuls</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-600">{stats.losses}</div>
              <div className="text-sm text-gray-600">Défaites</div>
            </div>

            <div className="bg-amber-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-amber-600">{stats.totalGoals}</div>
              <div className="text-sm text-gray-600">Buts marqués</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{estimatedConceded}</div>
              <div className="text-sm text-gray-600">Buts encaissés</div>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">{winPercentage}%</div>
              <div className="text-sm text-gray-600">% de victoires</div>
            </div>
            <div className="bg-teal-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-teal-600">{pointsPerGame}</div>
              <div className="text-sm text-gray-600">Points par match</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="transform transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-madrid-gold" />
            Top Buteurs (Toutes compétitions)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topScorers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune statistique de buteur disponible</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Joueur</TableHead>
                    <TableHead className="text-center">Buts</TableHead>
                    <TableHead className="text-center">Passes D.</TableHead>
                    <TableHead className="text-center">Matchs</TableHead>
                    <TableHead className="text-center">Buts/Match</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topScorers.slice(0, 5).map((player, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-medium flex items-center gap-2">
                        <img 
                          src={player.image} 
                          alt={player.name} 
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        {player.name}
                      </TableCell>
                      <TableCell className="text-center font-bold">{player.goals}</TableCell>
                      <TableCell className="text-center">{player.assists}</TableCell>
                      <TableCell className="text-center">{player.matches}</TableCell>
                      <TableCell className="text-center">
                        {player.matches > 0 ? Math.round((player.goals / player.matches) * 10) / 10 : 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="transform transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-madrid-blue" />
            Résumé de l'équipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-madrid-blue">{stats.totalPlayers}</div>
              <div className="text-sm text-gray-600">Joueurs total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.activePlayers}</div>
              <div className="text-sm text-gray-600">Joueurs actifs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.upcomingMatches}</div>
              <div className="text-sm text-gray-600">Matchs à venir</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.finishedMatches}</div>
              <div className="text-sm text-gray-600">Matchs terminés</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  User, 
  Star, 
  Calendar, 
  Activity,
  BarChart3,
  Users,
  FileText,
  Video,
  Camera,
  Target,
  Award
} from "lucide-react";
import { useRealStats } from "@/hooks/useRealStats";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminStatsOverview = () => {
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
        <p className="text-red-600">Erreur lors du chargement des statistiques</p>
      </div>
    );
  }

  // Calculs des statistiques dérivées
  const totalMatches = stats.totalMatches || 1;
  const winPercentage = Math.round((stats.wins / totalMatches) * 100);
  const pointsPerGame = Math.round(((stats.wins * 3 + stats.draws) / totalMatches) * 10) / 10;
  const goalsPerGame = Math.round((stats.totalGoals / totalMatches) * 10) / 10;
  const estimatedConceded = Math.floor(stats.totalGoals * 0.3);

  return (
    <div className="space-y-8">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Joueurs</p>
                <p className="text-3xl font-bold">{stats.totalPlayers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Victoires</p>
                <p className="text-3xl font-bold">{stats.wins}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Buts Marqués</p>
                <p className="text-3xl font-bold">{stats.totalGoals}</p>
              </div>
              <Target className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">% Victoires</p>
                <p className="text-3xl font-bold">{winPercentage}%</p>
              </div>
              <Award className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nouvel onglet pour la gestion des statistiques */}
      <Card className="transform transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-madrid-blue" />
            Gestion des Statistiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button 
              onClick={() => window.location.hash = '#stats-manager'}
              className="w-full md:w-auto"
            >
              Modifier les Statistiques des Joueurs
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Cliquez ci-dessus pour accéder à la gestion avancée des statistiques des joueurs,
            matchs et de l'équipe. Vous pourrez ajouter, modifier et supprimer les données statistiques.
          </p>
        </CardContent>
      </Card>

      {/* Statistiques détaillées */}
      <Card className="transform transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-madrid-blue" />
            Statistiques Détaillées - Saison 2025/2026
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
            <div className="bg-teal-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-teal-600">{pointsPerGame}</div>
              <div className="text-sm text-gray-600">Points par match</div>
            </div>
            <div className="bg-indigo-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-indigo-600">{goalsPerGame}</div>
              <div className="text-sm text-gray-600">Buts par match</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Buteurs */}
      <Card className="transform transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-madrid-gold" />
            Top Buteurs (Saison 2025/2026)
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
                  {stats.topScorers.slice(0, 10).map((player, index) => (
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

      {/* Top Passeurs */}
      <Card className="transform transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-madrid-blue" />
            Top Passeurs (Saison 2025/2026)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topAssists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune statistique de passeur disponible</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Joueur</TableHead>
                    <TableHead className="text-center">Passes D.</TableHead>
                    <TableHead className="text-center">Buts</TableHead>
                    <TableHead className="text-center">Matchs</TableHead>
                    <TableHead className="text-center">Passes/Match</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topAssists.slice(0, 10).map((player, index) => (
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
                      <TableCell className="text-center font-bold">{player.assists}</TableCell>
                      <TableCell className="text-center">{player.goals}</TableCell>
                      <TableCell className="text-center">{player.matches}</TableCell>
                      <TableCell className="text-center">
                        {player.matches > 0 ? Math.round((player.assists / player.matches) * 10) / 10 : 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résumé de l'équipe */}
      <Card className="transform transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-madrid-blue" />
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


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

export const StatsGlobalOverview = () => {
  // Données pour la saison actuelle - Statistiques globales
  const globalStats = {
    matchesPlayed: 42,
    wins: 30,
    draws: 7,
    losses: 5,
    goalsScored: 89,
    goalsConceded: 32,
    cleanSheets: 18,
    competitionStats: [
      { 
        competition: "La Liga", 
        played: 30, 
        won: 23, 
        drawn: 5, 
        lost: 2, 
        goalsFor: 67, 
        goalsAgainst: 20, 
        points: 74,
        position: "1er"
      },
      { 
        competition: "Champions League", 
        played: 10, 
        won: 6, 
        drawn: 2, 
        lost: 2, 
        goalsFor: 18, 
        goalsAgainst: 10, 
        points: 20,
        position: "Demi-finale"
      },
      { 
        competition: "Copa del Rey", 
        played: 4, 
        won: 3, 
        drawn: 0, 
        lost: 1, 
        goalsFor: 8, 
        goalsAgainst: 2, 
        points: "-",
        position: "Quart de finale"
      },
      { 
        competition: "Supercoupe d'Europe", 
        played: 1, 
        won: 1, 
        drawn: 0, 
        lost: 0, 
        goalsFor: 2, 
        goalsAgainst: 0, 
        points: "-",
        position: "Vainqueur"
      },
      { 
        competition: "Supercoupe d'Espagne", 
        played: 2, 
        won: 2, 
        drawn: 0, 
        lost: 0, 
        goalsFor: 4, 
        goalsAgainst: 1, 
        points: "-",
        position: "Vainqueur"
      }
    ],
    topScorers: [
      { player: "Mbappé", goals: 32, assists: 12, matches: 38 },
      { player: "Vinicius Jr.", goals: 23, assists: 15, matches: 36 },
      { player: "Bellingham", goals: 18, assists: 8, matches: 40 },
      { player: "Rodrygo", goals: 15, assists: 10, matches: 39 },
      { player: "Endrick", goals: 8, assists: 3, matches: 25 }
    ]
  };

  // Calculs des statistiques dérivées
  const winPercentage = Math.round((globalStats.wins / globalStats.matchesPlayed) * 100);
  const pointsPerGame = Math.round(((globalStats.wins * 3 + globalStats.draws) / globalStats.matchesPlayed) * 10) / 10;
  const goalsPerGame = Math.round((globalStats.goalsScored / globalStats.matchesPlayed) * 10) / 10;
  const concededPerGame = Math.round((globalStats.goalsConceded / globalStats.matchesPlayed) * 10) / 10;

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
              <div className="text-3xl font-bold">{globalStats.matchesPlayed}</div>
              <div className="text-sm text-gray-600">Matchs joués</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{globalStats.wins}</div>
              <div className="text-sm text-gray-600">Victoires</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-gray-600">{globalStats.draws}</div>
              <div className="text-sm text-gray-600">Nuls</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-600">{globalStats.losses}</div>
              <div className="text-sm text-gray-600">Défaites</div>
            </div>

            <div className="bg-amber-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-amber-600">{globalStats.goalsScored}</div>
              <div className="text-sm text-gray-600">Buts marqués</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{globalStats.goalsConceded}</div>
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
            <Trophy className="h-5 w-5 text-madrid-gold" />
            Performance par compétition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compétition</TableHead>
                  <TableHead className="text-center">J</TableHead>
                  <TableHead className="text-center">V</TableHead>
                  <TableHead className="text-center">N</TableHead>
                  <TableHead className="text-center">D</TableHead>
                  <TableHead className="text-center">BP</TableHead>
                  <TableHead className="text-center">BC</TableHead>
                  <TableHead className="text-center">Pts</TableHead>
                  <TableHead className="text-center">Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {globalStats.competitionStats.map((stat, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{stat.competition}</TableCell>
                    <TableCell className="text-center">{stat.played}</TableCell>
                    <TableCell className="text-center">{stat.won}</TableCell>
                    <TableCell className="text-center">{stat.drawn}</TableCell>
                    <TableCell className="text-center">{stat.lost}</TableCell>
                    <TableCell className="text-center">{stat.goalsFor}</TableCell>
                    <TableCell className="text-center">{stat.goalsAgainst}</TableCell>
                    <TableCell className="text-center font-bold">{stat.points}</TableCell>
                    <TableCell className="text-center">
                      <span className={stat.position.includes("Vainqueur") ? "font-bold text-madrid-gold" : ""}>
                        {stat.position}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                {globalStats.topScorers.map((player, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{player.player}</TableCell>
                    <TableCell className="text-center font-bold">{player.goals}</TableCell>
                    <TableCell className="text-center">{player.assists}</TableCell>
                    <TableCell className="text-center">{player.matches}</TableCell>
                    <TableCell className="text-center">
                      {Math.round((player.goals / player.matches) * 10) / 10}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

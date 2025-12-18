import { useLaLigaStandings } from "@/hooks/useFootballApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LaLigaStandings = () => {
  const { standings, loading, error, refetch, realMadridId } = useLaLigaStandings();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Classement La Liga 2024/25
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
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
            <Trophy className="h-5 w-5" />
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
          <Trophy className="h-5 w-5 text-primary" />
          Classement La Liga 2024/25
        </CardTitle>
        <Button onClick={refetch} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Pos</TableHead>
                <TableHead>Équipe</TableHead>
                <TableHead className="text-center w-12">J</TableHead>
                <TableHead className="text-center w-12">V</TableHead>
                <TableHead className="text-center w-12">N</TableHead>
                <TableHead className="text-center w-12">D</TableHead>
                <TableHead className="text-center w-12">BP</TableHead>
                <TableHead className="text-center w-12">BC</TableHead>
                <TableHead className="text-center w-12">Diff</TableHead>
                <TableHead className="text-center w-16 font-bold">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((team) => (
                <TableRow
                  key={team.rank}
                  className={team.team.id === realMadridId ? 'bg-primary/10 font-semibold' : ''}
                >
                  <TableCell className="font-medium">{team.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={team.team.logo}
                        alt={team.team.name}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="truncate max-w-[120px] sm:max-w-none">
                        {team.team.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{team.all.played}</TableCell>
                  <TableCell className="text-center text-green-600">{team.all.win}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{team.all.draw}</TableCell>
                  <TableCell className="text-center text-destructive">{team.all.lose}</TableCell>
                  <TableCell className="text-center">{team.all.goals.for}</TableCell>
                  <TableCell className="text-center">{team.all.goals.against}</TableCell>
                  <TableCell className="text-center">
                    <span className={team.goalsDiff > 0 ? 'text-green-600' : team.goalsDiff < 0 ? 'text-destructive' : ''}>
                      {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold text-lg">{team.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Données API Football • Mise à jour automatique
        </div>
      </CardContent>
    </Card>
  );
};

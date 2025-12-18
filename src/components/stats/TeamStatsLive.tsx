import { useTeamStats } from "@/hooks/useFootballApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart3, RefreshCw, Trophy, Target, Shield, TrendingUp } from "lucide-react";

export const TeamStatsLive = () => {
  const { stats, loading, error, refetch } = useTeamStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Statistiques Real Madrid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <BarChart3 className="h-5 w-5" />
            Erreur de chargement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error || 'Données non disponibles'}</p>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { fixtures, goals, clean_sheet, failed_to_score, form } = stats;
  const totalPlayed = fixtures.played.total;
  const winPercentage = totalPlayed > 0 ? (fixtures.wins.total / totalPlayed) * 100 : 0;
  const drawPercentage = totalPlayed > 0 ? (fixtures.draws.total / totalPlayed) * 100 : 0;
  const losePercentage = totalPlayed > 0 ? (fixtures.loses.total / totalPlayed) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={stats.team.logo}
            alt={stats.team.name}
            className="w-12 h-12 object-contain"
          />
          <div>
            <CardTitle>{stats.team.name}</CardTitle>
            <p className="text-sm text-muted-foreground">Statistiques La Liga 2024/25</p>
          </div>
        </div>
        <Button onClick={refetch} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Matchs joués</p>
                <p className="text-2xl font-bold">{totalPlayed}</p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-50" />
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Victoires</p>
                <p className="text-2xl font-bold text-green-600">{fixtures.wins.total}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Buts marqués</p>
                <p className="text-2xl font-bold">{goals.for.total.total}</p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-50" />
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Forme</p>
                <p className="text-lg font-bold font-mono tracking-wider">
                  {form?.slice(-5).split('').map((char, i) => (
                    <span key={i} className={
                      char === 'W' ? 'text-green-600' : 
                      char === 'D' ? 'text-yellow-600' : 
                      'text-destructive'
                    }>
                      {char}
                    </span>
                  )) || 'N/A'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </div>
        </div>

        {/* Performance Bars */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Victoires</span>
                <span className="font-semibold text-green-600">
                  {fixtures.wins.total} ({winPercentage.toFixed(0)}%)
                </span>
              </div>
              <Progress value={winPercentage} className="h-2 [&>div]:bg-green-600" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Nuls</span>
                <span className="font-semibold text-yellow-600">
                  {fixtures.draws.total} ({drawPercentage.toFixed(0)}%)
                </span>
              </div>
              <Progress value={drawPercentage} className="h-2 [&>div]:bg-yellow-600" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Défaites</span>
                <span className="font-semibold text-destructive">
                  {fixtures.loses.total} ({losePercentage.toFixed(0)}%)
                </span>
              </div>
              <Progress value={losePercentage} className="h-2 [&>div]:bg-destructive" />
            </div>
          </div>
        </div>

        {/* Goals Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-muted-foreground">Buts marqués</p>
            <p className="text-3xl font-bold text-green-600">{goals.for.total.total}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Moyenne: {goals.for.average.total} par match
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-muted-foreground">Buts encaissés</p>
            <p className="text-3xl font-bold text-destructive">{goals.against.total.total}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Moyenne: {goals.against.average.total} par match
            </p>
          </div>
        </div>

        {/* Clean Sheets */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Clean Sheets</p>
                <p className="text-2xl font-bold text-primary">{clean_sheet.total}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Sans marquer</p>
              <p className="text-2xl font-bold text-muted-foreground">{failed_to_score.total}</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Données API Football • Mise à jour automatique
        </div>
      </CardContent>
    </Card>
  );
};

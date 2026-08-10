
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CompetitionTabs } from "@/components/stats/CompetitionTabs";
import { useRealStatsData } from "@/components/stats/RealStatsData";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const Stats = () => {
  const {
    loading,
    isFetching,
    error,
    refetch,
    topScorers,
    topAssists,
    mostPlayed,
    teamPerformance,
    standings,
  } = useRealStatsData();

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="overflow-x-hidden">
          <div className="madrid-container py-8">
            <h1 className="section-title mb-8">Statistiques</h1>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="overflow-x-hidden">
          <div className="madrid-container py-8">
            <h1 className="section-title mb-8">Statistiques</h1>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Erreur de chargement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Une erreur est survenue lors du chargement des statistiques. 
                  Veuillez réessayer plus tard.
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Statistiques Real Madrid"
        description="Statistiques complètes du Real Madrid : buteurs, passeurs, classements et performances par compétition (Liga, Champions League, Coupe)."
        url="/stats"
      />
      <Navbar />
      <main className="overflow-x-hidden">
        <div className="madrid-container py-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h1 className="section-title mb-0">Statistiques</h1>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>
          
          <CompetitionTabs 
            topScorers={topScorers}
            topAssists={topAssists}
            mostPlayed={mostPlayed}
            teamPerformance={teamPerformance}
            standings={standings}
          />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Stats;

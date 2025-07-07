
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CompetitionTabs } from "@/components/stats/CompetitionTabs";
import { useRealStatsData } from "@/components/stats/RealStatsData";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const Stats = () => {
  const { 
    loading, 
    error, 
    topScorers, 
    topAssists, 
    mostPlayed, 
    teamPerformance, 
    standings 
  } = useRealStatsData();

  if (loading) {
    return (
      <>
        <Navbar />
        <main>
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
        <main>
          <div className="madrid-container py-8">
            <h1 className="section-title mb-8">Statistiques</h1>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Erreur de chargement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Une erreur est survenue lors du chargement des statistiques. 
                  Veuillez réessayer plus tard.
                </p>
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
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          <h1 className="section-title mb-8">Statistiques</h1>
          
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

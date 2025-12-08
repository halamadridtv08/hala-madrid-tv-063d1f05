import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/SEOHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy, Calendar, History } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { useMatchPredictions } from '@/hooks/useMatchPredictions';
import { MatchPredictionCard } from '@/components/predictions/MatchPredictionCard';
import { PredictionLeaderboard } from '@/components/predictions/PredictionLeaderboard';

const Predictions = () => {
  const { upcomingMatches, pastMatches, loading: matchesLoading } = useMatches();
  const { predictions, isLoading: predictionsLoading } = useMatchPredictions();
  const [activeTab, setActiveTab] = useState('upcoming');

  const isLoading = matchesLoading || predictionsLoading;

  // Filter matches with user predictions
  const predictedMatchIds = new Set(predictions.map(p => p.match_id));
  const finishedWithPredictions = pastMatches?.filter(m => 
    predictedMatchIds.has(m.id) && m.status === 'finished'
  ) || [];

  return (
    <>
      <SEOHead 
        title="Prédictions de matchs - HALA MADRID TV"
        description="Faites vos pronostics sur les matchs du Real Madrid et gagnez des points. Affrontez les autres fans dans le classement des meilleurs pronostiqueurs."
      />
      <Navbar />
      <main className="min-h-screen bg-background py-8">
        <div className="madrid-container">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Target className="w-8 h-8 text-secondary" />
              <h1 className="text-3xl md:text-4xl font-bold">Prédictions</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Faites vos pronostics sur les matchs du Real Madrid. 
              Score exact = 3 points, bon résultat = 1 point. 
              Affrontez les autres Madridistas !
            </p>
          </div>

          {/* Points Explanation */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="outline" className="px-4 py-2">
              <Trophy className="w-4 h-4 mr-2 text-secondary" />
              Score exact = 3 pts
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              ✓ Bon résultat = 1 pt
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              ✗ Mauvais pronostic = 0 pt
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="upcoming" className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    À venir ({upcomingMatches?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    <History className="w-4 h-4 mr-2" />
                    Historique ({finishedWithPredictions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : upcomingMatches && upcomingMatches.length > 0 ? (
                    upcomingMatches.map((match) => (
                      <MatchPredictionCard
                        key={match.id}
                        match={match}
                        existingPrediction={predictions.find(p => p.match_id === match.id)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun match à venir pour le moment</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : finishedWithPredictions.length > 0 ? (
                    finishedWithPredictions.slice(0, 10).map((match) => (
                      <MatchPredictionCard
                        key={match.id}
                        match={match}
                        existingPrediction={predictions.find(p => p.match_id === match.id)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun historique de prédictions</p>
                      <p className="text-sm">Faites votre première prédiction !</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Leaderboard */}
            <div>
              <PredictionLeaderboard />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Predictions;

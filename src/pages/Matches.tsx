import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, ChevronRight, Activity, RefreshCw, Users, Goal } from "lucide-react";
import { MatchDetail } from "@/components/matches/MatchDetail";
import { MatchStats } from "@/components/matches/MatchStats";
import { TeamFormation } from "@/components/matches/TeamFormation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMatches } from "@/hooks/useMatches";
import { Match } from "@/types/Match";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const Matches = () => {
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [showFormations, setShowFormations] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const {
    upcomingMatches,
    pastMatches,
    loading,
    error,
    refetch
  } = useMatches();

  // Fonction de synchronisation manuelle
  const handleSyncMatches = async () => {
    setSyncing(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('sync-matches');
      if (error) throw error;
      toast.success('Synchronisation réussie');
      refetch(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  // Convertir les matchs Supabase au format attendu par les composants
  const formatMatchForDisplay = (match: Match) => {
    // Extraire les buteurs avec toutes leurs infos depuis match_details
    let scorers: Array<{ name: string; team: string; minute: number }> = [];
    if (match.match_details && typeof match.match_details === 'object') {
      const details = match.match_details as any;
      // Vérifier d'abord dans details.goals (nouveau format)
      const goalsArray = details.goals || details.events?.goals;
      if (goalsArray && Array.isArray(goalsArray)) {
        scorers = goalsArray.map((goal: any) => ({
          name: (goal.scorer || goal.player || '').replace(/_/g, ' ').split(' ').map((word: string) => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          team: goal.team || '',
          minute: goal.minute || 0,
          type: goal.type || goal.goal_type || null // Ajouter le type de but
        }));
      }
    }

    return {
      id: match.id,
      competition: match.competition || 'Match amical',
      round: '',
      date: match.match_date,
      homeTeam: {
        name: match.home_team,
        logo: match.home_team_logo || (match.home_team === 'Real Madrid' ? "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png" : "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Sport_balls.svg/1200px-Sport_balls.svg.png"),
        score: match.home_score
      },
      awayTeam: {
        name: match.away_team,
        logo: match.away_team_logo || (match.away_team === 'Real Madrid' ? "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png" : "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Sport_balls.svg/1200px-Sport_balls.svg.png"),
        score: match.away_score
      },
      venue: match.venue,
      tickets: match.home_team === 'Real Madrid',
      scorers: scorers,
      match_details: match.match_details,
      stats: {},
      timeline: []
    };
  };
  const formattedUpcomingMatches = upcomingMatches.map(formatMatchForDisplay);
  const formattedPastMatches = pastMatches.map(formatMatchForDisplay);
  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };
  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "La Liga":
        return "bg-green-600";
      case "Ligue des Champions":
        return "bg-blue-600";
      case "Copa del Rey":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };
  const handleOpenMatchDetail = (match: any) => {
    setSelectedMatch(match);
    setIsDetailOpen(true);
  };
  const handleOpenMatchStats = (match: any) => {
    setSelectedMatch(match);
    setIsStatsOpen(true);
  };
  const handleOpenFormations = (match: any) => {
    setSelectedMatch(match);
    setShowFormations(true);
  };
  return <>
      <Navbar />
      <main className="min-h-screen">
        <div className="bg-madrid-blue py-10">
          <div className="madrid-container">
            <h1 className="text-4xl font-bold text-white mb-4">Matchs</h1>
          </div>
        </div>

        <div className="madrid-container py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Calendrier des matchs</h2>
              {loading && <RefreshCw className="h-5 w-5 animate-spin text-madrid-blue" />}
            </div>
            <Button onClick={handleSyncMatches} disabled={syncing || loading} variant="outline" className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Synchronisation...' : 'Synchroniser'}
            </Button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>}
          
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upcoming">Prochains matchs ({formattedUpcomingMatches.length})</TabsTrigger>
              <TabsTrigger value="past">Matchs passés ({formattedPastMatches.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {loading ? <div className="flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-madrid-blue" />
                </div> : formattedUpcomingMatches.length === 0 ? <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun match programmé pour le moment</p>
                </div> : <div className="grid gap-6">
                  {formattedUpcomingMatches.map(match => <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleOpenMatchDetail(match)}>
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-r from-madrid-blue to-blue-800 p-4">
                        <div className="flex justify-between items-center text-white">
                          <Badge className={`${getCompetitionColor(match.competition)} text-white`}>
                            {match.competition}
                          </Badge>
                          <span>{match.round}</span>
                        </div>
                      </div>
                      
                      <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
                          <div className="flex flex-col items-center">
                            <img 
                              src={match.homeTeam.logo} 
                              alt={match.homeTeam.name} 
                              className="w-16 h-16 object-contain"
                              width="64"
                              height="64"
                              loading="lazy"
                            />
                            <h3 className="text-lg font-bold mt-2">{match.homeTeam.name}</h3>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-3xl font-bold text-madrid-gold">VS</div>
                            <div className="flex items-center justify-center mt-4 space-x-2">
                              <Calendar className="h-5 w-5 text-gray-500" />
                              <span>{formatMatchDate(match.date)}</span>
                            </div>
                            <div className="flex items-center justify-center mt-2 space-x-2">
                              <Clock className="h-5 w-5 text-gray-500" />
                              <span>{formatMatchTime(match.date)}</span>
                            </div>
                            <div className="flex items-center justify-center mt-2 space-x-2">
                              <MapPin className="h-5 w-5 text-gray-500" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {match.venue}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <img 
                              src={match.awayTeam.logo} 
                              alt={match.awayTeam.name} 
                              className="w-16 h-16 object-contain"
                              width="64"
                              height="64"
                              loading="lazy"
                            />
                            <h3 className="text-lg font-bold mt-2">{match.awayTeam.name}</h3>
                          </div>
                        </div>
                        
                        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                          {match.tickets}
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={e => {
                          e.stopPropagation();
                          handleOpenFormations(match);
                        }}>
                              <Users className="h-4 w-4 mr-2" />
                              Compositions
                            </Button>
                            <Button variant="outline" onClick={e => {
                          e.stopPropagation();
                          handleOpenMatchDetail(match);
                        }}>
                              Voir détails <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
                </div>}
            </TabsContent>
            
            <TabsContent value="past">
              {loading ? <div className="flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-madrid-blue" />
                </div> : formattedPastMatches.length === 0 ? <div className="text-center py-12 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun match passé trouvé</p>
                </div> : <div className="grid gap-6">
                  {formattedPastMatches.map(match => <Card key={match.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-r from-madrid-blue to-blue-800 p-4">
                        <div className="flex justify-between items-center text-white">
                          <Badge className={`${getCompetitionColor(match.competition)} text-white`}>
                            {match.competition}
                          </Badge>
                          <span>{match.round}</span>
                        </div>
                      </div>
                      
                      <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
                          <div className="flex flex-col items-center">
                            <img 
                              src={match.homeTeam.logo} 
                              alt={match.homeTeam.name} 
                              className="w-16 h-16 object-contain"
                              width="64"
                              height="64"
                              loading="lazy"
                            />
                            <h3 className="text-lg font-bold mt-2">{match.homeTeam.name}</h3>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-4xl font-bold mb-4">
                              <span className={match.homeTeam.score > match.awayTeam.score ? "text-madrid-gold" : ""}>
                                {match.homeTeam.score}
                              </span>
                              <span className="mx-2">-</span>
                              <span className={match.awayTeam.score > match.homeTeam.score ? "text-madrid-gold" : ""}>
                                {match.awayTeam.score}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              {formatMatchDate(match.date)}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              {match.venue}
                            </div>
                            <div className="mt-4">
                              <h4 className="font-semibold mb-3 flex items-center justify-center gap-2">
                                <Goal className="h-4 w-4" />
                                Buteurs:
                              </h4>
                              {match.scorers && Array.isArray(match.scorers) && match.scorers.length > 0 ? (
                                <div className="space-y-3">
                                  {/* Grouper par équipe */}
                                  {(() => {
                                    const realMadridGoals = match.scorers.filter((s: any) => 
                                      s.team?.toLowerCase().includes('real_madrid') || 
                                      s.team?.toLowerCase().includes('real madrid')
                                    );
                                    const otherGoals = match.scorers.filter((s: any) => 
                                      !s.team?.toLowerCase().includes('real_madrid') && 
                                      !s.team?.toLowerCase().includes('real madrid')
                                    );
                                    
                                    return (
                                      <>
                                        {realMadridGoals.length > 0 && (
                                          <div className="space-y-1.5">
                                            <div className="text-xs font-medium text-madrid-gold">Real Madrid</div>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                              {realMadridGoals.map((scorer: any, idx: number) => (
                                                <div 
                                                  key={idx}
                                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-madrid-gold/20 text-madrid-gold border border-madrid-gold/30"
                                                >
                                                  <Goal className="h-3.5 w-3.5" />
                                                  <span className="font-medium">{scorer.name}</span>
                                                  <span className="opacity-70">({scorer.minute}')</span>
                                                  {scorer.type && (
                                                    <span className="text-xs opacity-60 ml-1">
                                                      {scorer.type === 'penalty' && '⚽ P'}
                                                      {scorer.type === 'header' && '🎯 T'}
                                                      {scorer.type === 'left_foot' && '👈'}
                                                      {scorer.type === 'right_foot' && '👉'}
                                                    </span>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {otherGoals.length > 0 && (
                                          <div className="space-y-1.5">
                                            <div className="text-xs font-medium text-muted-foreground">
                                              {otherGoals[0]?.team?.replace(/_/g, ' ').split(' ').map((w: string) => 
                                                w.charAt(0).toUpperCase() + w.slice(1)
                                              ).join(' ')}
                                            </div>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                              {otherGoals.map((scorer: any, idx: number) => (
                                                <div 
                                                  key={idx}
                                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-muted/50 text-foreground border border-border/30"
                                                >
                                                  <Goal className="h-3.5 w-3.5" />
                                                  <span className="font-medium">{scorer.name}</span>
                                                  <span className="opacity-70">({scorer.minute}')</span>
                                                  {scorer.type && (
                                                    <span className="text-xs opacity-60 ml-1">
                                                      {scorer.type === 'penalty' && '⚽ P'}
                                                      {scorer.type === 'header' && '🎯 T'}
                                                      {scorer.type === 'left_foot' && '👈'}
                                                      {scorer.type === 'right_foot' && '👉'}
                                                    </span>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">Aucun but marqué</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <img 
                              src={match.awayTeam.logo} 
                              alt={match.awayTeam.name} 
                              className="w-16 h-16 object-contain"
                              width="64"
                              height="64"
                              loading="lazy"
                            />
                            <h3 className="text-lg font-bold mt-2">{match.awayTeam.name}</h3>
                          </div>
                        </div>
                        
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                          <Button variant="outline" onClick={() => handleOpenMatchDetail(match)}>
                            Voir le résumé du match
                          </Button>
                          <Button variant="outline" onClick={() => handleOpenFormations(match)} className="flex items-center gap-2">
                            <Users size={16} />
                            Compositions
                          </Button>
                          <Button variant="outline" onClick={() => handleOpenMatchStats(match)} className="flex items-center gap-2">
                            <Activity size={16} />
                            Statistiques du match
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
                </div>}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      
      <MatchDetail match={selectedMatch} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
      
      {selectedMatch && <MatchStats match={selectedMatch} isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />}

      {/* Team Formations Dialog */}
      <Dialog open={showFormations} onOpenChange={setShowFormations}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compositions d'équipe</DialogTitle>
          </DialogHeader>
          {selectedMatch && <TeamFormation match={selectedMatch} />}
        </DialogContent>
      </Dialog>
    </>;
};
export default Matches;
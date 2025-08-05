
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Shield, Share2, Flag, Clock } from "lucide-react";

interface MatchStatsProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
}

export const MatchStats = ({ match, isOpen, onClose }: MatchStatsProps) => {
  if (!match) return null;

  // Provide default stats structure if not available
  const defaultStats = {
    attack: {
      totalShots: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      shotsOffTarget: { home: 0, away: 0 }
    },
    defense: {
      saves: { home: 0, away: 0 },
      tackles: { home: 0, away: 0 }
    },
    distribution: {
      totalPasses: { home: 0, away: 0 },
      completedPasses: { home: 0, away: 0 }
    },
    discipline: {
      fouls: { home: 0, away: 0 },
      yellowCards: { home: 0, away: 0 },
      redCards: { home: 0, away: 0 }
    }
  };

  // Safe access to stats with multiple fallback levels
  const stats = {
    attack: {
      totalShots: { 
        home: match?.stats?.attack?.totalShots?.home || 0, 
        away: match?.stats?.attack?.totalShots?.away || 0 
      },
      shotsOnTarget: { 
        home: match?.stats?.attack?.shotsOnTarget?.home || 0, 
        away: match?.stats?.attack?.shotsOnTarget?.away || 0 
      },
      shotsOffTarget: { 
        home: match?.stats?.attack?.shotsOffTarget?.home || 0, 
        away: match?.stats?.attack?.shotsOffTarget?.away || 0 
      }
    },
    defense: {
      saves: { 
        home: match?.stats?.defense?.saves?.home || 0, 
        away: match?.stats?.defense?.saves?.away || 0 
      },
      tackles: { 
        home: match?.stats?.defense?.tackles?.home || 0, 
        away: match?.stats?.defense?.tackles?.away || 0 
      }
    },
    distribution: {
      totalPasses: { 
        home: match?.stats?.distribution?.totalPasses?.home || 0, 
        away: match?.stats?.distribution?.totalPasses?.away || 0 
      },
      completedPasses: { 
        home: match?.stats?.distribution?.completedPasses?.home || 0, 
        away: match?.stats?.distribution?.completedPasses?.away || 0 
      }
    },
    discipline: {
      fouls: { 
        home: match?.stats?.discipline?.fouls?.home || 0, 
        away: match?.stats?.discipline?.fouls?.away || 0 
      },
      yellowCards: { 
        home: match?.stats?.discipline?.yellowCards?.home || 0, 
        away: match?.stats?.discipline?.yellowCards?.away || 0 
      },
      redCards: { 
        home: match?.stats?.discipline?.redCards?.home || 0, 
        away: match?.stats?.discipline?.redCards?.away || 0 
      }
    }
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "La Liga": return "bg-green-600";
      case "Ligue des Champions": return "bg-blue-600";
      case "Copa del Rey": return "bg-purple-600";
      default: return "bg-gray-600";
    }
  };

  const renderProgressBar = (homeValue: number, awayValue: number) => {
    const total = homeValue + awayValue;
    const homePercent = total === 0 ? 50 : Math.round((homeValue / total) * 100);
    const awayPercent = total === 0 ? 50 : 100 - homePercent;

    return (
      <div className="flex h-2 my-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="bg-madrid-blue" 
          style={{ width: `${homePercent}%` }}
        ></div>
        <div 
          className="bg-blue-500" 
          style={{ width: `${awayPercent}%` }}
        ></div>
      </div>
    );
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case "But": return "bg-green-500 text-white";
      case "Carton jaune": return "bg-yellow-500 text-black";
      case "Carton rouge": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case "But": return "⚽";
      case "Carton jaune": return "🟨";
      case "Carton rouge": return "🟥";
      default: return "•";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            <div className="flex items-center gap-2">
              <Badge className={`${getCompetitionColor(match?.competition || "")}`}>
                {match?.competition || "Match"}
              </Badge>
              <span>{match?.round || ""} - Statistiques</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            <div className="text-center mt-2">
              {match?.date ? formatMatchDate(match.date) : "Date inconnue"} - {match?.venue || "Lieu inconnu"}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between my-6 px-2">
          <div className="flex flex-col items-center">
            <img 
              src={match?.homeTeam?.logo || '/placeholder.svg'} 
              alt={match?.homeTeam?.name || 'Home Team'}
              className="w-16 h-16 object-contain"
            />
            <h3 className="text-lg font-bold mt-2">{match?.homeTeam?.name || 'Home Team'}</h3>
          </div>
          
          <div className="text-4xl font-bold">
            <span className={(match?.homeTeam?.score || 0) > (match?.awayTeam?.score || 0) ? "text-madrid-gold" : ""}>
              {match?.homeTeam?.score || 0}
            </span>
            <span className="mx-2">-</span>
            <span className={(match?.awayTeam?.score || 0) > (match?.homeTeam?.score || 0) ? "text-madrid-gold" : ""}>
              {match?.awayTeam?.score || 0}
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <img 
              src={match?.awayTeam?.logo || '/placeholder.svg'} 
              alt={match?.awayTeam?.name || 'Away Team'}
              className="w-16 h-16 object-contain"
            />
            <h3 className="text-lg font-bold mt-2">{match?.awayTeam?.name || 'Away Team'}</h3>
          </div>
        </div>

        <Tabs defaultValue="general" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Statistiques générales</TabsTrigger>
            <TabsTrigger value="timeline">Chronologie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-8">
                  {/* Statistiques d'attaque */}
                  <div>
                    <h3 className="text-lg font-semibold flex items-center mb-4">
                      <Activity className="mr-2 h-5 w-5 text-madrid-blue" />
                      Attaque
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{stats.attack.totalShots.home}</span>
                          <span className="font-medium">Tirs totaux</span>
                          <span>{stats.attack.totalShots.away}</span>
                        </div>
                        {renderProgressBar(stats.attack.totalShots.home, stats.attack.totalShots.away)}
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{stats.attack.shotsOnTarget.home}</span>
                          <span className="font-medium">Tirs cadrés</span>
                          <span>{stats.attack.shotsOnTarget.away}</span>
                        </div>
                        {renderProgressBar(stats.attack.shotsOnTarget.home, stats.attack.shotsOnTarget.away)}
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{stats.attack.shotsOffTarget.home}</span>
                          <span className="font-medium">Tirs non cadrés</span>
                          <span>{stats.attack.shotsOffTarget.away}</span>
                        </div>
                        {renderProgressBar(stats.attack.shotsOffTarget.home, stats.attack.shotsOffTarget.away)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Statistiques de défense */}
                  <div>
                    <h3 className="text-lg font-semibold flex items-center mb-4">
                      <Shield className="mr-2 h-5 w-5 text-madrid-blue" />
                      Défense
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{stats.defense.saves.home}</span>
                          <span className="font-medium">Arrêts du gardien</span>
                          <span>{stats.defense.saves.away}</span>
                        </div>
                        {renderProgressBar(stats.defense.saves.home, stats.defense.saves.away)}
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{stats.defense.tackles.home}</span>
                          <span className="font-medium">Tacles</span>
                          <span>{stats.defense.tackles.away}</span>
                        </div>
                        {renderProgressBar(stats.defense.tackles.home, stats.defense.tackles.away)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Statistiques de passes */}
                  <div>
                    <h3 className="text-lg font-semibold flex items-center mb-4">
                      <Share2 className="mr-2 h-5 w-5 text-madrid-blue" />
                      Distribution
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{stats.distribution.totalPasses.home}</span>
                          <span className="font-medium">Passes totales</span>
                          <span>{stats.distribution.totalPasses.away}</span>
                        </div>
                        {renderProgressBar(stats.distribution.totalPasses.home, stats.distribution.totalPasses.away)}
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{stats.distribution.completedPasses.home}</span>
                          <span className="font-medium">Passes réussies</span>
                          <span>{stats.distribution.completedPasses.away}</span>
                        </div>
                        {renderProgressBar(stats.distribution.completedPasses.home, stats.distribution.completedPasses.away)}
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>
                            {Math.round((stats.distribution.completedPasses.home / stats.distribution.totalPasses.home) * 100) || 0}%
                          </span>
                          <span className="font-medium">Précision des passes</span>
                          <span>
                            {Math.round((stats.distribution.completedPasses.away / stats.distribution.totalPasses.away) * 100) || 0}%
                          </span>
                        </div>
                        {renderProgressBar(stats.distribution.completedPasses.home, stats.distribution.completedPasses.away)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Statistiques de discipline */}
                  <div>
                    <h3 className="text-lg font-semibold flex items-center mb-4">
                      <Flag className="mr-2 h-5 w-5 text-madrid-blue" />
                      Discipline
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{stats.discipline.fouls.home}</span>
                          <span className="font-medium">Fautes</span>
                          <span>{stats.discipline.fouls.away}</span>
                        </div>
                        {renderProgressBar(stats.discipline.fouls.home, stats.discipline.fouls.away)}
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{stats.discipline.yellowCards.home}</span>
                          <span className="font-medium">Cartons jaunes</span>
                          <span>{stats.discipline.yellowCards.away}</span>
                        </div>
                        {renderProgressBar(stats.discipline.yellowCards.home, stats.discipline.yellowCards.away)}
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{stats.discipline.redCards.home}</span>
                          <span className="font-medium">Cartons rouges</span>
                          <span>{stats.discipline.redCards.away}</span>
                        </div>
                        {renderProgressBar(stats.discipline.redCards.home, stats.discipline.redCards.away)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeline">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <Clock className="mr-2 h-5 w-5 text-madrid-blue" />
                  Chronologie des événements
                </h3>
                
                <div className="relative px-4">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    {match?.timeline && match.timeline.length > 0 ? match.timeline.sort((a, b) => a.minute - b.minute).map((event, index) => (
                      <div key={index} className="flex gap-4 relative">
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getEventColor(event?.event || "")}`}>
                            <span className="text-lg">{getEventIcon(event?.event || "")}</span>
                          </div>
                          <div className="text-sm font-bold mt-1">{event?.minute || 0}'</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex-1">
                          <div className="font-bold text-md">{event?.event || "Événement"}</div>
                          <div className="flex justify-between mb-1">
                            <span>{event?.player || "Joueur inconnu"}</span>
                            <span className="text-gray-500">{event?.team || "Équipe"}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{event?.details || "Aucun détail"}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center text-gray-500 py-8">
                        Aucun événement disponible pour ce match
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

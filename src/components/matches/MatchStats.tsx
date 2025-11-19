
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Shield, Share2, Flag } from "lucide-react";

interface MatchStatsProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
}

export const MatchStats = ({ match, isOpen, onClose }: MatchStatsProps) => {
  if (!match) return null;

  // Extract match_details from the database
  const matchDetails = match?.match_details?.match || {};
  const events = match?.match_details?.événements || {};
  
  // Parse possession percentages
  const parsePossession = (possessionStr: string) => {
    return parseInt(possessionStr?.replace('%', '')?.trim() || '0');
  };

  const homePossession = parsePossession(matchDetails.possession?.[matchDetails.équipes?.home] || '0');
  const awayPossession = parsePossession(matchDetails.possession?.[matchDetails.équipes?.away] || '0');

  // Get yellow and red cards
  const yellowCards = events?.cartes?.jaune?.[0] || {};
  const redCards = events?.cartes?.rouge?.[0] || {};

  // Safe access to stats from match_details
  const stats = {
    attack: {
      totalShots: { 
        home: matchDetails?.tirs_totaux?.[matchDetails.équipes?.home] || 0, 
        away: matchDetails?.tirs_totaux?.[matchDetails.équipes?.away] || 0 
      },
      shotsOnTarget: { 
        home: matchDetails?.tirs_cadrés?.[matchDetails.équipes?.home] || 0, 
        away: matchDetails?.tirs_cadrés?.[matchDetails.équipes?.away] || 0 
      },
      shotsOffTarget: { 
        home: matchDetails?.tirs_non_cadrés?.[matchDetails.équipes?.home] || 0, 
        away: matchDetails?.tirs_non_cadrés?.[matchDetails.équipes?.away] || 0 
      }
    },
    defense: {
      saves: { 
        home: matchDetails?.arrêts_gardien?.[matchDetails.équipes?.home] || 0, 
        away: matchDetails?.arrêts_gardien?.[matchDetails.équipes?.away] || 0 
      },
      tackles: { 
        home: matchDetails?.tacles?.[matchDetails.équipes?.home] || 0, 
        away: matchDetails?.tacles?.[matchDetails.équipes?.away] || 0 
      }
    },
    distribution: {
      totalPasses: { 
        home: matchDetails?.passes_totales?.[matchDetails.équipes?.home] || 0, 
        away: matchDetails?.passes_totales?.[matchDetails.équipes?.away] || 0 
      },
      completedPasses: { 
        home: matchDetails?.passes_réussies?.[matchDetails.équipes?.home] || 0, 
        away: matchDetails?.passes_réussies?.[matchDetails.équipes?.away] || 0 
      },
      possession: {
        home: homePossession,
        away: awayPossession
      }
    },
    discipline: {
      fouls: { 
        home: events?.fautes?.filter(f => f.team === matchDetails.équipes?.home)?.length || 0, 
        away: events?.fautes?.filter(f => f.team === matchDetails.équipes?.away)?.length || 0 
      },
      yellowCards: { 
        home: yellowCards[matchDetails.équipes?.home] || 0, 
        away: yellowCards[matchDetails.équipes?.away] || 0 
      },
      redCards: { 
        home: redCards[matchDetails.équipes?.home] || 0, 
        away: redCards[matchDetails.équipes?.away] || 0 
      }
    }
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "La Liga": return "bg-green-600";
      case "Ligue des Champions": return "bg-blue-600";
      case "Copa del Rey": return "bg-purple-600";
      default: return "bg-gray-600";
    }
  };

  const formatMatchDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
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

        <Card className="mt-6">
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
                          <span>{stats.distribution.possession.home}%</span>
                          <span className="font-medium">Possession du ballon</span>
                          <span>{stats.distribution.possession.away}%</span>
                        </div>
                        {renderProgressBar(stats.distribution.possession.home, stats.distribution.possession.away)}
                      </div>

                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{stats.distribution.totalPasses.home}</span>
                          <span className="font-medium">Total des passes</span>
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
      </DialogContent>
    </Dialog>
  );
};

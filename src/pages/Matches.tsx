
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, ChevronRight, Activity, Shield, Share2, Flag } from "lucide-react";
import { MatchDetail } from "@/components/matches/MatchDetail";
import { MatchStats } from "@/components/matches/MatchStats";

const Matches = () => {
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Simuler des données de matchs passés
  const pastMatches = [
    {
      id: 1,
      competition: "La Liga",
      round: "Journée 32",
      date: "2025-04-20T20:00:00",
      homeTeam: {
        name: "Real Madrid",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png",
        score: 3
      },
      awayTeam: {
        name: "FC Barcelone",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png",
        score: 0
      },
      venue: "Santiago Bernabéu",
      scorers: ["Mbappé (23', 45', 67')"],
      stats: {
        attack: {
          totalShots: { home: 18, away: 9 },
          shotsOnTarget: { home: 8, away: 2 },
          shotsOffTarget: { home: 10, away: 7 }
        },
        defense: {
          saves: { home: 2, away: 5 },
          tackles: { home: 16, away: 12 }
        },
        distribution: {
          totalPasses: { home: 587, away: 423 },
          completedPasses: { home: 532, away: 358 }
        },
        discipline: {
          fouls: { home: 8, away: 14 },
          yellowCards: { home: 1, away: 3 },
          redCards: { home: 0, away: 0 }
        }
      },
      timeline: [
        { minute: 23, event: "But", player: "Mbappé", team: "Real Madrid", details: "Frappe du pied gauche après un centre de Vinicius Jr" },
        { minute: 32, event: "Carton jaune", player: "De Jong", team: "FC Barcelone", details: "Tacle par derrière sur Bellingham" },
        { minute: 45, event: "But", player: "Mbappé", team: "Real Madrid", details: "Penalty après une faute sur Vinicius Jr" },
        { minute: 56, event: "Carton jaune", player: "Gavi", team: "FC Barcelone", details: "Contestation" },
        { minute: 67, event: "But", player: "Mbappé", team: "Real Madrid", details: "Contre-attaque rapide, passe décisive de Bellingham" },
        { minute: 78, event: "Carton jaune", player: "Yamal", team: "FC Barcelone", details: "Simulation" }
      ]
    },
    {
      id: 2,
      competition: "Ligue des Champions",
      round: "Quart de finale retour",
      date: "2025-04-16T20:45:00",
      homeTeam: {
        name: "Real Madrid",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png",
        score: 2
      },
      awayTeam: {
        name: "Bayern Munich",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
        score: 0
      },
      venue: "Santiago Bernabéu",
      scorers: ["Vinicius Jr (34'), Bellingham (78')"],
      stats: {
        attack: {
          totalShots: { home: 15, away: 12 },
          shotsOnTarget: { home: 7, away: 4 },
          shotsOffTarget: { home: 8, away: 8 }
        },
        defense: {
          saves: { home: 4, away: 5 },
          tackles: { home: 18, away: 14 }
        },
        distribution: {
          totalPasses: { home: 492, away: 508 },
          completedPasses: { home: 436, away: 458 }
        },
        discipline: {
          fouls: { home: 10, away: 12 },
          yellowCards: { home: 2, away: 2 },
          redCards: { home: 0, away: 0 }
        }
      },
      timeline: [
        { minute: 34, event: "But", player: "Vinicius Jr", team: "Real Madrid", details: "Frappe enroulée depuis l'entrée de la surface" },
        { minute: 42, event: "Carton jaune", player: "Kimmich", team: "Bayern Munich", details: "Tacle dangereux sur Mbappé" },
        { minute: 65, event: "Carton jaune", player: "Carvajal", team: "Real Madrid", details: "Tirage de maillot sur Musiala" },
        { minute: 78, event: "But", player: "Bellingham", team: "Real Madrid", details: "Tête sur corner tiré par Modrić" },
        { minute: 81, event: "Carton jaune", player: "Mendy", team: "Real Madrid", details: "Gain de temps" },
        { minute: 85, event: "Carton jaune", player: "Goretzka", team: "Bayern Munich", details: "Faute tactique" }
      ]
    },
    {
      id: 3,
      competition: "La Liga",
      round: "Journée 31",
      date: "2025-04-13T16:15:00",
      homeTeam: {
        name: "Getafe",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ab/Getafe_CF_logo.svg/1200px-Getafe_CF_logo.svg.png",
        score: 0
      },
      awayTeam: {
        name: "Real Madrid",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png",
        score: 2
      },
      venue: "Coliseum Alfonso Pérez",
      scorers: ["Rodrygo (56'), Mbappé (71')"],
      stats: {
        attack: {
          totalShots: { home: 7, away: 16 },
          shotsOnTarget: { home: 2, away: 9 },
          shotsOffTarget: { home: 5, away: 7 }
        },
        defense: {
          saves: { home: 7, away: 2 },
          tackles: { home: 22, away: 8 }
        },
        distribution: {
          totalPasses: { home: 312, away: 621 },
          completedPasses: { home: 256, away: 568 }
        },
        discipline: {
          fouls: { home: 18, away: 6 },
          yellowCards: { home: 4, away: 1 },
          redCards: { home: 1, away: 0 }
        }
      },
      timeline: [
        { minute: 32, event: "Carton jaune", player: "Djené", team: "Getafe", details: "Faute sur Vinicius Jr" },
        { minute: 48, event: "Carton jaune", player: "Arambarri", team: "Getafe", details: "Tacle dangereux sur Camavinga" },
        { minute: 56, event: "But", player: "Rodrygo", team: "Real Madrid", details: "Frappe à l'entrée de la surface" },
        { minute: 62, event: "Carton rouge", player: "Djené", team: "Getafe", details: "Second carton jaune pour une faute sur Mbappé" },
        { minute: 71, event: "But", player: "Mbappé", team: "Real Madrid", details: "Contre-attaque, passe décisive de Bellingham" },
        { minute: 76, event: "Carton jaune", player: "Tchouaméni", team: "Real Madrid", details: "Faute tactique" },
        { minute: 85, event: "Carton jaune", player: "Mayoral", team: "Getafe", details: "Contestation" }
      ]
    }
  ];

  // Simuler des données de matchs à venir
  const upcomingMatches = [
    {
      id: 4,
      competition: "Ligue des Champions",
      round: "Demi-finale aller",
      date: "2025-05-02T20:00:00",
      homeTeam: {
        name: "Manchester City",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png"
      },
      awayTeam: {
        name: "Real Madrid",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png"
      },
      venue: "Etihad Stadium",
      tickets: false
    },
    {
      id: 5,
      competition: "Ligue des Champions",
      round: "Demi-finale retour",
      date: "2025-05-06T20:00:00",
      homeTeam: {
        name: "Real Madrid",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png"
      },
      awayTeam: {
        name: "Manchester City",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png"
      },
      venue: "Santiago Bernabéu",
      tickets: true
    },
    {
      id: 6,
      competition: "La Liga",
      round: "Journée 33",
      date: "2025-05-10T18:30:00",
      homeTeam: {
        name: "Real Madrid",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png"
      },
      awayTeam: {
        name: "Villarreal",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/70/Villarreal_CF_logo.svg/1200px-Villarreal_CF_logo.svg.png"
      },
      venue: "Santiago Bernabéu",
      tickets: true
    }
  ];

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
      case "La Liga": return "bg-green-600";
      case "Ligue des Champions": return "bg-blue-600";
      case "Copa del Rey": return "bg-purple-600";
      default: return "bg-gray-600";
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="bg-madrid-blue py-10">
          <div className="madrid-container">
            <h1 className="text-4xl font-bold text-white mb-4">Matchs</h1>
          </div>
        </div>

        <div className="madrid-container py-8">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upcoming">Prochains matchs</TabsTrigger>
              <TabsTrigger value="past">Matchs passés</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              <div className="grid gap-6">
                {upcomingMatches.map(match => (
                  <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleOpenMatchDetail(match)}>
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
                            />
                            <h3 className="text-lg font-bold mt-2">{match.awayTeam.name}</h3>
                          </div>
                        </div>
                        
                        <div className="mt-8 text-center flex justify-between items-center">
                          {match.tickets && (
                            <Button className="bg-madrid-blue hover:bg-blue-700 text-white">
                              Acheter des billets
                            </Button>
                          )}
                          <Button variant="outline" className="ml-auto" onClick={(e) => { e.stopPropagation(); handleOpenMatchDetail(match); }}>
                            Voir détails <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="past">
              <div className="grid gap-6">
                {pastMatches.map(match => (
                  <Card key={match.id} className="overflow-hidden">
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
                              <h4 className="font-semibold mb-1">Buteurs:</h4>
                              <p className="text-sm">{match.scorers.join(", ")}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <img 
                              src={match.awayTeam.logo} 
                              alt={match.awayTeam.name}
                              className="w-16 h-16 object-contain"
                            />
                            <h3 className="text-lg font-bold mt-2">{match.awayTeam.name}</h3>
                          </div>
                        </div>
                        
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                          <Button asChild variant="outline">
                            <Link to={`/news/${match.id}`}>
                              Voir le résumé du match
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleOpenMatchStats(match)}
                            className="flex items-center gap-2"
                          >
                            <Activity size={16} />
                            Statistiques du match
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      
      <MatchDetail 
        match={selectedMatch} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
      
      {selectedMatch && (
        <MatchStats
          match={selectedMatch}
          isOpen={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
        />
      )}
    </>
  );
};

export default Matches;

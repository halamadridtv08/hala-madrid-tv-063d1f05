
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin } from "lucide-react";

const Matches = () => {
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
      scorers: ["Mbappé (23', 45', 67')"]
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
      scorers: ["Vinicius Jr (34'), Bellingham (78')"]
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
      scorers: ["Rodrygo (56'), Mbappé (71')"]
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
                        
                        <div className="mt-8 text-center">
                          {match.tickets && (
                            <Button className="bg-madrid-blue hover:bg-blue-700 text-white">
                              Acheter des billets
                            </Button>
                          )}
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
                        
                        <div className="mt-8 text-center">
                          <Button asChild variant="outline">
                            <Link to={`/news/${match.id}`}>
                              Voir le résumé du match
                            </Link>
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
    </>
  );
};

export default Matches;

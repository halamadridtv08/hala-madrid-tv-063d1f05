
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";

const Calendar = () => {
  const [date, setDate] = useState(new Date());
  
  // Données de calendrier avec logos
  const matches = [
    {
      id: 1,
      competition: "Ligue des Champions",
      round: "Demi-finale retour",
      date: new Date("2025-05-06T20:00:00"),
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
      id: 2,
      competition: "La Liga",
      round: "Journée 37",
      date: new Date("2025-05-10T16:15:00"),
      homeTeam: {
        name: "Sevilla FC",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/1200px-Sevilla_FC_logo.svg.png"
      },
      awayTeam: {
        name: "Real Madrid",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png"
      },
      venue: "Ramón Sánchez-Pizjuán",
      tickets: true
    },
    {
      id: 3,
      competition: "La Liga",
      round: "Journée 38",
      date: new Date("2025-05-18T21:00:00"),
      homeTeam: {
        name: "Real Madrid",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png"
      },
      awayTeam: {
        name: "Real Betis",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Real_betis_logo.svg/1200px-Real_betis_logo.svg.png"
      },
      venue: "Santiago Bernabéu",
      tickets: false
    },
    {
      id: 4,
      competition: "La Liga",
      round: "Journée 1",
      date: new Date("2025-05-25T21:00:00"),
      homeTeam: {
        name: "Real Madrid",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png"
      },
      awayTeam: {
        name: "FC Barcelona",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png"
      },
      venue: "Santiago Bernabéu",
      tickets: false
    },
    {
      id: 5,
      competition: "Supercoupe d'Europe",
      round: "Finale",
      date: new Date("2025-06-05T20:45:00"),
      homeTeam: {
        name: "Real Madrid",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png"
      },
      awayTeam: {
        name: "Bayern Munich",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_München_logo_%282017%29.svg/1200px-FC_Bayern_München_logo_%282017%29.svg.png"
      },
      venue: "Stade de France",
      tickets: false
    }
  ];

  const formatMatchDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatMatchTime = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Filtrer les matchs pour le mois actuel
  const currentMonthMatches = matches.filter(match => 
    match.date.getMonth() === date.getMonth() && 
    match.date.getFullYear() === date.getFullYear()
  );

  // Jours spéciaux avec des matchs pour le calendrier
  const matchDays = matches.map(match => new Date(match.date));

  return (
    <>
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          <h1 className="section-title mb-8">Calendrier des Matchs</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card className="p-4 transform transition-all hover:scale-105 hover:shadow-xl">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  modifiers={{
                    matchDay: matchDays
                  }}
                  modifiersStyles={{
                    matchDay: {
                      fontWeight: 'bold',
                      color: '#FEBE10',
                      backgroundColor: '#00529F20'
                    }
                  }}
                />
                <div className="mt-4">
                  <h3 className="text-lg font-bold">Prochains matchs importants</h3>
                  <div className="space-y-2 mt-2">
                    {matches.slice(0, 3).map((match) => (
                      <div key={match.id} className="flex items-center text-sm p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                        <img 
                          src={match.awayTeam.name === "Real Madrid" ? match.homeTeam.logo : match.awayTeam.logo} 
                          alt="Logo adversaire"
                          className="w-5 h-5 mr-2"
                        />
                        <span>
                          {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(match.date)} - {match.awayTeam.name === "Real Madrid" ? match.homeTeam.name : match.awayTeam.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Matchs à venir</h2>
              
              {currentMonthMatches.length > 0 ? (
                <div className="space-y-4">
                  {currentMonthMatches.map((match) => (
                    <Card key={match.id} className="overflow-hidden transform transition-all hover:scale-102 hover:shadow-lg">
                      <CardContent className="p-0">
                        <div className="bg-gradient-to-r from-madrid-blue to-blue-800 p-4">
                          <div className="flex justify-between items-center text-white">
                            <Badge variant="secondary" className="bg-madrid-gold text-black">
                              {match.competition}
                            </Badge>
                            <span>{match.round}</span>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div className="flex flex-col items-center transform transition-transform hover:scale-110">
                              <img 
                                src={match.homeTeam.logo} 
                                alt={match.homeTeam.name}
                                className="w-12 h-12 object-contain"
                              />
                              <h3 className="text-lg font-bold mt-2">{match.homeTeam.name}</h3>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-3xl font-bold">VS</div>
                              <div className="flex items-center justify-center mt-2 space-x-2">
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{formatMatchDate(match.date)}</span>
                              </div>
                              <div className="flex items-center justify-center mt-1 space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{formatMatchTime(match.date)}</span>
                              </div>
                              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                {match.venue}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-center transform transition-transform hover:scale-110">
                              <img 
                                src={match.awayTeam.logo} 
                                alt={match.awayTeam.name}
                                className="w-12 h-12 object-contain"
                              />
                              <h3 className="text-lg font-bold mt-2">{match.awayTeam.name}</h3>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-gray-500">Aucun match programmé pour ce mois.</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Calendar;

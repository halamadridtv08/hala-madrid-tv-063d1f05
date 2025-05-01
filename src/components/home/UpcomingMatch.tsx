
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

export function UpcomingMatch() {
  // Simuler des données de match
  const upcomingMatch = {
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

  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="madrid-container">
        <h2 className="section-title">Prochain Match</h2>
        
        <Card className="max-w-4xl mx-auto overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-madrid-blue to-blue-800 p-4">
              <div className="flex justify-between items-center text-white">
                <Badge variant="secondary" className="bg-madrid-gold text-black">
                  {upcomingMatch.competition}
                </Badge>
                <span>{upcomingMatch.round}</span>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
                <div className="flex flex-col items-center">
                  <img 
                    src={upcomingMatch.homeTeam.logo} 
                    alt={upcomingMatch.homeTeam.name}
                    className="w-20 h-20 object-contain"
                  />
                  <h3 className="text-xl font-bold mt-2">{upcomingMatch.homeTeam.name}</h3>
                </div>
                
                <div className="text-center">
                  <div className="text-5xl font-bold text-madrid-gold">VS</div>
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span>{formatMatchDate(upcomingMatch.date)}</span>
                  </div>
                  <div className="flex items-center justify-center mt-2 space-x-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span>{formatMatchTime(upcomingMatch.date)}</span>
                  </div>
                  <div className="mt-2 text-gray-600 dark:text-gray-300">
                    {upcomingMatch.venue}
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <img 
                    src={upcomingMatch.awayTeam.logo} 
                    alt={upcomingMatch.awayTeam.name}
                    className="w-20 h-20 object-contain"
                  />
                  <h3 className="text-xl font-bold mt-2">{upcomingMatch.awayTeam.name}</h3>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                {upcomingMatch.tickets && (
                  <Button className="bg-madrid-blue hover:bg-blue-700 text-white">
                    Acheter des billets
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

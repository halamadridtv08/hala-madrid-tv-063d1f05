
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Ticket, Users, Tv } from "lucide-react";

export function UpcomingMatch() {
  // Données de match enrichies avec plus de détails
  const upcomingMatch = {
    competition: "Ligue des Champions",
    round: "Demi-finale retour",
    date: "2025-05-06T20:00:00",
    homeTeam: {
      name: "Real Madrid",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png",
      form: ["W", "W", "W", "D", "W"] // 5 derniers matchs
    },
    awayTeam: {
      name: "Manchester City",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png",
      form: ["W", "W", "D", "W", "L"] // 5 derniers matchs
    },
    venue: "Santiago Bernabéu",
    capacity: 81044,
    referee: "Daniele Orsato",
    broadcast: ["Canal+", "RMC Sport"],
    tickets: true,
    ticketsFrom: "90€",
    previousResult: "2-1 (Aller)",
    weatherForecast: "18°C, Partiellement nuageux"
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

  const getFormBadgeColor = (result: string) => {
    switch(result) {
      case "W": return "bg-green-500";
      case "L": return "bg-red-500";
      case "D": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getFormLabel = (result: string) => {
    switch(result) {
      case "W": return "V";
      case "L": return "D";
      case "D": return "N";
      default: return result;
    }
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
                  <div className="flex gap-1 mt-2">
                    {upcomingMatch.homeTeam.form.map((result, index) => (
                      <span 
                        key={index} 
                        className={`${getFormBadgeColor(result)} text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold`}
                      >
                        {getFormLabel(result)}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-5xl font-bold text-madrid-gold">VS</div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded mt-2 mb-3 text-sm">
                    {upcomingMatch.previousResult}
                  </div>
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span>{formatMatchDate(upcomingMatch.date)}</span>
                  </div>
                  <div className="flex items-center justify-center mt-2 space-x-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span>{formatMatchTime(upcomingMatch.date)}</span>
                  </div>
                  <div className="flex items-center justify-center mt-2 space-x-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span>{upcomingMatch.venue}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span>Capacité: {upcomingMatch.capacity.toLocaleString()} spectateurs</span>
                  </div>
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <Tv className="h-5 w-5 text-gray-500" />
                    <span>Diffusion: {upcomingMatch.broadcast.join(", ")}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <img 
                    src={upcomingMatch.awayTeam.logo} 
                    alt={upcomingMatch.awayTeam.name}
                    className="w-20 h-20 object-contain"
                  />
                  <h3 className="text-xl font-bold mt-2">{upcomingMatch.awayTeam.name}</h3>
                  <div className="flex gap-1 mt-2">
                    {upcomingMatch.awayTeam.form.map((result, index) => (
                      <span 
                        key={index} 
                        className={`${getFormBadgeColor(result)} text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold`}
                      >
                        {getFormLabel(result)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                <span className="text-sm font-medium">Arbitre: {upcomingMatch.referee} | Météo prévue: {upcomingMatch.weatherForecast}</span>
              </div>
              
              <div className="mt-8 text-center">
                {upcomingMatch.tickets && (
                  <Button className="bg-madrid-blue hover:bg-blue-700 text-white">
                    <Ticket className="mr-2 h-4 w-4" />
                    Billets à partir de {upcomingMatch.ticketsFrom}
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

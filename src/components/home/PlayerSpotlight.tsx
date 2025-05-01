
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function PlayerSpotlight() {
  // Simuler des données de joueur
  const featuredPlayer = {
    id: 1,
    name: "Kylian Mbappé",
    position: "Attaquant",
    number: 10,
    image: "https://media.gettyimages.com/id/1809515629/photo/real-madrid-cf-unveil-new-signing-kylian-mbappe-at-estadio-santiago-bernabeu-on-july-16-2024.jpg?s=2048x2048&w=gi&k=20&c=YecqQkxXHhuhfLrqKDsz-lIj-fPlMNZZnt-EvIr1L40=",
    nationality: "France",
    stats: {
      goals: 15,
      assists: 8,
      matches: 20,
      minutes: 1720
    }
  };

  return (
    <section className="py-12">
      <div className="madrid-container">
        <h2 className="section-title">Joueur en Vedette</h2>
        
        <Card className="max-w-4xl mx-auto overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-full">
                <img 
                  src={featuredPlayer.image} 
                  alt={featuredPlayer.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-bold">{featuredPlayer.name}</h3>
                    <div className="flex items-center mt-1 space-x-3">
                      <Badge className="bg-madrid-blue text-white">
                        {featuredPlayer.position}
                      </Badge>
                      <span className="text-gray-500 text-sm">
                        #{featuredPlayer.number}
                      </span>
                    </div>
                  </div>
                  <div className="bg-madrid-gold text-black rounded-full w-12 h-12 flex items-center justify-center font-bold">
                    {featuredPlayer.number}
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-gray-500">Nationalité</p>
                  <p className="font-medium">{featuredPlayer.nationality}</p>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-3xl font-bold text-madrid-blue">
                      {featuredPlayer.stats.goals}
                    </p>
                    <p className="text-sm text-gray-500">Buts</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-3xl font-bold text-madrid-blue">
                      {featuredPlayer.stats.assists}
                    </p>
                    <p className="text-sm text-gray-500">Passes décisives</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-3xl font-bold text-madrid-blue">
                      {featuredPlayer.stats.matches}
                    </p>
                    <p className="text-sm text-gray-500">Matchs joués</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-3xl font-bold text-madrid-blue">
                      {Math.floor(featuredPlayer.stats.minutes / 60)}h{featuredPlayer.stats.minutes % 60}
                    </p>
                    <p className="text-sm text-gray-500">Temps de jeu</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button asChild className="w-full bg-madrid-blue hover:bg-blue-700">
                    <Link to={`/players/${featuredPlayer.id}`}>
                      Voir le profil complet
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

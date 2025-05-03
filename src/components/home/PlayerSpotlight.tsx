
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Flag, CalendarDays, Ruler, Award, Timer, Users, Shield, Star } from "lucide-react";
import playersData from "@/data/playerData";

export function PlayerSpotlight() {
  // Utilisons Mbappé (ID 26) comme joueur en vedette, puisque nous avons ses données complètes
  const playerId = "26";
  const featuredPlayer = playersData[playerId];

  if (!featuredPlayer) {
    return null;
  }

  const formattedBirthDate = new Date(featuredPlayer.birthDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });

  const getPositionIcon = (pos: string) => {
    if (pos.includes("Gardien")) return <Star className="h-5 w-5 text-madrid-blue" />;
    if (pos.includes("Défenseur")) return <Shield className="h-5 w-5 text-madrid-blue" />;
    if (pos.includes("Milieu")) return <Award className="h-5 w-5 text-madrid-blue" />;
    return <Flag className="h-5 w-5 text-madrid-blue" />;
  };

  return (
    <section className="py-12">
      <div className="madrid-container">
        <h2 className="section-title">Joueur en Vedette</h2>
        
        <Card className="max-w-4xl mx-auto overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-full relative">
                <img 
                  src={featuredPlayer.image} 
                  alt={featuredPlayer.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4">
                  <div className="text-white">
                    <h3 className="text-3xl font-bold">{featuredPlayer.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-madrid-gold text-black flex items-center gap-1">
                        {getPositionIcon(featuredPlayer.position)}
                        {featuredPlayer.position}
                      </Badge>
                      <div className="bg-madrid-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {featuredPlayer.number}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Flag className="h-5 w-5 text-madrid-blue" />
                    <div>
                      <p className="text-sm text-gray-500">Nationalité</p>
                      <p className="font-medium">{featuredPlayer.nationality}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-madrid-blue" />
                    <div>
                      <p className="text-sm text-gray-500">Date de naissance</p>
                      <p className="font-medium">{formattedBirthDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Ruler className="h-5 w-5 text-madrid-blue" />
                    <div>
                      <p className="text-sm text-gray-500">Taille / Poids</p>
                      <p className="font-medium">{featuredPlayer.height} / {featuredPlayer.weight}</p>
                    </div>
                  </div>
                  
                  {featuredPlayer.secondaryPosition && (
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-madrid-blue" />
                      <div>
                        <p className="text-sm text-gray-500">Poste secondaire</p>
                        <p className="font-medium">{featuredPlayer.secondaryPosition}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Biographie</p>
                    <p className="mt-1 text-sm line-clamp-4">{featuredPlayer.bio}</p>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-3 gap-3">
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
                    <p className="text-sm text-gray-500">Matchs</p>
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

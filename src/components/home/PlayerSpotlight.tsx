
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Flag, CalendarDays, Ruler, Award, Timer, Users } from "lucide-react";

export function PlayerSpotlight() {
  // Données de joueur enrichies avec plus de détails
  const featuredPlayer = {
    id: 1,
    name: "Kylian Mbappé",
    position: "Attaquant",
    number: 10,
    image: "https://media.gettyimages.com/id/1809515629/photo/real-madrid-cf-unveil-new-signing-kylian-mbappe-at-estadio-santiago-bernabeu-on-july-16-2024.jpg?s=2048x2048&w=gi&k=20&c=YecqQkxXHhuhfLrqKDsz-lIj-fPlMNZZnt-EvIr1L40=",
    nationality: "France",
    nationalityFlag: "https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg",
    birthDate: "20/12/1998",
    height: "178 cm",
    weight: "73 kg",
    preferredFoot: "Droit",
    joinedDate: "Juillet 2025",
    previousClub: "Paris Saint-Germain",
    achievements: ["Champion du Monde 2018", "Meilleur buteur Ligue 1 (5×)", "Finaliste Ligue des Champions 2020"],
    stats: {
      goals: 15,
      assists: 8,
      matches: 20,
      minutes: 1720,
      yellowCards: 2,
      redCards: 0,
      passingAccuracy: "89%",
      shotsOnTarget: 28,
      dribbleSuccess: "76%"
    }
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
                      <Badge className="bg-madrid-gold text-black">
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
                      <div className="flex items-center gap-2">
                        <img src={featuredPlayer.nationalityFlag} alt={featuredPlayer.nationality} className="w-5 h-4" />
                        <p className="font-medium">{featuredPlayer.nationality}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-madrid-blue" />
                    <div>
                      <p className="text-sm text-gray-500">Date de naissance</p>
                      <p className="font-medium">{featuredPlayer.birthDate} (26 ans)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Ruler className="h-5 w-5 text-madrid-blue" />
                    <div>
                      <p className="text-sm text-gray-500">Taille / Poids</p>
                      <p className="font-medium">{featuredPlayer.height} / {featuredPlayer.weight}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-madrid-blue" />
                    <div>
                      <p className="text-sm text-gray-500">Ancien club</p>
                      <p className="font-medium">{featuredPlayer.previousClub}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Palmarès</p>
                    <ul className="list-disc list-inside mt-1">
                      {featuredPlayer.achievements.map((achievement, index) => (
                        <li key={index} className="text-sm">{achievement}</li>
                      ))}
                    </ul>
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
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-madrid-blue">
                      {featuredPlayer.stats.passingAccuracy}
                    </p>
                    <p className="text-sm text-gray-500">Précision passes</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-madrid-blue">
                      {featuredPlayer.stats.shotsOnTarget}
                    </p>
                    <p className="text-sm text-gray-500">Tirs cadrés</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-madrid-blue">
                      {featuredPlayer.stats.dribbleSuccess}
                    </p>
                    <p className="text-sm text-gray-500">Dribbles réussis</p>
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

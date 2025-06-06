
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Flag, CalendarDays, Ruler, Award, Timer, Users, Shield, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/Player";

export function PlayerSpotlight() {
  const [featuredPlayer, setFeaturedPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPlayer = async () => {
      try {
        // Fetch a featured player (you can modify this logic to select specific players)
        const { data: playersData, error } = await supabase
          .from('players')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching featured player:', error);
        } else if (playersData && playersData.length > 0) {
          setFeaturedPlayer(playersData[0]);
        }
      } catch (error) {
        console.error('Error fetching featured player:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPlayer();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="madrid-container">
          <h2 className="section-title">Joueur en Vedette</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-madrid-blue"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredPlayer) {
    return null;
  }

  const getPositionIcon = (pos: string) => {
    if (pos.includes("Gardien")) return <Star className="h-5 w-5 text-madrid-blue" />;
    if (pos.includes("Défenseur")) return <Shield className="h-5 w-5 text-madrid-blue" />;
    if (pos.includes("Milieu")) return <Award className="h-5 w-5 text-madrid-blue" />;
    return <Flag className="h-5 w-5 text-madrid-blue" />;
  };

  const playerStats = featuredPlayer.stats || {};

  return (
    <section className="py-12">
      <div className="madrid-container">
        <h2 className="section-title">Joueur en Vedette</h2>
        
        <Card className="max-w-4xl mx-auto overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-full relative">
                <img 
                  src={featuredPlayer.image_url || `https://placehold.co/400x600/1a365d/ffffff/?text=${featuredPlayer.name.charAt(0)}`} 
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
                        {featuredPlayer.jersey_number || 0}
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
                      <p className="font-medium">{featuredPlayer.nationality || "Non renseigné"}</p>
                    </div>
                  </div>
                  
                  {featuredPlayer.age && (
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-madrid-blue" />
                      <div>
                        <p className="text-sm text-gray-500">Âge</p>
                        <p className="font-medium">{featuredPlayer.age} ans</p>
                      </div>
                    </div>
                  )}
                  
                  {(featuredPlayer.height || featuredPlayer.weight) && (
                    <div className="flex items-center gap-3">
                      <Ruler className="h-5 w-5 text-madrid-blue" />
                      <div>
                        <p className="text-sm text-gray-500">Taille / Poids</p>
                        <p className="font-medium">
                          {featuredPlayer.height || "N/A"} / {featuredPlayer.weight || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {playerStats.secondaryPosition && (
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-madrid-blue" />
                      <div>
                        <p className="text-sm text-gray-500">Poste secondaire</p>
                        <p className="font-medium">{playerStats.secondaryPosition}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Biographie</p>
                    <p className="mt-1 text-sm line-clamp-4">
                      {featuredPlayer.bio || featuredPlayer.biography || "Biographie non disponible"}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {featuredPlayer.position.includes("Gardien") ? (
                    <>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                        <p className="text-3xl font-bold text-madrid-blue">
                          {playerStats.cleanSheets || 0}
                        </p>
                        <p className="text-sm text-gray-500">Clean Sheets</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                        <p className="text-3xl font-bold text-madrid-blue">
                          {playerStats.goalsConceded || 0}
                        </p>
                        <p className="text-sm text-gray-500">Buts encaissés</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                        <p className="text-3xl font-bold text-madrid-blue">
                          {playerStats.goals || 0}
                        </p>
                        <p className="text-sm text-gray-500">Buts</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                        <p className="text-3xl font-bold text-madrid-blue">
                          {playerStats.assists || 0}
                        </p>
                        <p className="text-sm text-gray-500">Passes décisives</p>
                      </div>
                    </>
                  )}
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-3xl font-bold text-madrid-blue">
                      {playerStats.matches || 0}
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

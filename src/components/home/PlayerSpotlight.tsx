import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, Users, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/Player";
import { useNavigate } from "react-router-dom";

// Type helper pour les stats du joueur
interface PlayerStats {
  goals?: number;
  matches?: number;
  assists?: number;
  minutesPlayed?: number;
  isFeatured?: boolean;
  [key: string]: any;
}

export function PlayerSpotlight() {
  const navigate = useNavigate();
  const [featuredPlayer, setFeaturedPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPlayer();
    
    // Écouter les changements en temps réel
    const channel = supabase
      .channel('featured-player-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players'
        },
        (payload) => {
          console.log('Changement détecté dans les joueurs:', payload);
          // Recharger le joueur en vedette si nécessaire
          fetchFeaturedPlayer();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFeaturedPlayer = async () => {
    try {
      // Chercher le joueur marqué comme featured dans ses stats
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('is_active', true)
        .not('stats', 'is', null);

      if (error) throw error;

      // Trouver le joueur avec isFeatured = true
      const featured = data?.find(player => {
        const stats = player.stats as PlayerStats;
        return stats && stats.isFeatured === true;
      });

      if (featured) {
        setFeaturedPlayer(featured);
      } else {
        // Fallback vers le premier joueur actif si aucun n'est marqué comme featured
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('players')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (fallbackError) {
          console.error('Erreur fallback:', fallbackError);
          // Utiliser des données par défaut
          setFeaturedPlayer({
            id: "1",
            name: "Kylian Mbappé",
            position: "Ailier/Attaquant",
            jersey_number: 9,
            nationality: "Française",
            image_url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=600&fit=crop",
            stats: {
              goals: 8,
              matches: 15,
              assists: 2,
              minutesPlayed: 1350
            },
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } else {
          setFeaturedPlayer(fallbackData);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du joueur en vedette:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeasonStats = (player: Player) => {
    const stats = player.stats as PlayerStats;
    if (!stats) return { goals: 0, matches: 0, assists: 0, minutesPlayed: 0 };
    
    return {
      goals: stats.goals || 0,
      matches: stats.matches || 0,
      assists: stats.assists || 0,
      minutesPlayed: stats.minutesPlayed || 0
    };
  };

  if (loading) {
    return (
      <section className="py-12">
        <div className="madrid-container">
          <h2 className="section-title">Joueur en Vedette</h2>
          <div className="text-center py-8">Chargement...</div>
        </div>
      </section>
    );
  }

  if (!featuredPlayer) {
    return (
      <section className="py-12">
        <div className="madrid-container">
          <h2 className="section-title">Joueur en Vedette</h2>
          <div className="text-center py-8 text-gray-500">
            Aucun joueur en vedette pour le moment.
          </div>
        </div>
      </section>
    );
  }

  const stats = getSeasonStats(featuredPlayer);

  return (
    <section className="py-12">
      <div className="madrid-container">
        <h2 className="section-title">Joueur en Vedette</h2>
        
        <Card className="max-w-4xl mx-auto overflow-hidden bg-gradient-to-r from-madrid-blue to-blue-800">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image Section */}
              <div className="relative">
                <img
                  src={featuredPlayer.image_url || `https://placehold.co/400x600/1a365d/ffffff/?text=${featuredPlayer.name.charAt(0)}`}
                  alt={featuredPlayer.name}
                  className="w-full h-96 md:h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-madrid-gold text-black text-lg px-3 py-1">
                    #{featuredPlayer.jersey_number}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90 text-madrid-blue">
                    <Star className="h-4 w-4 mr-1" />
                    Vedette
                  </Badge>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-8 text-white">
                <h3 className="text-3xl font-bold mb-2">{featuredPlayer.name}</h3>
                <p className="text-xl text-blue-200 mb-1">{featuredPlayer.position}</p>
                <p className="text-blue-300 mb-6">{featuredPlayer.nationality}</p>
                
                {/* Season Stats */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Saison 2024/25
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/10 rounded-lg">
                      <div className="text-2xl font-bold text-madrid-gold">{stats.goals}</div>
                      <div className="text-sm">Buts</div>
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-lg">
                      <div className="text-2xl font-bold text-madrid-gold">{stats.assists}</div>
                      <div className="text-sm">Passes D.</div>
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-lg">
                      <div className="text-2xl font-bold text-madrid-gold">{stats.matches}</div>
                      <div className="text-sm">Matchs</div>
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-lg">
                      <div className="text-2xl font-bold text-madrid-gold">{Math.round(stats.minutesPlayed / 60)}</div>
                      <div className="text-sm">Heures</div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => navigate(`/players/${featuredPlayer.id}`)}
                    className="bg-madrid-gold hover:bg-yellow-500 text-black font-semibold"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Voir le Profil
                  </Button>
                  <Button 
                    onClick={() => navigate('/players')}
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-madrid-blue"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Tout l'Effectif
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

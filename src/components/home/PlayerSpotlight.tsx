import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Trophy, TrendingUp, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/Player";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/optimized-image";
export function PlayerSpotlight() {
  const [featuredPlayers, setFeaturedPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    fetchFeaturedPlayers();
  }, []);

  // Suivre l'index actuel du carousel
  useEffect(() => {
    if (!api) return;
    
    api.on('select', () => {
      setCurrentIndex(api.selectedScrollSnap());
      setProgress(0);
    });
  }, [api]);

  // Auto-play avec barre de progression
  useEffect(() => {
    if (!api || featuredPlayers.length <= 1) return;
    
    const DURATION = 7000; // 7 secondes
    const INTERVAL = 50; // Mise à jour toutes les 50ms
    let elapsed = 0;

    const progressInterval = setInterval(() => {
      elapsed += INTERVAL;
      const currentProgress = (elapsed / DURATION) * 100;
      setProgress(currentProgress);

      if (elapsed >= DURATION) {
        api.scrollNext();
        elapsed = 0;
        setProgress(0);
      }
    }, INTERVAL);

    return () => clearInterval(progressInterval);
  }, [api, featuredPlayers.length]);
  const fetchFeaturedPlayers = async () => {
    try {
      // Récupérer tous les joueurs marqués comme vedettes
      const {
        data: playersData,
        error: playersError
      } = await supabase.from('players').select('*').eq('is_featured', true).eq('is_active', true).order('name', {
        ascending: true
      });
      if (playersError) {
        console.error('Error fetching featured players:', playersError);
        return;
      }
      if (!playersData || playersData.length === 0) {
        setFeaturedPlayers([]);
        return;
      }

      // Pour chaque joueur, récupérer ses stats réelles
      const playersWithStats = await Promise.all(playersData.map(async player => {
        const {
          data: statsData
        } = await supabase.from('player_stats').select('goals, assists, minutes_played, match_id').eq('player_id', player.id);

        // Calculer les stats totales
        const totalStats = {
          goals: statsData?.reduce((sum, stat) => sum + (stat.goals || 0), 0) || 0,
          assists: statsData?.reduce((sum, stat) => sum + (stat.assists || 0), 0) || 0,
          matches: statsData?.filter(stat => stat.match_id).length || 0,
          minutesPlayed: statsData?.reduce((sum, stat) => sum + (stat.minutes_played || 0), 0) || 0
        };
        return {
          ...player,
          stats: totalStats
        };
      }));
      setFeaturedPlayers(playersWithStats);
    } catch (error) {
      console.error('Error fetching featured players:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <section className="py-12 bg-gradient-to-br from-madrid-blue to-blue-900 dark:from-gray-900 dark:to-gray-800">
        <div className="madrid-container">
          <h2 className="section-title text-white mb-8">Joueur en Vedette</h2>
          <Skeleton className="h-[500px] w-full" />
        </div>
      </section>;
  }
  if (featuredPlayers.length === 0) {
    return null;
  }
  const renderPlayerCard = (player: Player) => <div className="grid md:grid-cols-2 gap-0">
      {/* Player Image */}
      <div className="relative h-[500px] bg-gradient-to-br from-blue-600 to-blue-800 dark:from-gray-700 dark:to-gray-900">
        <OptimizedImage src={player.image_url || "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=600&fit=crop"} alt={player.name} size="medium" className="w-full h-full object-cover object-top" />
        <div className="absolute top-4 left-4 bg-madrid-gold text-black px-4 py-2 rounded-full font-bold text-lg">
          #{player.jersey_number || "10"}
        </div>
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/30">
          <Star className="h-4 w-4 text-madrid-gold fill-madrid-gold" />
          <span className="text-sm font-medium">Vedette</span>
        </div>
      </div>

      {/* Player Info */}
      <div className="p-8 flex flex-col justify-between text-white bg-gradient-to-br from-madrid-blue/95 to-blue-900/95 dark:from-gray-800/95 dark:to-gray-900/95">
        <div>
          <h3 className="text-4xl font-bold mb-2">{player.name}</h3>
          <p className="text-xl text-blue-200 dark:text-blue-300 mb-2">{player.position}</p>
          <p className="text-lg text-blue-300 dark:text-blue-400">{player.nationality}</p>

          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-madrid-gold" />
              <h4 className="text-xl font-semibold">Saison 2025/26</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold text-madrid-gold">{player.stats?.goals || 0}</div>
                <div className="text-sm text-blue-200 dark:text-blue-300">Buts</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold text-madrid-gold">{player.stats?.assists || 0}</div>
                <div className="text-sm text-blue-200 dark:text-blue-300">Passes D.</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold text-madrid-gold">{player.stats?.matches || 0}</div>
                <div className="text-sm text-blue-200 dark:text-blue-300">Matchs</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold text-madrid-gold">{Math.round((player.stats?.minutesPlayed || 0) / 60)}</div>
                <div className="text-sm text-blue-200 dark:text-blue-300">Heures</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button asChild className="flex-1 bg-madrid-gold text-black hover:bg-yellow-400">
            <Link to={`/players/${player.id}`}>
              <Trophy className="mr-2 h-4 w-4" />
              Voir le Profil
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10">
            <Link to="/players">
              Tout l'Effectif
            </Link>
          </Button>
        </div>
      </div>
    </div>;
  return <section className="py-12 bg-gradient-to-br from-madrid-blue to-blue-900 dark:from-gray-900 dark:to-gray-800">
      <div className="madrid-container">
        <h2 className="section-title text-white mb-8">
          {featuredPlayers.length > 1 ? "Joueurs en Vedette" : "Joueur en Vedette"}
        </h2>
        
        {featuredPlayers.length === 1 ? <Card className="overflow-hidden bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-0">
              {renderPlayerCard(featuredPlayers[0])}
            </CardContent>
          </Card> : <div className="relative">
            <Carousel setApi={setApi} className="w-full" opts={{
          loop: true
        }}>
              <CarouselContent>
                {featuredPlayers.map((player, index) => <CarouselItem key={player.id}>
                    <AnimatePresence mode="wait">
                      {currentIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                          <Card className="overflow-hidden bg-white/10 backdrop-blur border-white/20">
                            <CardContent className="p-0">
                              {renderPlayerCard(player)}
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CarouselItem>)}
              </CarouselContent>
              <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                <CarouselPrevious className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 border-white/30 text-white -translate-y-0 static" />
                <CarouselNext className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 border-white/30 text-white -translate-y-0 static" />
              </div>
            </Carousel>
            
            {/* Barre de progression */}
            <div className="mt-4 w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-madrid-gold"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: "linear" }}
              />
            </div>
            
            {/* Indicator dots */}
            {featuredPlayers.length > 1 && <div className="flex justify-center gap-2 mt-4">
                {featuredPlayers.map((_, index) => <button key={index} onClick={() => {
                    api?.scrollTo(index);
                    setProgress(0);
                  }} className="w-2 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors" aria-label={`Aller au joueur ${index + 1}`} />)}
              </div>}
          </div>}
      </div>
    </section>;
}
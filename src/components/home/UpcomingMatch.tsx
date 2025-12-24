import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/Match";
import { MatchNotifications } from "@/components/notifications/MatchNotifications";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function UpcomingMatch() {
  const navigate = useNavigate();
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchUpcomingMatch();
  }, []);

  useEffect(() => {
    if (!upcomingMatch) return;

    const calculateTimeLeft = () => {
      const matchDate = new Date(upcomingMatch.match_date);
      const now = new Date();
      const difference = matchDate.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        // Le match a commencé ou est passé
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [upcomingMatch]);

  const fetchUpcomingMatch = async () => {
    try {
      const now = new Date().toISOString();
      
      // D'abord chercher un match avec status 'upcoming' ou 'live' dans le futur
      let { data, error } = await supabase
        .from('matches')
        .select('*')
        .in('status', ['upcoming', 'live'])
        .gte('match_date', now)
        .order('match_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Si aucun match trouvé, chercher le prochain match peu importe le status
      if (!data) {
        const { data: nextMatch, error: nextError } = await supabase
          .from('matches')
          .select('*')
          .gte('match_date', now)
          .order('match_date', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (nextError && nextError.code !== 'PGRST116') {
          throw nextError;
        }
        
        data = nextMatch;
      }

      setUpcomingMatch(data || null);
    } catch (error) {
      console.error('Erreur lors du chargement du prochain match:', error);
    } finally {
      setLoading(false);
    }
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    }
  };

  const countdownVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.6,
        type: "spring",
        stiffness: 120
      }
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="madrid-container">
          <h2 className="section-title">Prochain Match</h2>
          <div className="text-center py-8">Chargement...</div>
        </div>
      </section>
    );
  }

  if (!upcomingMatch) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="madrid-container">
          <h2 className="section-title">Prochain Match</h2>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Aucun match programmé pour le moment.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="madrid-container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Prochain Match
        </motion.h2>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Card className="max-w-4xl mx-auto overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <motion.div 
                className="bg-gradient-to-r from-madrid-blue to-blue-800 p-4"
                variants={itemVariants}
              >
                <div className="flex justify-between items-center text-white">
                  <Badge variant="secondary" className="bg-madrid-gold text-black">
                    {upcomingMatch.competition || 'Match amical'}
                  </Badge>
                  <span>{upcomingMatch.status === 'upcoming' ? 'À venir' : upcomingMatch.status}</span>
                </div>
              </motion.div>
              
              <div className="p-6 md:p-8">
                {/* Compte à rebours */}
                <motion.div 
                  className="mb-8"
                  variants={countdownVariants}
                >
                  <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto">
                    {[
                      { label: 'Jours', value: timeLeft.days },
                      { label: 'Heures', value: timeLeft.hours },
                      { label: 'Minutes', value: timeLeft.minutes },
                      { label: 'Secondes', value: timeLeft.seconds },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        className="bg-gradient-to-br from-madrid-blue to-blue-800 rounded-lg p-3 sm:p-4 text-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div 
                          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-madrid-gold"
                          key={item.value}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {String(item.value).padStart(2, '0')}
                        </motion.div>
                        <div className="text-xs sm:text-sm text-white/80 mt-1">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                  {/* Les deux équipes alignées horizontalement sur la même ligne */}
                  <motion.div 
                    className="flex items-center gap-3 sm:gap-6 justify-center flex-nowrap"
                    variants={itemVariants}
                  >
                    {/* Équipe 1 - Logo à gauche du nom */}
                    <motion.div 
                      className="flex items-center gap-2"
                      variants={scaleVariants}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center overflow-hidden bg-white flex-shrink-0">
                        {upcomingMatch.home_team_logo ? (
                          <img 
                            src={upcomingMatch.home_team_logo} 
                            alt={`Logo ${upcomingMatch.home_team}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-madrid-blue rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-xl">
                            {upcomingMatch.home_team.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold whitespace-nowrap">{upcomingMatch.home_team}</h3>
                    </motion.div>
                    
                    {/* VS */}
                    <motion.div 
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold text-madrid-gold flex-shrink-0"
                      variants={scaleVariants}
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      VS
                    </motion.div>
                    
                    {/* Équipe 2 - Nom à gauche du logo */}
                    <motion.div 
                      className="flex items-center gap-2"
                      variants={scaleVariants}
                      whileHover={{ scale: 1.05 }}
                    >
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold whitespace-nowrap">{upcomingMatch.away_team}</h3>
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center overflow-hidden bg-white flex-shrink-0">
                        {upcomingMatch.away_team_logo ? (
                          <img 
                            src={upcomingMatch.away_team_logo} 
                            alt={`Logo ${upcomingMatch.away_team}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-xl">
                            {upcomingMatch.away_team.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  {/* Informations date/heure/lieu */}
                  <motion.div 
                    className="text-center lg:text-right"
                    variants={itemVariants}
                  >
                    <div className="flex items-center justify-center lg:justify-end space-x-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{formatMatchDate(upcomingMatch.match_date)}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-end mt-2 space-x-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <span className="text-2xl font-bold">{formatMatchTime(upcomingMatch.match_date)}</span>
                    </div>
                    {upcomingMatch.venue && (
                      <div className="flex items-center justify-center lg:justify-end mt-2 space-x-2">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <span className="text-sm">{upcomingMatch.venue}</span>
                      </div>
                    )}
                  </motion.div>
                </div>
                
                <motion.div 
                  className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
                  variants={itemVariants}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      className="bg-madrid-blue hover:bg-blue-700 text-white"
                      onClick={() => navigate('/matches')}
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      Voir les détails du match
                    </Button>
                  </motion.div>
                  <MatchNotifications />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

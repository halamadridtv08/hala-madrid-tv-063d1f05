
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Ticket, Users, Tv } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/Match";

export function UpcomingMatch() {
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingMatch();
  }, []);

  const fetchUpcomingMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'upcoming')
        .gte('match_date', new Date().toISOString())
        .order('match_date', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
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
        <h2 className="section-title">Prochain Match</h2>
        
        <Card className="max-w-4xl mx-auto overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-madrid-blue to-blue-800 p-4">
              <div className="flex justify-between items-center text-white">
                <Badge variant="secondary" className="bg-madrid-gold text-black">
                  {upcomingMatch.competition || 'Match amical'}
                </Badge>
                <span>{upcomingMatch.status === 'upcoming' ? 'À venir' : upcomingMatch.status}</span>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                {/* Équipes côte à côte sur grands écrans */}
                <div className="flex flex-col sm:flex-row items-end gap-4 sm:gap-8">
                  <div className="flex flex-col items-center min-h-[120px] justify-end">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center overflow-hidden bg-white mb-2">
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
                        <div className="w-full h-full bg-madrid-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {upcomingMatch.home_team.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-center">{upcomingMatch.home_team}</h3>
                  </div>
                  
                  <div className="text-4xl lg:text-5xl font-bold text-madrid-gold pb-2">VS</div>
                  
                  <div className="flex flex-col items-center min-h-[120px] justify-end">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center overflow-hidden bg-white mb-2">
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
                        <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {upcomingMatch.away_team.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-center">{upcomingMatch.away_team}</h3>
                  </div>
                </div>
                
                {/* Informations date/heure/lieu */}
                <div className="text-center lg:text-right">
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
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Button className="bg-madrid-blue hover:bg-blue-700 text-white">
                  <Ticket className="mr-2 h-4 w-4" />
                  Voir les détails du match
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

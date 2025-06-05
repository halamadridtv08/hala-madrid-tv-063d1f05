
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
              <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-madrid-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {upcomingMatch.home_team.slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold mt-2">{upcomingMatch.home_team}</h3>
                </div>
                
                <div className="text-center">
                  <div className="text-5xl font-bold text-madrid-gold">VS</div>
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span>{formatMatchDate(upcomingMatch.match_date)}</span>
                  </div>
                  <div className="flex items-center justify-center mt-2 space-x-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span>{formatMatchTime(upcomingMatch.match_date)}</span>
                  </div>
                  {upcomingMatch.venue && (
                    <div className="flex items-center justify-center mt-2 space-x-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span>{upcomingMatch.venue}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {upcomingMatch.away_team.slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold mt-2">{upcomingMatch.away_team}</h3>
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

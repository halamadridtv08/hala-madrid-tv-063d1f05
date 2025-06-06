
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/Match";
import { toast } from "sonner";

const Calendar = () => {
  const [date, setDate] = useState(new Date());
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des matchs:', error);
      toast.error("Erreur lors du chargement des matchs");
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

  // Filtrer les matchs pour le mois actuel
  const currentMonthMatches = matches.filter(match => 
    new Date(match.match_date).getMonth() === date.getMonth() && 
    new Date(match.match_date).getFullYear() === date.getFullYear()
  );

  // Jours spéciaux avec des matchs pour le calendrier
  const matchDays = matches.map(match => new Date(match.match_date));

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "La Liga": return "bg-green-600";
      case "Ligue des Champions": return "bg-blue-600";
      case "Copa del Rey": return "bg-purple-600";
      default: return "bg-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'À venir';
      case 'live': return 'En cours';
      case 'finished': return 'Terminé';
      case 'postponed': return 'Reporté';
      default: return status;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main>
          <div className="madrid-container py-8">
            <h1 className="section-title mb-8">Calendrier des Matchs</h1>
            <div className="text-center py-8">
              Chargement des matchs...
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          <h1 className="section-title mb-8">Calendrier des Matchs</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card className="p-4 transform transition-all hover:scale-105 hover:shadow-xl">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  modifiers={{
                    matchDay: matchDays
                  }}
                  modifiersStyles={{
                    matchDay: {
                      fontWeight: 'bold',
                      color: '#FEBE10',
                      backgroundColor: '#00529F20'
                    }
                  }}
                />
                <div className="mt-4">
                  <h3 className="text-lg font-bold">Prochains matchs</h3>
                  <div className="space-y-2 mt-2">
                    {matches
                      .filter(match => new Date(match.match_date) > new Date())
                      .slice(0, 3)
                      .map((match) => (
                        <div key={match.id} className="flex items-center text-sm p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                          <span className="w-2 h-2 bg-madrid-gold rounded-full mr-2"></span>
                          <span>
                            {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(match.match_date))} - {match.away_team}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Matchs à venir</h2>
              
              {currentMonthMatches.length > 0 ? (
                <div className="space-y-4">
                  {currentMonthMatches.map((match) => (
                    <Card key={match.id} className="overflow-hidden transform transition-all hover:scale-102 hover:shadow-lg">
                      <CardContent className="p-0">
                        <div className="bg-gradient-to-r from-madrid-blue to-blue-800 p-4">
                          <div className="flex justify-between items-center text-white">
                            <Badge className={`${getCompetitionColor(match.competition || '')} text-white`}>
                              {match.competition || 'Match amical'}
                            </Badge>
                            <span>{getStatusLabel(match.status)}</span>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div className="flex flex-col items-center transform transition-transform hover:scale-110">
                              <div className="w-12 h-12 bg-madrid-blue rounded-full flex items-center justify-center text-white font-bold">
                                {match.home_team.slice(0, 2).toUpperCase()}
                              </div>
                              <h3 className="text-lg font-bold mt-2">{match.home_team}</h3>
                              {match.status === 'finished' && (
                                <span className="text-xl font-bold text-madrid-gold">
                                  {match.home_score}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-center">
                              <div className="text-3xl font-bold">
                                {match.status === 'finished' ? '-' : 'VS'}
                              </div>
                              <div className="flex items-center justify-center mt-2 space-x-2">
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{formatMatchDate(match.match_date)}</span>
                              </div>
                              <div className="flex items-center justify-center mt-1 space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{formatMatchTime(match.match_date)}</span>
                              </div>
                              {match.venue && (
                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                  {match.venue}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-center transform transition-transform hover:scale-110">
                              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                                {match.away_team.slice(0, 2).toUpperCase()}
                              </div>
                              <h3 className="text-lg font-bold mt-2">{match.away_team}</h3>
                              {match.status === 'finished' && (
                                <span className="text-xl font-bold text-madrid-gold">
                                  {match.away_score}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-gray-500">Aucun match programmé pour ce mois.</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Calendar;


import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, MapPin, ArrowLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/Match";
import { useNavigate } from "react-router-dom";

const CalendarPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });

      if (error) {
        console.error('Error fetching matches:', error);
      } else {
        setMatches(data || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter matches for selected date
  const matchesForSelectedDate = matches.filter(match => {
    if (!selectedDate) return false;
    const matchDate = new Date(match.match_date);
    return matchDate.toDateString() === selectedDate.toDateString();
  });

  // Get next upcoming match
  const nextMatch = matches.find(match => {
    const matchDate = new Date(match.match_date);
    return matchDate > new Date() && (match.status === 'upcoming' || match.status === 'live');
  });

  // Get matches for current month
  const monthMatches = matches.filter(match => {
    const matchDate = new Date(match.match_date);
    return matchDate.getMonth() === currentMonth.getMonth() && 
           matchDate.getFullYear() === currentMonth.getFullYear();
  });

  // Get dates that have matches for calendar highlighting
  const matchDates = matches.map(match => new Date(match.match_date));

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="secondary">À venir</Badge>;
      case 'live':
        return <Badge variant="destructive">En cours</Badge>;
      case 'finished':
        return <Badge variant="default">Terminé</Badge>;
      case 'postponed':
        return <Badge variant="outline">Reporté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="madrid-container py-8 overflow-x-hidden">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-madrid-blue"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
        <div className="madrid-container py-4 sm:py-8">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Calendrier des Matchs
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Consultez tous les matchs du Real Madrid
            </p>
          </div>

          {/* Section Prochain Match */}
          {nextMatch && (
            <div className="mb-6 sm:mb-8">
              <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Prochain Match</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-4 justify-center flex-wrap sm:flex-nowrap w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        {nextMatch.home_team_logo && (
                          <img 
                            src={nextMatch.home_team_logo} 
                            alt={nextMatch.home_team}
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <span className="font-semibold text-sm sm:text-base whitespace-nowrap">{nextMatch.home_team}</span>
                      </div>
                      <span className="text-xl sm:text-2xl font-bold flex-shrink-0">VS</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm sm:text-base whitespace-nowrap">{nextMatch.away_team}</span>
                        {nextMatch.away_team_logo && (
                          <img 
                            src={nextMatch.away_team_logo} 
                            alt={nextMatch.away_team}
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="text-center w-full sm:w-auto">
                      <div className="text-sm sm:text-base font-semibold">
                        {new Date(nextMatch.match_date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </div>
                      <div className="text-lg sm:text-xl font-bold">{formatTime(nextMatch.match_date)}</div>
                      {nextMatch.venue && (
                        <div className="text-xs sm:text-sm opacity-90 mt-1">{nextMatch.venue}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Calendrier */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    Sélectionner une date
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    modifiers={{
                      hasMatch: matchDates
                    }}
                    modifiersStyles={{
                      hasMatch: { 
                        backgroundColor: '#1a365d', 
                        color: 'white',
                        fontWeight: 'bold'
                      }
                    }}
                    className="rounded-md border w-full pointer-events-auto"
                  />
                  <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                    <p>• Les dates en bleu indiquent des matchs programmés</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Liste des matchs de la date sélectionnée */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">
                    {selectedDate ? (
                      `Matchs du ${selectedDate.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}`
                    ) : (
                      `Matchs du mois de ${currentMonth.toLocaleDateString('fr-FR', {
                        month: 'long',
                        year: 'numeric'
                      })}`
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(selectedDate ? matchesForSelectedDate : monthMatches).length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {(selectedDate ? matchesForSelectedDate : monthMatches).map((match) => (
                        <div key={match.id} className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <div className="flex flex-col items-start gap-2 w-full sm:w-auto">
                              <div className="flex items-center gap-2">
                                {match.home_team_logo && (
                                  <img 
                                    src={match.home_team_logo} 
                                    alt={match.home_team}
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                                <span className="font-semibold text-sm">{match.home_team}</span>
                              </div>
                              <span className="text-gray-500 text-xs">vs</span>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">{match.away_team}</span>
                                {match.away_team_logo && (
                                  <img 
                                    src={match.away_team_logo} 
                                    alt={match.away_team}
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                            {getStatusBadge(match.status)}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              {new Date(match.match_date).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              {formatTime(match.match_date)}
                            </div>
                            {match.venue && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="truncate max-w-[150px] sm:max-w-none">{match.venue}</span>
                              </div>
                            )}
                            {match.competition && (
                              <Badge variant="outline" className="text-xs">{match.competition}</Badge>
                            )}
                          </div>

                          {match.status === 'finished' && (
                            <div className="mt-2 text-base sm:text-lg font-bold">
                              Score: {match.home_score} - {match.away_score}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-gray-500">
                      <CalendarIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
                      <p className="text-sm sm:text-base">
                        {selectedDate 
                          ? "Aucun match programmé pour cette date" 
                          : "Aucun match programmé pour ce mois"
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CalendarPage;

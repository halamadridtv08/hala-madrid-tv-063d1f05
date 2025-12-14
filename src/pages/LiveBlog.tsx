import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInMinutes } from 'date-fns';
import { fr, es, enUS } from 'date-fns/locale';
import { Radio, Goal, AlertTriangle, Clock, MessageSquare, Zap, ArrowLeft, MapPin, Users, Flag, RefreshCw, CircleDot, Play, Pause, Square } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveBlog, LiveBlogEntry } from '@/hooks/useLiveBlog';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Match } from '@/types/Match';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/SEOHead';

const translations = {
  fr: {
    liveBlog: "Live Blog",
    back: "Retour",
    live: "EN DIRECT",
    finished: "Terminé",
    upcoming: "À venir",
    noEvents: "Aucun événement pour le moment",
    waitingForUpdates: "En attente des mises à jour...",
    matchNotFound: "Match introuvable",
    minute: "min",
    halftime: "Mi-temps",
    fulltime: "Fin du match",
    kickoff: "Coup d'envoi"
  },
  en: {
    liveBlog: "Live Blog",
    back: "Back",
    live: "LIVE",
    finished: "Finished",
    upcoming: "Upcoming",
    noEvents: "No events yet",
    waitingForUpdates: "Waiting for updates...",
    matchNotFound: "Match not found",
    minute: "min",
    halftime: "Half-time",
    fulltime: "Full-time",
    kickoff: "Kick-off"
  },
  es: {
    liveBlog: "En Vivo",
    back: "Volver",
    live: "EN VIVO",
    finished: "Finalizado",
    upcoming: "Próximo",
    noEvents: "Sin eventos aún",
    waitingForUpdates: "Esperando actualizaciones...",
    matchNotFound: "Partido no encontrado",
    minute: "min",
    halftime: "Descanso",
    fulltime: "Final del partido",
    kickoff: "Inicio"
  }
};

const getEntryIcon = (entryType: string) => {
  switch (entryType) {
    case 'goal':
      return <Goal className="w-5 h-5 text-green-500" />;
    case 'card':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'substitution':
      return <RefreshCw className="w-5 h-5 text-blue-500" />;
    case 'important':
      return <Radio className="w-5 h-5 text-red-500 animate-pulse" />;
    case 'halftime':
      return <Pause className="w-5 h-5 text-orange-500" />;
    case 'kickoff':
      return <Play className="w-5 h-5 text-green-500" />;
    case 'fulltime':
      return <Square className="w-5 h-5 text-muted-foreground" />;
    case 'corner':
      return <Flag className="w-5 h-5 text-purple-500" />;
    case 'foul':
      return <Users className="w-5 h-5 text-orange-500" />;
    case 'chance':
      return <CircleDot className="w-5 h-5 text-cyan-500" />;
    default:
      return <MessageSquare className="w-5 h-5 text-muted-foreground" />;
  }
};

const getEntryBadgeColor = (entryType: string) => {
  switch (entryType) {
    case 'goal':
      return 'bg-green-500/20 text-green-600 border-green-500/30';
    case 'card':
      return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    case 'substitution':
      return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    case 'important':
      return 'bg-red-500/20 text-red-600 border-red-500/30';
    case 'halftime':
    case 'fulltime':
    case 'kickoff':
      return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
    case 'corner':
      return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
    case 'foul':
      return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
    case 'chance':
      return 'bg-cyan-500/20 text-cyan-600 border-cyan-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getEntryLabel = (entryType: string) => {
  const labels: Record<string, string> = {
    goal: 'But ⚽',
    card: 'Carton',
    substitution: 'Remplacement',
    important: 'Important',
    update: 'Mise à jour',
    halftime: 'Mi-temps',
    fulltime: 'Fin',
    kickoff: 'Coup d\'envoi',
    corner: 'Corner',
    foul: 'Faute',
    chance: 'Occasion'
  };
  return labels[entryType] || entryType;
};

const LiveBlog = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const dateLocale = language === 'es' ? es : language === 'en' ? enUS : fr;
  
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchMinute, setMatchMinute] = useState(0);
  
  const { entries, loading: entriesLoading } = useLiveBlog(matchId);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return;
      
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();
      
      if (!error && data) {
        setMatch(data as Match);
      }
      setLoading(false);
    };
    
    fetchMatch();

    // Real-time subscription for match updates
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          if (payload.new) {
            setMatch(payload.new as Match);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  // Calculate match minute
  useEffect(() => {
    if (!match || match.status !== 'live') return;

    const calculateMinute = () => {
      const matchStart = new Date(match.match_date);
      const now = new Date();
      const minutes = differenceInMinutes(now, matchStart);
      setMatchMinute(Math.max(0, Math.min(minutes, 120)));
    };

    calculateMinute();
    const interval = setInterval(calculateMinute, 60000);

    return () => clearInterval(interval);
  }, [match]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-40 w-full mb-6" />
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-20 w-full mb-4" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t.matchNotFound}</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const matchDate = new Date(match.match_date);
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${match.home_team} vs ${match.away_team} - ${t.liveBlog}`}
        description={`Suivez en direct ${match.home_team} vs ${match.away_team} - ${match.competition}`}
      />
      <Navbar />
      
      {/* Match Header */}
      <div className="bg-[hsl(222,47%,20%)] text-white">
        <div className="container mx-auto px-4 py-6">
          {/* Back button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </Button>

          {/* Competition & Venue info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="text-sm text-white/70">
              <span className="font-semibold text-white block">{match.competition || "Football"}</span>
              {match.venue && (
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{match.venue}</span>
                </div>
              )}
              <span className="block mt-1">
                {format(matchDate, "EEEE dd MMMM yyyy - HH:mm", { locale: dateLocale })}
              </span>
            </div>
            
            {/* Status Badge */}
            <div>
              {isLive && (
                <Badge className="bg-red-500 text-white animate-pulse text-sm px-4 py-1">
                  {t.live}
                </Badge>
              )}
              {isFinished && (
                <Badge variant="secondary" className="text-sm px-4 py-1">
                  {t.finished}
                </Badge>
              )}
              {!isLive && !isFinished && (
                <Badge variant="outline" className="border-white/30 text-white text-sm px-4 py-1">
                  {t.upcoming}
                </Badge>
              )}
            </div>
          </div>

          {/* Teams and Score */}
          <div className="flex items-center justify-center gap-4 md:gap-8 py-6">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              {match.home_team_logo && (
                <img 
                  src={match.home_team_logo} 
                  alt={match.home_team}
                  className="w-16 h-16 md:w-24 md:h-24 object-contain"
                />
              )}
              <span className="text-lg md:text-2xl font-bold text-center">{match.home_team}</span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-4xl md:text-6xl font-bold">{match.home_score ?? 0}</span>
                <span className="text-2xl text-white/50">-</span>
                <span className="text-4xl md:text-6xl font-bold">{match.away_score ?? 0}</span>
              </div>
              {isLive && (
                <div className="px-4 py-1 bg-red-500/20 border border-red-500/50 rounded-full">
                  <span className="text-sm font-bold text-red-400 animate-pulse">
                    {matchMinute}'
                  </span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              {match.away_team_logo && (
                <img 
                  src={match.away_team_logo} 
                  alt={match.away_team}
                  className="w-16 h-16 md:w-24 md:h-24 object-contain"
                />
              )}
              <span className="text-lg md:text-2xl font-bold text-center">{match.away_team}</span>
            </div>
          </div>

          {/* Match Stats Summary */}
          {(isLive || isFinished) && entries.length > 0 && (
            <div className="flex items-center justify-center gap-6 py-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span className="font-semibold text-white">{entries.length}</span>
                <span>événements</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Blog Entries */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Radio className={`w-5 h-5 ${isLive ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
            {t.liveBlog}
          </h2>

          {entriesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">{t.waitingForUpdates}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={entry.is_important ? 'border-primary/50 bg-primary/5' : ''}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getEntryIcon(entry.entry_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {entry.minute !== null && (
                                <Badge variant="outline" className="font-mono text-sm">
                                  {entry.minute}'
                                </Badge>
                              )}
                              <Badge className={getEntryBadgeColor(entry.entry_type)}>
                                {getEntryLabel(entry.entry_type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {format(new Date(entry.created_at), 'HH:mm', { locale: dateLocale })}
                              </span>
                            </div>
                            {entry.title && (
                              <h3 className="font-semibold text-foreground mb-1 text-lg">{entry.title}</h3>
                            )}
                            <p className="text-muted-foreground">{entry.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LiveBlog;

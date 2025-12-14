import { useMatches } from "@/hooks/useMatches";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";
import { useLanguage } from "@/contexts/LanguageContext";
import { format, differenceInMinutes, addMinutes, subMinutes } from "date-fns";
import { fr, es, enUS } from "date-fns/locale";
import { Monitor, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

const translations = {
  fr: {
    followMatch: "Suivre le match",
    live: "EN DIRECT",
    upcoming: "À VENIR",
    finished: "TERMINÉ"
  },
  en: {
    followMatch: "Follow match",
    live: "LIVE",
    upcoming: "UPCOMING",
    finished: "FINISHED"
  },
  es: {
    followMatch: "Seguir partido",
    live: "EN VIVO",
    upcoming: "PRÓXIMO",
    finished: "FINALIZADO"
  }
};

export function LiveMatchBar() {
  const { upcomingMatches, pastMatches, loading } = useMatches();
  const { isVisible } = useSiteVisibility();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];
  
  const dateLocale = language === 'es' ? es : language === 'en' ? enUS : fr;

  // Find a match that should show the bar: live, 15min before, or 15min after
  const relevantMatch = useMemo(() => {
    const now = new Date();
    const allMatches = [...(upcomingMatches || []), ...(pastMatches || [])];
    
    // First priority: live match
    const liveMatch = allMatches.find(m => m.status === 'live');
    if (liveMatch) return { match: liveMatch, state: 'live' as const };
    
    // Second priority: match starting within 15 minutes
    const upcomingMatch = upcomingMatches?.find(m => {
      const matchDate = new Date(m.match_date);
      const fifteenMinBefore = subMinutes(matchDate, 15);
      return now >= fifteenMinBefore && now < matchDate && m.status !== 'finished';
    });
    if (upcomingMatch) return { match: upcomingMatch, state: 'upcoming' as const };
    
    // Third priority: match finished within last 15 minutes
    const recentlyFinished = pastMatches?.find(m => {
      if (m.status !== 'finished') return false;
      const matchDate = new Date(m.match_date);
      // Assume match duration ~105 minutes (90 + 15 min stoppage/halftime)
      const estimatedEndTime = addMinutes(matchDate, 105);
      const fifteenMinAfterEnd = addMinutes(estimatedEndTime, 15);
      return now >= estimatedEndTime && now <= fifteenMinAfterEnd;
    });
    if (recentlyFinished) return { match: recentlyFinished, state: 'finished' as const };
    
    return null;
  }, [upcomingMatches, pastMatches]);

  // Minuteur du match
  const [matchMinute, setMatchMinute] = useState(0);

  useEffect(() => {
    if (!relevantMatch || relevantMatch.state !== 'live') return;

    const calculateMinute = () => {
      const matchStart = new Date(relevantMatch.match.match_date);
      const now = new Date();
      const minutes = differenceInMinutes(now, matchStart);
      // Limiter entre 0 et 90+ (avec temps additionnel possible)
      setMatchMinute(Math.max(0, Math.min(minutes, 120)));
    };

    calculateMinute();
    const interval = setInterval(calculateMinute, 60000); // Mise à jour toutes les minutes

    return () => clearInterval(interval);
  }, [relevantMatch]);

  // Ne pas afficher si masqué depuis l'admin ou si pas de match pertinent
  if (!isVisible('live_match_bar') || loading || !relevantMatch) {
    return null;
  }

  const { match, state } = relevantMatch;
  const matchDate = new Date(match.match_date);

  const handleFollowMatch = () => {
    navigate(`/live-blog/${match.id}`);
  };

  const getStatusLabel = () => {
    switch (state) {
      case 'live': return t.live;
      case 'upcoming': return t.upcoming;
      case 'finished': return t.finished;
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case 'live': return 'bg-red-500';
      case 'upcoming': return 'bg-orange-500';
      case 'finished': return 'bg-muted-foreground';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-[hsl(222,47%,20%)] text-white border-b border-white/10 cursor-pointer hover:bg-[hsl(222,47%,25%)] transition-colors"
        onClick={handleFollowMatch}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Info compétition et lieu */}
            <div className="flex flex-col text-sm text-white/70 min-w-0">
              <span className="font-semibold text-white truncate">
                {match.competition || "Football"}
              </span>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3 w-3" />
                <span>{format(matchDate, "EEEE dd MMMM", { locale: dateLocale })}</span>
              </div>
              {match.venue && (
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{match.venue}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs mt-1">
                <Monitor className="h-3 w-3" />
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor()} ${state === 'live' ? 'animate-pulse' : ''}`}>
                  {getStatusLabel()}
                </span>
              </div>
            </div>

            {/* Équipes et score */}
            <div className="flex items-center gap-4 lg:gap-8">
              {/* Équipe domicile */}
              <div className="flex items-center gap-3">
                <span className="text-lg lg:text-xl font-bold text-right min-w-[100px] lg:min-w-[150px] truncate">
                  {match.home_team}
                </span>
                {match.home_team_logo && (
                  <img 
                    src={match.home_team_logo} 
                    alt={match.home_team}
                    className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
                  />
                )}
              </div>

              {/* Score et minuteur */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl lg:text-3xl font-bold">{match.home_score ?? 0}</span>
                  <span className="text-xl text-white/50">-</span>
                  <span className="text-2xl lg:text-3xl font-bold">{match.away_score ?? 0}</span>
                </div>
                {state === 'live' && (
                  <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full">
                    <span className="text-sm font-bold text-red-400 animate-pulse">
                      {matchMinute}'
                    </span>
                  </div>
                )}
              </div>

              {/* Équipe extérieur */}
              <div className="flex items-center gap-3">
                {match.away_team_logo && (
                  <img 
                    src={match.away_team_logo} 
                    alt={match.away_team}
                    className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
                  />
                )}
                <span className="text-lg lg:text-xl font-bold text-left min-w-[100px] lg:min-w-[150px] truncate">
                  {match.away_team}
                </span>
              </div>
            </div>

            {/* Bouton suivre */}
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                handleFollowMatch();
              }}
              className="border-white/30 text-white hover:bg-white hover:text-[hsl(222,47%,20%)] transition-colors"
            >
              {t.followMatch}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import { useMatches } from "@/hooks/useMatches";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";
import { useLiveMatchBarSettings } from "@/hooks/useLiveMatchBarSettings";
import { useMatchTimer } from "@/hooks/useMatchTimer";
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
    finished: "TERMINÉ",
    halftime: "MI-TEMPS",
    firstHalf: "1ÈRE MI-TEMPS",
    secondHalf: "2ÈME MI-TEMPS",
    extraTime1: "PROLONGATION 1",
    extraTime2: "PROLONGATION 2"
  },
  en: {
    followMatch: "Follow match",
    live: "LIVE",
    upcoming: "UPCOMING",
    finished: "FINISHED",
    halftime: "HALF-TIME",
    firstHalf: "1ST HALF",
    secondHalf: "2ND HALF",
    extraTime1: "EXTRA TIME 1",
    extraTime2: "EXTRA TIME 2"
  },
  es: {
    followMatch: "Seguir partido",
    live: "EN VIVO",
    upcoming: "PRÓXIMO",
    finished: "FINALIZADO",
    halftime: "DESCANSO",
    firstHalf: "1ª PARTE",
    secondHalf: "2ª PARTE",
    extraTime1: "PRÓRROGA 1",
    extraTime2: "PRÓRROGA 2"
  }
};

export function LiveMatchBar() {
  const { upcomingMatches, pastMatches, matches, loading: matchesLoading } = useMatches();
  const { isVisible } = useSiteVisibility();
  const { settings, loading: settingsLoading } = useLiveMatchBarSettings();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];
  
  const dateLocale = language === 'es' ? es : language === 'en' ? enUS : fr;

  // Find the match to display based on settings or auto-detection
  const relevantMatch = useMemo(() => {
    const now = new Date();
    const allMatches = [...(upcomingMatches || []), ...(pastMatches || [])];
    
    // If admin selected a specific match, use that
    if (settings?.active_match_id) {
      const selectedMatch = allMatches.find(m => m.id === settings.active_match_id);
      if (selectedMatch) {
        // Determine state based on match status
        let state: 'live' | 'upcoming' | 'finished' = 'upcoming';
        if (selectedMatch.status === 'live') state = 'live';
        else if (selectedMatch.status === 'finished') state = 'finished';
        else {
          const matchDate = new Date(selectedMatch.match_date);
          if (now >= matchDate) state = 'live'; // Match should have started
        }
        return { match: selectedMatch, state };
      }
    }

    // If forced active but no match selected, still skip auto-detection
    // (bar won't show useful content without a match)
    if (settings?.is_forced_active && !settings?.active_match_id) {
      // Try to find any ongoing or upcoming match
      const liveMatch = allMatches.find(m => m.status === 'live');
      if (liveMatch) return { match: liveMatch, state: 'live' as const };
      
      const nextMatch = upcomingMatches?.[0];
      if (nextMatch) return { match: nextMatch, state: 'upcoming' as const };
      
      return null;
    }

    // Auto-detection logic (improved to stay visible longer)
    
    // First priority: live match - always show
    const liveMatch = allMatches.find(m => m.status === 'live');
    if (liveMatch) return { match: liveMatch, state: 'live' as const };
    
    // Second priority: match starting within 15 minutes
    const upcomingMatch = upcomingMatches?.find(m => {
      const matchDate = new Date(m.match_date);
      const fifteenMinBefore = subMinutes(matchDate, 15);
      return now >= fifteenMinBefore && now < matchDate && m.status !== 'finished';
    });
    if (upcomingMatch) return { match: upcomingMatch, state: 'upcoming' as const };
    
    // Third priority: match that started but hasn't been marked as finished yet
    // Keep showing for up to 150 minutes (covers 90min + extra time + halftime)
    const ongoingMatch = allMatches.find(m => {
      if (m.status === 'finished') return false;
      const matchDate = new Date(m.match_date);
      const maxMatchDuration = addMinutes(matchDate, 150);
      return now >= matchDate && now <= maxMatchDuration;
    });
    if (ongoingMatch) return { match: ongoingMatch, state: 'live' as const };
    
    // Fourth priority: recently finished match (30 minutes after finish)
    const recentlyFinished = pastMatches?.find(m => {
      if (m.status !== 'finished') return false;
      const matchDate = new Date(m.match_date);
      // Estimate end time: start + 105 min
      const estimatedEndTime = addMinutes(matchDate, 105);
      const thirtyMinAfterEnd = addMinutes(estimatedEndTime, 30);
      return now >= estimatedEndTime && now <= thirtyMinAfterEnd;
    });
    if (recentlyFinished) return { match: recentlyFinished, state: 'finished' as const };
    
    return null;
  }, [upcomingMatches, pastMatches, settings]);

  // Use manual timer from match_timer_settings
  const { currentMinute: manualMinute, timerSettings } = useMatchTimer(relevantMatch?.match?.id || '');

  // Fallback to automatic calculation if no manual timer
  const [autoMatchMinute, setAutoMatchMinute] = useState(0);

  useEffect(() => {
    if (!relevantMatch || relevantMatch.state !== 'live' || timerSettings?.is_timer_running) return;

    const calculateMinute = () => {
      const matchStart = new Date(relevantMatch.match.match_date);
      const now = new Date();
      const minutes = differenceInMinutes(now, matchStart);
      setAutoMatchMinute(Math.max(0, Math.min(minutes, 120)));
    };

    calculateMinute();
    const interval = setInterval(calculateMinute, 60000);

    return () => clearInterval(interval);
  }, [relevantMatch, timerSettings]);

  // Determine which minute to display
  const displayMinute = timerSettings?.timer_started_at ? manualMinute : `${autoMatchMinute}`;

  // Don't show during loading to prevent flash of incorrect content
  const loading = matchesLoading || settingsLoading;
  
  // Return null during loading - prevents flash
  if (loading) {
    return null;
  }
  
  // Don't show if hidden from admin
  if (!isVisible('live_match_bar')) {
    return null;
  }

  // If forced active, show even without a match (but will be minimal)
  if (!settings?.is_forced_active && !relevantMatch) {
    return null;
  }

  // If forced but no match, don't render
  if (!relevantMatch) {
    return null;
  }

  const { match, state } = relevantMatch;
  const matchDate = new Date(match.match_date);

  const handleFollowMatch = () => {
    if (settings?.custom_cta_link) {
      // Handle external or custom links
      if (settings.custom_cta_link.startsWith('http')) {
        window.open(settings.custom_cta_link, '_blank');
      } else {
        navigate(settings.custom_cta_link);
      }
    } else {
      navigate(`/live-blog/${match.id}`);
    }
  };

  // Determine if we're in halftime (paused after first half)
  const isHalftime = timerSettings?.is_paused && timerSettings?.current_half === 1 && !timerSettings?.is_timer_running;
  
  // Get period-specific status
  const getPeriodLabel = () => {
    if (!timerSettings || state !== 'live') return null;
    
    if (isHalftime) return t.halftime;
    
    const half = timerSettings.current_half;
    if (half === 1) return t.firstHalf;
    if (half === 2) return t.secondHalf;
    if (half === 3) return t.extraTime1;
    if (half === 4) return t.extraTime2;
    return null;
  };

  const getStatusLabel = () => {
    if (isHalftime) return t.halftime;
    switch (state) {
      case 'live': return t.live;
      case 'upcoming': return t.upcoming;
      case 'finished': return t.finished;
    }
  };

  const getStatusColor = () => {
    if (isHalftime) return 'bg-amber-500';
    switch (state) {
      case 'live': return 'bg-red-500';
      case 'upcoming': return 'bg-orange-500';
      case 'finished': return 'bg-muted-foreground';
    }
  };

  // Use custom theme color or default
  const bgColor = settings?.theme_color || '#1e3a5f';
  const hasBackgroundImage = !!settings?.background_image_url;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-white border-b border-white/10 cursor-pointer transition-all relative overflow-hidden"
        style={{ 
          backgroundColor: bgColor,
          backgroundImage: hasBackgroundImage ? `url(${settings.background_image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        onClick={handleFollowMatch}
      >
        {/* Overlay for background image */}
        {hasBackgroundImage && (
          <div className="absolute inset-0 bg-black/50" />
        )}
        
        <div className="container mx-auto px-4 py-3 relative">
          {/* Custom message */}
          {settings?.custom_message && (
            <p className="text-sm text-white/90 text-center font-medium mb-2">
              {settings.custom_message}
            </p>
          )}

          {/* Mobile layout */}
          <div className="flex flex-col gap-2 sm:hidden">
            {/* Status and competition */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor()} ${state === 'live' && !isHalftime ? 'animate-pulse' : ''}`}>
                  {getStatusLabel()}
                </span>
                <span className="font-semibold text-white text-xs">
                  {match.competition || "Football"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/70">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>{format(matchDate, "dd MMM", { locale: dateLocale })}</span>
              </div>
            </div>

            {/* Teams and score - centered */}
            <div className="flex items-center justify-center gap-2">
              {/* Home team */}
              <div className="flex items-center gap-1.5 flex-1 justify-end">
                <span className="text-xs font-bold text-right truncate">
                  {match.home_team}
                </span>
                {match.home_team_logo && (
                  <img 
                    src={match.home_team_logo} 
                    alt={match.home_team}
                    className="w-7 h-7 object-contain shrink-0"
                  />
                )}
              </div>

              {/* Score */}
              {(settings?.show_scores !== false) && (
                <div className="flex flex-col items-center shrink-0 px-2">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold">{match.home_score ?? 0}</span>
                    <span className="text-sm text-white/50">-</span>
                    <span className="text-lg font-bold">{match.away_score ?? 0}</span>
                  </div>
                  {state === 'live' && (settings?.show_timer !== false) && (
                    isHalftime ? (
                      <span className="text-[10px] font-bold text-amber-400">
                        {t.halftime}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-400 animate-pulse">
                        {displayMinute}'
                      </span>
                    )
                  )}
                </div>
              )}

              {/* Away team */}
              <div className="flex items-center gap-1.5 flex-1 justify-start">
                {match.away_team_logo && (
                  <img 
                    src={match.away_team_logo} 
                    alt={match.away_team}
                    className="w-7 h-7 object-contain shrink-0"
                  />
                )}
                <span className="text-xs font-bold text-left truncate">
                  {match.away_team}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFollowMatch();
              }}
              className="border-white bg-white/10 text-white hover:bg-white hover:text-[hsl(222,47%,20%)] transition-colors text-xs font-medium w-full"
            >
              {settings?.custom_cta_text || t.followMatch}
            </Button>
          </div>

          {/* Desktop layout */}
          <div className="hidden sm:flex items-center justify-between gap-4 w-full">
            {/* Info compétition - Aligné à gauche */}
            <div className="flex flex-col items-start text-sm text-white/70 min-w-0 shrink-0">
              <span className="font-semibold text-white text-xs sm:text-sm">
                {match.competition || "Football"}
              </span>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>{format(matchDate, "EEEE dd MMMM", { locale: dateLocale })}</span>
              </div>
              {match.venue && (
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[200px]">{match.venue}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs mt-1">
                <Monitor className="h-3 w-3 shrink-0" />
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor()} ${state === 'live' && !isHalftime ? 'animate-pulse' : ''}`}>
                  {getStatusLabel()}
                </span>
              </div>
            </div>

            {/* Équipes et score - Centre */}
            <div className="flex items-center justify-center gap-4 flex-1">
              {/* Équipe domicile */}
              <div className="flex items-center gap-2 justify-end min-w-0">
                <span className="text-base lg:text-xl font-bold text-right truncate max-w-[100px] lg:max-w-[150px]">
                  {match.home_team}
                </span>
                {match.home_team_logo && (
                  <img 
                    src={match.home_team_logo} 
                    alt={match.home_team}
                    className="w-10 h-10 lg:w-12 lg:h-12 object-contain shrink-0"
                  />
                )}
              </div>

              {/* Score */}
              {(settings?.show_scores !== false) && (
                <div className="flex flex-col items-center gap-1 shrink-0 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl lg:text-3xl font-bold">{match.home_score ?? 0}</span>
                    <span className="text-xl text-white/50">-</span>
                    <span className="text-2xl lg:text-3xl font-bold">{match.away_score ?? 0}</span>
                  </div>
                  {state === 'live' && (settings?.show_timer !== false) && (
                    isHalftime ? (
                      <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full">
                        <span className="text-sm font-bold text-amber-400">
                          {t.halftime}
                        </span>
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full">
                        <span className="text-sm font-bold text-red-400 animate-pulse">
                          {displayMinute}'
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Équipe extérieur */}
              <div className="flex items-center gap-2 justify-start min-w-0">
                {match.away_team_logo && (
                  <img 
                    src={match.away_team_logo} 
                    alt={match.away_team}
                    className="w-10 h-10 lg:w-12 lg:h-12 object-contain shrink-0"
                  />
                )}
                <span className="text-base lg:text-xl font-bold text-left truncate max-w-[100px] lg:max-w-[150px]">
                  {match.away_team}
                </span>
              </div>
            </div>

            {/* Bouton suivre - Aligné à droite */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFollowMatch();
              }}
              className="border-white bg-white/10 text-white hover:bg-white hover:text-[hsl(222,47%,20%)] transition-colors text-sm font-medium shrink-0"
            >
              {settings?.custom_cta_text || t.followMatch}
            </Button>

            {/* Promo image - hidden on mobile */}
            {settings?.promo_image_url && (
              <a 
                href={settings.promo_link || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 hidden lg:block absolute right-4 top-1/2 -translate-y-1/2"
              >
                <img 
                  src={settings.promo_image_url} 
                  alt="Promo" 
                  className="h-10 w-auto object-contain"
                />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

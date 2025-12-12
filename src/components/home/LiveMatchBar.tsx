import { useMatches } from "@/hooks/useMatches";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";
import { useLanguage } from "@/contexts/LanguageContext";
import { format, differenceInMinutes } from "date-fns";
import { fr, es, enUS } from "date-fns/locale";
import { Monitor, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const translations = {
  fr: {
    followMatch: "Suivre le match",
    live: "EN DIRECT"
  },
  en: {
    followMatch: "Follow match",
    live: "LIVE"
  },
  es: {
    followMatch: "Seguir partido",
    live: "EN VIVO"
  }
};

export function LiveMatchBar() {
  const { upcomingMatches, loading } = useMatches();
  const { isVisible } = useSiteVisibility();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];
  
  const dateLocale = language === 'es' ? es : language === 'en' ? enUS : fr;

  // Trouver uniquement le match en direct
  const liveMatch = upcomingMatches.find(m => m.status === 'live');

  // Minuteur du match
  const [matchMinute, setMatchMinute] = useState(0);

  useEffect(() => {
    if (!liveMatch) return;

    const calculateMinute = () => {
      const matchStart = new Date(liveMatch.match_date);
      const now = new Date();
      const minutes = differenceInMinutes(now, matchStart);
      // Limiter entre 0 et 90+ (avec temps additionnel possible)
      setMatchMinute(Math.max(0, Math.min(minutes, 120)));
    };

    calculateMinute();
    const interval = setInterval(calculateMinute, 60000); // Mise à jour toutes les minutes

    return () => clearInterval(interval);
  }, [liveMatch]);

  // Ne pas afficher si masqué depuis l'admin ou si pas de match en direct
  if (!isVisible('live_match_bar') || loading || !liveMatch) {
    return null;
  }

  const matchDate = new Date(liveMatch.match_date);

  const handleFollowMatch = () => {
    navigate(`/calendar`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-[hsl(222,47%,20%)] text-white border-b border-white/10"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Info compétition et lieu */}
            <div className="flex flex-col text-sm text-white/70 min-w-0">
              <span className="font-semibold text-white truncate">
                {liveMatch.competition || "Football"}
              </span>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3 w-3" />
                <span>{format(matchDate, "EEEE dd MMMM", { locale: dateLocale })}</span>
              </div>
              {liveMatch.venue && (
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{liveMatch.venue}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs mt-1">
                <Monitor className="h-3 w-3" />
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 animate-pulse">
                  {t.live}
                </span>
              </div>
            </div>

            {/* Équipes et score */}
            <div className="flex items-center gap-4 lg:gap-8">
              {/* Équipe domicile */}
              <div className="flex items-center gap-3">
                <span className="text-lg lg:text-xl font-bold text-right min-w-[100px] lg:min-w-[150px] truncate">
                  {liveMatch.home_team}
                </span>
                {liveMatch.home_team_logo && (
                  <img 
                    src={liveMatch.home_team_logo} 
                    alt={liveMatch.home_team}
                    className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
                  />
                )}
              </div>

              {/* Score et minuteur */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl lg:text-3xl font-bold">{liveMatch.home_score ?? 0}</span>
                  <span className="text-xl text-white/50">-</span>
                  <span className="text-2xl lg:text-3xl font-bold">{liveMatch.away_score ?? 0}</span>
                </div>
                <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full">
                  <span className="text-sm font-bold text-red-400 animate-pulse">
                    {matchMinute}'
                  </span>
                </div>
              </div>

              {/* Équipe extérieur */}
              <div className="flex items-center gap-3">
                {liveMatch.away_team_logo && (
                  <img 
                    src={liveMatch.away_team_logo} 
                    alt={liveMatch.away_team}
                    className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
                  />
                )}
                <span className="text-lg lg:text-xl font-bold text-left min-w-[100px] lg:min-w-[150px] truncate">
                  {liveMatch.away_team}
                </span>
              </div>
            </div>

            {/* Bouton suivre */}
            <Button 
              variant="outline" 
              onClick={handleFollowMatch}
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

import { useMatches } from "@/hooks/useMatches";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { fr, es, enUS } from "date-fns/locale";
import { Monitor, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const translations = {
  fr: {
    followMatch: "Suivre le match",
    live: "EN DIRECT",
    today: "AUJOURD'HUI",
    upcoming: "À VENIR"
  },
  en: {
    followMatch: "Follow match",
    live: "LIVE",
    today: "TODAY",
    upcoming: "UPCOMING"
  },
  es: {
    followMatch: "Seguir partido",
    live: "EN VIVO",
    today: "HOY",
    upcoming: "PRÓXIMO"
  }
};

export function LiveMatchBar() {
  const { upcomingMatches, loading } = useMatches();
  const { isVisible } = useSiteVisibility();
  const { language } = useLanguage();
  const t = translations[language];
  
  const dateLocale = language === 'es' ? es : language === 'en' ? enUS : fr;

  // Ne pas afficher si masqué depuis l'admin
  if (!isVisible('live_match_bar')) {
    return null;
  }

  // Trouver le match en direct ou le prochain match
  const liveMatch = upcomingMatches.find(m => m.status === 'live');
  const nextMatch = liveMatch || upcomingMatches[0];

  if (loading || !nextMatch) {
    return null;
  }

  const matchDate = new Date(nextMatch.match_date);
  const isToday = new Date().toDateString() === matchDate.toDateString();
  const isLive = nextMatch.status === 'live';

  const getStatusLabel = () => {
    if (isLive) return t.live;
    if (isToday) return t.today;
    return t.upcoming;
  };

  const getStatusColor = () => {
    if (isLive) return "bg-red-500";
    if (isToday) return "bg-yellow-500";
    return "bg-primary";
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
                {nextMatch.competition || "Football"}
              </span>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3 w-3" />
                <span>{format(matchDate, "EEEE dd MMMM", { locale: dateLocale })}</span>
              </div>
              {nextMatch.venue && (
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{nextMatch.venue}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs">
                <Monitor className="h-3 w-3" />
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor()}`}>
                  {getStatusLabel()}
                </span>
              </div>
            </div>

            {/* Équipes et score */}
            <div className="flex items-center gap-4 lg:gap-8">
              {/* Équipe domicile */}
              <div className="flex items-center gap-3">
                <span className="text-lg lg:text-xl font-bold text-right min-w-[100px] lg:min-w-[150px] truncate">
                  {nextMatch.home_team}
                </span>
                {nextMatch.home_team_logo && (
                  <img 
                    src={nextMatch.home_team_logo} 
                    alt={nextMatch.home_team}
                    className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
                  />
                )}
              </div>

              {/* Score ou heure */}
              <div className="flex items-center gap-2 min-w-[80px] justify-center">
                {isLive ? (
                  <>
                    <span className="text-2xl lg:text-3xl font-bold">{nextMatch.home_score ?? 0}</span>
                    <span className="text-xl text-white/50">-</span>
                    <span className="text-2xl lg:text-3xl font-bold">{nextMatch.away_score ?? 0}</span>
                  </>
                ) : (
                  <div className="px-4 py-2 bg-white/10 rounded-lg">
                    <span className="text-lg lg:text-xl font-bold">
                      {format(matchDate, "HH:mm")}
                    </span>
                  </div>
                )}
              </div>

              {/* Équipe extérieur */}
              <div className="flex items-center gap-3">
                {nextMatch.away_team_logo && (
                  <img 
                    src={nextMatch.away_team_logo} 
                    alt={nextMatch.away_team}
                    className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
                  />
                )}
                <span className="text-lg lg:text-xl font-bold text-left min-w-[100px] lg:min-w-[150px] truncate">
                  {nextMatch.away_team}
                </span>
              </div>
            </div>

            {/* Bouton suivre */}
            <Link to={`/matches/${nextMatch.id}`}>
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white hover:text-[hsl(222,47%,20%)] transition-colors"
              >
                {t.followMatch}
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

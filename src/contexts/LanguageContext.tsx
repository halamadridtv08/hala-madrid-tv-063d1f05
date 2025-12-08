import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.news': 'Actualités',
    'nav.matches': 'Matchs',
    'nav.players': 'Effectif',
    'nav.stats': 'Statistiques',
    'nav.videos': 'Vidéos',
    'nav.calendar': 'Calendrier',
    'nav.kits': 'Maillots',
    'nav.media': 'Média',
    'nav.training': 'Entraînements',
    'nav.press': 'Conférences de Presse',
    'nav.predictions': 'Prédictions',
    
    // Auth
    'auth.login': 'Connexion',
    'auth.logout': 'Déconnexion',
    'auth.register': 'Inscription',
    'auth.admin': 'Administration',
    
    // Home
    'home.latestNews': 'Dernières Actualités',
    'home.flashNews': 'Flash News',
    'home.upcomingMatch': 'Prochain Match',
    'home.predictions': 'Prédictions',
    'home.trending': 'Tendances',
    'home.playerSpotlight': 'Joueur en Vedette',
    'home.featuredKits': 'Maillots en Vedette',
    'home.trophies': 'Trophées',
    'home.explore': 'Explorez HALA MADRID TV',
    'home.viewAll': 'Voir tout',
    'home.viewPlayers': 'Voir les profils des joueurs',
    
    // Predictions
    'predictions.title': 'Prédictions',
    'predictions.top3': 'Top 3',
    'predictions.nextMatches': 'Prochains matchs à pronostiquer',
    'predictions.yourPrediction': 'Votre prédiction',
    'predictions.yourRank': 'Votre classement',
    'predictions.viewLeaderboard': 'Voir le classement complet',
    'predictions.noMatches': 'Aucun match à venir pour le moment',
    
    // Trending
    'trending.title': 'Tendances',
    'trending.hot': 'Hot',
    'trending.viewAll': 'Voir toutes les actualités',
    
    // Cards
    'cards.training': 'Entrainement',
    'cards.trainingDesc': "Accédez aux vidéos des séances d'entrainement de l'équipe",
    'cards.conferences': 'Conférences',
    'cards.conferencesDesc': 'Regardez les conférences de presse des joueurs et du staff',
    'cards.kits': 'Maillots',
    'cards.kitsDesc': 'Découvrez les nouveaux maillots du Real Madrid',
    'cards.calendar': 'Calendrier',
    'cards.calendarDesc': 'Consultez les dates des prochains matchs de l\'équipe',
    'cards.viewVideos': 'Voir les vidéos',
    'cards.viewConferences': 'Voir les conférences',
    'cards.viewKits': 'Voir les maillots',
    'cards.viewCalendar': 'Voir le calendrier',
    
    // Footer
    'footer.about': 'À propos',
    'footer.aboutText': 'HALA MADRID TV est votre source d\'informations dédiée au Real Madrid CF.',
    'footer.quickLinks': 'Liens rapides',
    'footer.contact': 'Contact',
    'footer.followUs': 'Suivez-nous',
    'footer.rights': 'Tous droits réservés',
    
    // Language
    'language.select': 'Sélectionner la langue',
    'language.fr': 'Français',
    'language.en': 'English',
    'language.es': 'Español',
    
    // Common
    'common.search': 'Rechercher',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.seeMore': 'Voir plus',
    'common.back': 'Retour',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.news': 'News',
    'nav.matches': 'Matches',
    'nav.players': 'Squad',
    'nav.stats': 'Statistics',
    'nav.videos': 'Videos',
    'nav.calendar': 'Calendar',
    'nav.kits': 'Kits',
    'nav.media': 'Media',
    'nav.training': 'Training',
    'nav.press': 'Press Conferences',
    'nav.predictions': 'Predictions',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.admin': 'Administration',
    
    // Home
    'home.latestNews': 'Latest News',
    'home.flashNews': 'Flash News',
    'home.upcomingMatch': 'Upcoming Match',
    'home.predictions': 'Predictions',
    'home.trending': 'Trending',
    'home.playerSpotlight': 'Player Spotlight',
    'home.featuredKits': 'Featured Kits',
    'home.trophies': 'Trophies',
    'home.explore': 'Explore HALA MADRID TV',
    'home.viewAll': 'View all',
    'home.viewPlayers': 'View player profiles',
    
    // Predictions
    'predictions.title': 'Predictions',
    'predictions.top3': 'Top 3',
    'predictions.nextMatches': 'Next matches to predict',
    'predictions.yourPrediction': 'Your prediction',
    'predictions.yourRank': 'Your rank',
    'predictions.viewLeaderboard': 'View full leaderboard',
    'predictions.noMatches': 'No upcoming matches at the moment',
    
    // Trending
    'trending.title': 'Trending',
    'trending.hot': 'Hot',
    'trending.viewAll': 'View all news',
    
    // Cards
    'cards.training': 'Training',
    'cards.trainingDesc': 'Access training session videos of the team',
    'cards.conferences': 'Conferences',
    'cards.conferencesDesc': 'Watch press conferences from players and staff',
    'cards.kits': 'Kits',
    'cards.kitsDesc': 'Discover the new Real Madrid kits',
    'cards.calendar': 'Calendar',
    'cards.calendarDesc': 'Check the dates of upcoming matches',
    'cards.viewVideos': 'View videos',
    'cards.viewConferences': 'View conferences',
    'cards.viewKits': 'View kits',
    'cards.viewCalendar': 'View calendar',
    
    // Footer
    'footer.about': 'About',
    'footer.aboutText': 'HALA MADRID TV is your dedicated source for Real Madrid CF news.',
    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact',
    'footer.followUs': 'Follow us',
    'footer.rights': 'All rights reserved',
    
    // Language
    'language.select': 'Select language',
    'language.fr': 'Français',
    'language.en': 'English',
    'language.es': 'Español',
    
    // Common
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.seeMore': 'See more',
    'common.back': 'Back',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.news': 'Noticias',
    'nav.matches': 'Partidos',
    'nav.players': 'Plantilla',
    'nav.stats': 'Estadísticas',
    'nav.videos': 'Vídeos',
    'nav.calendar': 'Calendario',
    'nav.kits': 'Camisetas',
    'nav.media': 'Media',
    'nav.training': 'Entrenamientos',
    'nav.press': 'Ruedas de Prensa',
    'nav.predictions': 'Predicciones',
    
    // Auth
    'auth.login': 'Iniciar sesión',
    'auth.logout': 'Cerrar sesión',
    'auth.register': 'Registrarse',
    'auth.admin': 'Administración',
    
    // Home
    'home.latestNews': 'Últimas Noticias',
    'home.flashNews': 'Flash News',
    'home.upcomingMatch': 'Próximo Partido',
    'home.predictions': 'Predicciones',
    'home.trending': 'Tendencias',
    'home.playerSpotlight': 'Jugador Destacado',
    'home.featuredKits': 'Camisetas Destacadas',
    'home.trophies': 'Trofeos',
    'home.explore': 'Explora HALA MADRID TV',
    'home.viewAll': 'Ver todo',
    'home.viewPlayers': 'Ver perfiles de jugadores',
    
    // Predictions
    'predictions.title': 'Predicciones',
    'predictions.top3': 'Top 3',
    'predictions.nextMatches': 'Próximos partidos para predecir',
    'predictions.yourPrediction': 'Tu predicción',
    'predictions.yourRank': 'Tu clasificación',
    'predictions.viewLeaderboard': 'Ver clasificación completa',
    'predictions.noMatches': 'No hay partidos próximos por el momento',
    
    // Trending
    'trending.title': 'Tendencias',
    'trending.hot': 'Hot',
    'trending.viewAll': 'Ver todas las noticias',
    
    // Cards
    'cards.training': 'Entrenamiento',
    'cards.trainingDesc': 'Accede a los vídeos de entrenamiento del equipo',
    'cards.conferences': 'Conferencias',
    'cards.conferencesDesc': 'Mira las ruedas de prensa de jugadores y staff',
    'cards.kits': 'Camisetas',
    'cards.kitsDesc': 'Descubre las nuevas camisetas del Real Madrid',
    'cards.calendar': 'Calendario',
    'cards.calendarDesc': 'Consulta las fechas de los próximos partidos',
    'cards.viewVideos': 'Ver vídeos',
    'cards.viewConferences': 'Ver conferencias',
    'cards.viewKits': 'Ver camisetas',
    'cards.viewCalendar': 'Ver calendario',
    
    // Footer
    'footer.about': 'Sobre nosotros',
    'footer.aboutText': 'HALA MADRID TV es tu fuente de información dedicada al Real Madrid CF.',
    'footer.quickLinks': 'Enlaces rápidos',
    'footer.contact': 'Contacto',
    'footer.followUs': 'Síguenos',
    'footer.rights': 'Todos los derechos reservados',
    
    // Language
    'language.select': 'Seleccionar idioma',
    'language.fr': 'Français',
    'language.en': 'English',
    'language.es': 'Español',
    
    // Common
    'common.search': 'Buscar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.seeMore': 'Ver más',
    'common.back': 'Volver',
  },
};

// Detect user's preferred language based on browser settings
const detectLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('en')) return 'en';
  return 'fr'; // Default to French
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language') as Language;
    return stored || detectLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

import React from "react";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { QuickStatsCard } from "@/components/admin/QuickStatsCard";
import { AdminMenuBar } from "@/components/layout/AdminMenuBar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminStatsOverview } from "@/components/admin/AdminStatsOverview";
import { AdminStatsManager } from "@/components/admin/AdminStatsManager";
import { FileText, Video, Users, Calendar, Settings, LayoutDashboard, User, Camera, BarChart3, ArrowLeft, Mic, PlayCircle, Shirt, Target, Trophy, Twitter, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/Article";
import { VideoType } from "@/types/Video";
import { PhotoType } from "@/types/Photo";
import { Player } from "@/types/Player";
import { Coach } from "@/types/Coach";
import { Match } from "@/types/Match";
import { PressConference } from "@/types/PressConference";
import { TrainingSession } from "@/types/TrainingSession";
import { Kit } from "@/types/Kit";
import { YouTubeVideo } from "@/types/YouTubeVideo";
import ArticleTable from "@/components/admin/ArticleTable";
import { ArticleEngagementManager } from "@/components/admin/ArticleEngagementManager";
import VideoTable from "@/components/admin/VideoTable";
import PhotoTable from "@/components/admin/PhotoTable";
import PlayerTable from "@/components/admin/PlayerTable";
import CoachTable from "@/components/admin/CoachTable";
import MatchTable from "@/components/admin/MatchTable";
import PressConferenceTable from "@/components/admin/PressConferenceTable";
import TrainingSessionTable from "@/components/admin/TrainingSessionTable";
import KitTable from "@/components/admin/KitTable";
import YouTubeVideoTable from "@/components/admin/YouTubeVideoTable";
import SettingsDashboard from "@/components/admin/SettingsDashboard";
import { DataSynchronizer } from "@/components/admin/DataSynchronizer";
import { OpposingTeamManager } from "@/components/admin/OpposingTeamManager";
import { MatchFormationManager } from "@/components/admin/MatchFormationManager";
import { FormationManager } from "@/components/admin/formation/FormationManager";
import { FormationManagerV2 } from "@/components/admin/formation/FormationManagerV2";
import { FormationTemplateManager } from "@/components/admin/formation/FormationTemplateManager";
import { MatchLineupManager } from "@/components/admin/MatchLineupManager";
import { SpecialArticlesManager } from "@/components/admin/SpecialArticlesManager";
import { AuthImageManager } from "@/components/admin/AuthImageManager";
import { FlashNewsForm } from "@/components/admin/FlashNewsForm";
import { FlashNewsTable } from "@/components/admin/FlashNewsTable";
import { FlashNewsDashboard } from "@/components/admin/FlashNewsDashboard";
import { UserRolesManager } from "@/components/admin/UserRolesManager";
import { SiteVisibilityManager } from "@/components/admin/SiteVisibilityManager";
import { FlashNewsCategoryManager } from "@/components/admin/FlashNewsCategoryManager";
import { FlashNewsSourceManager } from "@/components/admin/FlashNewsSourceManager";
import { BatchMatchImporter } from "@/components/admin/BatchMatchImporter";
import { SyncPlayerStatsFromMatches } from "@/components/admin/SyncPlayerStatsFromMatches";
import { StatsEvolutionChart } from "@/components/admin/StatsEvolutionChart";
import { StatsExporter } from "@/components/admin/StatsExporter";
import { PlayerStatsAlerts } from "@/components/admin/PlayerStatsAlerts";
import { PlayerObjectivesManager } from "@/components/admin/PlayerObjectivesManager";
import { SeasonComparison } from "@/components/admin/SeasonComparison";
import { CompetitionReports } from "@/components/admin/CompetitionReports";
import { CompetitionAliasManager } from "@/components/admin/CompetitionAliasManager";
import { DataInconsistencyDetector } from "@/components/admin/DataInconsistencyDetector";
import IntegrationsManager from "@/components/admin/IntegrationsManager";
import { PartnersManager } from "@/components/admin/PartnersManager";
import { FooterLinksManager } from "@/components/admin/FooterLinksManager";
import { ArticleAdsManager } from "@/components/admin/ArticleAdsManager";
import { MatchControlCenter } from "@/components/admin/MatchControlCenter";
import { NewsletterManager } from "@/components/admin/NewsletterManager";
import { DreamTeamManager } from "@/components/admin/DreamTeamManager";
import { LiveMatchBarManager } from "@/components/admin/LiveMatchBarManager";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { SplineManager } from "@/components/admin/SplineManager";
import { HeroBackgroundManager } from "@/components/admin/HeroBackgroundManager";
import { FooterBackgroundManager } from "@/components/admin/FooterBackgroundManager";
import { TransfersManager } from "@/components/admin/TransfersManager";
import { AnnouncementBarManager } from "@/components/admin/AnnouncementBarManager";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import ModeratorActivityDashboard from "@/components/admin/ModeratorActivityDashboard";
import { SiteContentManager } from "@/components/admin/SiteContentManager";
import { BrandingManager } from "@/components/admin/BrandingManager";
import { WelcomePopupManager } from "@/components/admin/WelcomePopupManager";
import { SocialLinksManager } from "@/components/admin/SocialLinksManager";
import { ExploreCardsManager } from "@/components/admin/ExploreCardsManager";
import { SeasonResetManager } from "@/components/admin/SeasonResetManager";
import { SeasonArchiveViewer } from "@/components/admin/SeasonArchiveViewer";
import { SoundSettingsManager } from "@/components/admin/SoundSettingsManager";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
interface StatsData {
  totalPlayers: number;
  activePlayers: number;
  totalCoaches: number;
  publishedArticles: number;
  totalVideos: number;
  upcomingMatches: number;
  totalPressConferences: number;
  totalTrainingSessions: number;
}

const VALID_ADMIN_TABS = [
  "dashboard",
  "analytics",
  "moderator-activity",
  "articles",
  "special-articles",
  "videos",
  "photos",
  "players",
  "coaches",
  "matches",
  "live-bar",
  "announcement-bar",
  "opponents",
  "formations",
  "lineups",
  "press",
  "training",
  "stats",
  "kits",
  "youtube",
  "flash-news",
  "transfers",
  "match-control",
  "newsletter",
  "dream-teams",
  "notifications",
  "integrations",
  "site-content",
  "branding",
  "welcome-popup",
  "social-links",
  "explore-cards",
  "footer-links",
  "season-management",
  "settings",
] as const;

type AdminTab = (typeof VALID_ADMIN_TABS)[number];

function isValidAdminTab(value: string | null): value is AdminTab {
  return !!value && (VALID_ADMIN_TABS as readonly string[]).includes(value);
}

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isModerator, userRole, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pressConferences, setPressConferences] = useState<PressConference[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);

  const [selectedFlashNews, setSelectedFlashNews] = useState<any>(null);
  const [refreshFlashNews, setRefreshFlashNews] = useState(false);
  const flashNewsFormRef = React.useRef<HTMLDivElement>(null);

  const handleEditFlashNews = (flashNews: any) => {
    setSelectedFlashNews(flashNews);
    // Scroll to form after a short delay to ensure it's rendered
    setTimeout(() => {
      flashNewsFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const [stats, setStats] = useState<StatsData>({
    totalPlayers: 0,
    activePlayers: 0,
    totalCoaches: 0,
    publishedArticles: 0,
    totalVideos: 0,
    upcomingMatches: 0,
    totalPressConferences: 0,
    totalTrainingSessions: 0,
  });

  const handleTabChange = (tab: string) => {
    if (isValidAdminTab(tab)) {
      setActiveTab(tab);
    }
  };

  // Double-check moderator/admin status - defense in depth
  // Only redirect after auth AND role are fully loaded (userRole !== null)
  useEffect(() => {
    if (!authLoading && userRole !== null && !isModerator) {
      console.warn("Security: Non-admin/moderator user attempted to access admin panel");
      navigate("/", { replace: true });
    }
  }, [isModerator, authLoading, userRole, navigate]);

  // Read tab from URL (?tab=players)
  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get("tab");
    if (isValidAdminTab(tabParam)) {
      setActiveTab(tabParam);
    } else if (tabParam) {
      setActiveTab("dashboard");
    }
  }, [location.search]);

  // Persist tab to URL when user changes tab inside the admin
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (activeTab === "dashboard") {
      params.delete("tab");
    } else {
      params.set("tab", activeTab);
    }

    const next = params.toString();
    const nextSearch = next ? `?${next}` : "";

    if (location.search !== nextSearch) {
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch,
          hash: location.hash,
        },
        { replace: true }
      );
    }
  }, [activeTab, location.hash, location.pathname, location.search, navigate]);

  // Show nothing while checking auth OR loading role
  if (authLoading || userRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Block non-admins and non-moderators (role is now loaded)
  if (!isModerator) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Accès refusé</h1>
        <p className="text-muted-foreground">Vous n'avez pas les permissions nécessaires.</p>
        <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
      </div>
    );
  }

  useEffect(() => {
    const fetchArticles = async () => {
      const {
        data,
        error
      } = await supabase.from('articles').select('*');
      if (error) {
        console.error("Error fetching articles:", error);
      } else {
        setArticles(data || []);
      }
    };
    const fetchVideos = async () => {
      const {
        data,
        error
      } = await supabase.from('videos').select('*');
      if (error) {
        console.error("Error fetching videos:", error);
      } else {
        setVideos(data || []);
      }
    };
    const fetchPhotos = async () => {
      const {
        data,
        error
      } = await supabase.from('photos').select('*');
      if (error) {
        console.error("Error fetching photos:", error);
      } else {
        setPhotos(data || []);
      }
    };
    const fetchPlayers = async () => {
      const {
        data,
        error
      } = await supabase.from('players').select('*');
      if (error) {
        console.error("Error fetching players:", error);
      } else {
        setPlayers(data || []);
      }
    };
    const fetchCoaches = async () => {
      const {
        data,
        error
      } = await supabase.from('coaches').select('*');
      if (error) {
        console.error("Error fetching coaches:", error);
      } else {
        setCoaches(data || []);
      }
    };
    const fetchMatches = async () => {
      const {
        data,
        error
      } = await supabase.from('matches').select('*');
      if (error) {
        console.error("Error fetching matches:", error);
      } else {
        setMatches(data || []);
      }
    };
    const fetchPressConferences = async () => {
      const {
        data,
        error
      } = await supabase.from('press_conferences').select('*').order('conference_date', {
        ascending: false
      });
      if (error) {
        console.error("Error fetching press conferences:", error);
      } else {
        setPressConferences(data || []);
      }
    };
    const fetchTrainingSessions = async () => {
      const {
        data,
        error
      } = await supabase.from('training_sessions').select('*').order('training_date', {
        ascending: false
      });
      if (error) {
        console.error("Error fetching training sessions:", error);
      } else {
        setTrainingSessions(data || []);
      }
    };
    const fetchKits = async () => {
      const {
        data,
        error
      } = await supabase.from('kits').select('*').order('display_order', {
        ascending: true
      });
      if (error) {
        console.error("Error fetching kits:", error);
      } else {
        setKits((data || []) as Kit[]);
      }
    };
    fetchArticles();
    fetchVideos();
    fetchPhotos();
    fetchPlayers();
    fetchCoaches();
    fetchMatches();
    fetchPressConferences();
    fetchTrainingSessions();
    fetchKits();
  }, []);
  useEffect(() => {
    setStats({
      totalPlayers: players.length,
      activePlayers: players.filter(p => p.is_active).length,
      totalCoaches: coaches.length,
      publishedArticles: articles.filter(a => a.is_published).length,
      totalVideos: videos.length,
      upcomingMatches: matches.filter(m => m.status === 'upcoming').length,
      totalPressConferences: pressConferences.length,
      totalTrainingSessions: trainingSessions.length
    });
  }, [players, coaches, articles, videos, matches, pressConferences, trainingSessions]);
  const renderDashboard = () => <div className="space-y-4 md:space-y-6">
      <QuickStatsCard playersCount={players.length} coachesCount={coaches.length} articlesCount={articles.length} videosCount={videos.length} matchesCount={matches.length} />
      
      {/* Ajout du synchroniseur de données */}
      <DataSynchronizer />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Articles publiés</span>
                <Badge variant="secondary" className="text-xs">
                  {articles.filter(a => a.is_published).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Vidéos</span>
                <Badge variant="secondary" className="text-xs">{videos.length}</Badge>
              </div>
              <div className="hidden sm:flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Photos uploadées</span>
                <Badge variant="secondary" className="text-xs">{photos.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Matchs programmés</span>
                <Badge variant="secondary" className="text-xs">
                  {matches.filter(m => m.status === 'upcoming').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              Équipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Joueurs actifs</span>
                <Badge variant="default" className="text-xs">
                  {players.filter(p => p.is_active).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Entraîneurs</span>
                <Badge variant="default" className="text-xs">{coaches.length}</Badge>
              </div>
              <div className="hidden sm:flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Gardiens</span>
                <Badge variant="outline" className="text-xs">
                  {players.filter(p => p.position === 'gardien').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Attaquants</span>
                <Badge variant="outline" className="text-xs">
                  {players.filter(p => p.position === 'attaquant').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("articles")}>
          <CardContent className="p-4 md:p-6 text-center">
            <FileText className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-madrid-blue" />
            <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">Gérer les Articles</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm hidden md:block">Créer et modifier les articles</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("videos")}>
          <CardContent className="p-4 md:p-6 text-center">
            <Video className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-madrid-blue" />
            <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">Gérer les Vidéos</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm hidden md:block">Ajouter et organiser les vidéos</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("photos")}>
          <CardContent className="p-4 md:p-6 text-center">
            <Camera className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-madrid-blue" />
            <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">Gérer les Photos</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm hidden md:block">Organiser la galerie photos</p>
          </CardContent>
        </Card>
      </div>
    </div>;
  const renderArticles = () => {
    const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
    if (selectedArticleId) {
      return <div>
          <Button variant="ghost" onClick={() => setSelectedArticleId(null)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux articles
          </Button>
          <ArticleEngagementManager articleId={selectedArticleId} />
        </div>;
    }
    return <div>
        <h2 className="text-2xl font-bold mb-4">Gestion des Articles</h2>
        <ArticleTable articles={articles} setArticles={setArticles} onManageEngagement={setSelectedArticleId} />
      </div>;
  };
  const renderVideos = () => <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Vidéos</h2>
      <VideoTable videos={videos} setVideos={setVideos} />
    </div>;
  const renderPhotos = () => <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Photos</h2>
      <PhotoTable photos={photos} setPhotos={setPhotos} />
    </div>;
  const renderPlayers = () => <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Joueurs</h2>
      <PlayerTable players={players} setPlayers={setPlayers} />
    </div>;
  const renderCoaches = () => <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Entraîneurs</h2>
      <CoachTable coaches={coaches} setCoaches={setCoaches} />
    </div>;
  const renderMatches = () => <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestion des Matchs</h2>
      <MatchTable matches={matches} setMatches={setMatches} />
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Import par lots</h3>
        <BatchMatchImporter />
      </div>
    </div>;
  const renderPressConferences = () => <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Conférences de Presse</h2>
      <PressConferenceTable pressConferences={pressConferences} setPressConferences={setPressConferences} />
    </div>;
  const renderTrainingSessions = () => <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Séances d'Entraînement</h2>
      <TrainingSessionTable trainingSessions={trainingSessions} setTrainingSessions={setTrainingSessions} />
    </div>;
  const renderStats = () => <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Statistiques en Temps Réel</h2>
      {window.location.hash === '#stats-manager' ? <AdminStatsManager /> : <AdminStatsOverview />}
      
      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Synchronisation automatique</h3>
          <SyncPlayerStatsFromMatches />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Évolution et Export des Statistiques</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <StatsEvolutionChart />
            <StatsExporter />
          </div>
          <PlayerStatsAlerts />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Objectifs et Performance</h3>
          <PlayerObjectivesManager />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Comparaison par Saison</h3>
          <SeasonComparison />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Rapports par Compétition</h3>
          <CompetitionReports />
        </div>
      </div>
    </div>;
  const renderOpponents = () => <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Équipes Adverses</h2>
      <OpposingTeamManager />
    </div>;
  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Paramètres</h2>
      
      <Accordion type="single" collapsible className="space-y-4">
        {/* Section Configuration Générale */}
        <AccordionItem value="config-generale" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold text-muted-foreground hover:no-underline">
            Configuration générale
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <SettingsDashboard />
          </AccordionContent>
        </AccordionItem>

        {/* Section Visibilité & Affichage */}
        <AccordionItem value="visibilite-affichage" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold text-muted-foreground hover:no-underline">
            Visibilité & Affichage
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <SiteVisibilityManager />
            <HeroBackgroundManager />
            <FooterBackgroundManager />
            <SplineManager />
            <AuthImageManager />
          </AccordionContent>
        </AccordionItem>

        {/* Section Sons du site */}
        <AccordionItem value="sons-site" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold text-muted-foreground hover:no-underline">
            Sons du site
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <SoundSettingsManager />
          </AccordionContent>
        </AccordionItem>

        {/* Section Contenu */}
        <AccordionItem value="gestion-contenu" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold text-muted-foreground hover:no-underline">
            Gestion du contenu
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <FlashNewsCategoryManager />
            <FlashNewsSourceManager />
            <ArticleAdsManager />
          </AccordionContent>
        </AccordionItem>

        {/* Section Partenaires & Liens */}
        <AccordionItem value="partenaires-liens" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold text-muted-foreground hover:no-underline">
            Partenaires & Liens
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <PartnersManager />
            <FooterLinksManager />
          </AccordionContent>
        </AccordionItem>

        {/* Section Utilisateurs & Rôles - Admin only */}
        {isAdmin && (
          <AccordionItem value="utilisateurs-roles" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold text-muted-foreground hover:no-underline">
              Utilisateurs & Rôles
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <UserRolesManager />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Section Données & Synchronisation */}
        <AccordionItem value="donnees-sync" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold text-muted-foreground hover:no-underline">
            Données & Synchronisation
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <CompetitionAliasManager />
            <DataInconsistencyDetector />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
  const renderKits = () => <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Maillots</h2>
      <KitTable kits={kits} setKits={setKits} />
    </div>;
  const renderFormations = () => <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des Formations Tactiques</h2>
      <FormationTemplateManager />
      <FormationManagerV2 />
    </div>;
  const renderLineups = () => <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Compositions et Joueurs Absents</h2>
      <MatchLineupManager />
    </div>;
  const renderYouTubeVideos = () => <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Vidéos YouTube</h2>
      <YouTubeVideoTable videos={youtubeVideos} setVideos={setYoutubeVideos} />
    </div>;
  const renderFlashNews = () => <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Infos Flash</h2>
        {selectedFlashNews && <Button variant="outline" onClick={() => setSelectedFlashNews(null)}>
            Nouvelle Info
          </Button>}
      </div>

      <FlashNewsDashboard />

      <Card ref={flashNewsFormRef}>
        <CardHeader>
          <CardTitle>
            {selectedFlashNews ? "Modifier l'info flash" : "Créer une info flash"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FlashNewsForm flashNews={selectedFlashNews} onSuccess={() => {
          setSelectedFlashNews(null);
          setRefreshFlashNews(!refreshFlashNews);
        }} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Infos Flash</CardTitle>
        </CardHeader>
        <CardContent>
          <FlashNewsTable onEdit={handleEditFlashNews} refresh={refreshFlashNews} />
        </CardContent>
      </Card>
    </div>;
  const renderSpecialArticles = () => <SpecialArticlesManager />;

  const renderMatchControl = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Centre de Contrôle Match</h2>
      <MatchControlCenter />
    </div>
  );

  const renderLiveBar = () => <LiveMatchBarManager />;
  
  const renderAnnouncementBar = () => <AnnouncementBarManager />;

  const renderNewsletter = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestion de la Newsletter</h2>
      <NewsletterManager />
    </div>
  );

  const renderDreamTeams = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dream Teams des Utilisateurs</h2>
      <DreamTeamManager />
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Notifications</h2>
      <AdminNotifications />
    </div>
  );

  const renderTransfers = () => <TransfersManager />;
  
  const renderAnalytics = () => <AnalyticsDashboard />;
  
  const renderModeratorActivity = () => <ModeratorActivityDashboard />;
  
  return <div className="min-h-screen bg-background flex">
      {/* Sidebar desktop */}
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      {/* Main content */}
      <div className={cn("flex-1 transition-all duration-300", sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64")}>
        <div className="madrid-container px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <AdminMobileNav activeTab={activeTab} onTabChange={handleTabChange} />
              <Button onClick={() => navigate('/')} variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Retour au site</span>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold truncate">
                  Administration HALA MADRID TV
                </h1>
                <p className="hidden md:block text-sm text-muted-foreground mt-1">
                  Gérez le contenu et les paramètres du site
                </p>
              </div>
            </div>
            <Badge variant="outline" className="px-2 py-0.5 text-xs w-fit hidden sm:inline-flex">
              Version 2.0
            </Badge>
          </div>

        

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 md:space-y-6">

          <TabsContent value="dashboard">{renderDashboard()}</TabsContent>
          <TabsContent value="analytics">{renderAnalytics()}</TabsContent>
          <TabsContent value="moderator-activity">{isAdmin && renderModeratorActivity()}</TabsContent>
          <TabsContent value="articles">{renderArticles()}</TabsContent>
          <TabsContent value="special-articles">{renderSpecialArticles()}</TabsContent>
          <TabsContent value="videos">{renderVideos()}</TabsContent>
          <TabsContent value="photos">{renderPhotos()}</TabsContent>
          <TabsContent value="players">{renderPlayers()}</TabsContent>
          <TabsContent value="coaches">{renderCoaches()}</TabsContent>
          <TabsContent value="matches">{renderMatches()}</TabsContent>
          <TabsContent value="live-bar">{renderLiveBar()}</TabsContent>
          <TabsContent value="announcement-bar">{renderAnnouncementBar()}</TabsContent>
          <TabsContent value="opponents">{renderOpponents()}</TabsContent>
          <TabsContent value="formations">{renderFormations()}</TabsContent>
          <TabsContent value="lineups">{renderLineups()}</TabsContent>
          <TabsContent value="press">{renderPressConferences()}</TabsContent>
          <TabsContent value="training">{renderTrainingSessions()}</TabsContent>
          <TabsContent value="stats">{renderStats()}</TabsContent>
          <TabsContent value="kits">{renderKits()}</TabsContent>
          <TabsContent value="youtube">{renderYouTubeVideos()}</TabsContent>
          <TabsContent value="flash-news">{renderFlashNews()}</TabsContent>
          <TabsContent value="transfers">{renderTransfers()}</TabsContent>
          <TabsContent value="match-control">{renderMatchControl()}</TabsContent>
          <TabsContent value="newsletter">{renderNewsletter()}</TabsContent>
          <TabsContent value="dream-teams">{renderDreamTeams()}</TabsContent>
          <TabsContent value="notifications">{renderNotifications()}</TabsContent>
          <TabsContent value="integrations">
            <IntegrationsManager />
          </TabsContent>
          <TabsContent value="site-content">
            <SiteContentManager />
          </TabsContent>
          <TabsContent value="branding">
            <BrandingManager />
          </TabsContent>
          <TabsContent value="welcome-popup">
            <WelcomePopupManager />
          </TabsContent>
          <TabsContent value="social-links">
            <SocialLinksManager />
          </TabsContent>
          <TabsContent value="explore-cards">
            <ExploreCardsManager />
          </TabsContent>
          <TabsContent value="footer-links">
            <FooterLinksManager />
          </TabsContent>
          <TabsContent value="season-management">
            <div className="space-y-6">
              <SeasonResetManager />
              <SeasonArchiveViewer />
            </div>
          </TabsContent>
          <TabsContent value="settings">{renderSettings()}</TabsContent>
        </Tabs>
      </div>
      </div>
    </div>;
};
export default Admin;
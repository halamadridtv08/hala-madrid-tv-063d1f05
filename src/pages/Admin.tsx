import React from "react";
import { useState, useEffect } from "react";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { QuickStatsCard } from "@/components/admin/QuickStatsCard";
import { AdminMenuBar } from "@/components/layout/AdminMenuBar";
import { AdminStatsOverview } from "@/components/admin/AdminStatsOverview";
import { AdminStatsManager } from "@/components/admin/AdminStatsManager";
import { 
  FileText, 
  Video, 
  Users, 
  Calendar, 
  Settings, 
  LayoutDashboard, 
  User, 
  Camera,
  BarChart3,
  ArrowLeft,
  Mic,
  PlayCircle
} from "lucide-react";
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
import ArticleTable from "@/components/admin/ArticleTable";
import VideoTable from "@/components/admin/VideoTable";
import PhotoTable from "@/components/admin/PhotoTable";
import PlayerTable from "@/components/admin/PlayerTable";
import CoachTable from "@/components/admin/CoachTable";
import MatchTable from "@/components/admin/MatchTable";
import PressConferenceTable from "@/components/admin/PressConferenceTable";
import TrainingSessionTable from "@/components/admin/TrainingSessionTable";
import SettingsDashboard from "@/components/admin/SettingsDashboard";
import { DataSynchronizer } from "@/components/admin/DataSynchronizer";
import { OpposingTeamManager } from "@/components/admin/OpposingTeamManager";
import { useNavigate } from "react-router-dom";

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

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pressConferences, setPressConferences] = useState<PressConference[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
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

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*');

      if (error) {
        console.error("Error fetching articles:", error);
      } else {
        setArticles(data || []);
      }
    };

    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*');

      if (error) {
        console.error("Error fetching videos:", error);
      } else {
        setVideos(data || []);
      }
    };

    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*');

      if (error) {
        console.error("Error fetching photos:", error);
      } else {
        setPhotos(data || []);
      }
    };

    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*');

      if (error) {
        console.error("Error fetching players:", error);
      } else {
        setPlayers(data || []);
      }
    };

    const fetchCoaches = async () => {
      const { data, error } = await supabase
        .from('coaches')
        .select('*');

      if (error) {
        console.error("Error fetching coaches:", error);
      } else {
        setCoaches(data || []);
      }
    };

    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*');

      if (error) {
        console.error("Error fetching matches:", error);
      } else {
        setMatches(data || []);
      }
    };

    const fetchPressConferences = async () => {
      const { data, error } = await supabase
        .from('press_conferences')
        .select('*')
        .order('conference_date', { ascending: false });

      if (error) {
        console.error("Error fetching press conferences:", error);
      } else {
        setPressConferences(data || []);
      }
    };

    const fetchTrainingSessions = async () => {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .order('training_date', { ascending: false });

      if (error) {
        console.error("Error fetching training sessions:", error);
      } else {
        setTrainingSessions(data || []);
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
      totalTrainingSessions: trainingSessions.length,
    });
  }, [players, coaches, articles, videos, matches, pressConferences, trainingSessions]);

  const renderDashboard = () => (
    <div className="space-y-6">
      <QuickStatsCard 
        playersCount={players.length}
        coachesCount={coaches.length}
        articlesCount={articles.length}
        videosCount={videos.length}
        matchesCount={matches.length}
      />
      
      {/* Ajout du synchroniseur de données */}
      <DataSynchronizer />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Articles publiés cette semaine</span>
                <Badge variant="secondary">
                  {articles.filter(a => a.is_published).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vidéos ajoutées</span>
                <Badge variant="secondary">{videos.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Photos uploadées</span>
                <Badge variant="secondary">{photos.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Matchs programmés</span>
                <Badge variant="secondary">
                  {matches.filter(m => m.status === 'upcoming').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Équipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Joueurs actifs</span>
                <Badge variant="default">
                  {players.filter(p => p.is_active).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Entraîneurs</span>
                <Badge variant="default">{coaches.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Gardiens</span>
                <Badge variant="outline">
                  {players.filter(p => p.position === 'gardien').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Attaquants</span>
                <Badge variant="outline">
                  {players.filter(p => p.position === 'attaquant').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("articles")}>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-madrid-blue" />
            <h3 className="text-lg font-semibold mb-2">Gérer les Articles</h3>
            <p className="text-gray-600 text-sm">Créer et modifier les articles de actualités</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("videos")}>
          <CardContent className="p-6 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-madrid-blue" />
            <h3 className="text-lg font-semibold mb-2">Gérer les Vidéos</h3>
            <p className="text-gray-600 text-sm">Ajouter et organiser les vidéos</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("photos")}>
          <CardContent className="p-6 text-center">
            <Camera className="h-12 w-12 mx-auto mb-4 text-madrid-blue" />
            <h3 className="text-lg font-semibold mb-2">Gérer les Photos</h3>
            <p className="text-gray-600 text-sm">Organiser la galerie photos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderArticles = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Articles</h2>
      <ArticleTable articles={articles} setArticles={setArticles} />
    </div>
  );

  const renderVideos = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Vidéos</h2>
      <VideoTable videos={videos} setVideos={setVideos} />
    </div>
  );

  const renderPhotos = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Photos</h2>
      <PhotoTable photos={photos} setPhotos={setPhotos} />
    </div>
  );

  const renderPlayers = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Joueurs</h2>
      <PlayerTable players={players} setPlayers={setPlayers} />
    </div>
  );

  const renderCoaches = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Entraîneurs</h2>
      <CoachTable coaches={coaches} setCoaches={setCoaches} />
    </div>
  );

  const renderMatches = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Matchs</h2>
      <MatchTable matches={matches} setMatches={setMatches} />
    </div>
  );

  const renderPressConferences = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Conférences de Presse</h2>
      <PressConferenceTable 
        pressConferences={pressConferences} 
        setPressConferences={setPressConferences} 
      />
    </div>
  );

  const renderTrainingSessions = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Séances d'Entraînement</h2>
      <TrainingSessionTable 
        trainingSessions={trainingSessions} 
        setTrainingSessions={setTrainingSessions} 
      />
    </div>
  );

  const renderStats = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Statistiques en Temps Réel</h2>
      {window.location.hash === '#stats-manager' ? (
        <AdminStatsManager />
      ) : (
        <AdminStatsOverview />
      )}
    </div>
  );

  const renderOpponents = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des Équipes Adverses</h2>
      <OpposingTeamManager />
    </div>
  );

  const renderSettings = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Paramètres</h2>
      <SettingsDashboard />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="madrid-container py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au site
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Administration HALA MADRID TV
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Gérez le contenu et les paramètres du site
              </p>
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            Version 2.0
          </Badge>
        </div>

        <AdminMenuBar />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-12">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Vidéos
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Joueurs
            </TabsTrigger>
            <TabsTrigger value="coaches" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Entraîneurs
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Matchs
            </TabsTrigger>
            <TabsTrigger value="opponents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Équipes Adverses
            </TabsTrigger>
            <TabsTrigger value="press" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Conférences
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Entraînements
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">{renderDashboard()}</TabsContent>
          <TabsContent value="articles">{renderArticles()}</TabsContent>
          <TabsContent value="videos">{renderVideos()}</TabsContent>
          <TabsContent value="photos">{renderPhotos()}</TabsContent>
          <TabsContent value="players">{renderPlayers()}</TabsContent>
          <TabsContent value="coaches">{renderCoaches()}</TabsContent>
          <TabsContent value="matches">{renderMatches()}</TabsContent>
          <TabsContent value="opponents">{renderOpponents()}</TabsContent>
          <TabsContent value="press">{renderPressConferences()}</TabsContent>
          <TabsContent value="training">{renderTrainingSessions()}</TabsContent>
          <TabsContent value="stats">{renderStats()}</TabsContent>
          <TabsContent value="settings">{renderSettings()}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

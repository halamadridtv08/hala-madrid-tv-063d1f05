import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickStatsCard } from "@/components/admin/QuickStatsCard";
import PlayerTable from "@/components/admin/PlayerTable";
import CoachTable from "@/components/admin/CoachTable";
import ArticleTable from "@/components/admin/ArticleTable";
import VideoTable from "@/components/admin/VideoTable";
import PhotoTable from "@/components/admin/PhotoTable";
import MatchTable from "@/components/admin/MatchTable";
import { FeaturedPlayerManager } from "@/components/admin/FeaturedPlayerManager";
import { 
  Users, 
  FileText, 
  Video, 
  Image, 
  Calendar, 
  Settings,
  ArrowLeft,
  Shield,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    playersCount: 0,
    coachesCount: 0,
    articlesCount: 0,
    videosCount: 0,
    matchesCount: 0
  });

  useEffect(() => {
    checkAdminStatus();
    fetchStats();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        navigate('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [players, coaches, articles, videos, matches] = await Promise.all([
        supabase.from('players').select('id', { count: 'exact' }),
        supabase.from('coaches').select('id', { count: 'exact' }),
        supabase.from('articles').select('id', { count: 'exact' }),
        supabase.from('videos').select('id', { count: 'exact' }),
        supabase.from('matches').select('id', { count: 'exact' })
      ]);

      setStats({
        playersCount: players.count || 0,
        coachesCount: coaches.count || 0,
        articlesCount: articles.count || 0,
        videosCount: videos.count || 0,
        matchesCount: matches.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-madrid-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-madrid-blue py-10">
          <div className="madrid-container">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-madrid-blue"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au site
              </Button>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Shield className="h-8 w-8" />
                Administration
              </h1>
            </div>
            <p className="text-blue-200">
              Gérez le contenu et les paramètres du site HALA MADRID TV
            </p>
          </div>
        </div>

        <div className="madrid-container py-8">
          <QuickStatsCard {...stats} />
          
          <Tabs defaultValue="featured" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-1">
              <TabsTrigger value="featured" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Vedette</span>
              </TabsTrigger>
              <TabsTrigger value="players" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Joueurs</span>
              </TabsTrigger>
              <TabsTrigger value="coaches" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Staff</span>
              </TabsTrigger>
              <TabsTrigger value="matches" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Matchs</span>
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Articles</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Vidéos</span>
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Photos</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="featured" className="space-y-6">
              <FeaturedPlayerManager />
            </TabsContent>

            <TabsContent value="players" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestion des Joueurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PlayerTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coaches" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestion du Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CoachTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Gestion des Matchs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MatchTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="articles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Gestion des Articles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ArticleTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Gestion des Vidéos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Gestion des Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PhotoTable />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Admin;

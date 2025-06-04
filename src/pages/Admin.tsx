import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Upload, User, Trophy, Camera, BarChart3, Menu } from "lucide-react";
import { PlayerStatsManager } from "@/components/admin/PlayerStatsManager";
import { MediaManager } from "@/components/admin/MediaManager";
import { PlayerEditForm } from "@/components/admin/PlayerEditForm";
import { CoachEditForm } from "@/components/admin/CoachEditForm";
import { QuickStatsCard } from "@/components/admin/QuickStatsCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number | null;
  nationality: string | null;
  age: number | null;
  height: string | null;
  weight: string | null;
  image_url: string | null;
  bio: string | null;
  profile_image_url: string | null;
  biography: string | null;
  social_media: any;
  is_active: boolean;
  stats: any;
  created_at: string;
  updated_at: string;
}

interface Coach {
  id: string;
  name: string;
  role: string;
  nationality: string | null;
  age: number | null;
  experience_years: number | null;
  image_url: string | null;
  bio: string | null;
  profile_image_url: string | null;
  biography: string | null;
  social_media: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string | null;
  category: string;
  read_time: string | null;
  is_published: boolean;
  featured: boolean;
  published_at: string | null;
  author_id: string;
  updated_at: string;
}

interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  duration: number | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  photographer: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string | null;
  competition: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
  match_details: any;
  created_at: string;
  updated_at: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [playersData, setPlayersData] = useState<Player[]>([]);
  const [coachesData, setCoachesData] = useState<Coach[]>([]);
  const [articlesData, setArticlesData] = useState<Article[]>([]);
  const [videosData, setVideosData] = useState<Video[]>([]);
  const [photosData, setPhotosData] = useState<Photo[]>([]);
  const [matchesData, setMatchesData] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [managementMode, setManagementMode] = useState<'stats' | 'media' | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isMobile = useIsMobile();

  // Form states
  const [playerForm, setPlayerForm] = useState({
    name: "",
    position: "",
    jersey_number: "",
    nationality: "",
    age: "",
    height: "",
    weight: "",
    image_url: "",
    bio: "",
    profile_image_url: "",
    biography: "",
    social_media: { twitter: "", instagram: "", facebook: "" },
    is_active: true
  });

  const [coachForm, setCoachForm] = useState({
    name: "",
    role: "",
    nationality: "",
    age: "",
    experience_years: "",
    image_url: "",
    bio: "",
    profile_image_url: "",
    biography: "",
    social_media: { twitter: "", instagram: "", facebook: "" },
    is_active: true
  });

  const [articleForm, setArticleForm] = useState({
    title: "",
    description: "",
    content: "",
    image_url: "",
    category: "",
    read_time: "",
    is_published: false,
    featured: false
  });

  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    category: "",
    duration: "",
    is_published: false
  });

  const [photoForm, setPhotoForm] = useState({
    title: "",
    description: "",
    image_url: "",
    category: "",
    photographer: "",
    is_published: false
  });

  const [matchForm, setMatchForm] = useState({
    home_team: "",
    away_team: "",
    match_date: "",
    venue: "",
    competition: "",
    home_score: "",
    away_score: "",
    status: "upcoming"
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [players, coaches, articles, videos, photos, matches] = await Promise.all([
        supabase.from('players').select('*').order('name'),
        supabase.from('coaches').select('*').order('name'),
        supabase.from('articles').select('*').order('published_at', { ascending: false }),
        supabase.from('videos').select('*').order('published_at', { ascending: false }),
        supabase.from('photos').select('*').order('published_at', { ascending: false }),
        supabase.from('matches').select('*').order('match_date', { ascending: false })
      ]);

      if (players.error) throw players.error;
      if (coaches.error) throw coaches.error;
      if (articles.error) throw articles.error;
      if (videos.error) throw videos.error;
      if (photos.error) throw photos.error;
      if (matches.error) throw matches.error;

      setPlayersData(players.data || []);
      setCoachesData(coaches.data || []);
      setArticlesData(articles.data || []);
      setVideosData(videos.data || []);
      setPhotosData(photos.data || []);
      setMatchesData(matches.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('players').insert([{
        ...playerForm,
        jersey_number: playerForm.jersey_number ? parseInt(playerForm.jersey_number) : null,
        age: playerForm.age ? parseInt(playerForm.age) : null,
        social_media: playerForm.social_media
      }]);

      if (error) throw error;

      toast({
        title: "Joueur ajouté",
        description: "Le joueur a été ajouté avec succès"
      });

      setPlayerForm({
        name: "",
        position: "",
        jersey_number: "",
        nationality: "",
        age: "",
        height: "",
        weight: "",
        image_url: "",
        bio: "",
        profile_image_url: "",
        biography: "",
        social_media: { twitter: "", instagram: "", facebook: "" },
        is_active: true
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const handleAddCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('coaches').insert([{
        ...coachForm,
        age: coachForm.age ? parseInt(coachForm.age) : null,
        experience_years: coachForm.experience_years ? parseInt(coachForm.experience_years) : null,
        social_media: coachForm.social_media
      }]);

      if (error) throw error;

      toast({
        title: "Coach ajouté",
        description: "Le coach a été ajouté avec succès"
      });

      setCoachForm({
        name: "",
        role: "",
        nationality: "",
        age: "",
        experience_years: "",
        image_url: "",
        bio: "",
        profile_image_url: "",
        biography: "",
        social_media: { twitter: "", instagram: "", facebook: "" },
        is_active: true
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour ajouter un article"
        });
        return;
      }

      const { error } = await supabase.from('articles').insert([{
        ...articleForm,
        author_id: user.id
      }]);

      if (error) throw error;

      toast({
        title: "Article ajouté",
        description: "L'article a été ajouté avec succès"
      });

      setArticleForm({
        title: "",
        description: "",
        content: "",
        image_url: "",
        category: "",
        read_time: "",
        is_published: false,
        featured: false
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('videos').insert([{
        ...videoForm,
        duration: videoForm.duration ? parseInt(videoForm.duration) : null
      }]);

      if (error) throw error;

      toast({
        title: "Vidéo ajoutée",
        description: "La vidéo a été ajoutée avec succès"
      });

      setVideoForm({
        title: "",
        description: "",
        video_url: "",
        thumbnail_url: "",
        category: "",
        duration: "",
        is_published: false
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('photos').insert([photoForm]);

      if (error) throw error;

      toast({
        title: "Photo ajoutée",
        description: "La photo a été ajoutée avec succès"
      });

      setPhotoForm({
        title: "",
        description: "",
        image_url: "",
        category: "",
        photographer: "",
        is_published: false
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('matches').insert([{
        ...matchForm,
        home_score: matchForm.home_score ? parseInt(matchForm.home_score) : null,
        away_score: matchForm.away_score ? parseInt(matchForm.away_score) : null
      }]);

      if (error) throw error;

      toast({
        title: "Match ajouté",
        description: "Le match a été ajouté avec succès"
      });

      setMatchForm({
        home_team: "",
        away_team: "",
        match_date: "",
        venue: "",
        competition: "",
        home_score: "",
        away_score: "",
        status: "upcoming"
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const deletePlayer = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce joueur ?")) return;

    try {
      const { error } = await supabase.from('players').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Joueur supprimé",
        description: "Le joueur a été supprimé avec succès"
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const deleteCoach = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce coach ?")) return;

    try {
      const { error } = await supabase.from('coaches').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Coach supprimé",
        description: "Le coach a été supprimé avec succès"
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const deleteArticle = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès"
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const deleteVideo = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette vidéo ?")) return;

    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Vidéo supprimée",
        description: "La vidéo a été supprimée avec succès"
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const deletePhoto = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) return;

    try {
      const { error } = await supabase.from('photos').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Photo supprimée",
        description: "La photo a été supprimée avec succès"
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const deleteMatch = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce match ?")) return;

    try {
      const { error } = await supabase.from('matches').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Match supprimé",
        description: "Le match a été supprimé avec succès"
      });

      fetchAllData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-madrid-blue"></div>
      </div>
    );
  }

  // Check if we're in management mode
  if (selectedPlayer && managementMode) {
    return (
      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="mb-6">
          <Button 
            onClick={() => {
              setSelectedPlayer(null);
              setManagementMode(null);
            }}
            variant="outline"
            className="mb-4"
          >
            ← Retour à la liste
          </Button>
        </div>

        <Tabs value={managementMode} onValueChange={(value) => setManagementMode(value as 'stats' | 'media')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Statistiques</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Médias</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <PlayerStatsManager 
              playerId={selectedPlayer.id} 
              playerName={selectedPlayer.name} 
            />
          </TabsContent>

          <TabsContent value="media">
            <MediaManager 
              entityType="player" 
              entityId={selectedPlayer.id} 
              entityName={selectedPlayer.name} 
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (selectedCoach && managementMode) {
    return (
      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="mb-6">
          <Button 
            onClick={() => {
              setSelectedCoach(null);
              setManagementMode(null);
            }}
            variant="outline"
            className="mb-4"
          >
            ← Retour à la liste
          </Button>
        </div>

        <MediaManager 
          entityType="coach" 
          entityId={selectedCoach.id} 
          entityName={selectedCoach.name} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-madrid-blue">Administration</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out' : 'w-64 flex-shrink-0'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          bg-white shadow-lg lg:shadow-none border-r
        `}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-madrid-blue mb-6 hidden lg:block">Menu Admin</h2>
            <nav className="space-y-2">
              {[
                { id: "dashboard", label: "Tableau de bord", icon: BarChart3 },
                { id: "players", label: "Joueurs", icon: User },
                { id: "coaches", label: "Entraîneurs", icon: User },
                { id: "articles", label: "Articles", icon: Edit },
                { id: "videos", label: "Vidéos", icon: Video },
                { id: "photos", label: "Photos", icon: Camera },
                { id: "matches", label: "Matchs", icon: Trophy }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${activeTab === item.id 
                      ? 'bg-madrid-blue text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          {!isMobile && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-madrid-blue mb-2">Administration</h1>
              <p className="text-gray-600">Gérez votre contenu et votre équipe</p>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <QuickStatsCard
                playersCount={playersData.length}
                coachesCount={coachesData.length}
                articlesCount={articlesData.length}
                videosCount={videosData.length}
                matchesCount={matchesData.length}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Activité récente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Nouveau joueur ajouté</span>
                        <span className="text-xs text-gray-500 ml-auto">Il y a 2h</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Article publié</span>
                        <span className="text-xs text-gray-500 ml-auto">Il y a 4h</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Match programmé</span>
                        <span className="text-xs text-gray-500 ml-auto">Il y a 1j</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col"
                        onClick={() => setActiveTab("players")}
                      >
                        <User className="h-6 w-6 mb-2" />
                        <span className="text-xs">Ajouter joueur</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col"
                        onClick={() => setActiveTab("articles")}
                      >
                        <Edit className="h-6 w-6 mb-2" />
                        <span className="text-xs">Nouvel article</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col"
                        onClick={() => setActiveTab("matches")}
                      >
                        <Trophy className="h-6 w-6 mb-2" />
                        <span className="text-xs">Programmer match</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col"
                        onClick={() => setActiveTab("videos")}
                      >
                        <Video className="h-6 w-6 mb-2" />
                        <span className="text-xs">Ajouter vidéo</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "players" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter un joueur</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddPlayer} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="player-name">Nom*</Label>
                        <Input
                          id="player-name"
                          value={playerForm.name}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nom du joueur"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="player-position">Position*</Label>
                        <Select value={playerForm.position} onValueChange={(value) => setPlayerForm(prev => ({ ...prev, position: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Gardien">Gardien</SelectItem>
                            <SelectItem value="Défenseur">Défenseur</SelectItem>
                            <SelectItem value="Milieu">Milieu</SelectItem>
                            <SelectItem value="Attaquant">Attaquant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="player-jersey">Numéro de maillot</Label>
                        <Input
                          id="player-jersey"
                          type="number"
                          value={playerForm.jersey_number}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, jersey_number: e.target.value }))}
                          placeholder="10"
                        />
                      </div>

                      <div>
                        <Label htmlFor="player-nationality">Nationalité</Label>
                        <Input
                          id="player-nationality"
                          value={playerForm.nationality}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, nationality: e.target.value }))}
                          placeholder="France"
                        />
                      </div>

                      <div>
                        <Label htmlFor="player-age">Âge</Label>
                        <Input
                          id="player-age"
                          type="number"
                          value={playerForm.age}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, age: e.target.value }))}
                          placeholder="25"
                        />
                      </div>

                      <div>
                        <Label htmlFor="player-height">Taille</Label>
                        <Input
                          id="player-height"
                          value={playerForm.height}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, height: e.target.value }))}
                          placeholder="180 cm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="player-weight">Poids</Label>
                        <Input
                          id="player-weight"
                          value={playerForm.weight}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, weight: e.target.value }))}
                          placeholder="75 kg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="player-image">URL de l'image</Label>
                        <Input
                          id="player-image"
                          value={playerForm.image_url}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, image_url: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="player-profile-image">URL photo de profil</Label>
                        <Input
                          id="player-profile-image"
                          value={playerForm.profile_image_url}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, profile_image_url: e.target.value }))}
                          placeholder="https://example.com/profile.jpg"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="player-bio">Biographie courte</Label>
                        <Textarea
                          id="player-bio"
                          value={playerForm.bio}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Courte description du joueur"
                          rows={2}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="player-biography">Biographie complète</Label>
                        <Textarea
                          id="player-biography"
                          value={playerForm.biography}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, biography: e.target.value }))}
                          placeholder="Biographie détaillée du joueur"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="player-twitter">Twitter</Label>
                        <Input
                          id="player-twitter"
                          value={playerForm.social_media.twitter}
                          onChange={(e) => setPlayerForm(prev => ({ 
                            ...prev, 
                            social_media: { ...prev.social_media, twitter: e.target.value }
                          }))}
                          placeholder="@username"
                        />
                      </div>

                      <div>
                        <Label htmlFor="player-instagram">Instagram</Label>
                        <Input
                          id="player-instagram"
                          value={playerForm.social_media.instagram}
                          onChange={(e) => setPlayerForm(prev => ({ 
                            ...prev, 
                            social_media: { ...prev.social_media, instagram: e.target.value }
                          }))}
                          placeholder="@username"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="player-active"
                          checked={playerForm.is_active}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="player-active">Joueur actif</Label>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter le joueur
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Joueurs existants</CardTitle>
                </CardHeader>
                <CardContent>
                  {playersData.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Aucun joueur enregistré</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {playersData.map((player) => (
                        <div key={player.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg">{player.name}</h3>
                              <p className="text-sm text-madrid-blue font-medium">{player.position}</p>
                              {player.jersey_number && (
                                <p className="text-sm text-gray-500">N°{player.jersey_number}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <PlayerEditForm 
                                player={player} 
                                onPlayerUpdated={fetchAllData}
                              />
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedPlayer(player);
                                  setManagementMode('stats');
                                }}
                                title="Gérer les stats"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => deletePlayer(player.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {player.image_url && (
                            <img 
                              src={player.image_url} 
                              alt={player.name}
                              className="w-full h-32 object-cover rounded mb-3"
                            />
                          )}
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>{player.nationality} • {player.age} ans</p>
                            <p className="truncate">{player.bio}</p>
                          </div>
                          
                          <div className="mt-3 flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setSelectedPlayer(player);
                                setManagementMode('stats');
                              }}
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Stats
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setSelectedPlayer(player);
                                setManagementMode('media');
                              }}
                            >
                              <Camera className="h-3 w-3 mr-1" />
                              Médias
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "coaches" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter un coach</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddCoach} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="coach-name">Nom*</Label>
                        <Input
                          id="coach-name"
                          value={coachForm.name}
                          onChange={(e) => setCoachForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nom du coach"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="coach-role">Rôle*</Label>
                        <Select value={coachForm.role} onValueChange={(value) => setCoachForm(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entraîneur principal">Entraîneur principal</SelectItem>
                            <SelectItem value="Entraîneur adjoint">Entraîneur adjoint</SelectItem>
                            <SelectItem value="Entraîneur des gardiens">Entraîneur des gardiens</SelectItem>
                            <SelectItem value="Préparateur physique">Préparateur physique</SelectItem>
                            <SelectItem value="Analyste vidéo">Analyste vidéo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="coach-nationality">Nationalité</Label>
                        <Input
                          id="coach-nationality"
                          value={coachForm.nationality}
                          onChange={(e) => setCoachForm(prev => ({ ...prev, nationality: e.target.value }))}
                          placeholder="France"
                        />
                      </div>

                      <div>
                        <Label htmlFor="coach-age">Âge</Label>
                        <Input
                          id="coach-age"
                          type="number"
                          value={coachForm.age}
                          onChange={(e) => setCoachForm(prev => ({ ...prev, age: e.target.value }))}
                          placeholder="45"
                        />
                      </div>

                      <div>
                        <Label htmlFor="coach-experience">Années d'expérience</Label>
                        <Input
                          id="coach-experience"
                          type="number"
                          value={coachForm.experience_years}
                          onChange={(e) => setCoachForm(prev => ({ ...prev, experience_years: e.target.value }))}
                          placeholder="10"
                        />
                      </div>

                      <div>
                        <Label htmlFor="coach-image">URL de l'image</Label>
                        <Input
                          id="coach-image"
                          value={coachForm.image_url}
                          onChange={(e) => setCoachForm(prev => ({ ...prev, image_url: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="coach-profile-image">URL photo de profil</Label>
                        <Input
                          id="coach-profile-image"
                          value={coachForm.profile_image_url}
                          onChange={(e) => setCoachForm(prev => ({ ...prev, profile_image_url: e.target.value }))}
                          placeholder="https://example.com/profile.jpg"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="coach-bio">Biographie courte</Label>
                        <Textarea
                          id="coach-bio"
                          value={coachForm.bio}
                          onChange={(e) => setCoachForm(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Courte description du coach"
                          rows={2}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="coach-biography">Biographie complète</Label>
                        <Textarea
                          id="coach-biography"
                          value={coachForm.biography}
                          onChange={(e) => setCoachForm(prev => ({ ...prev, biography: e.target.value }))}
                          placeholder="Biographie détaillée du coach"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="coach-twitter">Twitter</Label>
                        <Input
                          id="coach-twitter"
                          value={coachForm.social_media.twitter}
                          onChange={(e) => setCoachForm(prev => ({ 
                            ...prev, 
                            social_media: { ...prev.social_media, twitter: e.target.value }
                          }))}
                          placeholder="@username"
                        />
                      </div>

                      <div>
                        <Label htmlFor="coach-instagram">Instagram</Label>
                        <Input
                          id="coach-instagram"
                          value={coachForm.social_media.instagram}
                          onChange={(e) => setCoachForm(prev => ({ 
                            ...prev, 
                            social_media: { ...prev.social_media, instagram: e.target.value }
                          }))}
                          placeholder="@username"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="coach-active"
                          checked={coachForm.is_active}
                          onChange={(e) => setCoachForm(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="coach-active">Coach actif</Label>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter le coach
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Entraîneurs existants</CardTitle>
                </CardHeader>
                <CardContent>
                  {coachesData.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Aucun entraîneur enregistré</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {coachesData.map((coach) => (
                        <div key={coach.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg">{coach.name}</h3>
                              <p className="text-sm text-madrid-blue font-medium">{coach.role}</p>
                            </div>
                            <div className="flex gap-1">
                              <CoachEditForm 
                                coach={coach} 
                                onCoachUpdated={fetchAllData}
                              />
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedCoach(coach);
                                  setManagementMode('media');
                                }}
                                title="Gérer les médias"
                              >
                                <Camera className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => deleteCoach(coach.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {coach.image_url && (
                            <img 
                              src={coach.image_url} 
                              alt={coach.name}
                              className="w-full h-32 object-cover rounded mb-3"
                            />
                          )}
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>{coach.nationality} • {coach.age} ans</p>
                            <p>{coach.experience_years} ans d'expérience</p>
                            <p className="truncate">{coach.bio}</p>
                          </div>
                          
                          <div className="mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                setSelectedCoach(coach);
                                setManagementMode('media');
                              }}
                            >
                              <Camera className="h-3 w-3 mr-1" />
                              Gérer médias
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "articles" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter un article</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddArticle} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="article-title">Titre*</Label>
                        <Input
                          id="article-title"
                          value={articleForm.title}
                          onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Titre de l'article"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="article-category">Catégorie*</Label>
                        <Select value={articleForm.category} onValueChange={(value) => setArticleForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Actualités">Actualités</SelectItem>
                            <SelectItem value="Match">Match</SelectItem>
                            <SelectItem value="Transfert">Transfert</SelectItem>
                            <SelectItem value="Interview">Interview</SelectItem>
                            <SelectItem value="Communiqué">Communiqué</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="article-description">Description*</Label>
                        <Textarea
                          id="article-description"
                          value={articleForm.description}
                          onChange={(e) => setArticleForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description courte de l'article"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="article-content">Contenu*</Label>
                        <Textarea
                          id="article-content"
                          value={articleForm.content}
                          onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Contenu complet de l'article"
                          rows={8}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="article-image">URL de l'image</Label>
                        <Input
                          id="article-image"
                          value={articleForm.image_url}
                          onChange={(e) => setArticleForm(prev => ({ ...prev, image_url: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="article-read-time">Temps de lecture</Label>
                        <Input
                          id="article-read-time"
                          value={articleForm.read_time}
                          onChange={(e) => setArticleForm(prev => ({ ...prev, read_time: e.target.value }))}
                          placeholder="5 min"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="article-published"
                            checked={articleForm.is_published}
                            onChange={(e) => setArticleForm(prev => ({ ...prev, is_published: e.target.checked }))}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="article-published">Publier</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="article-featured"
                            checked={articleForm.featured}
                            onChange={(e) => setArticleForm(prev => ({ ...prev, featured: e.target.checked }))}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="article-featured">Mettre en avant</Label>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter l'article
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Articles existants</CardTitle>
                </CardHeader>
                <CardContent>
                  {articlesData.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucun article enregistré</p>
                  ) : (
                    <div className="space-y-4">
                      {articlesData.map((article) => (
                        <div key={article.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{article.title}</h3>
                              <p className="text-sm text-gray-600">{article.category}</p>
                              <p className="text-xs text-gray-500">{article.read_time}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteArticle(article.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <p className="text-sm mb-2">{article.description}</p>
                          
                          <div className="flex flex-wrap gap-1">
                            {article.is_published && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Publié</span>
                            )}
                            {article.featured && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Mis en avant</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "videos" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter une vidéo</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddVideo} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="video-title">Titre*</Label>
                        <Input
                          id="video-title"
                          value={videoForm.title}
                          onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Titre de la vidéo"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="video-category">Catégorie</Label>
                        <Select value={videoForm.category} onValueChange={(value) => setVideoForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Match">Match</SelectItem>
                            <SelectItem value="Entraînement">Entraînement</SelectItem>
                            <SelectItem value="Interview">Interview</SelectItem>
                            <SelectItem value="Coulisses">Coulisses</SelectItem>
                            <SelectItem value="Résumé">Résumé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="video-description">Description</Label>
                        <Textarea
                          id="video-description"
                          value={videoForm.description}
                          onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description de la vidéo"
                        />
                      </div>

                      <div>
                        <Label htmlFor="video-url">URL de la vidéo*</Label>
                        <Input
                          id="video-url"
                          value={videoForm.video_url}
                          onChange={(e) => setVideoForm(prev => ({ ...prev, video_url: e.target.value }))}
                          placeholder="https://youtube.com/watch?v=..."
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="video-thumbnail">URL de la miniature</Label>
                        <Input
                          id="video-thumbnail"
                          value={videoForm.thumbnail_url}
                          onChange={(e) => setVideoForm(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                          placeholder="https://example.com/thumbnail.jpg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="video-duration">Durée (en secondes)</Label>
                        <Input
                          id="video-duration"
                          type="number"
                          value={videoForm.duration}
                          onChange={(e) => setVideoForm(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="180"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="video-published"
                          checked={videoForm.is_published}
                          onChange={(e) => setVideoForm(prev => ({ ...prev, is_published: e.target.checked }))}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="video-published">Publier</Label>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter la vidéo
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vidéos existantes</CardTitle>
                </CardHeader>
                <CardContent>
                  {videosData.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucune vidéo enregistrée</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videosData.map((video) => (
                        <div key={video.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{video.title}</h3>
                              <p className="text-sm text-gray-600">{video.category}</p>
                              {video.duration && (
                                <p className="text-xs text-gray-500">{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteVideo(video.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {video.thumbnail_url && (
                            <img 
                              src={video.thumbnail_url} 
                              alt={video.title}
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                          )}
                          
                          {video.description && (
                            <p className="text-xs text-gray-600 mb-2">{video.description}</p>
                          )}
                          
                          {video.is_published && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Publié</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "photos" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter une photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddPhoto} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="photo-title">Titre*</Label>
                        <Input
                          id="photo-title"
                          value={photoForm.title}
                          onChange={(e) => setPhotoForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Titre de la photo"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="photo-category">Catégorie</Label>
                        <Select value={photoForm.category} onValueChange={(value) => setPhotoForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Match">Match</SelectItem>
                            <SelectItem value="Entraînement">Entraînement</SelectItem>
                            <SelectItem value="Portrait">Portrait</SelectItem>
                            <SelectItem value="Événement">Événement</SelectItem>
                            <SelectItem value="Coulisses">Coulisses</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="photo-description">Description</Label>
                        <Textarea
                          id="photo-description"
                          value={photoForm.description}
                          onChange={(e) => setPhotoForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description de la photo"
                        />
                      </div>

                      <div>
                        <Label htmlFor="photo-url">URL de la photo*</Label>
                        <Input
                          id="photo-url"
                          value={photoForm.image_url}
                          onChange={(e) => setPhotoForm(prev => ({ ...prev, image_url: e.target.value }))}
                          placeholder="https://example.com/photo.jpg"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="photo-photographer">Photographe</Label>
                        <Input
                          id="photo-photographer"
                          value={photoForm.photographer}
                          onChange={(e) => setPhotoForm(prev => ({ ...prev, photographer: e.target.value }))}
                          placeholder="Nom du photographe"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="photo-published"
                          checked={photoForm.is_published}
                          onChange={(e) => setPhotoForm(prev => ({ ...prev, is_published: e.target.checked }))}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="photo-published">Publier</Label>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter la photo
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Photos existantes</CardTitle>
                </CardHeader>
                <CardContent>
                  {photosData.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucune photo enregistrée</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {photosData.map((photo) => (
                        <div key={photo.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{photo.title}</h3>
                              <p className="text-sm text-gray-600">{photo.category}</p>
                              {photo.photographer && (
                                <p className="text-xs text-gray-500">par {photo.photographer}</p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deletePhoto(photo.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <img 
                            src={photo.image_url} 
                            alt={photo.title}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                          
                          {photo.description && (
                            <p className="text-xs text-gray-600 mb-2">{photo.description}</p>
                          )}
                          
                          {photo.is_published && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Publié</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "matches" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter un match</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddMatch} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="match-home">Équipe à domicile*</Label>
                        <Input
                          id="match-home"
                          value={matchForm.home_team}
                          onChange={(e) => setMatchForm(prev => ({ ...prev, home_team: e.target.value }))}
                          placeholder="Real Madrid"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="match-away">Équipe à l'extérieur*</Label>
                        <Input
                          id="match-away"
                          value={matchForm.away_team}
                          onChange={(e) => setMatchForm(prev => ({ ...prev, away_team: e.target.value }))}
                          placeholder="FC Barcelona"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="match-date">Date du match*</Label>
                        <Input
                          id="match-date"
                          type="datetime-local"
                          value={matchForm.match_date}
                          onChange={(e) => setMatchForm(prev => ({ ...prev, match_date: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="match-venue">Lieu</Label>
                        <Input
                          id="match-venue"
                          value={matchForm.venue}
                          onChange={(e) => setMatchForm(prev => ({ ...prev, venue: e.target.value }))}
                          placeholder="Santiago Bernabéu"
                        />
                      </div>

                      <div>
                        <Label htmlFor="match-competition">Compétition</Label>
                        <Select value={matchForm.competition} onValueChange={(value) => setMatchForm(prev => ({ ...prev, competition: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une compétition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="La Liga">La Liga</SelectItem>
                            <SelectItem value="Champions League">Champions League</SelectItem>
                            <SelectItem value="Copa del Rey">Copa del Rey</SelectItem>
                            <SelectItem value="Supercoupe">Supercoupe</SelectItem>
                            <SelectItem value="Amical">Amical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="match-status">Statut</Label>
                        <Select value={matchForm.status} onValueChange={(value) => setMatchForm(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">À venir</SelectItem>
                            <SelectItem value="live">En cours</SelectItem>
                            <SelectItem value="finished">Terminé</SelectItem>
                            <SelectItem value="postponed">Reporté</SelectItem>
                            <SelectItem value="cancelled">Annulé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="match-home-score">Score à domicile</Label>
                        <Input
                          id="match-home-score"
                          type="number"
                          value={matchForm.home_score}
                          onChange={(e) => setMatchForm(prev => ({ ...prev, home_score: e.target.value }))}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="match-away-score">Score à l'extérieur</Label>
                        <Input
                          id="match-away-score"
                          type="number"
                          value={matchForm.away_score}
                          onChange={(e) => setMatchForm(prev => ({ ...prev, away_score: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter le match
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Matchs existants</CardTitle>
                </CardHeader>
                <CardContent>
                  {matchesData.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucun match enregistré</p>
                  ) : (
                    <div className="space-y-4">
                      {matchesData.map((match) => (
                        <div key={match.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{match.home_team} vs {match.away_team}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(match.match_date).toLocaleDateString()} à {new Date(match.match_date).toLocaleTimeString()}
                              </p>
                              <p className="text-xs text-gray-500">{match.venue} • {match.competition}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteMatch(match.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {match.home_score !== null && match.away_score !== null && (
                              <div className="text-lg font-bold">
                                {match.home_score} - {match.away_score}
                              </div>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              match.status === 'finished' ? 'bg-green-100 text-green-800' :
                              match.status === 'live' ? 'bg-red-100 text-red-800' :
                              match.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {match.status === 'finished' ? 'Terminé' :
                               match.status === 'live' ? 'En cours' :
                               match.status === 'upcoming' ? 'À venir' :
                               match.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

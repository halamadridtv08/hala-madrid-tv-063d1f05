import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/SEOHead';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Heart, User, Newspaper, Calendar, Shirt, Video, Loader2, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface FavoriteItem {
  id: string;
  name: string;
  image?: string;
  link: string;
  subtitle?: string;
}

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favorites, isLoading } = useFavorites();
  const [players, setPlayers] = useState<FavoriteItem[]>([]);
  const [articles, setArticles] = useState<FavoriteItem[]>([]);
  const [matches, setMatches] = useState<FavoriteItem[]>([]);
  const [kits, setKits] = useState<FavoriteItem[]>([]);
  const [videos, setVideos] = useState<FavoriteItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (favorites.length === 0) return;
      
      setLoadingDetails(true);
      
      // Group favorites by type
      const playerIds = favorites.filter(f => f.entity_type === 'player').map(f => f.entity_id);
      const articleIds = favorites.filter(f => f.entity_type === 'article').map(f => f.entity_id);
      const matchIds = favorites.filter(f => f.entity_type === 'match').map(f => f.entity_id);
      const kitIds = favorites.filter(f => f.entity_type === 'kit').map(f => f.entity_id);
      const videoIds = favorites.filter(f => f.entity_type === 'video').map(f => f.entity_id);

      // Fetch all data in parallel
      const [playersRes, articlesRes, matchesRes, kitsRes, videosRes] = await Promise.all([
        playerIds.length > 0 ? supabase.from('players').select('id, name, image_url, position').in('id', playerIds) : null,
        articleIds.length > 0 ? supabase.from('articles').select('id, title, thumbnail_url, category').in('id', articleIds) : null,
        matchIds.length > 0 ? supabase.from('matches').select('id, home_team, away_team, match_date, competition').in('id', matchIds) : null,
        kitIds.length > 0 ? supabase.from('kits').select('id, title, image_url, type').in('id', kitIds) : null,
        videoIds.length > 0 ? supabase.from('youtube_videos').select('id, title, thumbnail_url').in('id', videoIds) : null,
      ]);

      setPlayers((playersRes?.data || []).map(p => ({
        id: p.id,
        name: p.name,
        image: p.image_url,
        link: `/players/${p.id}`,
        subtitle: p.position
      })));

      setArticles((articlesRes?.data || []).map(a => ({
        id: a.id,
        name: a.title,
        image: a.thumbnail_url,
        link: `/news/${a.id}`,
        subtitle: a.category
      })));

      setMatches((matchesRes?.data || []).map(m => ({
        id: m.id,
        name: `${m.home_team} vs ${m.away_team}`,
        link: `/matches`,
        subtitle: m.competition
      })));

      setKits((kitsRes?.data || []).map(k => ({
        id: k.id,
        name: k.title,
        image: k.image_url,
        link: `/kits`,
        subtitle: k.type
      })));

      setVideos((videosRes?.data || []).map(v => ({
        id: v.id,
        name: v.title,
        image: v.thumbnail_url,
        link: `/videos`,
      })));

      setLoadingDetails(false);
    };

    fetchDetails();
  }, [favorites]);

  const renderFavoriteList = (items: FavoriteItem[], emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map(item => (
          <Link key={item.id} to={item.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                      <Heart className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    {item.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead 
          title="Mes Favoris" 
          description="Connectez-vous pour accéder à vos favoris" 
          url="/favorites"
          noIndex
        />
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-primary" />
              <CardTitle>Connexion requise</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Connectez-vous pour sauvegarder vos joueurs, articles et matchs préférés.
              </p>
              <Button onClick={() => navigate('/auth')} className="gap-2">
                <LogIn className="h-4 w-4" />
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title="Mes Favoris" 
        description="Gérez vos joueurs, articles et matchs favoris du Real Madrid" 
        url="/favorites"
        noIndex
      />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            Mes Favoris
          </h1>
          <p className="text-muted-foreground mt-2">
            {favorites.length} élément{favorites.length !== 1 ? 's' : ''} sauvegardé{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>

        {isLoading || loadingDetails ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="players" className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="players" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Joueurs</span>
                <span className="sm:hidden">{players.length}</span>
              </TabsTrigger>
              <TabsTrigger value="articles" className="gap-2">
                <Newspaper className="h-4 w-4" />
                <span className="hidden sm:inline">Articles</span>
                <span className="sm:hidden">{articles.length}</span>
              </TabsTrigger>
              <TabsTrigger value="matches" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Matchs</span>
                <span className="sm:hidden">{matches.length}</span>
              </TabsTrigger>
              <TabsTrigger value="kits" className="gap-2">
                <Shirt className="h-4 w-4" />
                <span className="hidden sm:inline">Maillots</span>
                <span className="sm:hidden">{kits.length}</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Vidéos</span>
                <span className="sm:hidden">{videos.length}</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="players">
                {renderFavoriteList(players, "Aucun joueur favori. Explorez les joueurs et ajoutez-les à vos favoris !")}
              </TabsContent>
              <TabsContent value="articles">
                {renderFavoriteList(articles, "Aucun article favori. Découvrez les actualités et sauvegardez vos articles préférés !")}
              </TabsContent>
              <TabsContent value="matches">
                {renderFavoriteList(matches, "Aucun match favori. Suivez les matchs et ajoutez-les à vos favoris !")}
              </TabsContent>
              <TabsContent value="kits">
                {renderFavoriteList(kits, "Aucun maillot favori. Parcourez la collection et sauvegardez vos préférés !")}
              </TabsContent>
              <TabsContent value="videos">
                {renderFavoriteList(videos, "Aucune vidéo favorite. Regardez nos vidéos et ajoutez-les à vos favoris !")}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </main>

      <Footer />
    </div>
  );
}

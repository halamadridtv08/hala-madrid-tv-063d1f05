
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { User, Calendar, Image, Video, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PhotoType } from "@/types/Photo";
import { VideoType } from "@/types/Video";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string | null;
  category: string;
  published_at: string;
  read_time: string | null;
}

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (!id) return;
        
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setArticle(data);
      } catch (error: any) {
        console.error('Error fetching article:', error);
        toast({
          variant: "destructive",
          title: "Article non trouvé",
          description: "L'article demandé n'existe pas ou n'est pas disponible"
        });
      } finally {
        setLoading(false);
      }
    };
    
    const fetchMedia = async () => {
      try {
        // Récupérer les photos publiées
        const { data: photosData, error: photosError } = await supabase
          .from('photos')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(8);

        if (photosError) throw photosError;
        setPhotos(photosData || []);

        // Récupérer les vidéos publiées
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(4);

        if (videosError) throw videosError;
        setVideos(videosData || []);
      } catch (error: any) {
        console.error('Error fetching media:', error);
      } finally {
        setMediaLoading(false);
      }
    };
    
    fetchArticle();
    fetchMedia();
  }, [id, toast]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "match": return "bg-green-600";
      case "joueur": return "bg-blue-600";
      case "conférence": return "bg-purple-600";
      case "mercato": return "bg-orange-600";
      case "hommage": return "bg-red-600";
      case "formation": return "bg-teal-600";
      case "info": return "bg-yellow-600";
      default: return "bg-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main>
          <div className="madrid-container py-8">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-[400px] w-full mb-8" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-8" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Navbar />
        <main>
          <div className="madrid-container py-20 text-center">
            <h1 className="text-3xl font-bold mb-4">Article non trouvé</h1>
            <p className="text-gray-500 mb-8">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Fonction pour rendre en toute sécurité le contenu HTML
  const renderContent = () => {
    // Fonction pour convertir les sauts de ligne en paragraphes, tout en conservant les balises HTML
    const formatContent = (content: string) => {
      // Si le contenu contient déjà des balises HTML (comme des vidéos ou des images), ne pas les modifier
      if (content.includes('<video') || content.includes('<img')) {
        return { __html: content };
      }
      
      // Sinon, convertir les sauts de ligne en paragraphes
      return {
        __html: content
          .split('\n')
          .filter(paragraph => paragraph.trim() !== '')
          .map(paragraph => `<p>${paragraph}</p>`)
          .join('')
      };
    };
    
    return <div dangerouslySetInnerHTML={formatContent(article.content)} />;
  };

  return (
    <>
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          <div className="mb-8">
            <Badge className={`${getCategoryColor(article.category)} mb-4`}>
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </Badge>
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">{article.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>Administrateur</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(article.published_at)}</span>
              </div>
              {article.read_time && (
                <div className="flex items-center">
                  <span>{article.read_time} de lecture</span>
                </div>
              )}
            </div>
          </div>
          
          {article.image_url && (
            <div className="mb-8">
              <img 
                src={article.image_url} 
                alt={article.title}
                className="w-full h-auto max-h-[500px] object-cover object-center rounded-lg"
              />
            </div>
          )}
          
          <Card className="mb-12">
            <CardContent className="p-6 sm:p-8">
              <div className="prose dark:prose-invert max-w-none">
                {renderContent()}
              </div>
            </CardContent>
          </Card>

          {/* Galerie d'actualités */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2">
                <Image className="h-6 w-6 text-madrid-blue" />
                <Video className="h-6 w-6 text-madrid-blue" />
              </div>
              <h2 className="text-2xl font-bold">Galerie d'Actualités</h2>
            </div>
            
            {mediaLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {/* Photos */}
                {photos.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Photos Récentes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {photos.map((photo) => (
                        <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                          <div className="relative">
                            <img
                              src={photo.image_url}
                              alt={photo.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button variant="secondary" size="sm">
                                Voir
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm line-clamp-2">{photo.title}</h4>
                            {photo.category && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                {photo.category}
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vidéos */}
                {videos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Vidéos Récentes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {videos.map((video) => (
                        <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                          <div className="relative">
                            {video.thumbnail_url ? (
                              <img
                                src={video.thumbnail_url}
                                alt={video.title}
                                className="w-full h-48 object-cover"
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                <Video className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play className="h-8 w-8 text-madrid-blue ml-1" />
                              </div>
                            </div>
                            {video.duration && (
                              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-medium line-clamp-2 mb-2">{video.title}</h4>
                            {video.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                {video.description}
                              </p>
                            )}
                            {video.category && (
                              <Badge variant="outline" className="text-xs">
                                {video.category}
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {photos.length === 0 && videos.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Image className="h-8 w-8" />
                      <Video className="h-8 w-8" />
                    </div>
                    <p>Aucun média disponible pour le moment.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ArticleDetail;

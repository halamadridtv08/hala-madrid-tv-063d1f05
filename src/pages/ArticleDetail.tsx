
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Article, ArticleImage } from "@/types/Article";
import { VideoPlayer } from "@/components/article/VideoPlayer";
import { ImageGallery } from "@/components/article/ImageGallery";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [images, setImages] = useState<ArticleImage[]>([]);
  const [loading, setLoading] = useState(true);
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
    
    const fetchImages = async () => {
      try {
        if (!id) return;
        
        const { data, error } = await supabase
          .from('article_images')
          .select('*')
          .eq('article_id', id)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setImages(data || []);
      } catch (error: any) {
        console.error('Error fetching images:', error);
      }
    };
    
    fetchArticle();
    fetchImages();
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
          <div className="max-w-4xl mx-auto px-6 py-8">
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
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h1 className="text-3xl font-bold mb-4">Article non trouvé</h1>
            <p className="text-gray-500 mb-8">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Fonction pour rendre le contenu avec formatage
  const renderContent = () => {
    if (!article.content) return null;
    
    let formattedContent = article.content
      // Gras
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<strong>$1</strong>')
      // Italique
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // Titres H2
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
      // Titres H3
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
      // Listes à puces
      .replace(/^- (.+)$/gm, '<li class="ml-6">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ul class="list-disc space-y-1 my-3">$1</ul>')
      // Paragraphes
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p && !p.startsWith('<'))
      .map(p => `<p class="mb-4 leading-relaxed">${p}</p>`)
      .join('');
    
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* En-tête de l'article */}
          <div className="mb-8">
            <Badge className={`${getCategoryColor(article.category)} mb-4`}>
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{article.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
          
          {/* Section Texte */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12 bg-card p-8 rounded-lg shadow-sm">
            {renderContent()}
          </div>

          {/* Section Vidéo */}
          {article.video_url && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Vidéo</h2>
              <VideoPlayer videoUrl={article.video_url} />
            </div>
          )}

          {/* Galerie d'images */}
          {images.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Galerie d'images</h2>
              <ImageGallery images={images} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ArticleDetail;

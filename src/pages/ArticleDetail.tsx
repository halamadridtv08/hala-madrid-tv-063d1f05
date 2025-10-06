import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VideoPlayer } from "@/components/article/VideoPlayer";
import { ImageGallery } from "@/components/article/ImageGallery";
import { Article, ArticleImage } from "@/types/Article";
import ReactMarkdown from 'react-markdown';

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

        // Fetch images for the article
        const { data: imagesData, error: imagesError } = await supabase
          .from('article_images')
          .select('*')
          .eq('article_id', id)
          .order('display_order', { ascending: true });

        if (imagesError) throw imagesError;
        setImages(imagesData || []);
      } catch (error: any) {
        console.error('Error fetching article:', error);
        toast({
          variant: "destructive",
          title: "Article non trouvé",
          description: "L'article demandé n'existe pas ou n'est pas disponible",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, toast]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "match":
        return "bg-green-600";
      case "joueur":
        return "bg-blue-600";
      case "conférence":
        return "bg-purple-600";
      case "mercato":
        return "bg-orange-600";
      case "hommage":
        return "bg-red-600";
      case "formation":
        return "bg-teal-600";
      case "info":
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
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
        <main className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h1 className="text-3xl font-bold mb-4">Article non trouvé</h1>
            <p className="text-muted-foreground mb-8">
              L'article que vous recherchez n'existe pas ou a été supprimé.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* En-tête de l'article */}
          <div className="mb-8 animate-fade-in">
            <Badge className={`${getCategoryColor(article.category)} mb-4`}>
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </Badge>
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">{article.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
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

          {/* 1. Section Texte - Contenu de l'article avec formatage */}
          <Card className="mb-8 animate-fade-in">
            <CardContent className="p-6 sm:p-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                    em: ({ node, ...props }) => <em className="italic" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                    li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* 2. Section Vidéo - Juste après le texte */}
          {article.video_url && <VideoPlayer videoUrl={article.video_url} />}

          {/* 3. Galerie d'images - Après la vidéo */}
          {images.length > 0 && <ImageGallery images={images} />}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ArticleDetail;
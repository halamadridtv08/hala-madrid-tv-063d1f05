import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/SEOHead";
import { LatestNewsWidget } from "@/components/home/LatestNewsWidget";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArticleVideoPlayer } from "@/components/articles/ArticleVideoPlayer";
import { ArticleImageGallery } from "@/components/articles/ArticleImageGallery";
import { ArticleComments } from "@/components/articles/ArticleComments";
import { ArticlePoll } from "@/components/articles/ArticlePoll";
import { ArticleQuiz } from "@/components/articles/ArticleQuiz";
import { ArticleTweets } from "@/components/articles/ArticleTweets";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { ArticleAds } from "@/components/articles/ArticleAds";
import { ArticleReactions } from "@/components/articles/ArticleReactions";
import { DynamicBreadcrumb } from "@/components/common/DynamicBreadcrumb";
import { ShareModal } from "@/components/common/ShareModal";
import DOMPurify from "dompurify";
import { stripHtml } from "@/utils/stripHtml";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  category: string;
  published_at: string;
  read_time: string | null;
}

interface ArticleImage {
  id: string;
  image_url: string;
  display_order: number;
}
const ArticleDetail = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [articleImages, setArticleImages] = useState<ArticleImage[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (!id) return;
        const {
          data,
          error
        } = await supabase.from('articles').select('*').eq('id', id).single();
        if (error) throw error;
        setArticle(data);
        
        // Increment view count (fire and forget)
        supabase
          .from('articles')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id)
          .then(() => {});
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

    const fetchArticleImages = async () => {
      try {
        if (!id) return;
        const { data, error } = await supabase
          .from('article_images')
          .select('*')
          .eq('article_id', id)
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        setArticleImages(data || []);
      } catch (error: any) {
        console.error('Error fetching article images:', error);
      }
    };

    fetchArticle();
    fetchArticleImages();
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
      year: 'numeric'
    }).format(date);
  };
  if (loading) {
    return <>
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
      </>;
  }
  if (!article) {
    return <>
        <Navbar />
        <main>
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h1 className="text-3xl font-bold mb-4">Article non trouvé</h1>
            <p className="text-gray-500 mb-8">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
          </div>
        </main>
        <Footer />
      </>;
  }

  // Fonction pour rendre en toute sécurité le contenu HTML
  const renderContent = () => {
    // Fonction pour convertir les sauts de ligne en paragraphes, tout en conservant les balises HTML
    const formatContent = (content: string) => {
      let formattedContent: string;
      
      // Si le contenu contient déjà des balises HTML (comme des vidéos ou des images), ne pas les modifier
      if (content.includes('<video') || content.includes('<img') || content.includes('<iframe')) {
        formattedContent = content;
      } else {
        // Sinon, convertir les sauts de ligne en paragraphes
        formattedContent = content.split('\n\n')
          .filter(paragraph => paragraph.trim() !== '')
          .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
          .join('');
      }

      // Sanitize the HTML to prevent XSS attacks
      const sanitized = DOMPurify.sanitize(formattedContent, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'video', 'iframe', 'blockquote', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'section'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'width', 'height', 'controls', 'class', 'target', 'rel', 'style', 'frameborder', 'allow', 'allowfullscreen', 'scrolling', 'allowtransparency', 'data-theme', 'cite', 'data-video-id']
      });
      
      return {
        __html: sanitized
      };
    };
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={formatContent(article.content)} />;
  };
  return <>
      <SEOHead 
        title={article.title}
        description={stripHtml(article.description).slice(0, 160)}
        image={article.image_url || undefined}
        url={`/news/${id}`}
        type="article"
        publishedTime={article.published_at}
        section={article.category}
        tags={[article.category, 'Real Madrid', 'Football']}
      />
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          {/* Breadcrumb */}
          <DynamicBreadcrumb 
            customTitle={article.title} 
            className="mb-6"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu de l'article */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                  <Badge className={`${getCategoryColor(article.category)}`}>
                    {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                  </Badge>
                  <ShareModal 
                    title={article.title}
                    description={stripHtml(article.description).slice(0, 160)}
                    url={typeof window !== "undefined" ? window.location.href : undefined}
                  />
                </div>
                <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
                <div 
                  className="text-xl text-muted-foreground mb-4 prose dark:prose-invert max-w-none" 
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(article.description, {
                      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'img', 'video', 'iframe', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
                      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'width', 'height', 'controls', 'class', 'target', 'rel', 'style', 'frameborder', 'allow', 'allowfullscreen', 'scrolling', 'allowtransparency']
                    })
                  }}
                />
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>Administrateur</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  {article.read_time && <div className="flex items-center">
                      <span>{article.read_time} de lecture</span>
                    </div>}
                </div>
              </div>
              
              {article.image_url && <div className="mb-8">
                  <img src={article.image_url} alt={article.title} className="w-full h-auto max-h-[500px] object-cover object-center rounded-lg" />
                </div>}
              
              <div className="mb-12">
                {renderContent()}
              </div>

              {/* Inline Ads - Dans l'article */}
              <ArticleAds position="inline" />

              {/* Article Reactions */}
              <ArticleReactions articleId={id!} className="border-t border-b border-border my-8" />

              {article.video_url && (
                <ArticleVideoPlayer videoUrl={article.video_url} />
              )}

              {articleImages.length > 0 && (
                <ArticleImageGallery images={articleImages} />
              )}

              {/* Interactive Sections */}
              <div className="mt-12 space-y-8">
                {/* Poll */}
                <ArticlePoll articleId={id!} />

                {/* Quiz */}
                <ArticleQuiz articleId={id!} />

                {/* Tweets */}
                <ArticleTweets articleId={id!} />

                {/* Comments */}
                <ArticleComments articleId={id!} />
              </div>

              {/* Bottom Ads - Bas de l'article */}
              <ArticleAds position="bottom" />
            </div>

            {/* Widget des dernières infos */}
            <div className="lg:col-span-1">
              <LatestNewsWidget />
              <ArticleAds position="sidebar" />
            </div>
          </div>

          {/* Related Articles Section */}
          <RelatedArticles currentArticleId={id!} category={article.category} />
        </div>
      </main>
      <Footer />
    </>;
};
export default ArticleDetail;
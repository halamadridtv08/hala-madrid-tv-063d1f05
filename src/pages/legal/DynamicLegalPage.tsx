import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/SEOHead";

export default function DynamicLegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Try to find by URL first
      const urlToSearch = `/${slug}`;
      const { data } = await supabase
        .from("footer_links")
        .select("content, title")
        .eq("url", urlToSearch)
        .eq("link_type", "internal")
        .single();
      
      if (data?.content) {
        setContent(data.content);
        setTitle(data.title);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };
    fetchContent();
  }, [slug]);

  if (notFound && !loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 madrid-container py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Page non trouvée</h1>
            <p className="text-muted-foreground">Cette page n'existe pas ou n'a pas encore de contenu.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead 
        title={title || "Page légale"}
        description={`${title} - HALA MADRID TV`}
      />
      <Navbar />
      <main className="flex-1 madrid-container py-12">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ) : (
            <>
              {title && <h1 className="text-3xl font-bold text-foreground mb-8">{title}</h1>}
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(content, {
                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'div', 'span'],
                    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
                  })
                }}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

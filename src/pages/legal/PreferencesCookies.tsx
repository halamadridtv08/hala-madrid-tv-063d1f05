import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PreferencesCookies() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("footer_links")
        .select("content")
        .eq("title", "Préférences cookies")
        .single();
      
      if (data?.content) {
        setContent(data.content);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(content, {
                  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'div', 'span'],
                  ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
                })
              }}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

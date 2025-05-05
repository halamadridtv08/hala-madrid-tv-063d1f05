
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArticleList } from "@/components/admin/ArticleList";
import { ArticleForm } from "@/components/admin/ArticleForm";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string | null;
  category: string;
  published_at: string;
  is_published: boolean;
  read_time: string | null;
  featured: boolean;
}

const Admin = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentTab, setCurrentTab] = useState("articles");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les articles"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setCurrentTab("create");
  };

  const handleNewArticle = () => {
    setEditingArticle(null);
    setCurrentTab("create");
  };

  const handleFormCancel = () => {
    setEditingArticle(null);
    setCurrentTab("articles");
  };

  const handleFormSuccess = () => {
    setEditingArticle(null);
    fetchArticles();
    setCurrentTab("articles");
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="madrid-container py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
          </div>
          
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="create">Créer / Modifier</TabsTrigger>
            </TabsList>
            
            <TabsContent value="articles">
              <ArticleList 
                articles={articles}
                loading={loading}
                onNewArticle={handleNewArticle}
                onEditArticle={handleEdit}
                refetchArticles={fetchArticles}
              />
            </TabsContent>
            
            <TabsContent value="create">
              <ArticleForm
                editingArticle={editingArticle}
                onCancel={handleFormCancel}
                onSuccess={handleFormSuccess}
                userId={user?.id}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
};

export default Admin;

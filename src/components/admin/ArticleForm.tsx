
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Article } from "@/types/Article";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ArticleFormProps {
  article?: Article;
  onSuccess: () => void;
  onCancel: () => void;
  defaultCategory?: string;
}

export const ArticleForm = ({ article, onSuccess, onCancel, defaultCategory }: ArticleFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: article?.title || "",
    description: article?.description || "",
    content: article?.content || "",
    image_url: article?.image_url || "",
    category: article?.category || defaultCategory || "",
    is_published: article?.is_published || false,
    featured: article?.featured || false,
    read_time: article?.read_time || "",
    author_id: article?.author_id || user?.id || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("Vous devez être connecté pour créer un article");
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        author_id: user.id // S'assurer que l'author_id est bien l'ID de l'utilisateur connecté
      };

      if (article?.id) {
        // Update existing article
        const { error } = await supabase
          .from('articles')
          .update(dataToSubmit)
          .eq('id', article.id);

        if (error) throw error;
        toast.success("Article mis à jour avec succès");
      } else {
        // Create new article
        const { error } = await supabase
          .from('articles')
          .insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Article créé avec succès");
      }

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'enregistrement de l'article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {article ? "Modifier l'article" : "Nouvel article"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="content">Contenu</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="min-h-[200px]"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="image_url">URL de l'image</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="read_time">Temps de lecture</Label>
            <Input
              id="read_time"
              value={formData.read_time}
              onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
              placeholder="Ex: 5 min"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              />
              <Label htmlFor="is_published">Publié</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              <Label htmlFor="featured">À la une</Label>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

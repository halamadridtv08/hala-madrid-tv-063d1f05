import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";
import type { ArticleComment } from "@/types/ArticleEngagement";

interface ArticleCommentsProps {
  articleId: string;
}

export const ArticleComments = ({ articleId }: ArticleCommentsProps) => {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("article_comments")
      .select("*")
      .eq("article_id", articleId)
      .eq("is_approved", true)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("article_comments").insert({
      article_id: articleId,
      user_name: userName,
      user_email: userEmail,
      content: content,
      is_approved: false,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter votre commentaire",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Commentaire envoyé",
        description: "Votre commentaire est en attente de modération",
      });
      setUserName("");
      setUserEmail("");
      setContent("");
    }

    setLoading(false);
  };

  return (
    <Card className="p-6 mt-8">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        Commentaires ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Votre nom *"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Votre email (optionnel)"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
        </div>
        <Textarea
          placeholder="Votre commentaire *"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Envoyer le commentaire"}
        </Button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border-l-4 border-primary pl-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{comment.user_name}</span>
              <span className="text-sm text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <p className="text-foreground">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Soyez le premier à commenter cet article
          </p>
        )}
      </div>
    </Card>
  );
};

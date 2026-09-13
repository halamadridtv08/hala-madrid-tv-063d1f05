import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import type { ArticleComment } from "@/types/ArticleEngagement";

interface CommentWithEmail extends ArticleComment {
  user_email?: string;
}

interface CommentsManagerProps {
  articleId: string;
}

export const CommentsManager = ({ articleId }: CommentsManagerProps) => {
  const [comments, setComments] = useState<CommentWithEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    // Use the secure function that only allows admins to see emails
    const { data, error } = await supabase.rpc("get_article_comments_with_emails", {
      p_article_id: articleId,
    });

    if (!error && data) {
      setComments(data);
    }
  };

  const handleVisibility = async (commentId: string, visible: boolean) => {
    setLoading(true);
    const { error } = await supabase
      .from("article_comments")
      .update({ is_published: visible, is_flagged: false, flagged_reason: null })
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la visibilité du commentaire",
        variant: "destructive",
      });
    } else {
      toast({ title: visible ? "Commentaire affiché" : "Commentaire masqué" });
      fetchComments();
    }
    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("article_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commentaire",
        variant: "destructive",
      });
    } else {
      toast({ title: "Commentaire supprimé" });
      fetchComments();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 mt-6">
      {comments.map((comment) => (
        <div key={comment.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{comment.user_name}</span>
                {comment.is_flagged ? (
                  <Badge variant="destructive">Signalé</Badge>
                ) : comment.is_published ? (
                  <Badge variant="default">Visible</Badge>
                ) : (
                  <Badge variant="secondary">Masqué</Badge>
                )}
              </div>
              {comment.user_email && (
                <p className="text-sm text-muted-foreground">{comment.user_email}</p>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(comment.created_at).toLocaleDateString("fr-FR")}
            </span>
          </div>
          
          <p className="text-foreground">{comment.content}</p>
          {comment.flagged_reason && <p className="text-sm text-destructive">Mot détecté : {comment.flagged_reason}</p>}

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleVisibility(comment.id, !comment.is_published)} disabled={loading}>
              {comment.is_published ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {comment.is_published ? "Masquer" : "Afficher"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(comment.id)}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Supprimer
            </Button>
          </div>
        </div>
      ))}
      
      {comments.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Aucun commentaire pour cet article
        </p>
      )}
    </div>
  );
};

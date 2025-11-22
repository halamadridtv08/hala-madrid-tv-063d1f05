import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Check, X, Trash2 } from "lucide-react";
import type { ArticleComment } from "@/types/ArticleEngagement";

interface CommentsManagerProps {
  articleId: string;
}

export const CommentsManager = ({ articleId }: CommentsManagerProps) => {
  const [comments, setComments] = useState<ArticleComment[]>([]);
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
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComments(data);
    }
  };

  const handleApprove = async (commentId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("article_comments")
      .update({ is_approved: true })
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le commentaire",
        variant: "destructive",
      });
    } else {
      toast({ title: "Commentaire approuvé" });
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
                {comment.is_approved ? (
                  <Badge variant="default">Approuvé</Badge>
                ) : (
                  <Badge variant="secondary">En attente</Badge>
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

          <div className="flex gap-2">
            {!comment.is_approved && (
              <Button
                size="sm"
                onClick={() => handleApprove(comment.id)}
                disabled={loading}
              >
                <Check className="w-4 h-4 mr-1" />
                Approuver
              </Button>
            )}
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

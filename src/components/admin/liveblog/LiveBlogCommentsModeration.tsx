import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageSquare, Pin, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLiveBlogComments } from '@/hooks/useLiveBlogSocial';
import { cn } from '@/lib/utils';

interface LiveBlogCommentsModerationProps {
  matchId: string;
}

export const LiveBlogCommentsModeration = ({ matchId }: LiveBlogCommentsModerationProps) => {
  const { comments, loading, deleteComment, setHidden, setPinned } = useLiveBlogComments(
    matchId,
    true
  );
  const { toast } = useToast();

  const run = async (fn: () => Promise<void>, title: string) => {
    try {
      await fn();
      toast({ title });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Modération des commentaires ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Chargement...</p>
        ) : comments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucun commentaire sur ce match
          </p>
        ) : (
          <div className="space-y-2">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  'rounded-lg border p-3',
                  comment.is_hidden && 'opacity-60',
                  comment.is_pinned && 'border-primary/50 bg-primary/5'
                )}
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{comment.display_name}</span>
                  {comment.is_pinned && <Badge variant="secondary">Épinglé</Badge>}
                  {comment.is_hidden && <Badge variant="outline">Masqué</Badge>}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      run(
                        () => setPinned(comment.id, !comment.is_pinned),
                        comment.is_pinned ? 'Désépinglé' : 'Épinglé'
                      )
                    }
                  >
                    <Pin className="mr-1 h-3.5 w-3.5" />
                    {comment.is_pinned ? 'Désépingler' : 'Épingler'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      run(
                        () => setHidden(comment.id, !comment.is_hidden),
                        comment.is_hidden ? 'Affiché' : 'Masqué'
                      )
                    }
                  >
                    {comment.is_hidden ? (
                      <Eye className="mr-1 h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="mr-1 h-3.5 w-3.5" />
                    )}
                    {comment.is_hidden ? 'Afficher' : 'Masquer'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => {
                      if (confirm('Supprimer ce commentaire ?')) {
                        run(() => deleteComment(comment.id), 'Commentaire supprimé');
                      }
                    }}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

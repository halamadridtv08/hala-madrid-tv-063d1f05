import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageSquare, Pin, Trash2, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLiveBlogComments } from '@/hooks/useLiveBlogSocial';
import { cn } from '@/lib/utils';

interface LiveBlogCommentsProps {
  matchId: string;
}

export const LiveBlogComments = ({ matchId }: LiveBlogCommentsProps) => {
  const { user, isAdmin, isModerator } = useAuth();
  const { comments, loading, addComment, deleteComment, setHidden, setPinned } =
    useLiveBlogComments(matchId);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const canModerate = isAdmin || isModerator;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await addComment(content);
      setContent('');
      toast({ title: 'Message publié' });
    } catch {
      toast({
        title: 'Erreur',
        description: "Votre message n'a pas pu être publié",
        variant: 'destructive',
      });
    }
    setSending(false);
  };

  return (
    <Card className="mt-8">
      <CardContent className="p-5">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <MessageSquare className="h-5 w-5" />
          Discussion des supporters ({comments.length})
        </h3>

        {user ? (
          <form onSubmit={handleSubmit} className="mb-6 space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Votre réaction sur le match..."
              rows={3}
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{content.length}/1000</span>
              <Button type="submit" disabled={sending || !content.trim()}>
                {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publier
              </Button>
            </div>
          </form>
        ) : (
          <p className="mb-6 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            Connectez-vous pour participer à la discussion en direct.
          </p>
        )}

        {loading ? (
          <p className="py-6 text-center text-muted-foreground">Chargement…</p>
        ) : comments.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">
            Aucun message pour l'instant — lancez la discussion !
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  'rounded-xl border border-border/60 p-3',
                  comment.is_pinned && 'border-primary/50 bg-primary/5'
                )}
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{comment.display_name}</span>
                  {comment.is_pinned && (
                    <Badge variant="secondary" className="gap-1">
                      <Pin className="h-3 w-3" /> Épinglé
                    </Badge>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-[15px] text-foreground/90">{comment.content}</p>

                {(canModerate || comment.user_id === user?.id) && (
                  <div className="mt-2 flex gap-1">
                    {canModerate && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPinned(comment.id, !comment.is_pinned)}
                        >
                          <Pin className="mr-1 h-3.5 w-3.5" />
                          {comment.is_pinned ? 'Désépingler' : 'Épingler'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setHidden(comment.id, true)}>
                          <EyeOff className="mr-1 h-3.5 w-3.5" />
                          Masquer
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

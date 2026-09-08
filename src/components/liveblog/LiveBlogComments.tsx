import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageSquare, Pin, Trash2, EyeOff, Loader2, Flag, Reply } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLiveBlogComments, LiveBlogComment } from '@/hooks/useLiveBlogSocial';
import { cn } from '@/lib/utils';

interface LiveBlogCommentsProps {
  matchId: string;
}

export const LiveBlogComments = ({ matchId }: LiveBlogCommentsProps) => {
  const { user, isAdmin, isModerator } = useAuth();
  const { comments, loading, addComment, deleteComment, setHidden, setPinned, reportComment } =
    useLiveBlogComments(matchId);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<LiveBlogComment | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [reportTarget, setReportTarget] = useState<LiveBlogComment | null>(null);
  const [reportReason, setReportReason] = useState('');
  const { toast } = useToast();

  const canModerate = isAdmin || isModerator;

  const { roots, repliesByParent } = useMemo(() => {
    const repliesByParent = new Map<string, LiveBlogComment[]>();
    const roots: LiveBlogComment[] = [];
    comments.forEach((c) => {
      if (c.parent_id) {
        repliesByParent.set(c.parent_id, [...(repliesByParent.get(c.parent_id) || []), c]);
      } else {
        roots.push(c);
      }
    });
    repliesByParent.forEach((list) =>
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    );
    return { roots, repliesByParent };
  }, [comments]);

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

  const handleReply = async () => {
    if (!replyTo || !replyContent.trim()) return;
    setSending(true);
    try {
      await addComment(replyContent, replyTo.entry_id, replyTo.id);
      setReplyContent('');
      setReplyTo(null);
      toast({ title: 'Réponse publiée' });
    } catch {
      toast({ title: 'Erreur', description: "La réponse n'a pas pu être publiée", variant: 'destructive' });
    }
    setSending(false);
  };

  const handleReport = async () => {
    if (!reportTarget || !reportReason.trim()) return;
    try {
      await reportComment(reportTarget.id, reportReason);
      toast({ title: 'Signalement envoyé', description: "L'équipe de modération va l'examiner." });
    } catch {
      toast({ title: 'Erreur', description: 'Signalement impossible', variant: 'destructive' });
    }
    setReportTarget(null);
    setReportReason('');
  };

  const renderComment = (comment: LiveBlogComment, isReply = false) => (
    <div key={comment.id} className={cn(isReply && 'ml-6 border-l-2 border-border/60 pl-3')}>
      <div
        className={cn(
          'rounded-xl border border-border/60 p-3',
          comment.is_pinned && 'border-primary/50 bg-primary/5',
          comment.is_hidden && 'opacity-60'
        )}
      >
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-semibold">{comment.display_name}</span>
          {comment.is_pinned && (
            <Badge variant="secondary" className="gap-1">
              <Pin className="h-3 w-3" /> Épinglé
            </Badge>
          )}
          {comment.is_hidden && <Badge variant="outline">Masqué</Badge>}
          <span className="ml-auto text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-[15px] text-foreground/90">{comment.content}</p>

        <div className="mt-2 flex flex-wrap gap-1">
          {user && !isReply && (
            <Button size="sm" variant="ghost" onClick={() => setReplyTo(comment)}>
              <Reply className="mr-1 h-3.5 w-3.5" />
              Répondre
            </Button>
          )}
          {comment.user_id !== user?.id && (
            <Button size="sm" variant="ghost" onClick={() => setReportTarget(comment)}>
              <Flag className="mr-1 h-3.5 w-3.5" />
              Signaler
            </Button>
          )}
          {canModerate && (
            <>
              <Button size="sm" variant="ghost" onClick={() => setPinned(comment.id, !comment.is_pinned)}>
                <Pin className="mr-1 h-3.5 w-3.5" />
                {comment.is_pinned ? 'Désépingler' : 'Épingler'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setHidden(comment.id, !comment.is_hidden)}>
                <EyeOff className="mr-1 h-3.5 w-3.5" />
                {comment.is_hidden ? 'Afficher' : 'Masquer'}
              </Button>
            </>
          )}
          {(canModerate || comment.user_id === user?.id) && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => deleteComment(comment.id)}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      {replyTo?.id === comment.id && (
        <div className="ml-6 mt-2 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`Répondre à ${comment.display_name}…`}
            rows={2}
            maxLength={1000}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleReply} disabled={sending || !replyContent.trim()}>
              {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {(repliesByParent.get(comment.id) || []).length > 0 && (
        <div className="mt-2 space-y-2">
          {(repliesByParent.get(comment.id) || []).map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <>
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
          ) : roots.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              Aucun message pour l'instant — lancez la discussion !
            </p>
          ) : (
            <div className="space-y-3">{roots.map((comment) => renderComment(comment))}</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!reportTarget} onOpenChange={(open) => !open && setReportTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler ce message</DialogTitle>
            <DialogDescription>
              Expliquez brièvement le problème — un modérateur examinera votre signalement.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Motif du signalement (insultes, spam, hors-sujet…)"
            rows={3}
            maxLength={500}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReportTarget(null)}>
              Annuler
            </Button>
            <Button onClick={handleReport} disabled={!reportReason.trim()}>
              Envoyer le signalement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

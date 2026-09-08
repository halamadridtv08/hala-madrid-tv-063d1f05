import { useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Flag, Check, X, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { logLiveBlogModeration } from '@/hooks/useLiveBlogSocial';

interface ReportRow {
  id: string;
  comment_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  handled_at: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  traité: 'Traité',
  rejeté: 'Rejeté',
  supprimé: 'Supprimé',
};

export const LiveBlogCommentReports = ({ matchId }: { matchId?: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [comments, setComments] = useState<Record<string, { display_name: string; content: string }>>({});
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from('live_blog_comment_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading reports:', error);
      setLoading(false);
      return;
    }

    const rows = (data || []) as ReportRow[];
    setReports(rows);

    const ids = [...new Set(rows.map((r) => r.comment_id))];
    if (ids.length) {
      const { data: cData } = await (supabase as any)
        .from('live_blog_comments')
        .select('id, display_name, content, match_id')
        .in('id', ids);
      const map: Record<string, { display_name: string; content: string }> = {};
      (cData || []).forEach((c: any) => {
        map[c.id] = { display_name: c.display_name, content: c.content };
      });
      setComments(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();
    const channel = supabase
      .channel(`lb-reports-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_blog_comment_reports' },
        () => fetchReports()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReports]);

  const updateStatus = async (report: ReportRow, status: string) => {
    const { error } = await (supabase as any)
      .from('live_blog_comment_reports')
      .update({ status, handled_by: user?.id ?? null, handled_at: new Date().toISOString() })
      .eq('id', report.id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    await logLiveBlogModeration({
      action: `report_${status}`,
      commentId: report.comment_id,
      matchId: matchId ?? null,
      email: user?.email ?? null,
    });
    toast({ title: 'Signalement mis à jour' });
    fetchReports();
  };

  const deleteReportedComment = async (report: ReportRow) => {
    const { error } = await (supabase as any)
      .from('live_blog_comments')
      .delete()
      .eq('id', report.comment_id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    await updateStatus(report, 'supprimé');
  };

  const pending = reports.filter((r) => r.status === 'pending');

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flag className="h-5 w-5 text-destructive" />
          Signalements
          {pending.length > 0 && <Badge variant="destructive">{pending.length} en attente</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
          </p>
        ) : reports.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">Aucun signalement.</p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="rounded-lg border p-3">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>
                  {STATUS_LABEL[report.status] || report.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm">
                <span className="font-semibold">Motif : </span>
                {report.reason || '—'}
              </p>
              <p className="mt-1 rounded bg-muted/50 p-2 text-sm">
                <span className="font-semibold">
                  {comments[report.comment_id]?.display_name || 'Message supprimé'} :{' '}
                </span>
                {comments[report.comment_id]?.content || '—'}
              </p>
              {report.status === 'pending' && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(report, 'traité')}>
                    <Check className="mr-1 h-3.5 w-3.5" /> Traiter
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(report, 'rejeté')}>
                    <X className="mr-1 h-3.5 w-3.5" /> Rejeter
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteReportedComment(report)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Supprimer le message
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

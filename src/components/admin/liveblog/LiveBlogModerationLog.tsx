import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LogRow {
  id: string;
  action: string;
  comment_id: string | null;
  match_id: string | null;
  moderator_email: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_LABEL: Record<string, string> = {
  pin: 'Épinglé',
  unpin: 'Désépinglé',
  hide: 'Masqué',
  unhide: 'Affiché',
  delete: 'Supprimé',
  report_traité: 'Signalement traité',
  'report_rejeté': 'Signalement rejeté',
  'report_supprimé': 'Message signalé supprimé',
};

export const LiveBlogModerationLog = ({ matchId }: { matchId?: string }) => {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    let query = (supabase as any)
      .from('live_blog_moderation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (matchId) query = query.eq('match_id', matchId);

    const { data, error } = await query;
    if (error) console.error('Error loading moderation logs:', error);
    else setLogs((data || []) as LogRow[]);
    setLoading(false);
  }, [matchId]);

  useEffect(() => {
    setLoading(true);
    fetchLogs();
    const channel = supabase
      .channel(`lb-mod-logs-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_blog_moderation_logs' },
        () => fetchLogs()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ScrollText className="h-5 w-5" />
          Journal de modération
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
          </p>
        ) : logs.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">Aucune action enregistrée.</p>
        ) : (
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-2 text-sm">
                <Badge variant="secondary">{ACTION_LABEL[log.action] || log.action}</Badge>
                <span className="font-medium">{log.moderator_email || 'Modérateur'}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                </span>
                {typeof log.details?.['content'] === 'string' && (
                  <p className="w-full truncate text-xs text-muted-foreground">
                    « {String(log.details['content'])} »
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, ArchiveRestore } from 'lucide-react';

const db = supabase as any;

interface ExpiryEntry {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

interface StoryExpiryLogProps {
  onArchived?: () => void;
}

export function StoryExpiryLog({ onArchived }: StoryExpiryLogProps) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<ExpiryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await db
      .from('admin_notifications')
      .select('id,title,message,created_at')
      .eq('type', 'story_expiry')
      .order('created_at', { ascending: false })
      .limit(20);
    setEntries((data ?? []) as ExpiryEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runNow = async () => {
    setRunning(true);
    const { data, error } = await db.rpc('archive_expired_stories');
    setRunning(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    const daily = Number(data?.daily ?? 0);
    const highlights = Number(data?.highlights ?? 0);
    toast({
      title: daily + highlights > 0 ? 'Stories archivées' : 'Aucune story expirée',
      description: `${daily} story(s) 24 h et ${highlights} story(s) à la une archivée(s).`,
    });
    await load();
    onArchived?.();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">Journal d'expiration</CardTitle>
          <p className="text-xs text-muted-foreground">
            Contrôle automatique toutes les heures : les stories 24 h et à la une expirées sont archivées et signalées ici.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          </Button>
          <Button size="sm" onClick={runNow} disabled={running}>
            {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArchiveRestore className="mr-2 h-4 w-4" />}
            Vérifier maintenant
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && entries.length === 0 && <p className="text-sm text-muted-foreground">Chargement...</p>}
        {!loading && entries.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune expiration enregistrée pour le moment.</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">{entry.title}</span>
              <Badge variant="secondary">{new Date(entry.created_at).toLocaleString('fr-FR')}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{entry.message}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

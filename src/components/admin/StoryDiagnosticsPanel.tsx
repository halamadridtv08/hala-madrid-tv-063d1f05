import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Globe2, RefreshCw, Server } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const db = supabase as any;

interface PlaybackEvent {
  id: string;
  event_type: string;
  detail: string | null;
  origin: string | null;
  page_url: string | null;
  media_url: string | null;
  attempt: number;
  asset_version: string | null;
  created_at: string;
  story_rings?: { title?: string } | null;
}

function currentAsset(): string {
  const script = Array.from(document.scripts).find((node) => node.src.includes('/assets/index-'));
  return script?.src.split('/').pop() ?? 'Mode développement';
}

export function StoryDiagnosticsPanel() {
  const [events, setEvents] = useState<PlaybackEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [domainReachable, setDomainReachable] = useState<boolean | null>(null);
  const asset = useMemo(currentAsset, []);
  const isLovableHost = window.location.hostname.endsWith('lovable.app') || window.location.hostname.endsWith('lovableproject.com');

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data }, domainResult] = await Promise.all([
      db
        .from('story_playback_events')
        .select('id,event_type,detail,origin,page_url,media_url,attempt,asset_version,created_at,story_rings(title)')
        .order('created_at', { ascending: false })
        .limit(100),
      fetch('https://hala-madrid-tv.com/', { method: 'HEAD', mode: 'no-cors', cache: 'no-store' })
        .then(() => true)
        .catch(() => false),
    ]);
    setEvents((data ?? []) as PlaybackEvent[]);
    setDomainReachable(domainResult);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Diagnostic des stories</h3>
          <p className="text-sm text-muted-foreground">Chargement média, CORS, lecture automatique, plein écran et synchronisation.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Actualiser
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Globe2 className="h-4 w-4" /> Environnement actuel</CardTitle></CardHeader>
          <CardContent><p className="break-all text-sm font-medium">{window.location.origin}</p><Badge className="mt-2" variant="secondary">{isLovableHost ? 'Lovable' : 'Domaine personnalisé'}</Badge></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Server className="h-4 w-4" /> Version chargée</CardTitle></CardHeader>
          <CardContent><p className="break-all font-mono text-xs">{asset}</p><p className="mt-2 text-xs text-muted-foreground">Les deux domaines doivent afficher le même fichier après publication.</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm">{domainReachable === false ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-primary" />} Domaine public</CardTitle></CardHeader>
          <CardContent><p className="text-sm font-medium">hala-madrid-tv.com</p><Badge className="mt-2" variant={domainReachable === false ? 'destructive' : 'secondary'}>{domainReachable === null ? 'Vérification…' : domainReachable ? 'Accessible' : 'Inaccessible'}</Badge></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">100 derniers incidents</CardTitle></CardHeader>
        <CardContent>
          {!loading && events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun incident enregistré.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-border text-xs text-muted-foreground"><tr><th className="p-2">Date</th><th className="p-2">Story</th><th className="p-2">Événement</th><th className="p-2">Domaine / version</th><th className="p-2">Détail</th></tr></thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-border/60 align-top">
                      <td className="whitespace-nowrap p-2 text-xs">{new Date(event.created_at).toLocaleString('fr-FR')}</td>
                      <td className="p-2">{event.story_rings?.title ?? 'Story supprimée'}</td>
                      <td className="p-2"><Badge variant="outline">{event.event_type}</Badge>{event.attempt > 0 && <span className="ml-1 text-xs">essai {event.attempt}</span>}</td>
                      <td className="p-2"><div className="max-w-48 truncate">{event.origin ?? '—'}</div><div className="max-w-48 truncate font-mono text-xs text-muted-foreground">{event.asset_version ?? '—'}</div></td>
                      <td className="p-2"><div className="max-w-md break-words">{event.detail ?? '—'}</div>{event.media_url && <div className="mt-1 max-w-md truncate text-xs text-muted-foreground" title={event.media_url}>{event.media_url}</div>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
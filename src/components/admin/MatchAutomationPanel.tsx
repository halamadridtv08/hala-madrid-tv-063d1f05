import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, Link, RefreshCw, Settings, Zap, Clock, Target, 
  AlertCircle, CheckCircle2, Loader2, ExternalLink, Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MatchAutomationPanelProps {
  matchId: string;
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
}

interface AutomationSettings {
  id: string;
  match_id: string;
  automation_enabled: boolean;
  api_fixture_id: number | null;
  scraper_url: string | null;
  last_api_sync: string | null;
  last_scraper_sync: string | null;
  auto_timer: boolean;
  auto_live_blog: boolean;
  auto_score: boolean;
  events_synced: any[];
  last_known_status: string | null;
  sync_errors: any[];
}

export const MatchAutomationPanel = ({ 
  matchId, 
  matchDate, 
  homeTeam, 
  awayTeam 
}: MatchAutomationPanelProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searching, setSearching] = useState(false);
  
  // Form state
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [apiFixtureId, setApiFixtureId] = useState<string>('');
  const [scraperUrl, setScraperUrl] = useState('');
  const [autoTimer, setAutoTimer] = useState(true);
  const [autoLiveBlog, setAutoLiveBlog] = useState(true);
  const [autoScore, setAutoScore] = useState(true);

  // Fetch existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('match_automation_settings')
        .select('*')
        .eq('match_id', matchId)
        .single();

      if (data && !error) {
        setSettings(data as AutomationSettings);
        setAutomationEnabled(data.automation_enabled);
        setApiFixtureId(data.api_fixture_id?.toString() || '');
        setScraperUrl(data.scraper_url || '');
        setAutoTimer(data.auto_timer);
        setAutoLiveBlog(data.auto_live_blog);
        setAutoScore(data.auto_score);
      }
      setLoading(false);
    };

    fetchSettings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`automation-${matchId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'match_automation_settings',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        if (payload.new) {
          setSettings(payload.new as AutomationSettings);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsData = {
        match_id: matchId,
        automation_enabled: automationEnabled,
        api_fixture_id: apiFixtureId ? parseInt(apiFixtureId) : null,
        scraper_url: scraperUrl || null,
        auto_timer: autoTimer,
        auto_live_blog: autoLiveBlog,
        auto_score: autoScore,
      };

      if (settings?.id) {
        const { error } = await supabase
          .from('match_automation_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('match_automation_settings')
          .insert(settingsData);

        if (error) throw error;
      }

      toast({ title: 'Configuration sauvegardée' });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Search for fixture in API
  const searchFixture = async () => {
    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('football-api', {
        body: {
          endpoint: 'fixtures',
          params: {
            team: 541, // Real Madrid ID
            from: matchDate.split('T')[0],
            to: matchDate.split('T')[0],
          },
        },
      });

      if (error) throw error;

      const fixtures = data?.response || [];
      if (fixtures.length > 0) {
        const fixture = fixtures[0];
        setApiFixtureId(fixture.fixture.id.toString());
        toast({
          title: 'Match trouvé !',
          description: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
        });
      } else {
        toast({
          title: 'Aucun match trouvé',
          description: 'Essayez de rechercher manuellement ou vérifiez la date',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur de recherche',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  // Force sync now
  const forceSync = async () => {
    if (!settings?.automation_enabled) {
      toast({
        title: 'Automatisation désactivée',
        description: 'Activez l\'automatisation d\'abord',
        variant: 'destructive',
      });
      return;
    }

    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-live-match', {
        body: { match_id: matchId },
      });

      if (error) throw error;

      toast({
        title: 'Synchronisation effectuée',
        description: data.message || `${data.synced} match(s) synchronisé(s)`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur de sync',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const lastSync = settings?.last_api_sync 
    ? format(new Date(settings.last_api_sync), 'dd/MM HH:mm:ss', { locale: fr })
    : 'Jamais';

  const hasErrors = (settings?.sync_errors?.length || 0) > 0;
  const eventCount = settings?.events_synced?.length || 0;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-primary" />
          Mode Automatique
          {automationEnabled && (
            <Badge variant="default" className="ml-auto">
              <Zap className="h-3 w-3 mr-1" />
              Actif
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Switch
              id="automation-enabled"
              checked={automationEnabled}
              onCheckedChange={setAutomationEnabled}
            />
            <Label htmlFor="automation-enabled" className="font-medium cursor-pointer">
              Automatisation activée
            </Label>
          </div>
          {settings?.last_known_status && (
            <Badge variant="outline">
              Status API: {settings.last_known_status}
            </Badge>
          )}
        </div>

        <Separator />

        {/* API Football Configuration */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Target className="h-4 w-4" />
            Source: API Football
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Fixture ID (ex: 1234567)"
              value={apiFixtureId}
              onChange={(e) => setApiFixtureId(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={searchFixture}
              disabled={searching}
              title="Rechercher automatiquement"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Dernière sync: {lastSync} • {eventCount} événements synchronisés
          </p>
        </div>

        {/* Scraper Configuration */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Link className="h-4 w-4" />
            Backup: Scraper Real Madrid
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="URL du live blog Real Madrid"
              value={scraperUrl}
              onChange={(e) => setScraperUrl(e.target.value)}
              className="flex-1"
            />
            {scraperUrl && (
              <Button
                variant="outline"
                size="icon"
                asChild
              >
                <a href={scraperUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Options */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Settings className="h-4 w-4" />
            Options d'automatisation
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <Switch
                id="auto-timer"
                checked={autoTimer}
                onCheckedChange={setAutoTimer}
              />
              <Label htmlFor="auto-timer" className="text-sm cursor-pointer">
                Timer auto
              </Label>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <Switch
                id="auto-score"
                checked={autoScore}
                onCheckedChange={setAutoScore}
              />
              <Label htmlFor="auto-score" className="text-sm cursor-pointer">
                Score auto
              </Label>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <Switch
                id="auto-live-blog"
                checked={autoLiveBlog}
                onCheckedChange={setAutoLiveBlog}
              />
              <Label htmlFor="auto-live-blog" className="text-sm cursor-pointer">
                Live Blog auto
              </Label>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        {hasErrors && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              {settings?.sync_errors?.length} erreur(s) récente(s) - 
              {settings?.sync_errors?.[0]?.error || 'Erreur inconnue'}
            </span>
          </div>
        )}

        {automationEnabled && !hasErrors && settings?.last_api_sync && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-lg text-sm">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Automatisation fonctionnelle</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              'Sauvegarder'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={forceSync}
            disabled={syncing || !automationEnabled}
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          <Clock className="h-3 w-3 inline mr-1" />
          La synchronisation automatique se fait toutes les 30 secondes via CRON
        </p>
      </CardContent>
    </Card>
  );
};

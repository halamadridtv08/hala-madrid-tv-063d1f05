import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, CalendarDays, Radio, RefreshCw, ListPlus, Users, Trophy } from 'lucide-react';

interface FixturePreview {
  flashscore_match_id: string;
  existing_id: string | null;
  action: 'create' | 'update';
  home_team: string;
  away_team: string;
  match_date: string;
  competition: string | null;
  venue: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
}

interface MatchRow {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  match_details: any;
}

interface LiveEntryPreview {
  entry_type: string;
  minute: number | null;
  title: string;
  content: string;
}

const LEAGUES = [
  { id: 'LaLiga', label: 'LaLiga' },
  { id: 'Champions League', label: 'Ligue des champions' },
  { id: 'Copa del Rey', label: 'Copa del Rey' },
  { id: 'Super Cup', label: 'Supercoupes' },
  { id: 'Club World Cup', label: 'Coupe du monde des clubs' },
];

export const SofascoreImportPanel = () => {
  const { toast } = useToast();

  const [daysBack, setDaysBack] = useState('3');
  const [daysAhead, setDaysAhead] = useState('7');
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(LEAGUES.map((l) => l.id));
  const [fixtures, setFixtures] = useState<FixturePreview[] | null>(null);
  const [fixtureLoading, setFixtureLoading] = useState(false);

  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [matchPreview, setMatchPreview] = useState<any>(null);
  const [matchLoading, setMatchLoading] = useState(false);

  const [fotmobMatch, setFotmobMatch] = useState<string>('');
  const [fotmobId, setFotmobId] = useState('');
  const [fotmobPreview, setFotmobPreview] = useState<any>(null);
  const [fotmobLoading, setFotmobLoading] = useState(false);

  const [flashEnabled, setFlashEnabled] = useState<boolean | null>(null);
  const [flashToggling, setFlashToggling] = useState(false);

  const [squadUrl, setSquadUrl] = useState('');
  const [squadPreview, setSquadPreview] = useState<any>(null);
  const [squadLoading, setSquadLoading] = useState(false);

  const [standingsPreview, setStandingsPreview] = useState<any>(null);
  const [standingsLoading, setStandingsLoading] = useState(false);

  useEffect(() => {
    supabase
      .from('matches')
      .select('id, home_team, away_team, match_date, match_details')
      .order('match_date', { ascending: false })
      .limit(40)
      .then(({ data }) => setMatches((data as MatchRow[]) || []));
    supabase
      .from('site_content')
      .select('content_value')
      .eq('content_key', 'flashscore_live_enabled')
      .maybeSingle()
      .then(({ data }) => setFlashEnabled(data?.content_value !== 'false'));
  }, []);

  const callFunction = async (body: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke('sofascore-sync', {
      body,
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
    });
    if (error) throw new Error(error.message);
    if (data && data.success === false) throw new Error(data.error || 'Erreur inconnue');
    return data;
  };

  const runFixtures = async (apply: boolean) => {
    setFixtureLoading(true);
    try {
      const data = await callFunction({
        action: 'fixtures',
        apply,
        daysBack: Number(daysBack) || 0,
        daysAhead: Number(daysAhead) || 0,
        leagues: selectedLeagues,
      });
      setFixtures(data.preview || []);
      toast({
        title: apply ? 'Calendrier importé' : 'Aperçu généré',
        description: apply
          ? `${data.created} match(s) créé(s), ${data.updated} mis à jour.`
          : `${data.found} match(s) du Real Madrid trouvé(s).`,
      });
    } catch (e) {
      toast({ title: 'Échec', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setFixtureLoading(false);
    }
  };

  const runMatch = async (apply: boolean) => {
    if (!selectedMatch) {
      toast({ title: 'Sélectionnez un match', variant: 'destructive' });
      return;
    }
    setMatchLoading(true);
    try {
      const data = await callFunction({ action: 'live', matchId: selectedMatch });
      setMatchPreview(data);
      toast({
        title: apply ? 'Match synchronisé' : 'Aperçu du match',
        description: apply
          ? `${data.synced} match(s) actualisé(s).`
          : '',
      });
    } catch (e) {
      toast({ title: 'Échec', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setMatchLoading(false);
    }
  };

  const toggleLeague = (id: string) =>
    setSelectedLeagues((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]));

  const toggleFlash = async (enabled: boolean) => {
    setFlashToggling(true);
    try {
      const { error } = await supabase
        .from('site_content')
        .update({ content_value: enabled ? 'true' : 'false' })
        .eq('content_key', 'flashscore_live_enabled');
      if (error) throw error;
      setFlashEnabled(enabled);
      toast({
        title: enabled ? 'Synchro automatique activée' : 'Synchro automatique arrêtée',
        description: enabled
          ? 'Les matchs en direct se mettent à jour toutes les 2 minutes.'
          : 'Plus aucun appel Flashscore — zéro crédit Apify dépensé.',
      });
    } catch (e) {
      toast({ title: 'Échec', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setFlashToggling(false);
    }
  };

  const runSquad = async (apply: boolean) => {
    if (!squadUrl.trim()) {
      toast({ title: "Collez l'URL FotMob de l'équipe adverse", variant: 'destructive' });
      return;
    }
    setSquadLoading(true);
    try {
      const data = await callFunction({ action: 'fotmob-squad', teamUrl: squadUrl.trim(), apply });
      setSquadPreview(data);
      toast({
        title: apply ? 'Effectif importé' : 'Aperçu FotMob',
        description: apply
          ? `${data.players_added} joueur(s) ajouté(s), ${data.players_updated} mis à jour.`
          : `${data.players_found} joueur(s) trouvé(s) pour ${data.team_name}.`,
      });
    } catch (e) {
      toast({ title: 'Échec', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSquadLoading(false);
    }
  };

  const runStandings = async (apply: boolean) => {
    setStandingsLoading(true);
    try {
      const data = await callFunction({ action: 'fotmob-standings', apply });
      setStandingsPreview(data);
      toast({
        title: apply ? 'Classement mis à jour' : 'Aperçu du classement',
        description: apply
          ? `${data.teams_updated} équipe(s) mises à jour.`
          : `${data.teams?.length ?? 0} équipe(s) trouvée(s).`,
      });
    } catch (e) {
      toast({ title: 'Échec', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setStandingsLoading(false);
    }
  };

  const runFotmob = async (apply: boolean) => {
    if (!fotmobMatch) {
      toast({ title: 'Sélectionnez un match', variant: 'destructive' });
      return;
    }
    setFotmobLoading(true);
    try {
      const data = await callFunction({
        action: 'fotmob-details',
        matchId: fotmobMatch,
        fotmobMatchId: fotmobId || undefined,
        apply,
      });
      setFotmobPreview(data);
      toast({
        title: apply ? 'Match mis à jour' : 'Aperçu FotMob',
        description: apply
          ? `${data.inserted} événement(s) ajouté(s), ${data.events_to_enrich ?? 0} complété(s).`
          : `${data.events_to_add?.length ?? 0} événement(s) à ajouter, ${data.events_to_enrich ?? 0} à compléter.`,
      });
    } catch (e) {
      toast({ title: 'Échec', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setFotmobLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Download className="h-5 w-5" /> Import Flashscore — Real Madrid
        </CardTitle>
        <CardDescription>
          Récupère uniquement les matchs du Real Madrid. Pendant un match importé, le score, les buts,
          la mi-temps, la fin et le minuteur se mettent à jour automatiquement toutes les 2 minutes.
        </CardDescription>
        {flashEnabled !== null && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-md border p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">Synchro automatique Flashscore</p>
              <p className="text-xs text-muted-foreground">
                {flashEnabled
                  ? 'Active : appels Apify toutes les 2 minutes pendant les matchs.'
                  : 'Arrêtée : plus aucun appel Apify, zéro crédit dépensé.'}
              </p>
            </div>
            <Switch
              checked={flashEnabled}
              disabled={flashToggling}
              onCheckedChange={toggleFlash}
              aria-label="Activer ou arrêter la synchro automatique Flashscore"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="min-w-0">
        <Tabs defaultValue="fixtures" className="w-full min-w-0">
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="fixtures" className="flex-shrink-0 gap-1">
              <CalendarDays className="h-4 w-4" /> Calendrier
            </TabsTrigger>
            <TabsTrigger value="live" className="flex-shrink-0 gap-1">
              <Radio className="h-4 w-4" /> Match
            </TabsTrigger>
            <TabsTrigger value="fotmob" className="flex-shrink-0 gap-1">
              <ListPlus className="h-4 w-4" /> Détails FotMob
            </TabsTrigger>
            <TabsTrigger value="squad" className="flex-shrink-0 gap-1">
              <Users className="h-4 w-4" /> Effectif adverse
            </TabsTrigger>
            <TabsTrigger value="standings" className="flex-shrink-0 gap-1">
              <Trophy className="h-4 w-4" /> Classement
            </TabsTrigger>
          </TabsList>

          {/* Calendrier */}
          <TabsContent value="fixtures" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="daysBack">Jours passés</Label>
                <Input id="daysBack" type="number" min={0} max={7} value={daysBack}
                  onChange={(e) => setDaysBack(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="daysAhead">Jours à venir</Label>
                <Input id="daysAhead" type="number" min={0} max={7} value={daysAhead}
                  onChange={(e) => setDaysAhead(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Compétitions</Label>
              <div className="flex flex-wrap gap-2">
                {LEAGUES.map((l) => (
                  <Badge
                    key={l.id}
                    variant={selectedLeagues.includes(l.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleLeague(l.id)}
                  >
                    {l.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => runFixtures(false)} disabled={fixtureLoading}>
                {fixtureLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Aperçu
              </Button>
              <Button onClick={() => runFixtures(true)} disabled={fixtureLoading || !fixtures}>
                Importer dans la base
              </Button>
            </div>

            {fixtures && (
              <div className="max-w-full overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-2 text-left">Match</th>
                      <th className="hidden p-2 text-left sm:table-cell">Compétition</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fixtures.map((f) => (
                      <tr key={f.flashscore_match_id} className="border-t">
                        <td className="p-2">
                          {f.home_team} {f.home_score ?? '-'} – {f.away_score ?? '-'} {f.away_team}
                        </td>
                        <td className="hidden p-2 sm:table-cell">{f.competition}</td>
                        <td className="p-2">{new Date(f.match_date).toLocaleString('fr-FR')}</td>
                        <td className="p-2">
                          <Badge variant={f.action === 'create' ? 'default' : 'secondary'}>
                            {f.action === 'create' ? 'Nouveau' : 'Mise à jour'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {fixtures.length === 0 && (
                      <tr><td className="p-3 text-muted-foreground" colSpan={4}>Aucun match trouvé sur cette période.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Match */}
          <TabsContent value="live" className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label>Match à synchroniser</Label>
              <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                <SelectTrigger><SelectValue placeholder="Choisir un match" /></SelectTrigger>
                <SelectContent>
                  {matches.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.home_team} – {m.away_team} ({new Date(m.match_date).toLocaleDateString('fr-FR')})
                      {m.match_details?.flashscore_match_id ? '' : ' ⚠︎ non lié'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Les matchs marqués « non lié » doivent d'abord passer par l'import du calendrier.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Automatique pendant le match : rien à faire. Ce bouton force une actualisation immédiate.
            </p>
            <Button onClick={() => runMatch(true)} disabled={matchLoading}>
              {matchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Actualiser maintenant
            </Button>
            {matchPreview?.results?.map((r: any, i: number) => (
              <div key={i} className="rounded-md border p-3 text-sm">
                {r.error ? r.error : `Statut : ${r.status} · Score : ${r.score}${r.changes?.length ? ' · ' + r.changes.join(', ') : ''}`}
              </div>
            ))}
          </TabsContent>

          {/* Détails FotMob */}
          <TabsContent value="fotmob" className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label>Match existant</Label>
              <Select value={fotmobMatch} onValueChange={setFotmobMatch}>
                <SelectTrigger><SelectValue placeholder="Choisir un match" /></SelectTrigger>
                <SelectContent>
                  {matches.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.home_team} – {m.away_team} ({new Date(m.match_date).toLocaleDateString('fr-FR')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="fotmobId">ID ou URL FotMob du match</Label>
              <Input
                id="fotmobId"
                placeholder="https://www.fotmob.com/match/1234567 ou 1234567"
                value={fotmobId}
                onChange={(e) => setFotmobId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Ouvrez le match sur fotmob.com et copiez l'URL. Le match n'est jamais recréé :
                le score, les statistiques et les détails manquants sont complétés sans effacer vos saisies.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => runFotmob(false)} disabled={fotmobLoading}>
                {fotmobLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Aperçu
              </Button>
              <Button onClick={() => runFotmob(true)} disabled={fotmobLoading || !fotmobPreview}>
                Compléter le match
              </Button>
            </div>
            {fotmobPreview && (
              <div className="space-y-2 rounded-md border p-3 text-sm">
                <p>
                  <strong>{fotmobPreview.match_name}</strong> · Score : {fotmobPreview.score} · Statut : {fotmobPreview.status}
                </p>
                <p className="text-muted-foreground">
                  {fotmobPreview.events_found} événement(s) trouvé(s), {fotmobPreview.events_existing} déjà présent(s),{' '}
                  {fotmobPreview.events_to_add?.length ?? 0} à ajouter.
                </p>
                <p className="text-muted-foreground">
                  {fotmobPreview.events_to_enrich ?? 0} événement(s) à compléter · {fotmobPreview.statistics_found ?? 0} statistique(s) disponibles.
                </p>
                {fotmobPreview.events_to_add?.map((e: any, i: number) => (
                  <div key={i} className="rounded border p-2">
                    <Badge variant="secondary" className="mr-2">{e.minute ?? '?'}′</Badge>
                    {e.title}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>


          
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SofascoreImportPanel;

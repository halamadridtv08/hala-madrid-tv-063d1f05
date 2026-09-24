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
import { Loader2, Download, CalendarDays, Radio, Users, RefreshCw } from 'lucide-react';

interface FixturePreview {
  sofascore_event_id: number;
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
  { id: '8', label: 'LaLiga' },
  { id: '7', label: 'Ligue des champions' },
  { id: '329', label: 'Copa del Rey' },
  { id: '213', label: 'Supercopa de España' },
  { id: '357', label: 'Coupe du monde des clubs' },
  { id: '30', label: 'Supercoupe de l\'UEFA' },
];

export const SofascoreImportPanel = () => {
  const { toast } = useToast();

  const [daysBack, setDaysBack] = useState('3');
  const [daysAhead, setDaysAhead] = useState('11');
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(LEAGUES.map((l) => l.id));
  const [fixtures, setFixtures] = useState<FixturePreview[] | null>(null);
  const [fixtureLoading, setFixtureLoading] = useState(false);

  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [matchPreview, setMatchPreview] = useState<any>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [syncEvents, setSyncEvents] = useState(true);

  const [squad, setSquad] = useState<any[] | null>(null);
  const [squadLoading, setSquadLoading] = useState(false);

  useEffect(() => {
    supabase
      .from('matches')
      .select('id, home_team, away_team, match_date, match_details')
      .order('match_date', { ascending: false })
      .limit(40)
      .then(({ data }) => setMatches((data as MatchRow[]) || []));
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
      const data = await callFunction({ action: 'match', matchId: selectedMatch, apply, syncEvents });
      setMatchPreview(data);
      toast({
        title: apply ? 'Match synchronisé' : 'Aperçu du match',
        description: apply
          ? `Score mis à jour, ${data.entriesCreated} événement(s) ajouté(s).`
          : `${(data.entries || []).length} événement(s) détecté(s).`,
      });
    } catch (e) {
      toast({ title: 'Échec', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setMatchLoading(false);
    }
  };

  const runSquad = async () => {
    setSquadLoading(true);
    try {
      const data = await callFunction({ action: 'squad' });
      setSquad(data.players || []);
      toast({ title: 'Effectif récupéré', description: `${(data.players || []).length} joueur(s).` });
    } catch (e) {
      toast({ title: 'Échec', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSquadLoading(false);
    }
  };

  const toggleLeague = (id: string) =>
    setSelectedLeagues((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]));

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Download className="h-5 w-5" /> Import Sofascore — Real Madrid
        </CardTitle>
        <CardDescription>
          Récupère uniquement les données du Real Madrid : calendrier, résultats, score en direct,
          événements du match et effectif. Chaque import propose d'abord un aperçu avant enregistrement.
        </CardDescription>
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
            <TabsTrigger value="squad" className="flex-shrink-0 gap-1">
              <Users className="h-4 w-4" /> Effectif
            </TabsTrigger>
          </TabsList>

          {/* Calendrier */}
          <TabsContent value="fixtures" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="daysBack">Jours passés</Label>
                <Input id="daysBack" type="number" min={0} max={14} value={daysBack}
                  onChange={(e) => setDaysBack(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="daysAhead">Jours à venir</Label>
                <Input id="daysAhead" type="number" min={0} max={14} value={daysAhead}
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
                      <tr key={f.sofascore_event_id} className="border-t">
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
                      {m.match_details?.sofascore_event_id ? '' : ' ⚠︎ non lié'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Les matchs marqués « non lié » doivent d'abord passer par l'import du calendrier.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch id="syncEvents" checked={syncEvents} onCheckedChange={setSyncEvents} />
              <Label htmlFor="syncEvents">Créer aussi les événements du live (buts, cartons, remplacements)</Label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => runMatch(false)} disabled={matchLoading}>
                {matchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Aperçu
              </Button>
              <Button onClick={() => runMatch(true)} disabled={matchLoading || !matchPreview}>
                Appliquer au match
              </Button>
            </div>

            {matchPreview && (
              <div className="space-y-3">
                <div className="rounded-md border p-3 text-sm">
                  <div className="font-semibold">
                    {matchPreview.match.home_team} {matchPreview.match.home_score} – {matchPreview.match.away_score} {matchPreview.match.away_team}
                  </div>
                  <div className="text-muted-foreground">
                    {matchPreview.match.competition} · {matchPreview.match.status_description}
                  </div>
                </div>
                <div className="max-h-80 max-w-full overflow-auto rounded-md border">
                  <table className="w-full text-sm">
                    <tbody>
                      {(matchPreview.entries as LiveEntryPreview[]).map((e, i) => (
                        <tr key={i} className="border-t">
                          <td className="w-12 p-2 text-muted-foreground">{e.minute ?? '-'}'</td>
                          <td className="p-2 font-medium">{e.title}</td>
                          <td className="p-2">{e.content}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Effectif */}
          <TabsContent value="squad" className="space-y-4 pt-4">
            <Button variant="outline" onClick={runSquad} disabled={squadLoading}>
              {squadLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Récupérer l'effectif Sofascore
            </Button>
            <p className="text-xs text-muted-foreground">
              Consultation seule : aucune donnée n'est écrite dans la fiche des joueurs, pour ne pas écraser vos contenus.
            </p>
            {squad && (
              <div className="max-h-96 max-w-full overflow-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-2 text-left">Joueur</th>
                      <th className="p-2 text-left">Poste</th>
                      <th className="hidden p-2 text-left sm:table-cell">N°</th>
                      <th className="hidden p-2 text-left sm:table-cell">Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {squad.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{p.name}</td>
                        <td className="p-2">{p.position ?? '-'}</td>
                        <td className="hidden p-2 sm:table-cell">{p.jerseyNumber ?? '-'}</td>
                        <td className="hidden p-2 sm:table-cell">
                          {p.marketValue ? `${(p.marketValue / 1_000_000).toFixed(1)} M€` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SofascoreImportPanel;

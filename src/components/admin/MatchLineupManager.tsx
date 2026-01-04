import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin } from '@dnd-kit/core';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Papa from 'papaparse';
import { 
  Download, 
  Upload, 
  Plus, 
  Search, 
  Users, 
  UserX,
  Calendar,
  Shield,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { FORMATION_TEMPLATES } from './formation/FormationTemplates';
import { LineupPlayerCard } from './lineup/LineupPlayerCard';
import { LineupPitch } from './lineup/LineupPitch';
import { SubstitutesZone } from './lineup/SubstitutesZone';
import { AbsentPlayerCard } from './lineup/AbsentPlayerCard';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  competition: string | null;
}

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number;
  image_url?: string;
}

interface OpposingPlayer {
  id: string;
  name: string;
  position: string;
  jersey_number: number;
  team_id: string;
}

interface LineupPlayer {
  id: string;
  match_id: string;
  player_id?: string;
  opposing_player_id?: string;
  player_name: string;
  position: string;
  jersey_number?: number;
  is_starter: boolean;
  team_type: string;
  player_image?: string;
}

interface AbsentPlayer {
  id: string;
  match_id: string;
  player_id?: string;
  opposing_player_id?: string;
  player_name: string;
  reason: string;
  return_date?: string;
  team_type: string;
  player_image?: string;
}

// Get position coordinates from formation template
const getPositionFromTemplate = (formation: string, index: number) => {
  const template = FORMATION_TEMPLATES.find(t => t.formation === formation);
  if (template && index < template.positions.length) {
    return { x: template.positions[index].x, y: template.positions[index].y };
  }
  // Fallback if no template found
  return { x: 20 + (index * 15) % 60, y: 30 + (index * 12) % 50 };
};

// Available formations from templates
const FORMATIONS = FORMATION_TEMPLATES.map(t => t.formation);

export function MatchLineupManager() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [opposingPlayers, setOpposingPlayers] = useState<OpposingPlayer[]>([]);
  const [lineupPlayers, setLineupPlayers] = useState<LineupPlayer[]>([]);
  const [absentPlayers, setAbsentPlayers] = useState<AbsentPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTeam, setActiveTeam] = useState<'real_madrid' | 'opposing'>('real_madrid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<string>('4-3-3');
  
  // Refs for file inputs
  const lineupsFileInputRef = useRef<HTMLInputElement>(null);
  const absentsFileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states for adding absent players
  const [absentForm, setAbsentForm] = useState({
    playerId: '',
    reason: '',
    returnDate: '',
  });
  
  // Form states for adding opposing team player
  const [opposingPlayerForm, setOpposingPlayerForm] = useState({
    name: '',
    position: '',
    jerseyNumber: '',
  });

  const selectedMatch = matches.find(m => m.id === selectedMatchId);
  
  // Computed values - must be defined before functions that use them
  const currentPlayers = activeTeam === 'real_madrid' ? players : opposingPlayers;
  const currentLineup = lineupPlayers.filter(lp => lp.team_type === activeTeam);
  const starters = currentLineup.filter(lp => lp.is_starter);
  const substitutes = currentLineup.filter(lp => !lp.is_starter);
  const currentAbsents = absentPlayers.filter(ap => ap.team_type === activeTeam);
  const lineupPlayerIds = currentLineup.map(lp => lp.player_id || lp.opposing_player_id);
  const absentPlayerIds = currentAbsents.map(ap => ap.player_id || ap.opposing_player_id);
  const availablePlayers = currentPlayers.filter(p => 
    !lineupPlayerIds.includes(p.id) && 
    !absentPlayerIds.includes(p.id) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (selectedMatchId) {
      fetchLineups();
      fetchAbsentPlayers();
      fetchOpposingPlayersForMatch();
    }
  }, [selectedMatchId]);

  // Re-enrich data when players/opposingPlayers are loaded
  useEffect(() => {
    if (lineupPlayers.length > 0 && (players.length > 0 || opposingPlayers.length > 0)) {
      const enrichedData = lineupPlayers.map(lineup => {
        if (lineup.team_type === 'real_madrid' && lineup.player_id) {
          const player = players.find(p => p.id === lineup.player_id);
          return { ...lineup, player_image: player?.image_url };
        }
        // Opposing players don't have images in DB
        return lineup;
      });
      setLineupPlayers(enrichedData);
    }
  }, [players, opposingPlayers]);

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('id, home_team, away_team, match_date, competition')
      .order('match_date', { ascending: false });
    
    if (error) {
      toast.error('Erreur lors du chargement des matchs');
      return;
    }
    setMatches(data || []);
  };

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('id, name, position, jersey_number, image_url')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast.error('Erreur lors du chargement des joueurs');
      return;
    }
    setPlayers(data || []);
  };

  const fetchOpposingPlayersForMatch = async () => {
    if (!selectedMatch) return;
    
    const opposingTeamName = selectedMatch.home_team === 'Real Madrid' 
      ? selectedMatch.away_team 
      : selectedMatch.home_team;
    
    const { data: teamData } = await supabase
      .from('opposing_teams')
      .select('id')
      .eq('name', opposingTeamName)
      .maybeSingle();
    
    if (teamData) {
      const { data, error } = await supabase
        .from('opposing_players')
        .select('id, name, position, jersey_number, team_id')
        .eq('team_id', teamData.id)
        .order('name');
      
      if (!error) {
        setOpposingPlayers(data || []);
      }
    } else {
      setOpposingPlayers([]);
    }
  };

  const fetchLineups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('match_probable_lineups')
      .select('*')
      .eq('match_id', selectedMatchId);
    
    if (error) {
      toast.error('Erreur lors du chargement des compositions');
    } else {
      setLineupPlayers(data || []);
    }
    setLoading(false);
  };

  const fetchAbsentPlayers = async () => {
    const { data, error } = await supabase
      .from('match_absent_players')
      .select('*')
      .eq('match_id', selectedMatchId);
    
    if (error) {
      toast.error('Erreur lors du chargement des absents');
    } else {
      const enrichedData = (data || []).map(absent => {
        if (absent.team_type === 'real_madrid' && absent.player_id) {
          const player = players.find(p => p.id === absent.player_id);
          return { ...absent, player_image: player?.image_url };
        }
        return absent;
      });
      setAbsentPlayers(enrichedData);
    }
  };

  const addToLineup = async (playerId: string, isStarter: boolean) => {
    const isRealMadrid = activeTeam === 'real_madrid';
    const player = isRealMadrid 
      ? players.find(p => p.id === playerId)
      : opposingPlayers.find(p => p.id === playerId);
    
    if (!player) return;
    
    const lineupData = {
      match_id: selectedMatchId,
      player_id: isRealMadrid ? playerId : null,
      opposing_player_id: !isRealMadrid ? playerId : null,
      player_name: player.name,
      position: player.position,
      jersey_number: player.jersey_number,
      is_starter: isStarter,
      team_type: activeTeam,
    };

    const { error } = await supabase
      .from('match_probable_lineups')
      .insert(lineupData);
    
    if (error) {
      toast.error('Erreur lors de l\'ajout du joueur');
    } else {
      toast.success('Joueur ajouté');
      fetchLineups();
    }
  };

  const deleteFromLineup = async (id: string) => {
    const { error } = await supabase
      .from('match_probable_lineups')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Joueur retiré');
      fetchLineups();
    }
  };

  const toggleStarterStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('match_probable_lineups')
      .update({ is_starter: !currentStatus })
      .eq('id', id);
    
    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      fetchLineups();
    }
  };

  const addAbsentPlayer = async () => {
    if (!absentForm.playerId || !absentForm.reason) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const isRealMadrid = activeTeam === 'real_madrid';
    const player = isRealMadrid 
      ? players.find(p => p.id === absentForm.playerId)
      : opposingPlayers.find(p => p.id === absentForm.playerId);
    
    if (!player) return;

    const { error } = await supabase
      .from('match_absent_players')
      .insert({
        match_id: selectedMatchId,
        player_id: isRealMadrid ? absentForm.playerId : null,
        opposing_player_id: !isRealMadrid ? absentForm.playerId : null,
        player_name: player.name,
        reason: absentForm.reason,
        return_date: absentForm.returnDate || null,
        team_type: activeTeam,
      });
    
    if (error) {
      toast.error('Erreur lors de l\'ajout du joueur absent');
    } else {
      toast.success('Joueur absent ajouté');
      setAbsentForm({ playerId: '', reason: '', returnDate: '' });
      fetchAbsentPlayers();
    }
  };

  const deleteAbsentPlayer = async (id: string) => {
    const { error } = await supabase
      .from('match_absent_players')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Joueur retiré des absents');
      fetchAbsentPlayers();
    }
  };

  const addOpposingPlayer = async () => {
    if (!opposingPlayerForm.name || !opposingPlayerForm.position) {
      toast.error('Veuillez remplir le nom et la position');
      return;
    }

    const lineupData = {
      match_id: selectedMatchId,
      player_name: opposingPlayerForm.name,
      position: opposingPlayerForm.position,
      jersey_number: opposingPlayerForm.jerseyNumber ? parseInt(opposingPlayerForm.jerseyNumber) : null,
      is_starter: true,
      team_type: 'opposing',
    };

    const { error } = await supabase
      .from('match_probable_lineups')
      .insert(lineupData);
    
    if (error) {
      toast.error('Erreur lors de l\'ajout');
    } else {
      toast.success('Joueur adverse ajouté');
      setOpposingPlayerForm({ name: '', position: '', jerseyNumber: '' });
      fetchLineups();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const draggedId = active.id as string;
    const dropZone = over.id as string;

    // Check if it's an available player being dragged
    const availablePlayer = currentPlayers.find(p => p.id === draggedId);
    
    if (availablePlayer) {
      // Check if player is already in lineup
      const existingLineup = lineupPlayers.find(
        lp => (lp.player_id === draggedId || lp.opposing_player_id === draggedId) && lp.team_type === activeTeam
      );

      if (!existingLineup) {
        addToLineup(draggedId, dropZone === 'pitch');
      }
    } else {
      // It's a lineup player being moved
      const lineupPlayer = currentLineup.find(lp => lp.id === draggedId);
      if (lineupPlayer) {
        if (dropZone === 'pitch' && !lineupPlayer.is_starter) {
          toggleStarterStatus(lineupPlayer.id, false);
        } else if (dropZone === 'substitutes' && lineupPlayer.is_starter) {
          toggleStarterStatus(lineupPlayer.id, true);
        }
      }
    }
  };

  // CSV Export/Import functions
  const exportLineupsToCSV = () => {
    if (!selectedMatchId) {
      toast.error('Veuillez sélectionner un match');
      return;
    }

    const csvData = lineupPlayers.map((lineup) => ({
      team_type: lineup.team_type,
      player_name: lineup.player_name,
      position: lineup.position,
      jersey_number: lineup.jersey_number || '',
      is_starter: lineup.is_starter ? 'Oui' : 'Non',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `compositions_probables_${selectedMatchId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export CSV réussi');
  };

  const exportAbsentsToCSV = () => {
    if (!selectedMatchId) {
      toast.error('Veuillez sélectionner un match');
      return;
    }

    const csvData = absentPlayers.map((player) => ({
      team_type: player.team_type,
      player_name: player.player_name,
      reason: player.reason,
      return_date: player.return_date || '',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `joueurs_absents_${selectedMatchId}.csv`);
    link.click();
    
    toast.success('Export CSV réussi');
  };

  const importLineupsFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedMatchId) {
      toast.error('Veuillez sélectionner un match');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validRows = results.data.filter((row: any) => 
          row.team_type && row.player_name && row.position
        );

        if (validRows.length === 0) {
          toast.error('Aucune donnée valide trouvée dans le fichier');
          return;
        }

        const insertData = validRows.map((row: any) => ({
          match_id: selectedMatchId,
          team_type: row.team_type,
          player_name: row.player_name,
          position: row.position,
          jersey_number: row.jersey_number ? parseInt(row.jersey_number) : null,
          is_starter: row.is_starter === 'Oui' || row.is_starter === 'true',
        }));

        const { error } = await supabase
          .from('match_probable_lineups')
          .insert(insertData);

        if (error) {
          toast.error('Erreur lors de l\'import: ' + error.message);
          return;
        }

        toast.success(`${validRows.length} joueurs importés avec succès`);
        fetchLineups();
        
        if (lineupsFileInputRef.current) {
          lineupsFileInputRef.current.value = '';
        }
      },
    });
  };

  const importAbsentsFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedMatchId) {
      toast.error('Veuillez sélectionner un match');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validRows = results.data.filter((row: any) => 
          row.team_type && row.player_name && row.reason
        );

        if (validRows.length === 0) {
          toast.error('Aucune donnée valide trouvée dans le fichier');
          return;
        }

        const insertData = validRows.map((row: any) => ({
          match_id: selectedMatchId,
          team_type: row.team_type,
          player_name: row.player_name,
          reason: row.reason,
          return_date: row.return_date || null,
        }));

        const { error } = await supabase
          .from('match_absent_players')
          .insert(insertData);

        if (error) {
          toast.error('Erreur lors de l\'import: ' + error.message);
          return;
        }

        toast.success(`${validRows.length} joueurs absents importés avec succès`);
        fetchAbsentPlayers();
        
        if (absentsFileInputRef.current) {
          absentsFileInputRef.current.value = '';
        }
      },
    });
  };

  const activeDragPlayer = activeDragId 
    ? currentPlayers.find(p => p.id === activeDragId) || currentLineup.find(lp => lp.id === activeDragId)
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des Compositions et Joueurs Absents
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportLineupsToCSV} disabled={!selectedMatchId}>
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export Compos</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => lineupsFileInputRef.current?.click()} disabled={!selectedMatchId}>
              <Upload className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Import Compos</span>
            </Button>
            <Button variant="outline" size="sm" onClick={exportAbsentsToCSV} disabled={!selectedMatchId}>
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export Absents</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => absentsFileInputRef.current?.click()} disabled={!selectedMatchId}>
              <Upload className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Import Absents</span>
            </Button>
            <input ref={lineupsFileInputRef} type="file" accept=".csv" onChange={importLineupsFromCSV} className="hidden" />
            <input ref={absentsFileInputRef} type="file" accept=".csv" onChange={importAbsentsFromCSV} className="hidden" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Match Selection */}
        <div className="space-y-2">
          <Label>Sélectionner un match</Label>
          <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un match..." />
            </SelectTrigger>
            <SelectContent>
              {matches.map(match => (
                <SelectItem key={match.id} value={match.id}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(match.match_date), 'dd/MM/yyyy', { locale: fr })}</span>
                    <span className="font-medium">{match.home_team} vs {match.away_team}</span>
                    {match.competition && (
                      <Badge variant="outline" className="text-xs">{match.competition}</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedMatchId && (
          <>
            {/* Match Info Banner */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-bold text-lg">
                    {selectedMatch?.home_team} vs {selectedMatch?.away_team}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMatch && format(new Date(selectedMatch.match_date), 'EEEE dd MMMM yyyy', { locale: fr })}
                    {selectedMatch?.competition && ` • ${selectedMatch.competition}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{starters.length}/11 titulaires</Badge>
                <Badge variant="outline">{substitutes.length} remplaçants</Badge>
              </div>
            </div>

            {/* Team Tabs */}
            <Tabs value={activeTeam} onValueChange={(v) => setActiveTeam(v as 'real_madrid' | 'opposing')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="real_madrid" className="gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Real Madrid</span>
                  <span className="sm:hidden">Real</span>
                </TabsTrigger>
                <TabsTrigger value="opposing" className="gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="truncate">
                    {selectedMatch?.home_team === 'Real Madrid' ? selectedMatch?.away_team : selectedMatch?.home_team}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTeam} className="mt-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <DndContext
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    collisionDetection={pointerWithin}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Available Players */}
                      <div className="lg:col-span-1 order-2 lg:order-1">
                        <div className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Joueurs disponibles
                            </h3>
                            <Badge variant="secondary">{availablePlayers.length}</Badge>
                          </div>
                          
                          <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Rechercher..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9"
                            />
                          </div>

                          <ScrollArea className="h-[350px]">
                            <div className="space-y-2 pr-4">
                              {availablePlayers.map(player => (
                                <LineupPlayerCard
                                  key={player.id}
                                  id={player.id}
                                  playerId={player.id}
                                  playerName={player.name}
                                  position={player.position}
                                  jerseyNumber={player.jersey_number}
                                  playerImage={'image_url' in player ? player.image_url : undefined}
                                  variant="list"
                                  onAddToStarters={() => addToLineup(player.id, true)}
                                  onAddToSubstitutes={() => addToLineup(player.id, false)}
                                />
                              ))}
                              {availablePlayers.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                  Aucun joueur disponible
                                </p>
                              )}
                            </div>
                          </ScrollArea>

                          {/* Add opposing player form */}
                          {activeTeam === 'opposing' && (
                            <div className="mt-4 pt-4 border-t space-y-3">
                              <h4 className="text-sm font-medium">Ajouter un joueur</h4>
                              <Input
                                placeholder="Nom du joueur"
                                value={opposingPlayerForm.name}
                                onChange={(e) => setOpposingPlayerForm(prev => ({ ...prev, name: e.target.value }))}
                              />
                              <Input
                                placeholder="Position"
                                value={opposingPlayerForm.position}
                                onChange={(e) => setOpposingPlayerForm(prev => ({ ...prev, position: e.target.value }))}
                              />
                              <Input
                                placeholder="Numéro"
                                type="number"
                                value={opposingPlayerForm.jerseyNumber}
                                onChange={(e) => setOpposingPlayerForm(prev => ({ ...prev, jerseyNumber: e.target.value }))}
                              />
                              <Button onClick={addOpposingPlayer} size="sm" className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pitch */}
                      <div className="lg:col-span-2 order-1 lg:order-2 space-y-4">
                        {/* Formation Selector */}
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Formation</Label>
                          <Select value={selectedFormation} onValueChange={setSelectedFormation}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FORMATIONS.map(formation => (
                                <SelectItem key={formation} value={formation}>
                                  {formation}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <LineupPitch id="pitch">
                          {starters.map((player, index) => {
                            const pos = getPositionFromTemplate(selectedFormation, index);
                            return (
                              <LineupPlayerCard
                                key={player.id}
                                id={player.id}
                                playerId={player.player_id || player.opposing_player_id || player.id}
                                playerName={player.player_name}
                                position={player.position}
                                jerseyNumber={player.jersey_number}
                                playerImage={player.player_image}
                                isStarter={true}
                                variant="field"
                                onDelete={() => deleteFromLineup(player.id)}
                                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                              />
                            );
                          })}
                        </LineupPitch>
                      </div>

                      {/* Substitutes & Absents */}
                      <div className="lg:col-span-1 order-3 space-y-6">
                        {/* Substitutes */}
                        <SubstitutesZone id="substitutes" count={substitutes.length}>
                          {substitutes.map(player => (
                            <LineupPlayerCard
                              key={player.id}
                              id={player.id}
                              playerId={player.player_id || player.opposing_player_id || player.id}
                              playerName={player.player_name}
                              position={player.position}
                              jerseyNumber={player.jersey_number}
                              playerImage={player.player_image}
                              isStarter={false}
                              variant="list"
                              onDelete={() => deleteFromLineup(player.id)}
                            />
                          ))}
                        </SubstitutesZone>

                        {/* Absent Players */}
                        <div className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                              <UserX className="h-4 w-4 text-destructive" />
                              Joueurs absents
                            </h3>
                            <Badge variant="destructive">{currentAbsents.length}</Badge>
                          </div>

                          <ScrollArea className="h-[180px] mb-4">
                            <div className="space-y-2 pr-2">
                              {currentAbsents.map(absent => (
                                <AbsentPlayerCard
                                  key={absent.id}
                                  id={absent.id}
                                  playerName={absent.player_name}
                                  playerImage={absent.player_image}
                                  reason={absent.reason}
                                  returnDate={absent.return_date}
                                  onDelete={deleteAbsentPlayer}
                                />
                              ))}
                              {currentAbsents.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  Aucun joueur absent
                                </p>
                              )}
                            </div>
                          </ScrollArea>

                          {/* Add absent form */}
                          <div className="pt-4 border-t space-y-3">
                            <Select
                              value={absentForm.playerId}
                              onValueChange={(v) => setAbsentForm(prev => ({ ...prev, playerId: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un joueur" />
                              </SelectTrigger>
                              <SelectContent>
                                {currentPlayers
                                  .filter(p => !absentPlayerIds.includes(p.id) && !lineupPlayerIds.includes(p.id))
                                  .map(player => (
                                    <SelectItem key={player.id} value={player.id}>
                                      {player.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={absentForm.reason}
                              onValueChange={(v) => setAbsentForm(prev => ({ ...prev, reason: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Raison de l'absence" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Blessure">Blessure</SelectItem>
                                <SelectItem value="Suspension">Suspension</SelectItem>
                                <SelectItem value="Repos">Repos</SelectItem>
                                <SelectItem value="Sélection nationale">Sélection nationale</SelectItem>
                                <SelectItem value="Raison personnelle">Raison personnelle</SelectItem>
                                <SelectItem value="Autre">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="date"
                              value={absentForm.returnDate}
                              onChange={(e) => setAbsentForm(prev => ({ ...prev, returnDate: e.target.value }))}
                              placeholder="Date de retour prévue"
                            />
                            <Button onClick={addAbsentPlayer} size="sm" className="w-full" variant="destructive">
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter aux absents
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Drag Overlay */}
                    <DragOverlay>
                      {activeDragPlayer && (
                        <div className="opacity-80">
                          <LineupPlayerCard
                            id="overlay"
                            playerId="overlay"
                            playerName={'name' in activeDragPlayer ? activeDragPlayer.name : (activeDragPlayer as LineupPlayer).player_name}
                            position={activeDragPlayer.position}
                            jerseyNumber={activeDragPlayer.jersey_number}
                            playerImage={'image_url' in activeDragPlayer ? (activeDragPlayer as Player).image_url : (activeDragPlayer as LineupPlayer).player_image}
                            variant="list"
                          />
                        </div>
                      )}
                    </DragOverlay>
                  </DndContext>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}

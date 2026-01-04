import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Radio, Calendar, Download, Loader2, Link } from 'lucide-react';
import { useLiveBlog, LiveBlogEntry, NewLiveBlogEntry } from '@/hooks/useLiveBlog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Match } from '@/types/Match';
import { liveBlogScraperApi } from '@/lib/api/liveBlogScraper';

import { QuickActionBar } from './liveblog/QuickActionBar';
import { GoalEntryModal } from './liveblog/GoalEntryModal';
import { CardEntryModal } from './liveblog/CardEntryModal';
import { SubstitutionModal } from './liveblog/SubstitutionModal';
import { GroupedEntriesView } from './liveblog/GroupedEntriesView';
import { EditEntryModal } from './liveblog/EditEntryModal';
interface LiveBlogManagerProps {
  matchId?: string;
}

interface Player {
  id: string;
  name: string;
  jersey_number?: number | null;
  image_url?: string | null;
  position?: string;
}

export const LiveBlogManager = ({ matchId: propMatchId }: LiveBlogManagerProps) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(propMatchId || '');
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  
  const { entries, addEntry, updateEntry, deleteEntry, loading } = useLiveBlog(selectedMatchId || undefined);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [submitting, setSubmitting] = useState(false);
  
  // Import from URL states
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  
  // Modal states
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [substitutionModalOpen, setSubstitutionModalOpen] = useState(false);
  const [defaultCardType, setDefaultCardType] = useState<'yellow' | 'red'>('yellow');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LiveBlogEntry | null>(null);

  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setMatches(data as Match[]);
        if (!propMatchId) {
          const liveMatch = data.find(m => m.status === 'live');
          if (liveMatch) setSelectedMatchId(liveMatch.id);
        }
      }
      setLoadingMatches(false);
    };
    
    if (!propMatchId) {
      fetchMatches();
    } else {
      setLoadingMatches(false);
    }
  }, [propMatchId]);

  // Fetch players
  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, jersey_number, image_url, position')
        .eq('is_active', true)
        .order('name');
      
      if (!error && data) {
        setPlayers(data);
      }
    };
    fetchPlayers();
  }, []);

  const handleQuickAction = (type: string) => {
    switch (type) {
      case 'goal':
        setGoalModalOpen(true);
        break;
      case 'yellow_card':
        setDefaultCardType('yellow');
        setCardModalOpen(true);
        break;
      case 'red_card':
        setDefaultCardType('red');
        setCardModalOpen(true);
        break;
      case 'substitution':
        setSubstitutionModalOpen(true);
        break;
      case 'halftime':
        addQuickEntry('halftime', '⏸️ MI-TEMPS', 'La première période est terminée.', 45);
        break;
      case 'kickoff':
        addQuickEntry('kickoff', '▶️ COUP D\'ENVOI', 'Le match commence !', 0);
        break;
      case 'fulltime':
        addQuickEntry('fulltime', '⏹️ FIN DU MATCH', 'C\'est terminé !', 90);
        break;
      case 'var':
        addQuickEntry('var', '📺 VAR', 'L\'arbitre consulte la VAR...', null, true);
        break;
      case 'injury':
        addQuickEntry('injury', '🏥 Blessure', 'Un joueur est au sol...', null);
        break;
      case 'comment':
        // Open a simple comment modal or use existing form
        break;
    }
  };

  const addQuickEntry = async (
    entryType: string, 
    title: string, 
    content: string, 
    minute: number | null,
    isImportant: boolean = false
  ) => {
    if (!selectedMatchId) return;
    
    setSubmitting(true);
    try {
      await addEntry({
        match_id: selectedMatchId,
        minute,
        entry_type: entryType,
        title,
        content,
        is_important: isImportant,
        author_id: user?.id || null,
      });
      toast({ title: 'Entrée ajoutée' });
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoalSubmit = async (data: {
    minute: number;
    player_id: string;
    assist_player_id?: string;
    content: string;
    is_important: boolean;
    team_side: 'home' | 'away';
  }) => {
    if (!selectedMatchId) return;
    
    setSubmitting(true);
    try {
      await addEntry({
        match_id: selectedMatchId,
        minute: data.minute,
        entry_type: 'goal',
        title: 'BUT !',
        content: data.content,
        is_important: data.is_important,
        author_id: user?.id || null,
        player_id: data.player_id,
        assist_player_id: data.assist_player_id || null,
        team_side: data.team_side,
      });
      toast({ title: 'But ajouté' });
      setGoalModalOpen(false);
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardSubmit = async (data: {
    minute: number;
    player_id: string;
    card_type: 'yellow' | 'red' | 'second_yellow';
    card_reason: string;
    content: string;
    is_important: boolean;
    team_side: 'home' | 'away';
  }) => {
    if (!selectedMatchId) return;
    
    setSubmitting(true);
    try {
      await addEntry({
        match_id: selectedMatchId,
        minute: data.minute,
        entry_type: data.card_type === 'yellow' ? 'yellow_card' : 'red_card',
        title: data.card_type === 'yellow' ? 'CARTON JAUNE' : 'CARTON ROUGE',
        content: data.content,
        is_important: data.is_important,
        author_id: user?.id || null,
        player_id: data.player_id,
        card_type: data.card_type,
        card_reason: data.card_reason,
        team_side: data.team_side,
      });
      toast({ title: 'Carton ajouté' });
      setCardModalOpen(false);
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubstitutionSubmit = async (data: {
    minute: number;
    player_id: string;
    substituted_player_id: string;
    content: string;
    team_side: 'home' | 'away';
  }) => {
    if (!selectedMatchId) return;
    
    setSubmitting(true);
    try {
      await addEntry({
        match_id: selectedMatchId,
        minute: data.minute,
        entry_type: 'substitution',
        title: 'REMPLACEMENT',
        content: data.content,
        is_important: false,
        author_id: user?.id || null,
        player_id: data.player_id,
        substituted_player_id: data.substituted_player_id,
        team_side: data.team_side,
      });
      toast({ title: 'Remplacement ajouté' });
      setSubstitutionModalOpen(false);
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette entrée ?')) return;
    
    try {
      await deleteEntry(id);
      toast({ title: 'Entrée supprimée' });
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleEdit = (entry: LiveBlogEntry) => {
    setEditingEntry(entry);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (id: string, updates: Partial<LiveBlogEntry>) => {
    setSubmitting(true);
    try {
      await updateEntry(id, updates);
      toast({ title: 'Entrée modifiée' });
      setEditModalOpen(false);
      setEditingEntry(null);
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportFromUrl = async () => {
    if (!selectedMatchId || !importUrl.trim()) {
      toast({ title: 'Veuillez entrer une URL', variant: 'destructive' });
      return;
    }

    setImporting(true);
    try {
      const result = await liveBlogScraperApi.importFromUrl(importUrl.trim(), selectedMatchId);
      
      if (result.success) {
        toast({ 
          title: 'Import réussi', 
          description: `${result.entriesImported} entrées importées` 
        });
        setImportUrl('');
      } else {
        toast({ 
          title: 'Erreur d\'import', 
          description: result.error || 'Impossible d\'importer le live blog',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Erreur', 
        description: 'Une erreur est survenue lors de l\'import',
        variant: 'destructive' 
      });
    } finally {
      setImporting(false);
    }
  };

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  return (
    <div className="space-y-4">
      {/* Match Selector */}
      {!propMatchId && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4" />
              Match
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingMatches ? (
              <p className="text-muted-foreground text-sm">Chargement...</p>
            ) : (
              <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un match" />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      <span className="flex items-center gap-2">
                        {match.status === 'live' && (
                          <Badge variant="destructive" className="text-xs">LIVE</Badge>
                        )}
                        {match.home_team} vs {match.away_team} - {format(new Date(match.match_date), 'dd/MM HH:mm')}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedMatch && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{selectedMatch.home_team} vs {selectedMatch.away_team}</p>
                    <p className="text-xs text-muted-foreground">{selectedMatch.competition}</p>
                  </div>
                  <Badge variant={selectedMatch.status === 'live' ? 'destructive' : 'outline'}>
                    {selectedMatch.status === 'live' ? '🔴 LIVE' : selectedMatch.status}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import from URL */}
      {selectedMatchId && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Link className="w-4 h-4" />
              Importer depuis Real Madrid
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Input
                placeholder="https://www.realmadrid.com/en/live-blog/..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                disabled={importing}
                className="flex-1"
              />
              <Button 
                onClick={handleImportFromUrl} 
                disabled={importing || !importUrl.trim()}
                variant="secondary"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Import...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Importer
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Collez l'URL du live blog officiel du Real Madrid pour importer automatiquement les événements
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Action Bar */}
      {selectedMatchId && (
        <QuickActionBar onAction={handleQuickAction} isLive={selectedMatch?.status === 'live'} />
      )}

      {/* Entries List */}
      {selectedMatchId && (
        <Card>
          <CardContent className="pt-4">
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Chargement...</p>
            ) : (
              <GroupedEntriesView
                entries={entries}
                players={players}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )}
          </CardContent>
        </Card>
      )}
      
      {!selectedMatchId && !loadingMatches && (
        <Card>
          <CardContent className="py-12 text-center">
            <Radio className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Sélectionnez un match pour gérer son Live Blog
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <GoalEntryModal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSubmit={handleGoalSubmit}
        players={players}
        isSubmitting={submitting}
      />

      <CardEntryModal
        open={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        onSubmit={handleCardSubmit}
        players={players}
        isSubmitting={submitting}
        defaultCardType={defaultCardType}
      />

      <SubstitutionModal
        open={substitutionModalOpen}
        onClose={() => setSubstitutionModalOpen(false)}
        onSubmit={handleSubstitutionSubmit}
        players={players}
        isSubmitting={submitting}
      />

      <EditEntryModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={handleEditSubmit}
        entry={editingEntry}
        isSubmitting={submitting}
      />
    </div>
  );
};

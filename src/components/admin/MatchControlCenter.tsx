import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, Pause, Square, Timer, Radio, Trash2, Send, Calendar, 
  Image, Upload, X, Target, AlertCircle
} from 'lucide-react';
import { useMatchTimer } from '@/hooks/useMatchTimer';
import { useLiveBlog } from '@/hooks/useLiveBlog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Match } from '@/types/Match';

interface MatchControlCenterProps {
  matchId?: string;
}

const ENTRY_TYPES = [
  { value: 'update', label: 'Mise à jour', emoji: '📝' },
  { value: 'goal', label: 'But', emoji: '⚽' },
  { value: 'yellow_card', label: 'Carton jaune', emoji: '🟨' },
  { value: 'red_card', label: 'Carton rouge', emoji: '🟥' },
  { value: 'substitution', label: 'Remplacement', emoji: '🔄' },
  { value: 'var', label: 'VAR', emoji: '📺' },
  { value: 'penalty', label: 'Penalty', emoji: '⚡' },
  { value: 'injury', label: 'Blessure', emoji: '🏥' },
  { value: 'corner', label: 'Corner', emoji: '🚩' },
  { value: 'chance', label: 'Occasion', emoji: '🎯' },
  { value: 'kickoff', label: 'Coup d\'envoi', emoji: '▶️' },
  { value: 'halftime', label: 'Mi-temps', emoji: '⏸️' },
  { value: 'fulltime', label: 'Fin de match', emoji: '⏹️' },
  { value: 'extra_time', label: 'Temps additionnel', emoji: '⏰' },
  { value: 'media', label: 'Photo/Vidéo', emoji: '📷' },
];

export const MatchControlCenter = ({ matchId: propMatchId }: MatchControlCenterProps) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(propMatchId || '');
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<{ id: string; name: string; jersey_number: number | null }[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  
  const { 
    timerSettings, 
    currentMinute, 
    getNumericMinute,
    getPeriodLabel,
    startFirstHalf, 
    endFirstHalf, 
    startSecondHalf, 
    endMatch,
    startExtraTime1,
    endExtraTime1,
    startExtraTime2,
    endExtraTime2,
    setExtraTime,
    loading: timerLoading 
  } = useMatchTimer(selectedMatchId);
  
  const { entries, addEntry, deleteEntry, loading: blogLoading } = useLiveBlog(selectedMatchId);
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [entryType, setEntryType] = useState('update');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Extra time input
  const [extraTimeInput, setExtraTimeInput] = useState<string>('');

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
      const { data } = await supabase
        .from('players')
        .select('id, name, jersey_number')
        .eq('is_active', true)
        .order('name');
      
      if (data) setPlayers(data);
    };
    fetchPlayers();
  }, []);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Erreur', description: 'Fichier image requis', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `live-blog/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      setImagePreview(publicUrl);
      toast({ title: 'Image uploadée' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  // Remove image
  const removeImage = () => {
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit entry
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim() || !selectedMatchId) return;

    setSubmitting(true);
    try {
      await addEntry({
        match_id: selectedMatchId,
        minute: getNumericMinute(),
        entry_type: entryType,
        title: title || null,
        content,
        is_important: isImportant,
        author_id: user?.id || null,
        image_url: imageUrl || null,
        player_id: selectedPlayerId || null,
      });

      toast({ title: 'Entrée publiée' });

      // Reset form
      setTitle('');
      setContent('');
      setIsImportant(false);
      setEntryType('update');
      setSelectedPlayerId('');
      removeImage();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de publier', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // Quick actions
  const quickGoal = async (team: 'home' | 'away') => {
    const selectedMatch = matches.find(m => m.id === selectedMatchId);
    if (!selectedMatch) return;

    const teamName = team === 'home' ? selectedMatch.home_team : selectedMatch.away_team;
    const minute = getNumericMinute();

    // Update score
    const scoreField = team === 'home' ? 'home_score' : 'away_score';
    const currentScore = team === 'home' ? (selectedMatch.home_score || 0) : (selectedMatch.away_score || 0);
    
    await supabase
      .from('matches')
      .update({ [scoreField]: currentScore + 1 })
      .eq('id', selectedMatchId);

    // Add live blog entry
    await addEntry({
      match_id: selectedMatchId,
      minute,
      entry_type: 'goal',
      title: `⚽ BUT! ${teamName}`,
      content: `${teamName} marque! Score: ${team === 'home' ? currentScore + 1 : selectedMatch.home_score || 0} - ${team === 'away' ? currentScore + 1 : selectedMatch.away_score || 0}`,
      is_important: true,
      author_id: user?.id || null,
    });

    toast({ title: `But ${teamName}!` });
  };

  const quickCard = async (cardType: 'yellow' | 'red') => {
    await addEntry({
      match_id: selectedMatchId,
      minute: getNumericMinute(),
      entry_type: cardType === 'yellow' ? 'yellow_card' : 'red_card',
      title: cardType === 'yellow' ? '🟨 Carton jaune' : '🟥 Carton rouge',
      content: cardType === 'yellow' ? 'Carton jaune distribué' : 'Carton rouge! Expulsion!',
      is_important: cardType === 'red',
      author_id: user?.id || null,
    });
  };

  // Handle timer actions
  const handleStartFirstHalf = async () => {
    await startFirstHalf();
    await addEntry({
      match_id: selectedMatchId,
      minute: 0,
      entry_type: 'kickoff',
      title: '▶️ Coup d\'envoi!',
      content: 'Le match commence!',
      is_important: true,
      author_id: user?.id || null,
    });
    
    // Update match status to live
    await supabase.from('matches').update({ status: 'live' }).eq('id', selectedMatchId);
    toast({ title: 'Match démarré!' });
  };

  const handleEndFirstHalf = async () => {
    const extraTime = parseInt(extraTimeInput) || 0;
    await endFirstHalf(extraTime);
    await addEntry({
      match_id: selectedMatchId,
      minute: 45 + extraTime,
      entry_type: 'halftime',
      title: '⏸️ Mi-temps',
      content: `Fin de la première période${extraTime > 0 ? ` (+ ${extraTime} min)` : ''}`,
      is_important: true,
      author_id: user?.id || null,
    });
    setExtraTimeInput('');
    toast({ title: 'Mi-temps!' });
  };

  const handleStartSecondHalf = async () => {
    await startSecondHalf();
    await addEntry({
      match_id: selectedMatchId,
      minute: 46,
      entry_type: 'kickoff',
      title: '▶️ Reprise!',
      content: 'La seconde période commence!',
      is_important: true,
      author_id: user?.id || null,
    });
    toast({ title: 'Reprise!' });
  };

  const handleEndMatch = async () => {
    const extraTime = parseInt(extraTimeInput) || 0;
    await endMatch(extraTime);
    await addEntry({
      match_id: selectedMatchId,
      minute: 90 + extraTime,
      entry_type: 'fulltime',
      title: '⏹️ Fin du temps réglementaire!',
      content: `90 minutes terminées!${extraTime > 0 ? ` (+ ${extraTime} min)` : ''}`,
      is_important: true,
      author_id: user?.id || null,
    });

    // Marquer le match comme terminé (stop du LIVE)
    await supabase.from('matches').update({ status: 'finished' }).eq('id', selectedMatchId);
    setMatches((prev) => prev.map((m) => (m.id === selectedMatchId ? ({ ...m, status: 'finished' } as Match) : m)));

    setExtraTimeInput('');
    toast({ title: 'Match terminé!' });
  };

  // Prolongations handlers
  const handleStartExtraTime1 = async () => {
    await startExtraTime1();
    await addEntry({
      match_id: selectedMatchId,
      minute: 91,
      entry_type: 'kickoff',
      title: '▶️ Début des prolongations!',
      content: 'La première période de prolongation commence (15 min)',
      is_important: true,
      author_id: user?.id || null,
    });
    toast({ title: 'Prolongation 1 démarrée!' });
  };

  const handleEndExtraTime1 = async () => {
    const extraTime = parseInt(extraTimeInput) || 0;
    await endExtraTime1(extraTime);
    await addEntry({
      match_id: selectedMatchId,
      minute: 105 + extraTime,
      entry_type: 'halftime',
      title: '⏸️ Mi-temps des prolongations',
      content: `Fin de la 1ère période de prolongation${extraTime > 0 ? ` (+ ${extraTime} min)` : ''}`,
      is_important: true,
      author_id: user?.id || null,
    });
    setExtraTimeInput('');
    toast({ title: 'Mi-temps prolongations!' });
  };

  const handleStartExtraTime2 = async () => {
    await startExtraTime2();
    await addEntry({
      match_id: selectedMatchId,
      minute: 106,
      entry_type: 'kickoff',
      title: '▶️ Reprise prolongations!',
      content: 'La 2ème période de prolongation commence (15 min)',
      is_important: true,
      author_id: user?.id || null,
    });
    toast({ title: 'Prolongation 2 démarrée!' });
  };

  const handleEndExtraTime2 = async () => {
    const extraTime = parseInt(extraTimeInput) || 0;
    await endExtraTime2(extraTime);
    await addEntry({
      match_id: selectedMatchId,
      minute: 120 + extraTime,
      entry_type: 'fulltime',
      title: '⏹️ Fin des prolongations!',
      content: `Les prolongations sont terminées!${extraTime > 0 ? ` (+ ${extraTime} min)` : ''}`,
      is_important: true,
      author_id: user?.id || null,
    });
    
    await supabase.from('matches').update({ status: 'finished' }).eq('id', selectedMatchId);
    setExtraTimeInput('');
    toast({ title: 'Match terminé!' });
  };

  const handleSetExtraTime = async () => {
    const minutes = parseInt(extraTimeInput);
    if (isNaN(minutes) || minutes < 0) return;
    await setExtraTime(minutes);
    const period = timerSettings?.current_half || 1;
    const baseMinute = period === 1 ? 45 : period === 2 ? 90 : period === 3 ? 105 : 120;
    await addEntry({
      match_id: selectedMatchId,
      minute: baseMinute,
      entry_type: 'extra_time',
      title: `⏰ Temps additionnel: ${minutes} minutes`,
      content: `${minutes} minutes de temps additionnel annoncées`,
      is_important: false,
      author_id: user?.id || null,
    });
    toast({ title: `Temps additionnel: ${minutes} min` });
  };

  // Delete entry handler with feedback
  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteEntry(entryId);
      toast({ title: 'Entrée supprimée' });
    } catch (error: any) {
      toast({ 
        title: 'Erreur', 
        description: error.message || 'Impossible de supprimer', 
        variant: 'destructive' 
      });
    }
  };

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  if (!selectedMatchId && loadingMatches) {
    return <div className="text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Match Selector */}
      {!propMatchId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Sélectionner un match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un match" />
              </SelectTrigger>
              <SelectContent>
                {matches.map((match) => (
                  <SelectItem key={match.id} value={match.id}>
                    <span className="flex items-center gap-2">
                      {match.status === 'live' && <Badge variant="destructive" className="text-xs">LIVE</Badge>}
                      {match.home_team} vs {match.away_team} - {format(new Date(match.match_date), 'dd/MM HH:mm')}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {selectedMatchId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Contrôle du minuteur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current time display */}
              <div className="text-center p-6 bg-muted rounded-lg">
                <div className="text-5xl font-mono font-bold text-primary">
                  {currentMinute}'
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {timerSettings?.is_timer_running ? (
                    <Badge variant="destructive" className="animate-pulse">EN COURS</Badge>
                  ) : (
                    <Badge variant="outline">ARRÊTÉ</Badge>
                  )}
                  {timerSettings && (
                    <span className="ml-2">{getPeriodLabel()}</span>
                  )}
                </div>
              </div>

              {/* Timer buttons - Match régulier */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Match régulier</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={handleStartFirstHalf}
                    disabled={timerSettings?.is_timer_running || (timerSettings?.current_half || 0) >= 1}
                    className="w-full"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Coup d'envoi
                  </Button>
                  <Button 
                    onClick={handleEndFirstHalf}
                    disabled={!timerSettings?.is_timer_running || timerSettings?.current_half !== 1}
                    variant="secondary"
                    className="w-full"
                    size="sm"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Mi-temps
                  </Button>
                  <Button 
                    onClick={handleStartSecondHalf}
                    disabled={timerSettings?.is_timer_running || timerSettings?.current_half !== 1 || !timerSettings?.is_paused}
                    className="w-full"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Reprise
                  </Button>
                  <Button 
                    onClick={handleEndMatch}
                    disabled={(timerSettings?.current_half !== 2) || (!timerSettings?.is_timer_running && !timerSettings?.is_paused)}
                    variant="destructive"
                    className="w-full"
                    size="sm"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Fin 90'
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Prolongations */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Prolongations (2x15min)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={handleStartExtraTime1}
                    disabled={timerSettings?.is_timer_running || timerSettings?.current_half !== 2 || !timerSettings?.is_paused}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Prol. 1
                  </Button>
                  <Button 
                    onClick={handleEndExtraTime1}
                    disabled={!timerSettings?.is_timer_running || timerSettings?.current_half !== 3}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Mi-prol.
                  </Button>
                  <Button 
                    onClick={handleStartExtraTime2}
                    disabled={timerSettings?.is_timer_running || timerSettings?.current_half !== 3 || !timerSettings?.is_paused}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Prol. 2
                  </Button>
                  <Button 
                    onClick={handleEndExtraTime2}
                    disabled={(timerSettings?.current_half !== 4) || (!timerSettings?.is_timer_running && !timerSettings?.is_paused)}
                    variant="destructive"
                    className="w-full"
                    size="sm"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Fin 120'
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Extra time */}
              <div className="space-y-2">
                <Label>Temps additionnel</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="15"
                    placeholder="Minutes"
                    value={extraTimeInput}
                    onChange={(e) => setExtraTimeInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleSetExtraTime}>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Annoncer
                  </Button>
                </div>
              </div>

              {/* Quick actions */}
              <Separator />
              <div className="space-y-2">
                <Label>Actions rapides</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => quickGoal('home')}
                    className="text-xs"
                  >
                    ⚽ But {selectedMatch?.home_team?.substring(0, 10)}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => quickGoal('away')}
                    className="text-xs"
                  >
                    ⚽ But {selectedMatch?.away_team?.substring(0, 10)}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => quickCard('yellow')}
                    size="sm"
                  >
                    🟨 Jaune
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => quickCard('red')}
                    size="sm"
                  >
                    🟥 Rouge
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Blog Entry Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500" />
                Nouvelle entrée Live Blog
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Minute</Label>
                    <div className="h-10 px-3 flex items-center bg-muted rounded-md font-mono font-bold">
                      {currentMinute}'
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={entryType} onValueChange={setEntryType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENTRY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.emoji} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Joueur (optionnel)</Label>
                    <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un joueur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Aucun joueur</SelectItem>
                        {players.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.jersey_number && `#${player.jersey_number} `}{player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Titre (optionnel)</Label>
                  <Input
                    placeholder="Titre de l'entrée"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contenu *</Label>
                  <Textarea
                    placeholder="Décrivez l'événement..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                {/* Image upload */}
                <div className="space-y-2">
                  <Label>Image (optionnel)</Label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Upload...' : 'Ajouter image'}
                    </Button>
                    
                    {imagePreview && (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="h-16 w-auto rounded-md object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={removeImage}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="important"
                      checked={isImportant}
                      onCheckedChange={setIsImportant}
                    />
                    <Label htmlFor="important">Marquer comme important</Label>
                  </div>
                  
                  <Button type="submit" disabled={submitting || !content.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Publication...' : 'Publier'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Timeline */}
      {selectedMatchId && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline des événements ({entries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {blogLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : entries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun événement. Démarrez le match pour commencer!
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      entry.is_important ? 'bg-primary/5 border-primary/30' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {entry.minute !== null && (
                          <Badge variant="outline" className="font-mono">
                            {entry.minute}'
                          </Badge>
                        )}
                        <Badge>
                          {ENTRY_TYPES.find(t => t.value === entry.entry_type)?.emoji} {entry.entry_type}
                        </Badge>
                        {entry.is_important && <Badge variant="destructive">Important</Badge>}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {format(new Date(entry.created_at), 'HH:mm:ss', { locale: fr })}
                        </span>
                      </div>
                      {entry.title && <h4 className="font-semibold">{entry.title}</h4>}
                      <p className="text-sm text-muted-foreground">{entry.content}</p>
                      {entry.image_url && (
                        <img 
                          src={entry.image_url} 
                          alt="" 
                          className="mt-2 max-h-32 rounded-md object-cover"
                        />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedMatchId && !loadingMatches && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Sélectionnez un match pour accéder au centre de contrôle
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

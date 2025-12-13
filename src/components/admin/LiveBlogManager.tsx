import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Radio, Trash2, Plus, Send } from 'lucide-react';
import { useLiveBlog } from '@/hooks/useLiveBlog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LiveBlogManagerProps {
  matchId: string;
}

const ENTRY_TYPES = [
  { value: 'update', label: 'Mise à jour' },
  { value: 'goal', label: 'But ⚽' },
  { value: 'card', label: 'Carton 🟨🟥' },
  { value: 'substitution', label: 'Remplacement 🔄' },
  { value: 'important', label: 'Important ❗' },
  { value: 'halftime', label: 'Mi-temps' },
  { value: 'kickoff', label: 'Coup d\'envoi' },
  { value: 'fulltime', label: 'Fin du match' },
];

export const LiveBlogManager = ({ matchId }: LiveBlogManagerProps) => {
  const { entries, addEntry, deleteEntry, loading } = useLiveBlog(matchId);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [minute, setMinute] = useState<string>('');
  const [entryType, setEntryType] = useState('update');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await addEntry({
        match_id: matchId,
        minute: minute ? parseInt(minute) : null,
        entry_type: entryType,
        title: title || null,
        content,
        is_important: isImportant,
        author_id: user?.id || null,
      });

      toast({
        title: 'Entrée ajoutée',
        description: 'La mise à jour a été publiée en direct.',
      });

      // Reset form
      setMinute('');
      setTitle('');
      setContent('');
      setIsImportant(false);
      setEntryType('update');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'entrée.',
        variant: 'destructive',
      });
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
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'entrée.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* New Entry Form */}
      <Card>
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
                <Label htmlFor="minute">Minute</Label>
                <Input
                  id="minute"
                  type="number"
                  min="0"
                  max="120"
                  placeholder="45"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                />
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
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">Titre (optionnel)</Label>
                <Input
                  id="title"
                  placeholder="Titre de l'entrée"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenu *</Label>
              <Textarea
                id="content"
                placeholder="Décrivez l'événement..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                required
              />
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

      {/* Existing Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Entrées publiées ({entries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : entries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune entrée pour le moment. Commencez à publier !
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    entry.is_important ? 'bg-primary/5 border-primary/30' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {entry.minute !== null && (
                        <Badge variant="outline" className="font-mono">
                          {entry.minute}'
                        </Badge>
                      )}
                      <Badge>{entry.entry_type}</Badge>
                      {entry.is_important && (
                        <Badge variant="destructive">Important</Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(entry.created_at), 'HH:mm:ss', { locale: fr })}
                      </span>
                    </div>
                    {entry.title && (
                      <h4 className="font-semibold">{entry.title}</h4>
                    )}
                    <p className="text-sm text-muted-foreground">{entry.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

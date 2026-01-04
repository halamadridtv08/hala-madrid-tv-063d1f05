import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { LiveBlogEntry } from '@/hooks/useLiveBlog';

interface EditEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<LiveBlogEntry>) => Promise<void>;
  entry: LiveBlogEntry | null;
  isSubmitting: boolean;
}

const ENTRY_TYPES = [
  { value: 'update', label: 'Mise à jour' },
  { value: 'goal', label: 'But' },
  { value: 'yellow_card', label: 'Carton jaune' },
  { value: 'red_card', label: 'Carton rouge' },
  { value: 'substitution', label: 'Remplacement' },
  { value: 'var', label: 'VAR' },
  { value: 'penalty', label: 'Penalty' },
  { value: 'corner', label: 'Corner' },
  { value: 'chance', label: 'Occasion' },
  { value: 'injury', label: 'Blessure' },
  { value: 'extra_time', label: 'Temps additionnel' },
  { value: 'kickoff', label: 'Coup d\'envoi' },
  { value: 'halftime', label: 'Mi-temps' },
  { value: 'fulltime', label: 'Fin du match' },
  { value: 'media', label: 'Photo/Vidéo' },
  { value: 'comment', label: 'Commentaire' },
];

export const EditEntryModal = ({
  open,
  onClose,
  onSubmit,
  entry,
  isSubmitting
}: EditEntryModalProps) => {
  const [minute, setMinute] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryType, setEntryType] = useState('comment');
  const [isImportant, setIsImportant] = useState(false);

  useEffect(() => {
    if (entry) {
      setMinute(entry.minute !== null ? String(entry.minute) : '');
      setTitle(entry.title || '');
      setContent(entry.content);
      setEntryType(entry.entry_type);
      setIsImportant(entry.is_important);
    }
  }, [entry]);

  const handleSubmit = async () => {
    if (!entry) return;
    
    await onSubmit(entry.id, {
      minute: minute ? parseInt(minute) : null,
      title: title || null,
      content,
      entry_type: entryType,
      is_important: isImportant,
    });
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'événement</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-minute">Minute</Label>
              <Input
                id="edit-minute"
                type="number"
                min="0"
                max="120"
                placeholder="Ex: 45"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select value={entryType} onValueChange={setEntryType}>
                <SelectTrigger id="edit-type">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-title">Titre</Label>
            <Input
              id="edit-title"
              placeholder="Ex: BUT !"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-content">Contenu</Label>
            <Textarea
              id="edit-content"
              placeholder="Description de l'événement..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="edit-important">Événement important</Label>
            <Switch
              id="edit-important"
              checked={isImportant}
              onCheckedChange={setIsImportant}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

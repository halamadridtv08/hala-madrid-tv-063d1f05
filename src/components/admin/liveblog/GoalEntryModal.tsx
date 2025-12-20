import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { QuickPlayerSelector } from './QuickPlayerSelector';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CircleDot } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  jersey_number?: number | null;
  image_url?: string | null;
}

interface GoalEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    minute: number;
    player_id: string;
    assist_player_id?: string;
    content: string;
    is_important: boolean;
    team_side: 'home' | 'away';
  }) => void;
  players: Player[];
  isSubmitting?: boolean;
}

export const GoalEntryModal = ({
  open,
  onClose,
  onSubmit,
  players,
  isSubmitting
}: GoalEntryModalProps) => {
  const [minute, setMinute] = useState<number>(0);
  const [scorerId, setScorerId] = useState<string>('');
  const [assistId, setAssistId] = useState<string>('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(true);
  const [teamSide, setTeamSide] = useState<'home' | 'away'>('home');

  const handleSubmit = () => {
    if (!scorerId || minute === undefined) return;
    
    const scorer = players.find(p => p.id === scorerId);
    const assister = players.find(p => p.id === assistId);
    
    const autoContent = content || 
      `⚽ BUT ! ${scorer?.name}${assister ? ` (passe de ${assister.name})` : ''}`;
    
    onSubmit({
      minute,
      player_id: scorerId,
      assist_player_id: assistId || undefined,
      content: autoContent,
      is_important: isImportant,
      team_side: teamSide
    });
    
    // Reset form
    setMinute(0);
    setScorerId('');
    setAssistId('');
    setContent('');
    setIsImportant(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleDot className="h-5 w-5 text-green-500" />
            Ajouter un but
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minute</Label>
              <Input
                type="number"
                min={0}
                max={120}
                value={minute}
                onChange={(e) => setMinute(parseInt(e.target.value) || 0)}
                className="text-2xl font-bold h-14 text-center"
              />
            </div>
            <div>
              <Label>Équipe</Label>
              <RadioGroup 
                value={teamSide} 
                onValueChange={(v) => setTeamSide(v as 'home' | 'away')}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="home" id="home" />
                  <Label htmlFor="home">Domicile</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="away" id="away" />
                  <Label htmlFor="away">Extérieur</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <QuickPlayerSelector
            players={players}
            selectedPlayerId={scorerId}
            onSelect={(p) => setScorerId(p.id)}
            label="Buteur *"
          />

          <QuickPlayerSelector
            players={players.filter(p => p.id !== scorerId)}
            selectedPlayerId={assistId}
            onSelect={(p) => setAssistId(p.id)}
            label="Passeur décisif (optionnel)"
          />

          <div>
            <Label>Commentaire (optionnel)</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Description du but..."
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isImportant}
              onCheckedChange={setIsImportant}
            />
            <Label>Marquer comme important</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!scorerId || isSubmitting}
            className="bg-green-500 hover:bg-green-600"
          >
            {isSubmitting ? 'Ajout...' : 'Ajouter le but'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

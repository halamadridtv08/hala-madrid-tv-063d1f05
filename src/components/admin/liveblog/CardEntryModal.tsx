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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  jersey_number?: number | null;
  image_url?: string | null;
}

interface CardEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    minute: number;
    player_id: string;
    card_type: 'yellow' | 'red' | 'second_yellow';
    card_reason: string;
    content: string;
    is_important: boolean;
    team_side: 'home' | 'away';
  }) => void;
  players: Player[];
  isSubmitting?: boolean;
  defaultCardType?: 'yellow' | 'red';
}

const CARD_REASONS = [
  { value: 'foul', label: 'Faute' },
  { value: 'unsportsmanlike', label: 'Comportement antisportif' },
  { value: 'handball', label: 'Main' },
  { value: 'time_wasting', label: 'Perte de temps' },
  { value: 'simulation', label: 'Simulation' },
  { value: 'protest', label: 'Protestation' },
  { value: 'dangerous_play', label: 'Jeu dangereux' },
  { value: 'other', label: 'Autre' },
];

export const CardEntryModal = ({
  open,
  onClose,
  onSubmit,
  players,
  isSubmitting,
  defaultCardType = 'yellow'
}: CardEntryModalProps) => {
  const [minute, setMinute] = useState<number>(0);
  const [playerId, setPlayerId] = useState<string>('');
  const [cardType, setCardType] = useState<'yellow' | 'red' | 'second_yellow'>(defaultCardType);
  const [cardReason, setCardReason] = useState('foul');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(cardType === 'red');
  const [teamSide, setTeamSide] = useState<'home' | 'away'>('home');

  const handleSubmit = () => {
    if (!playerId || minute === undefined) return;
    
    const player = players.find(p => p.id === playerId);
    const reasonLabel = CARD_REASONS.find(r => r.value === cardReason)?.label || cardReason;
    
    const cardEmoji = cardType === 'yellow' ? '🟨' : cardType === 'second_yellow' ? '🟨🟨' : '🟥';
    const autoContent = content || 
      `${cardEmoji} Carton ${cardType === 'red' ? 'rouge' : 'jaune'}${cardType === 'second_yellow' ? ' (2e)' : ''} pour ${player?.name} (${reasonLabel})`;
    
    onSubmit({
      minute,
      player_id: playerId,
      card_type: cardType,
      card_reason: cardReason,
      content: autoContent,
      is_important: isImportant,
      team_side: teamSide
    });
    
    // Reset form
    setMinute(0);
    setPlayerId('');
    setCardReason('foul');
    setContent('');
    setIsImportant(cardType === 'red');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Square className={cn(
              "h-5 w-5",
              cardType === 'yellow' || cardType === 'second_yellow' ? "text-yellow-500" : "text-red-500"
            )} />
            Ajouter un carton
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
                  <RadioGroupItem value="home" id="card-home" />
                  <Label htmlFor="card-home">Domicile</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="away" id="card-away" />
                  <Label htmlFor="card-away">Extérieur</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div>
            <Label>Type de carton</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={cardType === 'yellow' ? 'default' : 'outline'}
                onClick={() => { setCardType('yellow'); setIsImportant(false); }}
                className={cardType === 'yellow' ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : ''}
              >
                🟨 Jaune
              </Button>
              <Button
                type="button"
                variant={cardType === 'second_yellow' ? 'default' : 'outline'}
                onClick={() => { setCardType('second_yellow'); setIsImportant(true); }}
                className={cardType === 'second_yellow' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
              >
                🟨🟨 2e Jaune
              </Button>
              <Button
                type="button"
                variant={cardType === 'red' ? 'default' : 'outline'}
                onClick={() => { setCardType('red'); setIsImportant(true); }}
                className={cardType === 'red' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
              >
                🟥 Rouge
              </Button>
            </div>
          </div>

          <div>
            <Label>Raison</Label>
            <Select value={cardReason} onValueChange={setCardReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CARD_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <QuickPlayerSelector
            players={players}
            selectedPlayerId={playerId}
            onSelect={(p) => setPlayerId(p.id)}
            label="Joueur *"
          />

          <div>
            <Label>Commentaire (optionnel)</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Description..."
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
            disabled={!playerId || isSubmitting}
            className={cn(
              cardType === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-red-500 hover:bg-red-600'
            )}
          >
            {isSubmitting ? 'Ajout...' : 'Ajouter le carton'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

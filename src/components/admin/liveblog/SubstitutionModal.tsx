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
import { QuickPlayerSelector } from './QuickPlayerSelector';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeftRight, ArrowDown, ArrowUp } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  jersey_number?: number | null;
  image_url?: string | null;
}

interface SubstitutionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    minute: number;
    player_id: string;
    substituted_player_id: string;
    content: string;
    team_side: 'home' | 'away';
  }) => void;
  players: Player[];
  isSubmitting?: boolean;
}

export const SubstitutionModal = ({
  open,
  onClose,
  onSubmit,
  players,
  isSubmitting
}: SubstitutionModalProps) => {
  const [minute, setMinute] = useState<number>(0);
  const [playerInId, setPlayerInId] = useState<string>('');
  const [playerOutId, setPlayerOutId] = useState<string>('');
  const [content, setContent] = useState('');
  const [teamSide, setTeamSide] = useState<'home' | 'away'>('home');

  const handleSubmit = () => {
    if (!playerInId || !playerOutId || minute === undefined) return;
    
    const playerIn = players.find(p => p.id === playerInId);
    const playerOut = players.find(p => p.id === playerOutId);
    
    const autoContent = content || 
      `🔄 Remplacement : ${playerOut?.name} ↔ ${playerIn?.name}`;
    
    onSubmit({
      minute,
      player_id: playerInId,
      substituted_player_id: playerOutId,
      content: autoContent,
      team_side: teamSide
    });
    
    // Reset form
    setMinute(0);
    setPlayerInId('');
    setPlayerOutId('');
    setContent('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-blue-500" />
            Ajouter un remplacement
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
                  <RadioGroupItem value="home" id="sub-home" />
                  <Label htmlFor="sub-home">Domicile</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="away" id="sub-away" />
                  <Label htmlFor="sub-away">Extérieur</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-500">
              <ArrowDown className="h-4 w-4" />
              <span className="font-medium">Joueur sortant</span>
            </div>
            <QuickPlayerSelector
              players={players}
              selectedPlayerId={playerOutId}
              onSelect={(p) => setPlayerOutId(p.id)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-500">
              <ArrowUp className="h-4 w-4" />
              <span className="font-medium">Joueur entrant</span>
            </div>
            <QuickPlayerSelector
              players={players.filter(p => p.id !== playerOutId)}
              selectedPlayerId={playerInId}
              onSelect={(p) => setPlayerInId(p.id)}
            />
          </div>

          <div>
            <Label>Commentaire (optionnel)</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Description du remplacement..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!playerInId || !playerOutId || isSubmitting}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSubmitting ? 'Ajout...' : 'Ajouter le remplacement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

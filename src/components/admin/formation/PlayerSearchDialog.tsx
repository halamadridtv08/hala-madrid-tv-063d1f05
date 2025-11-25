import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number;
  image_url?: string;
  profile_image_url?: string;
}

interface PlayerSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  selectedPosition: string;
}

export const PlayerSearchDialog = ({
  open,
  onOpenChange,
  players,
  onSelectPlayer,
  selectedPosition
}: PlayerSearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (player: Player) => {
    onSelectPlayer(player);
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un joueur - {selectedPosition}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un joueur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-1">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun joueur trouvé
              </div>
            ) : (
              filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleSelect(player)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={player.profile_image_url || player.image_url} 
                      alt={player.name}
                    />
                    <AvatarFallback>
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Real Madrid
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {player.position}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

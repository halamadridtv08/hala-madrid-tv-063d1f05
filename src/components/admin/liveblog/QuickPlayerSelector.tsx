import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  jersey_number?: number | null;
  image_url?: string | null;
  position?: string;
}

interface QuickPlayerSelectorProps {
  players: Player[];
  selectedPlayerId?: string | null;
  onSelect: (player: Player) => void;
  label?: string;
  className?: string;
}

export const QuickPlayerSelector = ({
  players,
  selectedPlayerId,
  onSelect,
  label,
  className
}: QuickPlayerSelectorProps) => {
  const [search, setSearch] = useState('');

  const filteredPlayers = useMemo(() => {
    if (!search) return players;
    return players.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.jersey_number?.toString().includes(search)
    );
  }, [players, search]);

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un joueur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {selectedPlayer && (
        <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/20">
          <Avatar className="h-8 w-8">
            <AvatarImage src={selectedPlayer.image_url || ''} alt={selectedPlayer.name} />
            <AvatarFallback>{selectedPlayer.jersey_number || '?'}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{selectedPlayer.name}</span>
          <span className="text-xs text-muted-foreground">#{selectedPlayer.jersey_number}</span>
        </div>
      )}

      <ScrollArea className="h-[200px] border rounded-lg">
        <div className="grid grid-cols-2 gap-1 p-2">
          {filteredPlayers.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => onSelect(player)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg text-left transition-colors hover:bg-accent",
                selectedPlayerId === player.id && "bg-primary/20 ring-1 ring-primary"
              )}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={player.image_url || ''} alt={player.name} />
                <AvatarFallback className="text-xs">
                  {player.jersey_number || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{player.name}</p>
                <p className="text-xs text-muted-foreground">#{player.jersey_number}</p>
              </div>
            </button>
          ))}
          {filteredPlayers.length === 0 && (
            <p className="col-span-2 text-center text-sm text-muted-foreground py-4">
              Aucun joueur trouvé
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

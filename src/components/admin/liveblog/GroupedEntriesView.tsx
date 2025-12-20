import { useState } from 'react';
import { LiveBlogEntry } from '@/hooks/useLiveBlog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  CircleDot, 
  Square, 
  ArrowLeftRight, 
  MessageSquare,
  AlertTriangle,
  Timer,
  ChevronDown,
  Trash2,
  Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Player {
  id: string;
  name: string;
  jersey_number?: number | null;
  image_url?: string | null;
}

interface GroupedEntriesViewProps {
  entries: LiveBlogEntry[];
  players: Player[];
  onDelete: (id: string) => void;
  onEdit?: (entry: LiveBlogEntry) => void;
}

const getEntryTypeConfig = (type: string) => {
  switch (type) {
    case 'goal':
      return { icon: CircleDot, color: 'border-green-500 bg-green-500/10', label: 'Buts', badgeColor: 'bg-green-500' };
    case 'yellow_card':
      return { icon: Square, color: 'border-yellow-500 bg-yellow-500/10', label: 'Cartons jaunes', badgeColor: 'bg-yellow-500' };
    case 'red_card':
      return { icon: Square, color: 'border-red-500 bg-red-500/10', label: 'Cartons rouges', badgeColor: 'bg-red-500' };
    case 'substitution':
      return { icon: ArrowLeftRight, color: 'border-blue-500 bg-blue-500/10', label: 'Remplacements', badgeColor: 'bg-blue-500' };
    case 'var':
      return { icon: AlertTriangle, color: 'border-purple-500 bg-purple-500/10', label: 'VAR', badgeColor: 'bg-purple-500' };
    case 'injury':
      return { icon: Timer, color: 'border-orange-500 bg-orange-500/10', label: 'Blessures', badgeColor: 'bg-orange-500' };
    default:
      return { icon: MessageSquare, color: 'border-muted bg-muted/10', label: 'Commentaires', badgeColor: 'bg-muted' };
  }
};

const ENTRY_GROUPS = [
  { key: 'goal', label: 'BUTS' },
  { key: 'yellow_card', label: 'CARTONS JAUNES' },
  { key: 'red_card', label: 'CARTONS ROUGES' },
  { key: 'substitution', label: 'REMPLACEMENTS' },
  { key: 'other', label: 'AUTRES' },
];

export const GroupedEntriesView = ({
  entries,
  players,
  onDelete,
  onEdit
}: GroupedEntriesViewProps) => {
  const [orderByMinute, setOrderByMinute] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['goal', 'yellow_card', 'red_card', 'substitution']);

  const getPlayerById = (id: string | null) => {
    if (!id) return null;
    return players.find(p => p.id === id);
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const groupedEntries = ENTRY_GROUPS.reduce((acc, group) => {
    if (group.key === 'other') {
      acc[group.key] = entries.filter(e => 
        !['goal', 'yellow_card', 'red_card', 'substitution'].includes(e.entry_type)
      );
    } else {
      acc[group.key] = entries.filter(e => e.entry_type === group.key);
    }
    return acc;
  }, {} as Record<string, LiveBlogEntry[]>);

  const sortedEntries = orderByMinute 
    ? [...entries].sort((a, b) => (b.minute || 0) - (a.minute || 0))
    : entries;

  const renderEntry = (entry: LiveBlogEntry) => {
    const config = getEntryTypeConfig(entry.entry_type);
    const Icon = config.icon;
    const player = getPlayerById(entry.player_id);

    return (
      <div 
        key={entry.id}
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg border-l-4 transition-colors hover:bg-accent/50",
          config.color
        )}
      >
        {player ? (
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={player.image_url || ''} alt={player.name} />
            <AvatarFallback>{player.jersey_number || '?'}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {entry.minute !== null && (
              <Badge variant="secondary" className="text-xs font-bold">
                {entry.minute}'
              </Badge>
            )}
            {entry.is_important && (
              <Badge variant="destructive" className="text-xs">
                Important
              </Badge>
            )}
            {entry.title && (
              <span className="font-medium text-sm">{entry.title}</span>
            )}
          </div>
          <p className="text-sm text-foreground">{entry.content}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(entry.created_at), 'HH:mm', { locale: fr })}
          </p>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          {onEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onEdit(entry)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Entrées du live ({entries.length})</h3>
        <div className="flex items-center gap-2">
          <Switch
            id="order-by-minute"
            checked={orderByMinute}
            onCheckedChange={setOrderByMinute}
          />
          <Label htmlFor="order-by-minute" className="text-sm">
            {orderByMinute ? 'Par minute' : 'Groupé par type'}
          </Label>
        </div>
      </div>

      {orderByMinute ? (
        <div className="space-y-2">
          {sortedEntries.map(renderEntry)}
          {sortedEntries.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Aucune entrée pour le moment
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {ENTRY_GROUPS.map((group) => {
            const groupEntries = groupedEntries[group.key] || [];
            if (groupEntries.length === 0) return null;
            
            const config = getEntryTypeConfig(group.key);
            
            return (
              <Collapsible 
                key={group.key}
                open={expandedGroups.includes(group.key)}
                onOpenChange={() => toggleGroup(group.key)}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-3 h-auto"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-white", config.badgeColor)}>
                        {groupEntries.length}
                      </Badge>
                      <span className="font-semibold">{group.label}</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      expandedGroups.includes(group.key) && "rotate-180"
                    )} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {groupEntries
                    .sort((a, b) => (b.minute || 0) - (a.minute || 0))
                    .map(renderEntry)}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};

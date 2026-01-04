import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LineupPlayerCardProps {
  id: string;
  playerId: string;
  playerName: string;
  position: string;
  jerseyNumber?: number;
  playerImage?: string;
  isStarter?: boolean;
  onDelete?: () => void;
  variant?: 'list' | 'field';
  style?: React.CSSProperties;
}

export const LineupPlayerCard = ({
  id,
  playerId,
  playerName,
  position,
  jerseyNumber,
  playerImage,
  isStarter = true,
  onDelete,
  variant = 'list',
  style,
}: LineupPlayerCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: {
      playerId,
      playerName,
      position,
      jerseyNumber,
      playerImage,
      isStarter,
    },
  });

  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    ...style,
  };

  if (variant === 'field') {
    return (
      <div
        ref={setNodeRef}
        style={dragStyle}
        {...listeners}
        {...attributes}
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing z-10 group"
      >
        <div className="relative">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-card border-2 border-primary shadow-lg overflow-hidden">
            {playerImage ? (
              <img src={playerImage} alt={playerName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/70">
                <span className="text-xs font-bold text-primary-foreground">
                  {playerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </span>
              </div>
            )}
          </div>
          {jerseyNumber && (
            <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center border border-secondary-foreground/20">
              <span className="text-[10px] font-bold text-secondary-foreground">{jerseyNumber}</span>
            </div>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="bg-card/95 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
          <span className="text-[10px] sm:text-xs font-medium text-foreground truncate max-w-[80px] block">
            {playerName.split(' ').pop()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-colors group"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      
      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
        {playerImage ? (
          <img src={playerImage} alt={playerName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/70">
            <span className="text-[10px] font-bold text-primary-foreground">
              {playerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{playerName}</p>
        <p className="text-xs text-muted-foreground">{position}</p>
      </div>

      {jerseyNumber && (
        <Badge variant="secondary" className="text-xs">
          {jerseyNumber}
        </Badge>
      )}

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

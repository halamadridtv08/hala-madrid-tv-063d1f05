import { useDraggable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, UserPlus } from 'lucide-react';

interface LineupPlayerCardProps {
  id: string;
  playerId: string;
  playerName: string;
  position: string;
  jerseyNumber?: number;
  playerImage?: string;
  isStarter?: boolean;
  onDelete?: () => void;
  onAddToStarters?: () => void;
  onAddToSubstitutes?: () => void;
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
  onAddToStarters,
  onAddToSubstitutes,
  variant = 'list',
  style,
}: LineupPlayerCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
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

  const transformStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  if (variant === 'field') {
    // Séparer la position (left, top) du transform de drag - comme DraggablePlayer
    const { left, top, transform: _transform, ...restStyle } = style || {};
    
    const combinedStyle = {
      left,
      top,
      ...restStyle,
      transition: isDragging ? 'none' : 'left 0.3s ease-out, top 0.3s ease-out',
    };

    return (
      <div
        ref={setNodeRef}
        style={{ ...combinedStyle, ...transformStyle }}
        {...listeners}
        {...attributes}
        className={`absolute cursor-move ${isDragging ? 'opacity-50 z-50' : 'z-10'}`}
      >
        <div 
          className="relative flex flex-col items-center"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          {/* Photo du joueur */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden bg-muted">
              {playerImage ? (
                <img 
                  src={playerImage} 
                  alt={playerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">
                    {playerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Numéro de maillot */}
            {jerseyNumber && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                <span className="text-xs font-bold text-white">
                  {jerseyNumber}
                </span>
              </div>
            )}
            
            {/* Bouton supprimer - en dehors du drag handler */}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute -top-1 -left-7 h-5 w-5 z-20 bg-red-500 hover:bg-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete();
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-3 w-3 text-white" />
              </Button>
            )}
          </div>
          
          {/* Nom du joueur */}
          <div className="mt-1 bg-black/80 text-white px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap">
            {playerName.split(' ').pop()}
          </div>
        </div>
      </div>
    );
  }

  // List variant
  const showAddButtons = onAddToStarters || onAddToSubstitutes;

  return (
    <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors group">
      {/* Draggable part */}
      <div
        ref={setNodeRef}
        style={transformStyle}
        {...listeners}
        {...attributes}
        className={`flex items-center gap-2 flex-1 min-w-0 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
      >
        <Badge variant="secondary" className="shrink-0">{jerseyNumber}</Badge>
        
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
      </div>

      {/* Action buttons - en dehors du drag handler */}
      {showAddButtons && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onAddToStarters && (
            <Button
              variant="default"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onAddToStarters();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              title="Ajouter comme titulaire"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {onAddToSubstitutes && (
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onAddToSubstitutes();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              title="Ajouter comme remplaçant"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {onDelete && !showAddButtons && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

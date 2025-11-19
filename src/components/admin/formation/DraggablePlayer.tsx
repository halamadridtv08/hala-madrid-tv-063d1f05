import { useDraggable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Lock, Unlock } from 'lucide-react';

interface DraggablePlayerProps {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number;
  imageUrl?: string;
  onDelete?: () => void;
  showDelete?: boolean;
  onToggleLock?: () => void;
  isLocked?: boolean;
  variant?: 'list' | 'field';
  style?: React.CSSProperties;
}

export const DraggablePlayer = ({
  id,
  name,
  position,
  jerseyNumber,
  imageUrl,
  onDelete,
  showDelete = false,
  onToggleLock,
  isLocked = false,
  variant = 'list',
  style
}: DraggablePlayerProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    disabled: isLocked,
  });

  const transformStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  if (variant === 'field') {
    // Séparer la position (left, top) du transform de drag
    const { left, top, transform: _transform, ...restStyle } = style || {};
    
    const combinedStyle = {
      left,
      top,
      ...restStyle,
    };

    return (
      <div
        ref={setNodeRef}
        style={{ ...combinedStyle, ...transformStyle }}
        {...listeners}
        {...attributes}
        className={`absolute ${isLocked ? 'cursor-not-allowed' : 'cursor-move'} ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="relative" style={{ transform: 'translate(-50%, -50%)' }}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name}
              className={`w-12 h-12 rounded-full object-cover border-2 shadow-lg transition-all ${isLocked ? 'border-orange-500 opacity-75' : 'border-white'}`}
            />
          ) : (
            <div className={`w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center shadow-lg transition-all ${isLocked ? 'border-orange-500 opacity-75' : 'border-primary'}`}>
              <span className="text-lg font-bold text-primary">{jerseyNumber}</span>
            </div>
          )}
          <Badge className="absolute -top-1 -right-1 text-xs h-5 min-w-5 flex items-center justify-center">
            {jerseyNumber}
          </Badge>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/80 text-white px-1.5 py-0.5 rounded text-[10px]">
            {name.split(' ').pop()}
          </div>
          {onToggleLock && (
            <Button
              size="icon"
              variant={isLocked ? "default" : "secondary"}
              className="absolute -top-1 -left-8 h-5 w-5"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock();
              }}
            >
              {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            </Button>
          )}
          {showDelete && onDelete && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-1 -left-1 h-5 w-5"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-2 bg-card border rounded cursor-move hover:bg-accent relative ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{jerseyNumber}</Badge>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{name}</div>
          <div className="text-xs text-muted-foreground">{position}</div>
        </div>
        {showDelete && onDelete && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

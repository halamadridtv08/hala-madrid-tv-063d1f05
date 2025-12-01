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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: id,
    disabled: isLocked
  });
  const transformStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
  } : undefined;
  if (variant === 'field') {
    // Séparer la position (left, top) du transform de drag
    const {
      left,
      top,
      transform: _transform,
      ...restStyle
    } = style || {};
    const combinedStyle = {
      left,
      top,
      ...restStyle,
      transition: isDragging ? 'none' : 'left 0.3s ease-out, top 0.3s ease-out'
    };
    return <div ref={setNodeRef} style={{
      ...combinedStyle,
      ...transformStyle
    }} {...listeners} {...attributes} className={`absolute ${isLocked ? 'cursor-not-allowed' : 'cursor-move'} ${isDragging ? 'opacity-50' : ''}`}>
        <div className="relative flex flex-col items-center" style={{
        transform: 'translate(-50%, -50%)'
      }}>
          {/* Maillot SVG avec numéro */}
          <div className="relative">
            <svg width="40" height="48" viewBox="0 0 40 48" className={`drop-shadow-lg ${isLocked ? 'opacity-75' : ''}`}>
              {/* Corps du maillot */}
              <path d="M8 8 L8 2 L12 0 L16 2 L24 2 L28 0 L32 2 L32 8 L32 44 L28 48 L12 48 L8 44 Z" fill={isLocked ? '#f97316' : '#1e40af'} stroke="white" strokeWidth="1" />
              {/* Col en V */}
              <path d="M12 2 L16 8 L20 2 L24 8 L28 2" fill="none" stroke="white" strokeWidth="1" />
              {/* Manches */}
              <ellipse cx="8" cy="12" rx="6" ry="8" fill={isLocked ? '#f97316' : '#1e40af'} stroke="white" strokeWidth="1" />
              <ellipse cx="32" cy="12" rx="6" ry="8" fill={isLocked ? '#f97316' : '#1e40af'} stroke="white" strokeWidth="1" />
              
              {/* Numéro du joueur */}
              <text x="20" y="30" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">
                {jerseyNumber}
              </text>
            </svg>
            
            {/* Boutons d'action */}
            {onToggleLock && <Button size="icon" variant={isLocked ? "default" : "secondary"} className="absolute -top-1 -left-9 h-5 w-5 z-10" onClick={e => {
            e.stopPropagation();
            onToggleLock();
          }}>
                {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              </Button>}
            {showDelete && onDelete && <Button size="icon" variant="ghost" className="absolute -top-1 -right-1 h-5 w-5 z-10 bg-red-500 hover:bg-red-600" onClick={e => {
              e.stopPropagation();
              onDelete();
            }}>
              <Trash2 className="h-3 w-3 text-white" />
            </Button>}
          </div>
          
          {/* Nom du joueur */}
          <div className="mt-1 bg-black/80 text-white px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap">
            {name.split(' ').pop()}
          </div>
        </div>
      </div>;
  }
  return <div ref={setNodeRef} {...listeners} {...attributes} className={`p-2 bg-card border rounded cursor-move hover:bg-accent relative ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{jerseyNumber}</Badge>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{name}</div>
          <div className="text-xs text-muted-foreground">{position}</div>
        </div>
        {showDelete && onDelete && <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={e => {
        e.stopPropagation();
        onDelete();
      }}>
            <Trash2 className="h-3 w-3" />
          </Button>}
      </div>
    </div>;
};
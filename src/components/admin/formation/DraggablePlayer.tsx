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
          {/* Photo du joueur au lieu du maillot */}
          <div className="relative">
            <div className={`w-12 h-12 rounded-full border-2 ${isLocked ? 'border-orange-500' : 'border-white'} shadow-lg overflow-hidden bg-muted ${isLocked ? 'opacity-75' : ''}`}>
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">
                    {name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Numéro de maillot */}
            <div className={`absolute -top-1 -right-1 w-6 h-6 ${isLocked ? 'bg-orange-500' : 'bg-blue-600'} rounded-full flex items-center justify-center border-2 border-white shadow-md`}>
              <span className="text-xs font-bold text-white">
                {jerseyNumber}
              </span>
            </div>
            
            {/* Boutons d'action */}
            {onToggleLock && <Button size="icon" variant={isLocked ? "default" : "secondary"} className="absolute -top-1 -left-9 h-5 w-5 z-10" onClick={e => {
            e.stopPropagation();
            onToggleLock();
          }}>
                {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              </Button>}
            {showDelete && onDelete && <Button size="icon" variant="ghost" className="absolute -top-1 -right-8 h-5 w-5 z-10 bg-red-500 hover:bg-red-600" onClick={e => {
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
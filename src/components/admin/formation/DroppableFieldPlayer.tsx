import { useDroppable } from '@dnd-kit/core';
import { DraggablePlayer } from './DraggablePlayer';

interface DroppableFieldPlayerProps {
  player: {
    id?: string;
    player_id: string;
    player_name: string;
    player_position: string;
    jersey_number: number;
    player_image_url?: string;
    position_x: number;
    position_y: number;
  };
  onDelete: () => void;
  onToggleLock?: () => void;
  isLocked?: boolean;
  style: React.CSSProperties;
}

export const DroppableFieldPlayer = ({ player, onDelete, onToggleLock, isLocked, style }: DroppableFieldPlayerProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: player.id || player.player_id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${isOver ? 'scale-110 transition-transform' : ''}`}
    >
      <DraggablePlayer
        id={player.id || player.player_id}
        name={player.player_name}
        position={player.player_position}
        jerseyNumber={player.jersey_number}
        imageUrl={player.player_image_url}
        variant="field"
        showDelete
        onDelete={onDelete}
        onToggleLock={onToggleLock}
        isLocked={isLocked}
        style={style}
      />
    </div>
  );
};

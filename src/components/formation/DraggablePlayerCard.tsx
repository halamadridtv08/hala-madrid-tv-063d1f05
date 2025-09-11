import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Player {
  id: string;
  player_name: string;
  player_position: string;
  jersey_number: number;
  player_image_url?: string;
  player_rating: number;
}

interface DraggablePlayerCardProps {
  player: Player;
  position: { x: number; y: number };
  isDragOverlay?: boolean;
}

export const DraggablePlayerCard: React.FC<DraggablePlayerCardProps> = ({ 
  player, 
  position, 
  isDragOverlay = false 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: player.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${position.x}%`,
    top: `${position.y}%`,
    opacity: isDragging ? 0.5 : 1,
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return "bg-green-500";
    if (rating >= 7.5) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 ${
        isDragOverlay ? 'rotate-3 scale-105' : ''
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <Card className="w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 bg-card/95 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 transition-all duration-200 shadow-lg">
        <div className="relative h-full p-1 sm:p-2 flex flex-col items-center justify-between">
          {/* Numéro de maillot */}
          <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">
              {player.jersey_number}
            </span>
          </div>

          {/* Photo du joueur */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {player.player_image_url ? (
              <img 
                src={player.player_image_url} 
                alt={player.player_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-primary-foreground">
                  {player.player_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </span>
              </div>
            )}
          </div>

          {/* Nom du joueur */}
          <div className="text-center flex-1 flex flex-col justify-center min-h-0">
            <p className="text-xs sm:text-sm font-semibold text-foreground truncate leading-tight">
              {player.player_name.split(' ').pop()}
            </p>
            <p className="text-xs text-muted-foreground uppercase">
              {player.player_position}
            </p>
          </div>

          {/* Note */}
          <Badge 
            variant="secondary" 
            className={`text-xs px-1 py-0 ${getRatingColor(player.player_rating)} text-white`}
          >
            {player.player_rating.toFixed(1)}
          </Badge>
        </div>
      </Card>
    </div>
  );
};
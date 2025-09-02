import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FormationPlayerData } from '@/types/Formation';
import { Edit3, Check, X } from 'lucide-react';

interface PlayerCardProps {
  player: FormationPlayerData;
  position: { x: number; y: number };
  onUpdatePlayer: (playerId: string, updates: Partial<FormationPlayerData>) => void;
  isDragOverlay?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  position, 
  onUpdatePlayer,
  isDragOverlay = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(player.name);
  const [editPosition, setEditPosition] = useState(player.position);
  const [editJerseyNumber, setEditJerseyNumber] = useState(player.jerseyNumber);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: player.id,
    disabled: isEditing
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${position.x}%`,
    top: `${position.y}%`,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveEdit = () => {
    onUpdatePlayer(player.id, {
      name: editName,
      position: editPosition,
      jerseyNumber: editJerseyNumber
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(player.name);
    setEditPosition(player.position);
    setEditJerseyNumber(player.jerseyNumber);
    setIsEditing(false);
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
            {isEditing ? (
              <Input
                value={editJerseyNumber}
                onChange={(e) => setEditJerseyNumber(parseInt(e.target.value) || 0)}
                className="w-8 h-4 text-xs text-center p-0 border-none bg-transparent text-primary-foreground"
                type="number"
                min="1"
                max="99"
              />
            ) : (
              <span className="text-xs font-bold text-primary-foreground">
                {player.jerseyNumber}
              </span>
            )}
          </div>

          {/* Photo du joueur */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {player.imageUrl ? (
              <img 
                src={player.imageUrl} 
                alt={player.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-primary-foreground">
                  {player.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
          </div>

          {/* Nom du joueur */}
          <div className="text-center flex-1 flex flex-col justify-center min-h-0">
            {isEditing ? (
              <div className="space-y-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-4 text-xs text-center p-1 border"
                  placeholder="Nom"
                />
                <Input
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full h-4 text-xs text-center p-1 border"
                  placeholder="Poste"
                />
              </div>
            ) : (
              <>
                <p className="text-xs sm:text-sm font-semibold text-foreground truncate leading-tight">
                  {player.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {player.position}
                </p>
              </>
            )}
          </div>

          {/* Note et actions */}
          <div className="flex items-center justify-between w-full mt-1">
            <Badge 
              variant="secondary" 
              className={`text-xs px-1 py-0 ${getRatingColor(player.rating)} text-white`}
            >
              {player.rating}
            </Badge>

            {/* Boutons d'édition */}
            <div className="flex gap-1">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="w-4 h-4 bg-green-500 text-white rounded flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-2 h-2" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="w-4 h-4 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="w-4 h-4 bg-muted text-muted-foreground rounded flex items-center justify-center hover:bg-muted-foreground hover:text-muted transition-colors"
                >
                  <Edit3 className="w-2 h-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
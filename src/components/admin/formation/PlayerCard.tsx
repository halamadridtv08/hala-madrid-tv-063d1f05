import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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
  const [editRating, setEditRating] = useState(player.rating);

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
      rating: editRating
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditRating(player.rating);
    setIsEditing(false);
  };

  const lastName = player.name.split(' ').pop() || player.name;

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
      <div className="relative">
        {/* Player Card - Similar to reference image */}
        <div className="w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 bg-white rounded-t-3xl rounded-b-lg shadow-lg border border-gray-200">
          {/* Player Photo */}
          <div className="relative w-full h-16 sm:h-20 md:h-24 rounded-t-3xl overflow-hidden bg-gray-100">
            {player.imageUrl ? (
              <img 
                src={player.imageUrl} 
                alt={player.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {player.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </span>
              </div>
            )}
            
            {/* Jersey Number */}
            <div className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {player.jerseyNumber}
              </span>
            </div>
          </div>
          
          {/* Player Name */}
          <div className="px-1 py-1 text-center">
            <p className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide truncate">
              {lastName}
            </p>
          </div>
        </div>

        {/* Rating Badge - Yellow circle like in the image */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={editRating}
                onChange={(e) => setEditRating(parseFloat(e.target.value) || 0)}
                className="w-8 h-6 text-xs text-center border rounded"
                min="0"
                max="10"
                step="0.1"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={handleSaveEdit}
                className="w-4 h-4 bg-green-500 text-white rounded flex items-center justify-center"
              >
                <Check className="w-2 h-2" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="w-4 h-4 bg-red-500 text-white rounded flex items-center justify-center"
              >
                <X className="w-2 h-2" />
              </button>
            </div>
          ) : (
            <div 
              className="relative w-6 h-6 sm:w-7 sm:h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-yellow-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <span className="text-xs font-bold text-gray-900">
                {player.rating.toFixed(1)}
              </span>
              <Edit3 className="absolute -top-1 -right-1 w-2 h-2 text-gray-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
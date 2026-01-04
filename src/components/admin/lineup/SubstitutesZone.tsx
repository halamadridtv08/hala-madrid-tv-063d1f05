import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Users } from 'lucide-react';

interface SubstitutesZoneProps {
  children: React.ReactNode;
  id: string;
  count: number;
}

export const SubstitutesZone: React.FC<SubstitutesZoneProps> = ({ children, id, count }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed rounded-lg p-3 transition-all min-h-[200px] ${
        isOver 
          ? 'border-primary bg-primary/10' 
          : 'border-border bg-muted/30'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Remplaçants ({count})
        </span>
      </div>
      <div className="space-y-2">
        {children}
      </div>
      {count === 0 && (
        <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
          Glissez des joueurs ici
        </div>
      )}
    </div>
  );
};

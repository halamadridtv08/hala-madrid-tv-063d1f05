import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface LineupPitchProps {
  children: React.ReactNode;
  id: string;
}

export const LineupPitch: React.FC<LineupPitchProps> = ({ children, id }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative w-full aspect-[3/4] sm:aspect-[9/14] bg-gradient-to-b from-green-500 to-green-600 rounded-lg overflow-hidden shadow-lg transition-all ${
        isOver ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      {/* Football pitch lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140" preserveAspectRatio="none">
        {/* Outer lines */}
        <rect x="5" y="5" width="90" height="130" fill="none" stroke="white" strokeWidth="0.4" />
        
        {/* Center line */}
        <line x1="5" y1="70" x2="95" y2="70" stroke="white" strokeWidth="0.4" />
        
        {/* Center circle */}
        <circle cx="50" cy="70" r="12" fill="none" stroke="white" strokeWidth="0.4" />
        <circle cx="50" cy="70" r="0.8" fill="white" />
        
        {/* Top penalty area */}
        <rect x="20" y="5" width="60" height="22" fill="none" stroke="white" strokeWidth="0.4" />
        <rect x="32" y="5" width="36" height="10" fill="none" stroke="white" strokeWidth="0.4" />
        
        {/* Bottom penalty area */}
        <rect x="20" y="113" width="60" height="22" fill="none" stroke="white" strokeWidth="0.4" />
        <rect x="32" y="125" width="36" height="10" fill="none" stroke="white" strokeWidth="0.4" />
        
        {/* Goals */}
        <rect x="42" y="2" width="16" height="3" fill="none" stroke="white" strokeWidth="0.4" />
        <rect x="42" y="135" width="16" height="3" fill="none" stroke="white" strokeWidth="0.4" />
        
        {/* Penalty arcs */}
        <path d="M 32 27 A 12 12 0 0 1 68 27" fill="none" stroke="white" strokeWidth="0.4" />
        <path d="M 32 113 A 12 12 0 0 0 68 113" fill="none" stroke="white" strokeWidth="0.4" />
        
        {/* Penalty spots */}
        <circle cx="50" cy="20" r="0.6" fill="white" />
        <circle cx="50" cy="120" r="0.6" fill="white" />
      </svg>
      
      {/* Grass pattern overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.15) 3px,
            rgba(0,0,0,0.15) 6px
          )`
        }} />
      </div>
      
      {/* Players container */}
      <div className="relative w-full h-full">
        {children}
      </div>
    </div>
  );
};

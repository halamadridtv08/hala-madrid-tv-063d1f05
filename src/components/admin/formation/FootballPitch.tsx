import React from 'react';

interface FootballPitchProps {
  children: React.ReactNode;
}

export const FootballPitch: React.FC<FootballPitchProps> = ({ children }) => {
  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] bg-gradient-to-b from-green-400 to-green-500 rounded-lg overflow-hidden shadow-lg">
      {/* Terrain de football avec lignes */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Lignes de touche */}
        <rect x="5" y="5" width="90" height="90" fill="none" stroke="white" strokeWidth="0.3" />
        
        {/* Ligne médiane */}
        <line x1="5" y1="50" x2="95" y2="50" stroke="white" strokeWidth="0.3" />
        
        {/* Cercle central */}
        <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="0.5" fill="white" />
        
        {/* Surface de réparation haute */}
        <rect x="25" y="5" width="50" height="16" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="35" y="5" width="30" height="8" fill="none" stroke="white" strokeWidth="0.3" />
        
        {/* Surface de réparation basse */}
        <rect x="25" y="79" width="50" height="16" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="35" y="87" width="30" height="8" fill="none" stroke="white" strokeWidth="0.3" />
        
        {/* Buts */}
        <rect x="45" y="5" width="10" height="3" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="45" y="92" width="10" height="3" fill="none" stroke="white" strokeWidth="0.3" />
        
        {/* Arcs de cercle des surfaces */}
        <path d="M 35 21 A 8 8 0 0 1 65 21" fill="none" stroke="white" strokeWidth="0.3" />
        <path d="M 35 79 A 8 8 0 0 0 65 79" fill="none" stroke="white" strokeWidth="0.3" />
        
        {/* Points de penalty */}
        <circle cx="50" cy="15" r="0.5" fill="white" />
        <circle cx="50" cy="85" r="0.5" fill="white" />
      </svg>
      
      {/* Gradient overlay pour donner de la profondeur */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/20 to-green-600/30 pointer-events-none" />
      
      {/* Pattern d'herbe (effet visuel) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.1) 2px,
            rgba(0,0,0,0.1) 4px
          )`
        }} />
      </div>
      
      {/* Contenu (joueurs) */}
      <div className="relative w-full h-full">
        {children}
      </div>
    </div>
  );
};
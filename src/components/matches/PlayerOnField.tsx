import React from 'react';

interface PlayerOnFieldProps {
  player: {
    id?: string;
    player_name: string;
    player_position: string;
    jersey_number: number;
    player_image_url?: string;
    player_rating?: number;
  };
  style: React.CSSProperties;
}

export const PlayerOnField: React.FC<PlayerOnFieldProps> = ({ player, style }) => {
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={style}
    >
      <div className="flex flex-col items-center gap-0.5 md:gap-1">
        {/* Photo du joueur */}
        <div className="relative">
          <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-2 border-white shadow-lg overflow-hidden bg-muted">
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
          
          {/* Numéro de maillot */}
          <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-5 h-5 md:w-6 md:h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
            <span className="text-[10px] md:text-xs font-bold text-white">
              {player.jersey_number}
            </span>
          </div>
        </div>

        {/* Nom du joueur */}
        <div className="bg-black/80 px-1.5 md:px-2 py-0.5 rounded text-center">
          <p className="text-[10px] md:text-xs font-semibold text-white whitespace-nowrap">
            {player.player_name.split(' ').pop()}
          </p>
        </div>
      </div>
    </div>
  );
};

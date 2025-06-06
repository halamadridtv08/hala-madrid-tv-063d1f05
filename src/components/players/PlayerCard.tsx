
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Flag, Shield, Star, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PlayerCardProps {
  id: string;
  name: string;
  number: number;
  position: string;
  secondaryPosition?: string;
  nationality?: string;
  image?: string;
  stats?: {
    matches: number;
    goals: number;
    assists: number;
    cleanSheets?: number;
    goalsConceded?: number;
    minutesPlayed: number;
  };
}

export function PlayerCard({ 
  id, 
  name, 
  number, 
  position, 
  secondaryPosition,
  nationality, 
  image, 
  stats 
}: PlayerCardProps) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(() => {
    const favorites = JSON.parse(localStorage.getItem('favoritePlayers') || '[]');
    return favorites.includes(id);
  });

  const getPositionColor = (pos: string) => {
    if (pos.includes("Gardien")) return "bg-yellow-600 hover:bg-yellow-700";
    if (pos.includes("Défenseur")) return "bg-blue-600 hover:bg-blue-700";
    if (pos.includes("Milieu")) return "bg-green-600 hover:bg-green-700";
    if (pos.includes("Ailier") || pos.includes("Attaquant")) return "bg-red-600 hover:bg-red-700";
    return "bg-gray-600 hover:bg-gray-700";
  };

  const getPositionIcon = (pos: string) => {
    if (pos.includes("Gardien")) return <Star className="h-5 w-5" />;
    if (pos.includes("Défenseur")) return <Shield className="h-5 w-5" />;
    if (pos.includes("Milieu")) return <Award className="h-5 w-5" />;
    if (pos.includes("Ailier") || pos.includes("Attaquant")) return <Flag className="h-5 w-5" />;
    return <User className="h-5 w-5" />;
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const favorites = JSON.parse(localStorage.getItem('favoritePlayers') || '[]');
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favorites.filter((favId: string) => favId !== id);
    } else {
      updatedFavorites = [...favorites, id];
    }
    
    localStorage.setItem('favoritePlayers', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleCardClick = () => {
    navigate(`/players/${id}`);
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-t-lg">
            <img
              src={image || `https://placehold.co/300x375/1a365d/ffffff/?text=${name.charAt(0)}`}
              alt={name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Number badge */}
          <div className="absolute top-2 left-2 bg-madrid-gold text-black font-bold text-lg px-3 py-1 rounded-full">
            {number}
          </div>
          
          {/* Favorite button */}
          <Button
            onClick={toggleFavorite}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 p-2 h-8 w-8"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-transparent'}`} />
          </Button>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 group-hover:text-madrid-blue transition-colors">
            {name}
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className={`${getPositionColor(position)} text-white text-xs px-2 py-1`}
              >
                {getPositionIcon(position)}
                <span className="ml-1">{position}</span>
              </Button>
            </div>
            
            {secondaryPosition && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {secondaryPosition}
                </Badge>
              </div>
            )}
            
            {nationality && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Flag className="h-3 w-3" />
                {nationality}
              </div>
            )}
          </div>
          
          {/* Stats */}
          {stats && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {position.includes("Gardien") ? (
                  <>
                    <div className="text-center">
                      <div className="font-bold text-madrid-blue">{stats.cleanSheets || 0}</div>
                      <div className="text-gray-500">Clean Sheets</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-madrid-blue">{stats.matches}</div>
                      <div className="text-gray-500">Matchs</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="font-bold text-madrid-blue">{stats.goals}</div>
                      <div className="text-gray-500">Buts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-madrid-blue">{stats.assists}</div>
                      <div className="text-gray-500">Passes D.</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Flag, Heart, Shield, Star, Award, User } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface PlayerCardProps {
  id: number;
  name: string;
  number: number;
  position: string;
  secondaryPosition?: string;
  nationality?: string;
  image?: string;
  stats?: {
    matches: number;
    goals?: number;
    assists?: number;
    cleanSheets?: number;
    goalsConceded?: number;
    minutesPlayed: number;
  };
}

export const PlayerCard = ({ 
  id, 
  name, 
  number, 
  position, 
  secondaryPosition, 
  nationality, 
  image,
  stats 
}: PlayerCardProps) => {
  // Retrieve favorites from localStorage
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Fallback image if none is provided
  const playerImage = image || `https://placehold.co/300x400/1a365d/ffffff/?text=${name.charAt(0)}`;
  
  // Load favorite status on component mount
  useEffect(() => {
    const favoritePlayers = JSON.parse(localStorage.getItem('favoritePlayers') || '[]');
    setIsFavorite(favoritePlayers.includes(id));
  }, [id]);

  const getPositionColor = (pos: string) => {
    if (pos.includes("Gardien")) return "bg-yellow-600 hover:bg-yellow-700";
    if (pos.includes("Défenseur")) return "bg-blue-600 hover:bg-blue-700";
    if (pos.includes("Milieu")) return "bg-green-600 hover:bg-green-700";
    if (pos.includes("Ailier") || pos.includes("Attaquant")) return "bg-red-600 hover:bg-red-700";
    return "bg-gray-600 hover:bg-gray-700";
  };

  const getPositionIcon = (pos: string) => {
    if (pos.includes("Gardien")) return <Star className="h-3.5 w-3.5 mr-1" />;
    if (pos.includes("Défenseur")) return <Shield className="h-3.5 w-3.5 mr-1" />;
    if (pos.includes("Milieu")) return <Award className="h-3.5 w-3.5 mr-1" />;
    if (pos.includes("Ailier") || pos.includes("Attaquant")) return <Flag className="h-3.5 w-3.5 mr-1" />;
    return <User className="h-3.5 w-3.5 mr-1" />;
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get current favorites from localStorage
    const favoritePlayers = JSON.parse(localStorage.getItem('favoritePlayers') || '[]');
    
    let updatedFavorites;
    if (isFavorite) {
      // Remove player from favorites
      updatedFavorites = favoritePlayers.filter((playerId: number) => playerId !== id);
      toast({
        description: `${name} a été retiré de vos favoris`,
        variant: "default",
      });
    } else {
      // Add player to favorites
      updatedFavorites = [...favoritePlayers, id];
      toast({
        description: `${name} a été ajouté à vos favoris`,
        variant: "default",
      });
    }
    
    // Update localStorage
    localStorage.setItem('favoritePlayers', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
  };

  // Function to display stat highlights based on position
  const renderStatHighlight = () => {
    if (!stats) return null;
    
    // If player hasn't played any matches, don't show stats
    if (stats.matches === 0) return null;

    if (position.includes("Gardien")) {
      return (
        <div className="absolute top-0 right-0 bg-black bg-opacity-70 p-1 px-2 rounded-bl-md text-xs text-white">
          <div className="flex items-center">
            <Star className="h-3.5 w-3.5 text-yellow-400 mr-1" />
            <span>{stats.cleanSheets || 0} CS</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="absolute top-0 right-0 bg-black bg-opacity-70 p-1 px-2 rounded-bl-md text-xs text-white">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center">
              <Flag className="h-3 w-3 text-red-400 mr-1" />
              <span>{stats.goals || 0}</span>
            </div>
            <div className="flex items-center">
              <Award className="h-3 w-3 text-blue-400 mr-1" />
              <span>{stats.assists || 0}</span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <Link to={`/players/${id}`}>
      <Card className="overflow-hidden transition-all transform hover:scale-105 hover:shadow-xl cursor-pointer h-full flex flex-col">
        <div className="relative bg-gradient-to-b from-madrid-blue to-blue-900 pt-6 pb-2 px-4 text-center">
          <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white text-madrid-blue flex items-center justify-center font-bold text-xl">
            {number}
          </div>
          <button 
            onClick={toggleFavorite} 
            className="absolute top-2 right-2 text-white hover:text-red-500 transition-colors"
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "fill-transparent"}`} />
          </button>
          <h3 className="text-lg font-bold text-white mt-1">{name}</h3>
          {nationality && (
            <div className="flex items-center justify-center gap-1 text-white text-opacity-80 text-sm">
              <Flag className="h-3.5 w-3.5" />
              <span>{nationality}</span>
            </div>
          )}
        </div>
        
        <div className="flex-grow relative overflow-hidden">
          <img src={playerImage} alt={name} className="w-full h-64 object-cover object-top" />
          {renderStatHighlight()}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2">
            <div className="flex flex-wrap justify-center gap-1">
              <Badge className={`${getPositionColor(position)} flex items-center`}>
                {getPositionIcon(position)}
                {position}
              </Badge>
              {secondaryPosition && (
                <Badge variant="outline" className="bg-opacity-80 bg-white text-black border-0 flex items-center">
                  {getPositionIcon(secondaryPosition)}
                  {secondaryPosition}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

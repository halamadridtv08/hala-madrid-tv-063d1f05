
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface PlayerCardProps {
  id: number;
  name: string;
  number: number;
  position: string;
  secondaryPosition?: string;
  nationality?: string;
  image?: string;
}

export const PlayerCard = ({ id, name, number, position, secondaryPosition, nationality, image }: PlayerCardProps) => {
  // Fallback image if none is provided
  const playerImage = image || `https://placehold.co/300x400/1a365d/ffffff/?text=${name.charAt(0)}`;
  
  const getPositionColor = (pos: string) => {
    if (pos.includes("Gardien")) return "bg-yellow-600 hover:bg-yellow-700";
    if (pos.includes("Défenseur")) return "bg-blue-600 hover:bg-blue-700";
    if (pos.includes("Milieu")) return "bg-green-600 hover:bg-green-700";
    if (pos.includes("Ailier") || pos.includes("Attaquant")) return "bg-red-600 hover:bg-red-700";
    return "bg-gray-600 hover:bg-gray-700";
  };

  return (
    <Link to={`/players/${id}`}>
      <Card className="overflow-hidden transition-all transform hover:scale-105 hover:shadow-xl cursor-pointer h-full flex flex-col">
        <div className="relative bg-gradient-to-b from-madrid-blue to-blue-900 pt-6 pb-2 px-4 text-center">
          <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white text-madrid-blue flex items-center justify-center font-bold text-xl">
            {number}
          </div>
          <h3 className="text-lg font-bold text-white mt-1">{name}</h3>
          {nationality && (
            <p className="text-white text-opacity-80 text-sm">{nationality}</p>
          )}
        </div>
        
        <div className="flex-grow relative overflow-hidden">
          <img src={playerImage} alt={name} className="w-full h-64 object-cover object-top" />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2">
            <div className="flex flex-wrap justify-center gap-1">
              <Badge className={`${getPositionColor(position)}`}>{position}</Badge>
              {secondaryPosition && (
                <Badge variant="outline" className="bg-opacity-80 bg-white text-black border-0">
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

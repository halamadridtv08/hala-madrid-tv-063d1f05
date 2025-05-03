
import { Card, CardContent } from "@/components/ui/card";

interface CoachCardProps {
  name: string;
  title: string;
  image?: string;
}

export const CoachCard = ({ name, title, image }: CoachCardProps) => {
  // Fallback image if none is provided
  const coachImage = image || `https://placehold.co/400x500/1a365d/ffffff/?text=${name.charAt(0)}`;
  
  return (
    <Card className="overflow-hidden transition-all transform hover:scale-105 hover:shadow-xl cursor-pointer h-full">
      <div className="relative">
        <div className="bg-gradient-to-b from-madrid-blue to-blue-900 pt-6 pb-4 px-4 text-center">
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <p className="text-white text-opacity-80 mt-1">{title}</p>
        </div>
        
        <div className="flex-grow relative overflow-hidden">
          <img 
            src="https://images2.minutemediacdn.com/image/upload/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/FBL-ESP-REALMADRID-ANCELOTTI-7eead8584a27073b747c5b33954ea6c1.jpg" 
            alt={name} 
            className="w-full h-80 object-cover" 
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-30 p-4">
            <div className="flex flex-wrap justify-center gap-1">
              <span className="text-white font-semibold">Champion d'Europe 2024</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

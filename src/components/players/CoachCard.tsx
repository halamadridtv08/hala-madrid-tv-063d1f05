
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Flag, Star, Award } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/sonner";

interface CoachCardProps {
  name: string;
  title: string;
  image?: string;
  achievements?: { title: string; year: string }[];
  nationality?: string;
  birthDate?: string;
  atClubSince?: string;
}

export const CoachCard = ({ 
  name, 
  title, 
  image, 
  achievements, 
  nationality = "Italienne", 
  birthDate = "10 juin 1959",
  atClubSince = "2021"
}: CoachCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Default coach image
  const defaultImage = "https://images2.minutemediacdn.com/image/upload/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/FBL-ESP-REALMADRID-ANCELOTTI-7eead8584a27073b747c5b33954ea6c1.jpg";
  const coachImage = image || defaultImage;
  const coachAchievements = achievements || [];
  
  const toggleDetails = () => {
    setShowDetails(!showDetails);
    if (!showDetails) {
      toast.info(`Détails de ${name} affichés`);
    }
  };

  return (
    <Card className="overflow-hidden transition-all transform hover:scale-105 hover:shadow-xl cursor-pointer h-full">
      <div className="relative" onClick={toggleDetails}>
        <div className="bg-gradient-to-b from-madrid-blue to-blue-900 pt-6 pb-4 px-4 text-center">
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <p className="text-white text-opacity-80 mt-1">{title}</p>
          <div className="flex items-center justify-center gap-1 text-white text-opacity-80 text-sm mt-2">
            <Flag className="h-3.5 w-3.5" />
            <span>{nationality}</span>
          </div>
        </div>
        
        <div className="flex-grow relative overflow-hidden">
          <img 
            src={coachImage}
            alt={name} 
            className="w-full h-80 object-cover" 
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 p-4">
            <div className="flex flex-wrap justify-center gap-1">
              {coachAchievements.slice(0, 2).map((achievement, index) => (
                <div key={index} className="text-white font-semibold text-center block w-full md:inline md:w-auto md:px-1 flex items-center justify-center gap-1">
                  <Trophy className="h-4 w-4 text-madrid-gold" />
                  <span>{achievement.title} ({achievement.year})</span>
                </div>
              ))}
              {coachAchievements.length > 2 && (
                <div className="text-white font-semibold text-center block w-full mt-1">
                  +{coachAchievements.length - 2} autres titres
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-lg mb-2">Informations</h4>
          <p className="mb-1 text-sm"><span className="font-medium">Né le:</span> {birthDate}</p>
          <p className="mb-3 text-sm"><span className="font-medium">Au club depuis:</span> {atClubSince}</p>
          
          <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Award className="h-5 w-5 text-madrid-gold" />
            Palmarès avec le Real Madrid
          </h4>
          
           <ScrollArea className="h-40">
             {coachAchievements.length > 0 ? (
               <ul className="list-disc list-inside space-y-1 text-sm">
                 {coachAchievements.map((achievement, index) => (
                   <li key={index}>{achievement.title} ({achievement.year})</li>
                 ))}
               </ul>
             ) : (
               <p className="text-sm text-gray-500 italic">Aucun titre remporté pour le moment</p>
             )}
           </ScrollArea>
        </div>
      )}
    </Card>
  );
};

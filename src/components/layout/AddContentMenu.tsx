import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Video, Camera, Users, Calendar, Youtube, Shield, Mic, PlayCircle, Shirt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddContentMenuProps {
  onClose: () => void;
  onTabChange?: (tab: string) => void;
}

export function AddContentMenu({ onClose, onTabChange }: AddContentMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Ferme le menu lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleNavigate = (tab: string, contentType: string) => {
    console.log(`Switching to tab: ${tab}`);
    
    // Navigate to admin page with the correct tab
    navigate(`/admin?tab=${tab}`);
    
    if (onTabChange) {
      onTabChange(tab);
    }
    onClose();
    
    toast({
      title: `Création de contenu`,
      description: `Formulaire de création ${contentType} ouvert`
    });
  };

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700"
    >
      <div className="p-2">
        <h3 className="text-sm font-semibold mb-2 px-3 py-1 text-gray-500 dark:text-gray-400">
          Ajouter du contenu
        </h3>
        
        <button 
          onClick={() => handleNavigate("articles", "d'article")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <FileText className="h-4 w-4 text-madrid-blue" />
          <span>Article</span>
        </button>
        
        <button 
          onClick={() => handleNavigate("videos", "de vidéo")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Video className="h-4 w-4 text-madrid-blue" />
          <span>Vidéo</span>
        </button>
        
        <button 
          onClick={() => handleNavigate("photos", "de photo")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Camera className="h-4 w-4 text-madrid-blue" />
          <span>Photo</span>
        </button>
        
        <button 
          onClick={() => handleNavigate("players", "de joueur")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Users className="h-4 w-4 text-madrid-blue" />
          <span>Joueur</span>
        </button>
        
        <button 
          onClick={() => handleNavigate("coaches", "d'entraîneur")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Users className="h-4 w-4 text-green-600" />
          <span>Entraîneur</span>
        </button>
        
        <button 
          onClick={() => handleNavigate("matches", "de match")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Calendar className="h-4 w-4 text-madrid-blue" />
          <span>Match</span>
        </button>

        <button 
          onClick={() => handleNavigate("press", "de conférence de presse")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Mic className="h-4 w-4 text-madrid-blue" />
          <span>Conférence de presse</span>
        </button>
        
        <button 
          onClick={() => handleNavigate("training", "de séance d'entraînement")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <PlayCircle className="h-4 w-4 text-madrid-blue" />
          <span>Séance d'entraînement</span>
        </button>

        <button 
          onClick={() => handleNavigate("kits", "de maillot")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Shirt className="h-4 w-4 text-madrid-gold" />
          <span>Maillot</span>
        </button>

        <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
        
        <h3 className="text-sm font-semibold mb-2 px-3 py-1 text-gray-500 dark:text-gray-400">
          Administration
        </h3>
        
        <button 
          onClick={() => handleNavigate("settings", "Paramètres de sécurité")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Shield className="h-4 w-4 text-green-600" />
          <span>Sécurité</span>
        </button>
      </div>
    </div>
  );
}


import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Video, Camera, Users, Calendar, Youtube, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddContentMenuProps {
  onClose: () => void;
}

export function AddContentMenu({ onClose }: AddContentMenuProps) {
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

  const handleNavigate = (path: string, contentType: string) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
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
          onClick={() => handleNavigate("/admin?tab=create&type=article", "d'article")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <FileText className="h-4 w-4 text-madrid-blue" />
          <span>Article</span>
        </button>
        
        <button 
          onClick={() => handleNavigate("/admin?tab=create&type=video", "de vidéo")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Video className="h-4 w-4 text-madrid-blue" />
          <span>Vidéo</span>
        </button>
        
        <button 
          onClick={() => handleNavigate("/admin?tab=create&type=photo", "de photo")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Camera className="h-4 w-4 text-madrid-blue" />
          <span>Photo</span>
        </button>
        
        <button 
          onClick={() => handleNavigate("/admin?tab=create&type=player", "de joueur")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Users className="h-4 w-4 text-madrid-blue" />
          <span>Joueur</span>
        </button>
        
        <button 
          onClick={() => handleNavigate("/admin?tab=create&type=coach", "d'entraîneur")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Users className="h-4 w-4 text-green-600" />
          <span>Entraîneur</span>
        </button>
        
        <button 
          onClick={() => handleNavigate("/admin?tab=create&type=match", "de match")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Calendar className="h-4 w-4 text-madrid-blue" />
          <span>Match</span>
        </button>

        <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
        
        <h3 className="text-sm font-semibold mb-2 px-3 py-1 text-gray-500 dark:text-gray-400">
          Administration
        </h3>
        
        <button 
          onClick={() => handleNavigate("/admin/security", "Paramètres de sécurité")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <Shield className="h-4 w-4 text-green-600" />
          <span>Sécurité</span>
        </button>
      </div>
    </div>
  );
}

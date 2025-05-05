
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FileText, Video, Camera, Users, Calendar } from "lucide-react";

interface AddContentMenuProps {
  onClose: () => void;
}

export function AddContentMenu({ onClose }: AddContentMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700"
    >
      <div className="p-2">
        <h3 className="text-sm font-semibold mb-2 px-3 py-1 text-gray-500 dark:text-gray-400">
          Ajouter du contenu
        </h3>
        
        <Link 
          to="/admin?tab=articles&mode=create" 
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          <FileText className="h-4 w-4 text-madrid-blue" />
          <span>Article</span>
        </Link>
        
        <Link 
          to="/admin?tab=videos&mode=create" 
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          <Video className="h-4 w-4 text-madrid-blue" />
          <span>Vidéo</span>
        </Link>
        
        <Link 
          to="/admin?tab=photos&mode=create" 
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          <Camera className="h-4 w-4 text-madrid-blue" />
          <span>Photo</span>
        </Link>
        
        <Link 
          to="/admin?tab=players&mode=create" 
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          <Users className="h-4 w-4 text-madrid-blue" />
          <span>Joueur</span>
        </Link>
        
        <Link 
          to="/admin?tab=matches&mode=create" 
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          <Calendar className="h-4 w-4 text-madrid-blue" />
          <span>Match</span>
        </Link>
      </div>
    </div>
  );
}

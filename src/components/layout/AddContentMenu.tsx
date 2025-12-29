import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Video,
  Camera,
  Users,
  Calendar,
  Youtube,
  Shield,
  Mic,
  PlayCircle,
  Shirt,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddContentMenuProps {
  onClose: () => void;
  onTabChange?: (tab: string) => void;
}

export function AddContentMenu({ onClose, onTabChange }: AddContentMenuProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNavigate = (tab: string, contentType: string) => {
    console.log(`Switching to tab: ${tab}`);

    // Prefer parent navigation (Navbar already knows how to navigate + close state)
    if (onTabChange) {
      onTabChange(tab);
    } else {
      navigate(`/admin?tab=${tab}`);
    }

    onClose();

    toast({
      title: `Création de contenu`,
      description: `Formulaire de création ${contentType} ouvert`,
    });
  };

  return (
    <>
      {/* Backdrop to reliably handle outside clicks (prevents onClick race conditions) */}
      <div
        className="fixed inset-0 z-40 bg-background/40"
        onMouseDown={onClose}
        aria-hidden="true"
      />

      <div
        className="absolute right-0 mt-2 w-64 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg z-50"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="p-2">
          <h3 className="text-sm font-semibold mb-2 px-3 py-1 text-muted-foreground">
            Ajouter du contenu
          </h3>

          <button
            onClick={() => handleNavigate("articles", "d'article")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <FileText className="h-4 w-4 text-madrid-blue" />
            <span>Article</span>
          </button>

          <button
            onClick={() => handleNavigate("videos", "de vidéo")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <Video className="h-4 w-4 text-madrid-blue" />
            <span>Vidéo</span>
          </button>

          <button
            onClick={() => handleNavigate("photos", "de photo")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <Camera className="h-4 w-4 text-madrid-blue" />
            <span>Photo</span>
          </button>

          <button
            onClick={() => handleNavigate("players", "de joueur")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <Users className="h-4 w-4 text-madrid-blue" />
            <span>Joueur</span>
          </button>

          <button
            onClick={() => handleNavigate("coaches", "d'entraîneur")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <Users className="h-4 w-4 text-green-600" />
            <span>Entraîneur</span>
          </button>

          <button
            onClick={() => handleNavigate("matches", "de match")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <Calendar className="h-4 w-4 text-madrid-blue" />
            <span>Match</span>
          </button>

          <button
            onClick={() => handleNavigate("press", "de conférence de presse")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <Mic className="h-4 w-4 text-madrid-blue" />
            <span>Conférence de presse</span>
          </button>

          <button
            onClick={() => handleNavigate("training", "de séance d'entraînement")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <PlayCircle className="h-4 w-4 text-madrid-blue" />
            <span>Séance d'entraînement</span>
          </button>

          <button
            onClick={() => handleNavigate("kits", "de maillot")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <Shirt className="h-4 w-4 text-madrid-gold" />
            <span>Maillot</span>
          </button>

          <div className="border-t border-border my-2"></div>

          <h3 className="text-sm font-semibold mb-2 px-3 py-1 text-muted-foreground">
            Administration
          </h3>

          <button
            onClick={() => handleNavigate("settings", "Paramètres de sécurité")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <Shield className="h-4 w-4 text-green-600" />
            <span>Sécurité</span>
          </button>
        </div>
      </div>
    </>
  );
}

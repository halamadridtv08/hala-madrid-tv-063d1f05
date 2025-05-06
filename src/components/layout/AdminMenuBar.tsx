
import React from "react";
import { 
  Menubar, 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator 
} from "@/components/ui/menubar";
import { AddContentMenu } from "./AddContentMenu";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Video, 
  Users, 
  Calendar, 
  Settings, 
  LayoutDashboard, 
  Camera, 
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminMenuBar() {
  const navigate = useNavigate();
  const [showAddMenu, setShowAddMenu] = React.useState(false);

  return (
    <div className="flex justify-between items-center w-full mb-6 bg-white dark:bg-gray-800 p-2 rounded-md shadow">
      <Menubar className="border-none shadow-none bg-transparent">
        <MenubarMenu>
          <MenubarTrigger className="font-medium">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => navigate("/admin?tab=articles")}>
              <FileText className="w-4 h-4 mr-2 text-madrid-blue" />
              Articles
            </MenubarItem>
            <MenubarItem onClick={() => navigate("/admin?tab=videos")}>
              <Video className="w-4 h-4 mr-2 text-madrid-blue" />
              Vidéos
            </MenubarItem>
            <MenubarItem onClick={() => navigate("/admin?tab=photos")}>
              <Camera className="w-4 h-4 mr-2 text-madrid-blue" />
              Photos
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="font-medium">
            <Users className="w-4 h-4 mr-2" />
            Équipe
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => navigate("/admin?tab=players")}>
              <Users className="w-4 h-4 mr-2 text-madrid-blue" />
              Joueurs
            </MenubarItem>
            <MenubarItem onClick={() => navigate("/admin?tab=coaches")}>
              <Users className="w-4 h-4 mr-2 text-madrid-blue" />
              Entraîneurs
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="font-medium">
            <Calendar className="w-4 h-4 mr-2" />
            Matchs
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => navigate("/admin?tab=matches")}>
              <Calendar className="w-4 h-4 mr-2 text-madrid-blue" />
              Calendrier des matchs
            </MenubarItem>
            <MenubarItem onClick={() => navigate("/admin?tab=results")}>
              <Calendar className="w-4 h-4 mr-2 text-madrid-blue" />
              Résultats
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="font-medium">
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => navigate("/admin?tab=settings")}>
              <Settings className="w-4 h-4 mr-2 text-madrid-blue" />
              Paramètres du site
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => navigate("/admin?tab=featured")}>
              Contenu à la une
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="relative">
        <Button 
          variant="default" 
          size="sm"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
        {showAddMenu && (
          <AddContentMenu onClose={() => setShowAddMenu(false)} />
        )}
      </div>
    </div>
  );
}

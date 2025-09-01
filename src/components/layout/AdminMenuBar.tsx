import React from "react";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator } from "@/components/ui/menubar";
import { AddContentMenu } from "./AddContentMenu";
import { useNavigate } from "react-router-dom";
import { FileText, Video, Users, Calendar, Settings, LayoutDashboard, Camera, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminMenuBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function AdminMenuBar({ activeTab, onTabChange }: AdminMenuBarProps) {
  const navigate = useNavigate();
  const [showAddMenu, setShowAddMenu] = React.useState(false);
  
  return <div className="flex justify-between items-center w-full mb-6 bg-white dark:bg-gray-800 p-2 rounded-md shadow">
      <div className="relative">
        <Button variant="default" size="sm" onClick={() => setShowAddMenu(!showAddMenu)} className="flex items-center gap-1 text-right font-extrabold rounded-md my-0 mx-[58px]">
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
        {showAddMenu && <AddContentMenu onClose={() => setShowAddMenu(false)} onTabChange={onTabChange} />}
      </div>
    </div>;
}
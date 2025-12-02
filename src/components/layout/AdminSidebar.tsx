import React from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  Users, 
  Calendar, 
  Settings, 
  User, 
  Camera,
  BarChart3,
  Mic,
  PlayCircle,
  Shirt,
  Target,
  Trophy,
  Twitter
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "articles", label: "Articles", icon: FileText },
  { value: "special-articles", label: "Articles Spéciaux", icon: Trophy },
  { value: "videos", label: "Vidéos", icon: Video },
  { value: "photos", label: "Photos", icon: Camera },
  { value: "players", label: "Joueurs", icon: User },
  { value: "coaches", label: "Entraîneurs", icon: Users },
  { value: "matches", label: "Matchs", icon: Calendar },
  { value: "opponents", label: "Équipes Adverses", icon: Target },
  { value: "formations", label: "Formations", icon: Target },
  { value: "lineups", label: "Compositions", icon: Users },
  { value: "press", label: "Conférences", icon: Mic },
  { value: "training", label: "Entraînements", icon: PlayCircle },
  { value: "stats", label: "Statistiques", icon: BarChart3 },
  { value: "kits", label: "Maillots", icon: Shirt },
  { value: "youtube", label: "YouTube", icon: PlayCircle },
  { value: "flash-news", label: "Infos Flash", icon: Twitter },
  { value: "settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <div className="hidden lg:flex w-64 flex-col fixed left-0 top-0 h-screen bg-background border-r z-40">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            
            return (
              <button
                key={item.value}
                onClick={() => onTabChange(item.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-md text-left",
                  "transition-all duration-200 ease-out",
                  "hover-scale",
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                    : "hover:bg-muted text-foreground hover:translate-x-1"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200", isActive ? "scale-110" : "")} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

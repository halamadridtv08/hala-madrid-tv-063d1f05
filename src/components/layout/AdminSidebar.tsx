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
  Twitter,
  ChevronLeft,
  ChevronRight,
  Puzzle,
  Radio,
  Mail,
  Star,
  Tv,
  Bell
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
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
  { value: "live-bar", label: "Barre Live", icon: Tv },
  { value: "match-control", label: "Centre Match", icon: Radio },
  { value: "opponents", label: "Équipes Adverses", icon: Target },
  { value: "formations", label: "Formations", icon: Target },
  { value: "lineups", label: "Compositions", icon: Users },
  { value: "press", label: "Conférences", icon: Mic },
  { value: "training", label: "Entraînements", icon: PlayCircle },
  { value: "stats", label: "Statistiques", icon: BarChart3 },
  { value: "kits", label: "Maillots", icon: Shirt },
  { value: "youtube", label: "YouTube", icon: PlayCircle },
  { value: "flash-news", label: "Infos Flash", icon: Twitter },
  { value: "newsletter", label: "Newsletter", icon: Mail },
  { value: "dream-teams", label: "Dream Teams", icon: Star },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "integrations", label: "Intégrations", icon: Puzzle },
  { value: "settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar({ activeTab, onTabChange, collapsed, onCollapsedChange }: AdminSidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-background border-r z-40 transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64"
      )}>
        <div className={cn(
          "p-4 border-b flex items-center",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapsedChange(!collapsed)}
            className={cn(
              "h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300",
              "hover:scale-110 active:scale-95",
              collapsed && "rotate-180"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.value;
              
              const button = (
                <button
                  key={item.value}
                  onClick={() => onTabChange(item.value)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg text-left",
                    "transition-all duration-200 ease-out",
                    collapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
                    isActive 
                      ? "bg-primary text-primary-foreground font-medium shadow-md" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-200", 
                    isActive ? "scale-110" : ""
                  )} />
                  {!collapsed && <span className="text-sm truncate">{item.label}</span>}
                </button>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.value}>
                    <TooltipTrigger asChild>
                      {button}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

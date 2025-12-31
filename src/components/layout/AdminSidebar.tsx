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
  Bell,
  ArrowRightLeft,
  Megaphone,
  TrendingUp
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const navigationItems = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { value: "analytics", label: "Analytics", icon: TrendingUp, adminOnly: false },
  { value: "articles", label: "Articles", icon: FileText, adminOnly: false },
  { value: "special-articles", label: "Articles Spéciaux", icon: Trophy, adminOnly: false },
  { value: "videos", label: "Vidéos", icon: Video, adminOnly: false },
  { value: "photos", label: "Photos", icon: Camera, adminOnly: false },
  { value: "players", label: "Joueurs", icon: User, adminOnly: false },
  { value: "coaches", label: "Entraîneurs", icon: Users, adminOnly: false },
  { value: "matches", label: "Matchs", icon: Calendar, adminOnly: false },
  { value: "live-bar", label: "Barre Live", icon: Tv, adminOnly: false },
  { value: "announcement-bar", label: "Barre Annonce", icon: Megaphone, adminOnly: false },
  { value: "match-control", label: "Centre Match", icon: Radio, adminOnly: false },
  { value: "opponents", label: "Équipes Adverses", icon: Target, adminOnly: false },
  { value: "formations", label: "Formations", icon: Target, adminOnly: false },
  { value: "lineups", label: "Compositions", icon: Users, adminOnly: false },
  { value: "press", label: "Conférences", icon: Mic, adminOnly: false },
  { value: "training", label: "Entraînements", icon: PlayCircle, adminOnly: false },
  { value: "stats", label: "Statistiques", icon: BarChart3, adminOnly: false },
  { value: "kits", label: "Maillots", icon: Shirt, adminOnly: false },
  { value: "youtube", label: "YouTube", icon: PlayCircle, adminOnly: false },
  { value: "flash-news", label: "Infos Flash", icon: Twitter, adminOnly: false },
  { value: "transfers", label: "Transferts", icon: ArrowRightLeft, adminOnly: false },
  { value: "newsletter", label: "Newsletter", icon: Mail, adminOnly: false },
  { value: "dream-teams", label: "Dream Teams", icon: Star, adminOnly: false },
  { value: "notifications", label: "Notifications", icon: Bell, adminOnly: false },
  { value: "integrations", label: "Intégrations", icon: Puzzle, adminOnly: true },
  { value: "settings", label: "Paramètres", icon: Settings, adminOnly: false },
];

export function AdminSidebar({ activeTab, onTabChange, collapsed, onCollapsedChange }: AdminSidebarProps) {
  const { isAdmin } = useAuth();

  // Filter items based on user role
  const visibleItems = navigationItems.filter(item => !item.adminOnly || isAdmin);

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
            {visibleItems.map((item) => {
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

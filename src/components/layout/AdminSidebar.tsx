import React, { useState } from "react";
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
  ChevronDown,
  Puzzle,
  Radio,
  Mail,
  Star,
  Tv,
  Bell,
  ArrowRightLeft,
  Megaphone,
  TrendingUp,
  Palette,
  Type,
  Share2,
  LayoutGrid,
  Sparkles,
  Link,
  RotateCcw
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const navigationItems = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { value: "analytics", label: "Analytics", icon: TrendingUp, adminOnly: false },
  { value: "moderator-activity", label: "Activité Modérateurs", icon: Users, adminOnly: true },
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
];

// Settings sub-items (apparence + paramètres)
const settingsSubItems = [
  { value: "site-content", label: "Contenu du site", icon: Type, adminOnly: true },
  { value: "branding", label: "Branding", icon: Palette, adminOnly: true },
  { value: "welcome-popup", label: "Popup Bienvenue", icon: Sparkles, adminOnly: true },
  { value: "social-links", label: "Réseaux Sociaux", icon: Share2, adminOnly: true },
  { value: "explore-cards", label: "Cartes Explorer", icon: LayoutGrid, adminOnly: true },
  { value: "footer-links", label: "Liens du Footer", icon: Link, adminOnly: true },
  { value: "season-management", label: "Gestion Saison", icon: RotateCcw, adminOnly: true },
  { value: "settings", label: "Configuration", icon: Settings, adminOnly: false },
];

export function AdminSidebar({ activeTab, onTabChange, collapsed, onCollapsedChange }: AdminSidebarProps) {
  const { isAdmin } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(() => {
    // Open settings section if active tab is a settings sub-item
    return settingsSubItems.some(item => item.value === activeTab);
  });

  // Filter items based on user role
  const visibleItems = navigationItems.filter(item => !item.adminOnly || isAdmin);
  const visibleSettingsItems = settingsSubItems.filter(item => !item.adminOnly || isAdmin);

  // Check if current tab is in settings section
  const isSettingsActive = settingsSubItems.some(item => item.value === activeTab);

  const renderNavButton = (item: typeof navigationItems[0], isActive: boolean) => {
    const Icon = item.icon;
    return (
      <button
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
  };

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
              const isActive = activeTab === item.value;
              
              if (collapsed) {
                return (
                  <Tooltip key={item.value}>
                    <TooltipTrigger asChild>
                      {renderNavButton(item, isActive)}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.value}>{renderNavButton(item, isActive)}</div>;
            })}

            {/* Settings Section with collapsible sub-items */}
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onTabChange("settings")}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg text-left",
                      "transition-all duration-200 ease-out px-3 py-3 justify-center",
                      isSettingsActive
                        ? "bg-primary text-primary-foreground font-medium shadow-md" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Settings className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200", 
                      isSettingsActive ? "scale-110" : ""
                    )} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  Paramètres
                </TooltipContent>
              </Tooltip>
            ) : (
              <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg text-left px-4 py-3",
                      "transition-all duration-200 ease-out",
                      isSettingsActive
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Settings className="h-5 w-5 shrink-0" />
                    <span className="text-sm truncate flex-1">Paramètres</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      settingsOpen && "rotate-180"
                    )} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {visibleSettingsItems.map((item) => {
                    const isActive = activeTab === item.value;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.value}
                        onClick={() => onTabChange(item.value)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg text-left px-4 py-2",
                          "transition-all duration-200 ease-out",
                          isActive 
                            ? "bg-primary text-primary-foreground font-medium shadow-md" 
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="text-sm truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

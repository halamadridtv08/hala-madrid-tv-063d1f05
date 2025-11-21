import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
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

interface AdminMobileNavProps {
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

export function AdminMobileNav({ activeTab, onTabChange }: AdminMobileNavProps) {
  const [open, setOpen] = React.useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-left">Navigation</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.value;
              
              return (
                <button
                  key={item.value}
                  onClick={() => handleTabChange(item.value)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-md text-left
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary text-primary-foreground font-medium' 
                      : 'hover:bg-muted text-foreground'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
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
  Palette,
  Type,
  Share2,
  LayoutGrid,
  Sparkles,
  TrendingUp,
  Tv,
  Megaphone,
  Radio,
  ArrowRightLeft,
  Mail,
  Star,
  Bell,
  Puzzle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";

interface AdminMobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
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
  { value: "site-content", label: "Contenu du site", icon: Type, adminOnly: true },
  { value: "branding", label: "Branding", icon: Palette, adminOnly: true },
  { value: "welcome-popup", label: "Popup Bienvenue", icon: Sparkles, adminOnly: true },
  { value: "social-links", label: "Réseaux Sociaux", icon: Share2, adminOnly: true },
  { value: "explore-cards", label: "Cartes Explorer", icon: LayoutGrid, adminOnly: true },
  { value: "settings", label: "Paramètres", icon: Settings, adminOnly: false },
];

export function AdminMobileNav({ activeTab, onTabChange }: AdminMobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const { isAdmin } = useAuth();

  // Filter items based on user role
  const visibleItems = navigationItems.filter(item => !item.adminOnly || isAdmin);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden hover-scale">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <SheetHeader className="p-6 pb-4 border-b animate-fade-in">
          <SheetTitle className="text-left">Navigation</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-1">
            {visibleItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.value;
              
              return (
                <button
                  key={item.value}
                  onClick={() => handleTabChange(item.value)}
                  style={{
                    animationDelay: `${index * 30}ms`
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-md text-left
                    transition-all duration-200 ease-out
                    animate-fade-in hover-scale
                    ${isActive 
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
                      : 'hover:bg-muted text-foreground hover:translate-x-1'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
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

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown } from "lucide-react";
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
  Puzzle,
  Link,
  RotateCcw
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdminMobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationCategories = [
  {
    category: "Général",
    items: [
      { value: "dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
      { value: "analytics", label: "Analytics", icon: TrendingUp, adminOnly: false },
      { value: "moderator-activity", label: "Activité Modérateurs", icon: Users, adminOnly: true },
    ]
  },
  {
    category: "Contenu",
    items: [
      { value: "articles", label: "Articles", icon: FileText, adminOnly: false },
      { value: "special-articles", label: "Articles Spéciaux", icon: Trophy, adminOnly: false },
      { value: "videos", label: "Vidéos", icon: Video, adminOnly: false },
      { value: "photos", label: "Photos", icon: Camera, adminOnly: false },
      { value: "flash-news", label: "Infos Flash", icon: Twitter, adminOnly: false },
      { value: "youtube", label: "YouTube", icon: PlayCircle, adminOnly: false },
    ]
  },
  {
    category: "Équipe",
    items: [
      { value: "players", label: "Joueurs", icon: User, adminOnly: false },
      { value: "coaches", label: "Entraîneurs", icon: Users, adminOnly: false },
      { value: "stats", label: "Statistiques", icon: BarChart3, adminOnly: false },
      { value: "transfers", label: "Transferts", icon: ArrowRightLeft, adminOnly: false },
      { value: "kits", label: "Maillots", icon: Shirt, adminOnly: false },
    ]
  },
  {
    category: "Matchs",
    items: [
      { value: "matches", label: "Matchs", icon: Calendar, adminOnly: false },
      { value: "live-bar", label: "Barre Live", icon: Tv, adminOnly: false },
      { value: "announcement-bar", label: "Barre Annonce", icon: Megaphone, adminOnly: false },
      { value: "match-control", label: "Centre Match", icon: Radio, adminOnly: false },
      { value: "opponents", label: "Équipes Adverses", icon: Target, adminOnly: false },
      { value: "formations", label: "Formations", icon: Target, adminOnly: false },
      { value: "lineups", label: "Compositions", icon: Users, adminOnly: false },
    ]
  },
  {
    category: "Événements",
    items: [
      { value: "press", label: "Conférences", icon: Mic, adminOnly: false },
      { value: "training", label: "Entraînements", icon: PlayCircle, adminOnly: false },
    ]
  },
  {
    category: "Engagement",
    items: [
      { value: "newsletter", label: "Newsletter", icon: Mail, adminOnly: false },
      { value: "dream-teams", label: "Dream Teams", icon: Star, adminOnly: false },
      { value: "notifications", label: "Notifications", icon: Bell, adminOnly: false },
    ]
  },
  {
    category: "Paramètres",
    items: [
      { value: "integrations", label: "Intégrations", icon: Puzzle, adminOnly: true },
      { value: "site-content", label: "Contenu du site", icon: Type, adminOnly: true },
      { value: "branding", label: "Branding", icon: Palette, adminOnly: true },
      { value: "welcome-popup", label: "Popup Bienvenue", icon: Sparkles, adminOnly: true },
      { value: "social-links", label: "Réseaux Sociaux", icon: Share2, adminOnly: true },
      { value: "explore-cards", label: "Cartes Explorer", icon: LayoutGrid, adminOnly: true },
      { value: "footer-links", label: "Liens Footer", icon: Link, adminOnly: true },
      { value: "season-management", label: "Gestion Saison", icon: RotateCcw, adminOnly: true },
      { value: "settings", label: "Paramètres", icon: Settings, adminOnly: false },
    ]
  },
];

export function AdminMobileNav({ activeTab, onTabChange }: AdminMobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const [openCategories, setOpenCategories] = React.useState<string[]>(["Général"]);
  const { isAdmin } = useAuth();

  // Find which category the active tab belongs to and open it
  React.useEffect(() => {
    const category = navigationCategories.find(cat => 
      cat.items.some(item => item.value === activeTab)
    );
    if (category && !openCategories.includes(category.category)) {
      setOpenCategories(prev => [...prev, category.category]);
    }
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setOpen(false);
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline ml-2">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0">
        <SheetHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b">
          <SheetTitle className="text-left text-base sm:text-lg">Navigation Admin</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-70px)] sm:h-[calc(100vh-80px)]">
          <div className="p-2 sm:p-3 space-y-1">
            {navigationCategories.map((category) => {
              const visibleItems = category.items.filter(item => !item.adminOnly || isAdmin);
              if (visibleItems.length === 0) return null;

              const isOpen = openCategories.includes(category.category);
              const hasActiveItem = visibleItems.some(item => item.value === activeTab);

              return (
                <Collapsible 
                  key={category.category} 
                  open={isOpen} 
                  onOpenChange={() => toggleCategory(category.category)}
                >
                  <CollapsibleTrigger className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-md text-left
                    transition-colors text-xs sm:text-sm font-medium
                    ${hasActiveItem ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}
                  `}>
                    <span>{category.category}</span>
                    <ChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-1 ml-2 space-y-0.5">
                      {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.value;
                        
                        return (
                          <button
                            key={item.value}
                            onClick={() => handleTabChange(item.value)}
                            className={`
                              w-full flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-md text-left
                              transition-all duration-150
                              ${isActive 
                                ? 'bg-primary text-primary-foreground font-medium' 
                                : 'hover:bg-muted text-foreground'
                              }
                            `}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="text-xs sm:text-sm truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

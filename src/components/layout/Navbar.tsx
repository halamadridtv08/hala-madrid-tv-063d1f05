import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, Calendar, Users, Video, FileText, Image, Search, Plus, Star } from "lucide-react";
import { AuthButtons } from "./AuthButtons";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";
import { AddContentMenu } from "./AddContentMenu";
import { AnimatedSearchBar } from "./AnimatedSearchBar";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const {
    isAdmin
  } = useAuth();
  const {
    t
  } = useLanguage();
  const {
    isVisible
  } = useSiteVisibility();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const closeMenu = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };
  const toggleAddMenu = () => {
    setIsAddMenuOpen(!isAddMenuOpen);
  };
  const handleTabChange = (tab: string) => {
    navigate(`/admin?tab=${tab}`);
    setIsAddMenuOpen(false);
  };
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      closeMenu();
    }
  };
  return <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm">
      <div className="madrid-container py-2 md:py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 md:gap-3" onClick={closeMenu}>
          <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full backdrop-blur-lg border border-madrid-gold/20 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg flex items-center justify-center hover:shadow-xl hover:shadow-madrid-gold/20 hover:scale-105 transition-all duration-300">
            <img alt="Hala Madrid Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain" width="48" height="48" src="/lovable-uploads/68f70788-6521-4d69-a55f-56bf305adf1d.png" />
          </div>
          <span className="font-montserrat font-bold text-sm sm:text-lg md:text-xl lg:text-2xl tracking-tight">
            <span className="text-madrid-blue">HALA</span>
            <span className="text-black dark:text-white">MADRID</span>
            <span className="text-madrid-gold">TV</span>
          </span>
        </Link>

        {/* Search Bar for Desktop */}
        <div className="hidden lg:flex items-center flex-1 mx-8 justify-center">
          <AnimatedSearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearchSubmit} />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-1 md:gap-2 md:hidden">
          {isAdmin && <div className="relative">
              <Button variant="ghost" size="sm" onClick={toggleAddMenu} className="relative text-madrid-blue p-1" aria-label="Ajouter du contenu">
                <Plus className="h-4 w-4" />
              </Button>
              {isAddMenuOpen && <AddContentMenu onClose={() => setIsAddMenuOpen(false)} onTabChange={handleTabChange} />}
            </div>}
          <ThemeToggle />
          <div className="hidden xs:block">
            <AuthButtons />
          </div>
          <Button variant="ghost" size="sm" onClick={toggleMenu} className="p-1">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-5">
          <NavigationMenu>
            <NavigationMenuList className="gap-1 lg:gap-2">
              <NavigationMenuItem>
                <Link to="/" className="text-foreground hover:text-madrid-blue font-medium transition-colors text-sm lg:text-base px-2 py-1">
                  {t('nav.home')}
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm lg:text-base px-2 py-1">{t('nav.news')}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[320px] md:w-[400px] md:grid-cols-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link to="/news" className="flex flex-col h-full w-full justify-between rounded-md bg-gradient-to-b from-madrid-blue/20 to-madrid-gold/20 p-4 lg:p-6 no-underline hover:shadow-md">
                          <div className="mb-2 mt-4 text-base lg:text-lg font-medium">
                            Dernières Actualités
                          </div>
                          <p className="text-xs lg:text-sm leading-tight text-muted-foreground">
                            Découvrez les dernières nouvelles concernant le Real Madrid.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/press" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-xs lg:text-sm font-medium leading-none">Conférences de Presse</div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            Les déclarations des joueurs et du staff.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/training" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-xs lg:text-sm font-medium leading-none">Entraînements</div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            Les séances d'entraînement de l'équipe.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/players" className="text-foreground hover:text-madrid-blue font-medium transition-colors flex items-center gap-1 text-sm lg:text-base px-2 py-1">
                  <Users className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden lg:inline">Effectif</span>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/matches" className="text-foreground hover:text-madrid-blue font-medium transition-colors text-sm lg:text-base px-2 py-1">
                  Matchs
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/kits" className="text-foreground hover:text-madrid-blue font-medium transition-colors text-sm lg:text-base px-2 py-1">
                  Maillots
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/calendar" className="text-foreground hover:text-madrid-blue font-medium transition-colors flex items-center gap-1 text-sm lg:text-base px-2 py-1">
                  <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden lg:inline">Calendrier</span>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/stats" className="text-foreground hover:text-madrid-blue font-medium transition-colors text-sm lg:text-base px-2 py-1">
                  Stats
                </Link>
              </NavigationMenuItem>
              
              {isVisible('dream_team_nav') && <NavigationMenuItem>
                  <Link to="/dream-team" className="text-foreground hover:text-madrid-gold font-medium transition-colors flex items-center gap-1 text-sm lg:text-base px-2 py-1">
                    <Star className="h-3 w-3 lg:h-4 lg:w-4 text-madrid-gold" />
                    <span className="hidden lg:inline">Dream Team</span>
                  </Link>
                </NavigationMenuItem>}
            </NavigationMenuList>
          </NavigationMenu>
          
          {isAdmin && <div className="relative">
              <Button variant="ghost" size="sm" onClick={toggleAddMenu} className="relative text-madrid-blue hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors p-2" aria-label="Ajouter du contenu">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Ajouter du contenu</span>
              </Button>
              {isAddMenuOpen && <AddContentMenu onClose={() => setIsAddMenuOpen(false)} onTabChange={handleTabChange} />}
            </div>}
          
          {isVisible('language_selector') && <LanguageSelector />}
          <ThemeToggle />
          <AuthButtons />
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-md md:hidden z-50">
            <div className="p-3">
              <div className="mb-4">
                <AnimatedSearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearchSubmit} />
              </div>
              
              <div className="flex flex-col gap-2">
                <Link to="/" className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 text-sm" onClick={closeMenu}>
                  {t('nav.home')}
                </Link>
                <Link to="/news" className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 flex items-center gap-2 text-sm" onClick={closeMenu}>
                  <FileText className="h-4 w-4" /> {t('nav.news')}
                </Link>
                <Link to="/players" className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 flex items-center gap-2 text-sm" onClick={closeMenu}>
                  <Users className="h-4 w-4" /> {t('nav.players')}
                </Link>
                <Link to="/matches" className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 text-sm" onClick={closeMenu}>
                  {t('nav.matches')}
                </Link>
                <Link to="/training" className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 flex items-center gap-2 text-sm" onClick={closeMenu}>
                  <Video className="h-4 w-4" /> {t('nav.training')}
                </Link>
                <Link to="/press" className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 text-sm" onClick={closeMenu}>
                  {t('nav.press')}
                </Link>
                <Link to="/kits" className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 flex items-center gap-2 text-sm" onClick={closeMenu}>
                  <Image className="h-4 w-4" /> {t('nav.kits')}
                </Link>
                <Link to="/calendar" className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 flex items-center gap-2 text-sm" onClick={closeMenu}>
                  <Calendar className="h-4 w-4" /> {t('nav.calendar')}
                </Link>
                <Link to="/stats" className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 text-sm" onClick={closeMenu}>
                  {t('nav.stats')}
                </Link>
                {isVisible('dream_team_nav') && <Link to="/dream-team" className="text-foreground hover:text-madrid-gold font-medium transition-colors py-2 flex items-center gap-2 text-sm" onClick={closeMenu}>
                    <Star className="h-4 w-4 text-madrid-gold" /> Dream Team
                  </Link>}
              </div>
              
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {isVisible('language_selector') && <LanguageSelector />}
                <AuthButtons />
              </div>
            </div>
          </div>}
      </div>
    </header>;
}
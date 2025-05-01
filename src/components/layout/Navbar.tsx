
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, Calendar, Users, Video, FileText, Image } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm">
      <div className="madrid-container py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <div className="relative">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png" 
              alt="Logo" 
              className="h-10 w-10"
            />
          </div>
          <span className="font-montserrat font-bold text-xl md:text-2xl tracking-tight">
            <span className="text-madrid-blue">HALA</span>
            <span className="text-black dark:text-white">MADRID</span>
            <span className="text-madrid-gold">TV</span>
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-5">
          <Link to="/" className="text-foreground hover:text-madrid-blue font-medium transition-colors">
            Accueil
          </Link>
          <Link to="/news" className="text-foreground hover:text-madrid-blue font-medium transition-colors flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Actualités
          </Link>
          <Link to="/players" className="text-foreground hover:text-madrid-blue font-medium transition-colors flex items-center gap-1">
            <Users className="h-4 w-4" />
            Effectif
          </Link>
          <Link to="/matches" className="text-foreground hover:text-madrid-blue font-medium transition-colors">
            Matchs
          </Link>
          <Link to="/training" className="text-foreground hover:text-madrid-blue font-medium transition-colors flex items-center gap-1">
            <Video className="h-4 w-4" />
            Entrainement
          </Link>
          <Link to="/press" className="text-foreground hover:text-madrid-blue font-medium transition-colors">
            Conférences
          </Link>
          <Link to="/kits" className="text-foreground hover:text-madrid-blue font-medium transition-colors flex items-center gap-1">
            <Image className="h-4 w-4" />
            Maillots
          </Link>
          <Link to="/calendar" className="text-foreground hover:text-madrid-blue font-medium transition-colors flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Calendrier
          </Link>
          <Link to="/stats" className="text-foreground hover:text-madrid-blue font-medium transition-colors">
            Stats
          </Link>
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-md md:hidden z-50">
            <div className="flex flex-col p-4 gap-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2"
                onClick={closeMenu}
              >
                Accueil
              </Link>
              <Link 
                to="/news" 
                className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 flex items-center gap-2"
                onClick={closeMenu}
              >
                <FileText className="h-4 w-4" /> Actualités
              </Link>
              <Link 
                to="/players" 
                className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 flex items-center gap-2"
                onClick={closeMenu}
              >
                <Users className="h-4 w-4" /> Effectif
              </Link>
              <Link 
                to="/matches" 
                className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2"
                onClick={closeMenu}
              >
                Matchs
              </Link>
              <Link 
                to="/training" 
                className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 flex items-center gap-2"
                onClick={closeMenu}
              >
                <Video className="h-4 w-4" /> Entrainement
              </Link>
              <Link 
                to="/press" 
                className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2"
                onClick={closeMenu}
              >
                Conférences
              </Link>
              <Link 
                to="/kits" 
                className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 flex items-center gap-2"
                onClick={closeMenu}
              >
                <Image className="h-4 w-4" /> Maillots
              </Link>
              <Link 
                to="/calendar" 
                className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2 flex items-center gap-2"
                onClick={closeMenu}
              >
                <Calendar className="h-4 w-4" /> Calendrier
              </Link>
              <Link 
                to="/stats" 
                className="text-foreground hover:text-madrid-blue font-medium transition-colors py-2"
                onClick={closeMenu}
              >
                Stats
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

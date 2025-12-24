import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Home, Search, Trophy, Users, Newspaper } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const quickLinks = [
    { icon: Home, label: "Accueil", path: "/" },
    { icon: Newspaper, label: "Actualités", path: "/news" },
    { icon: Users, label: "Effectif", path: "/players" },
    { icon: Trophy, label: "Matchs", path: "/matches" },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 py-16 px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Football animation */}
          <motion.div
            className="relative mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-[150px] sm:text-[200px] font-black text-primary/10 select-none leading-none"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            >
              404
            </motion.div>
            
            {/* Animated football */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 10,
                delay: 0.5 
              }}
            >
              <motion.span
                className="text-6xl sm:text-8xl"
                animate={{ 
                  rotate: [0, 360],
                  y: [0, -20, 0]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  y: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                ⚽
              </motion.span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
              Hors-jeu ! 🚫
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Cette page semble avoir quitté le terrain. 
              <br className="hidden sm:block" />
              L'arbitre a sifflé, mais la page n'existe pas.
            </p>
          </motion.div>

          {/* Quick navigation */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={link.path}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-accent transition-all duration-200"
                >
                  <link.icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Search and home buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Button asChild variant="outline" className="gap-2">
              <Link to="/search">
                <Search className="h-4 w-4" />
                Rechercher
              </Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;

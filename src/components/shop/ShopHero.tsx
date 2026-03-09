import { motion } from "framer-motion";
import { ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const ShopHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-card to-background py-16 sm:py-24">
      {/* Glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10"
          >
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
            <span className="text-xs font-semibold text-secondary uppercase tracking-widest">
              Fan Store Officiel
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-montserrat font-extrabold text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight"
          >
            THE ULTIMATE{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MADRID
            </span>{" "}
            FAN STORE
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto"
          >
            Maillots premium, accessoires exclusifs et déco gaming.
            Tout pour les vrais Madridistas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
          >
            <Button size="lg" className="gap-2 font-montserrat font-semibold" asChild>
              <a href="#shop-products">
                <ShoppingBag className="h-5 w-5" />
                Voir la boutique
              </a>
            </Button>
            <Button size="lg" variant="outline" className="font-montserrat font-semibold border-secondary/30 hover:bg-secondary/10 text-foreground" asChild>
              <Link to="/shop?category=special">
                Collection Spéciale ⭐
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

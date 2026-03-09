import { motion } from "framer-motion";
import { ShoppingBag, ArrowDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const ShopHero = () => {
  return (
    <section className="relative overflow-hidden bg-background min-h-[70vh] flex items-center">
      {/* Dramatic background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute top-0 right-0 w-[80%] h-full bg-gradient-to-l from-primary/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent" />
        
        {/* Geometric accents */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] border border-primary/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -left-20 w-[300px] h-[300px] border border-secondary/10 rounded-full"
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-4xl space-y-8">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">
                Collection 2025/26
              </span>
            </span>
          </motion.div>

          {/* Main headline — Nike-style bold stacked text */}
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-montserrat font-black text-5xl sm:text-7xl lg:text-8xl text-foreground leading-[0.9] tracking-tight"
            >
              SHOP
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-montserrat font-black text-5xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tight"
            >
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                MADRIDISTA
              </span>
            </motion.h1>
          </div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-muted-foreground text-base sm:text-lg max-w-lg leading-relaxed"
          >
            Maillots authentiques, accessoires premium et éditions limitées. 
            Conçus pour les vrais fans.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-wrap gap-4 pt-2"
          >
            <Button 
              size="lg" 
              className="gap-2.5 font-montserrat font-bold text-sm uppercase tracking-wider px-8 h-14 rounded-none"
              asChild
            >
              <a href="#shop-products">
                <ShoppingBag className="h-5 w-5" />
                Explorer la boutique
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="font-montserrat font-bold text-sm uppercase tracking-wider px-8 h-14 rounded-none border-foreground/20 hover:bg-foreground hover:text-background transition-all"
              asChild
            >
              <Link to="/shop?category=special">
                Collection Spéciale
              </Link>
            </Button>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex gap-8 sm:gap-12 pt-8 border-t border-border/50"
          >
            {[
              { value: "100%", label: "Authentique" },
              { value: "24/7", label: "Support" },
              { value: "30j", label: "Retour gratuit" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="font-montserrat font-black text-xl sm:text-2xl text-foreground">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a href="#shop-products" className="flex flex-col items-center gap-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ArrowDown className="h-4 w-4" />
        </a>
      </motion.div>
    </section>
  );
};

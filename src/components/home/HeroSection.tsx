
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { YouTubeChannel } from "@/components/YouTubeChannel";
import { NewsCarousel } from "@/components/home/NewsCarousel";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <>
      <motion.div 
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <video 
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-madrid-blue/40 z-10"></div>
        
        <div className="madrid-container py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32 relative z-10">
          <motion.div 
            className="max-w-3xl"
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
              <span className="text-madrid-gold">Bienvenue sur </span>
              <br />
              HALA<span className="text-white">MADRID</span><span className="text-madrid-gold">TV</span>
            </h1>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 mb-4 sm:mb-6 md:mb-8 leading-relaxed">
              Votre chaîne officielle d'actualités, de vidéos et d'informations sur le Real Madrid
            </p>
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-4">
              <Button asChild className="bg-madrid-gold text-black hover:bg-yellow-400 font-bold py-2 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base lg:text-lg transform transition hover:scale-105 w-full xs:w-auto">
                <Link to="/news">Dernières Actualités</Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 font-bold py-2 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base lg:text-lg transform transition hover:scale-105 w-full xs:w-auto">
                <Link to="/videos">Voir les Vidéos</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Nouveau carrousel de nouvelles */}
      <div className="w-full">
        <NewsCarousel />
      </div>
      
      {/* Section YouTube mise en avant */}
      <section className="py-6 sm:py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
        <div className="madrid-container">
          <h2 className="section-title mb-4 sm:mb-6 md:mb-8 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">Dernière Vidéo YouTube</h2>
          <YouTubeChannel channelUrl="https://www.youtube.com/@HALAMADRIDTV10" />
        </div>
      </section>
    </>
  );
}

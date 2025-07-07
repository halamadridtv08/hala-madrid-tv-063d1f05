
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { YouTubeChannel } from "@/components/YouTubeChannel";
import { NewsCarousel } from "@/components/home/NewsCarousel";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <>
      <motion.div 
        className="relative bg-madrid-blue overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div 
          className="absolute inset-0 opacity-30 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://media.gettyimages.com/id/1664698815/photo/real-madrid-cf-beats-fc-barcelona-3-2-el-clasico-pre-season-friendly.jpg?s=2048x2048&w=gi&k=20&c=o3BYRGQaJdAbjXcH6_D0OjTNq4D9z_CXsH5RG31rz3A=')` 
          }}
        ></div>
        
        <div className="madrid-container py-12 md:py-20 lg:py-32 relative z-10">
          <motion.div 
            className="max-w-3xl"
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 leading-tight">
              <span className="text-madrid-gold">Bienvenue sur </span>
              <br />
              HALA<span className="text-white">MADRID</span><span className="text-madrid-gold">TV</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 mb-6 md:mb-8 leading-relaxed">
              Votre chaîne officielle d'actualités, de vidéos et d'informations sur le Real Madrid
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button asChild className="bg-madrid-gold text-black hover:bg-yellow-400 font-bold py-2 px-4 md:py-2 md:px-6 text-sm md:text-lg transform transition hover:scale-105 w-full sm:w-auto">
                <Link to="/news">Dernières Actualités</Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 font-bold py-2 px-4 md:py-2 md:px-6 text-sm md:text-lg transform transition hover:scale-105 w-full sm:w-auto">
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
      <section className="py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
        <div className="madrid-container">
          <h2 className="section-title mb-6 md:mb-8 text-2xl md:text-3xl lg:text-4xl">Dernière Vidéo YouTube</h2>
          <YouTubeChannel channelUrl="https://www.youtube.com/@HALAMADRIDTV10" />
        </div>
      </section>
    </>
  );
}

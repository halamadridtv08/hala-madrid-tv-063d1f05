
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { YouTubeChannel } from "@/components/YouTubeChannel";
import { NewsCarousel } from "@/components/home/NewsCarousel";
import { motion } from "framer-motion";
import { useHeroVideo } from "@/hooks/useHeroVideo";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroSection() {
  const { videoUrl, isLoading } = useHeroVideo();

  return (
    <>
      <motion.div 
        className="relative overflow-hidden bg-madrid-blue/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="madrid-container py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <motion.div 
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

            <motion.div 
              className="w-full h-[300px] sm:h-[400px] lg:h-[500px] flex justify-center items-center"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : videoUrl ? (
                <video 
                  className="w-full h-full rounded-xl object-cover shadow-2xl"
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  key={videoUrl}
                >
                  <source src={videoUrl} type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              ) : (
                <div className="w-full h-full rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <p className="text-gray-500">Vidéo non disponible</p>
                </div>
              )}
            </motion.div>
          </div>
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

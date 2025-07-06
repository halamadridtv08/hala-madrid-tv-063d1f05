
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
        
        <div className="madrid-container py-20 md:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Contenu textuel à gauche */}
            <motion.div 
              className="max-w-3xl lg:max-w-none"
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
                <span className="text-madrid-gold">Bienvenue sur </span>
                <br />
                HALA<span className="text-white">MADRID</span><span className="text-madrid-gold">TV</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-8">
                Votre chaîne officielle d'actualités, de vidéos et d'informations sur le Real Madrid
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-madrid-gold text-black hover:bg-yellow-400 font-bold py-2 px-6 text-lg transform transition hover:scale-105">
                  <Link to="/news">Dernières Actualités</Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 font-bold py-2 px-6 text-lg transform transition hover:scale-105">
                  <Link to="/videos">Voir les Vidéos</Link>
                </Button>
              </div>
            </motion.div>

            {/* Vidéo de présentation à droite */}
            <motion.div 
              className="relative"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h3 className="text-white text-xl font-bold mb-4 text-center">
                  Découvrez HALA MADRID TV
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden shadow-2xl">
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Présentation HALA MADRID TV"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                <p className="text-gray-200 text-sm mt-3 text-center">
                  Plongez dans l'univers du Real Madrid avec nos contenus exclusifs
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Nouveau carrousel de nouvelles */}
      <div className="w-full">
        <NewsCarousel />
      </div>
      
      {/* Section YouTube mise en avant */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="madrid-container">
          <h2 className="section-title mb-8">Dernière Vidéo YouTube</h2>
          <YouTubeChannel channelUrl="https://www.youtube.com/@HALAMADRIDTV10" />
        </div>
      </section>
    </>
  );
}

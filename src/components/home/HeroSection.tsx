import { useNavigate } from "react-router-dom";
import { NewsCarousel } from "@/components/home/NewsCarousel";
import { motion } from "framer-motion";
import { useHeroSettings } from "@/hooks/useHeroSettings";
import { ShinyButton } from "@/components/ui/shiny-button";
import { VideoButton } from "@/components/ui/video-button";
import { useSiteContent } from "@/hooks/useSiteContent";

export function HeroSection() {
  const navigate = useNavigate();
  const { backgroundVideoEnabled, backgroundVideoUrl, mockupVideoUrl, isLoading } = useHeroSettings();
  const { getContent } = useSiteContent();
  
  // Get dynamic content from site_content table
  const heroTitle = getContent('hero_title', 'Bienvenue sur');
  const heroBrandName = getContent('hero_brand_name', 'HALAMADRIDTV');
  const heroSubtitle = getContent('hero_subtitle', "Votre chaîne officielle d'actualités, de vidéos et d'informations sur le Real Madrid");
  const heroCta1 = getContent('hero_cta_primary', 'Dernières Actualités');
  const heroCta2 = getContent('hero_cta_secondary', 'Voir les Vidéos');

  // Mode arrière-plan vidéo plein écran
  if (backgroundVideoEnabled && backgroundVideoUrl) {
    return (
      <>
        <motion.div
          className="relative overflow-hidden min-h-[70vh] sm:min-h-[80vh] lg:min-h-[90vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Video background */}
          <video
            className="absolute inset-0 w-full h-full object-cover z-0"
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            controlsList="nodownload noplaybackrate nofullscreen"
            onContextMenu={(e) => e.preventDefault()}
            key={backgroundVideoUrl}
          >
            <source src={backgroundVideoUrl} type="video/mp4" />
          </video>

          {/* Overlay sombre pour lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 z-10" />

          {/* Contenu - centré en bas */}
          <div className="relative z-20 madrid-container pb-12 sm:pb-16 lg:pb-20 pt-32 flex items-end justify-center min-h-[70vh] sm:min-h-[80vh] lg:min-h-[90vh]">
            <motion.div
              className="text-center max-w-3xl"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">
                <span className="text-madrid-gold">{heroTitle} </span>
                <br />
                HALA<span className="text-white">MADRID</span>
                <span className="text-madrid-gold">TV</span>
              </h1>
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-gray-100 mb-4 sm:mb-6 leading-relaxed">
                {heroSubtitle}
              </p>
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 items-center justify-center">
                <ShinyButton onClick={() => navigate('/news')}>
                  {heroCta1}
                </ShinyButton>
                <VideoButton onClick={() => navigate('/videos')}>
                  {heroCta2}
                </VideoButton>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Carousel */}
        <div className="w-full">
          <NewsCarousel />
        </div>
      </>
    );
  }

  // Mode classique avec vidéo mockup iPhone (layout actuel)
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
                <span className="text-madrid-gold">{heroTitle} </span>
                <br />
                HALA<span className="text-white">MADRID</span>
                <span className="text-madrid-gold">TV</span>
              </h1>
              <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                {heroSubtitle}
              </p>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-4 items-center">
                <ShinyButton onClick={() => navigate('/news')}>
                  {heroCta1}
                </ShinyButton>
                <VideoButton onClick={() => navigate('/videos')}>
                  {heroCta2}
                </VideoButton>
              </div>
            </motion.div>

            <motion.div
              className="w-full h-[300px] sm:h-[400px] lg:h-[500px] flex justify-center items-center"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {mockupVideoUrl ? (
                <video
                  className="w-full h-full rounded-xl object-cover shadow-2xl"
                  autoPlay
                  muted
                  loop
                  playsInline
                  disablePictureInPicture
                  controlsList="nodownload noplaybackrate nofullscreen"
                  onContextMenu={(e) => e.preventDefault()}
                  preload="auto"
                  key={mockupVideoUrl}
                >
                  <source src={mockupVideoUrl} type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-madrid-blue/30 to-madrid-gold/20 flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 border-4 border-madrid-gold border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Carousel */}
      <div className="w-full">
        <NewsCarousel />
      </div>
    </>
  );
}

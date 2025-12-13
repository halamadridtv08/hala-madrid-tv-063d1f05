import { HeroSection } from "@/components/home/HeroSection";
import { LatestNews } from "@/components/home/LatestNews";
import { UpcomingMatch } from "@/components/home/UpcomingMatch";
import { PlayerSpotlight } from "@/components/home/PlayerSpotlight";
import FeaturedKits from "@/components/home/FeaturedKits";
import YouTubeVideos from "@/components/home/YouTubeVideos";
import FeaturedYouTubeVideo from "@/components/home/FeaturedYouTubeVideo";
import { TrophiesShowcase } from "@/components/home/TrophiesShowcase";
import { TwitterFlashCarousel } from "@/components/home/TwitterFlashCarousel";
import { MatchPredictionsWidget } from "@/components/home/MatchPredictionsWidget";
import { StickyContent } from "@/components/home/StickyContent";
import { LiveMatchBar } from "@/components/home/LiveMatchBar";
import { PartnersSection } from "@/components/home/PartnersSection";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText, Video, Users, Image, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";
import { useLiveMatchNotifications } from "@/hooks/useMatchNotifications";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { isVisible } = useSiteVisibility();
  const { t } = useLanguage();
  useLiveMatchNotifications();
  
  return <>
      <SEOHead 
        title={t('nav.home')}
        description="Toute l'actualité du Real Madrid en direct : matchs, transferts, joueurs, statistiques. Suivez les Merengues avec HALA MADRID TV."
        url="/"
      />
      <LiveMatchBar />
      <Navbar />
      <main>
      {isVisible('hero_section') && <HeroSection />}
      {isVisible('youtube_videos') && <FeaturedYouTubeVideo />}
      {isVisible('latest_news') && <LatestNews />}
      {isVisible('flash_news') && <TwitterFlashCarousel />}
      
      {isVisible('youtube_videos') && <YouTubeVideos />}
      {isVisible('trophies') && <TrophiesShowcase />}
      {isVisible('upcoming_match') && <UpcomingMatch />}
      
      {/* Predictions & Sticky Content Section */}
      {(isVisible('predictions_section') || isVisible('trending_section')) && (
        <section className="py-8 bg-muted/30">
          <div className="madrid-container">
            <div className="grid lg:grid-cols-3 gap-6">
              {isVisible('predictions_section') && (
                <div className="lg:col-span-2">
                  <MatchPredictionsWidget />
                </div>
              )}
              {isVisible('trending_section') && (
                <div className={!isVisible('predictions_section') ? 'lg:col-span-3' : ''}>
                  <StickyContent />
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      
        {isVisible('player_spotlight') && <PlayerSpotlight />}
        {isVisible('featured_kits') && <FeaturedKits />}
        
        {/* Partners Section */}
        {isVisible('partners_section') && <PartnersSection />}
        
        {/* Section pour les liens rapides vers les nouvelles sections */}
        <section className="py-6 sm:py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
          <div className="madrid-container">
            <h2 className="section-title mb-4 sm:mb-6 md:mb-8 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">{t('home.explore')}</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <Card className="card-hover">
                <CardContent className="p-3 sm:p-4 md:p-6 text-center flex flex-col items-center">
                  <Video className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-madrid-blue mb-2 sm:mb-3 md:mb-4" />
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{t('cards.training')}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-2 sm:mb-3 md:mb-4 leading-tight">{t('cards.trainingDesc')}</p>
                  <Button asChild variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                    <Link to="/training">{t('cards.viewVideos')}</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-3 sm:p-4 md:p-6 text-center flex flex-col items-center">
                  <FileText className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-madrid-blue mb-2 sm:mb-3 md:mb-4" />
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{t('cards.conferences')}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-2 sm:mb-3 md:mb-4 leading-tight">{t('cards.conferencesDesc')}</p>
                  <Button asChild variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                    <Link to="/press">{t('cards.viewConferences')}</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-3 sm:p-4 md:p-6 text-center flex flex-col items-center">
                  <Image className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-madrid-blue mb-2 sm:mb-3 md:mb-4" />
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{t('cards.kits')}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-2 sm:mb-3 md:mb-4 leading-tight">{t('cards.kitsDesc')}</p>
                  <Button asChild variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                    <Link to="/kits">{t('cards.viewKits')}</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-3 sm:p-4 md:p-6 text-center flex flex-col items-center">
                  <Calendar className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-madrid-blue mb-2 sm:mb-3 md:mb-4" />
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{t('cards.calendar')}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-2 sm:mb-3 md:mb-4 leading-tight">{t('cards.calendarDesc')}</p>
                  <Button asChild variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                    <Link to="/calendar">{t('cards.viewCalendar')}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-4 sm:mt-6 md:mt-8 text-center">
              <Button asChild className="bg-madrid-blue hover:bg-blue-700 w-full xs:w-auto text-sm md:text-base">
                <Link to="/players">
                  <Users className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  {t('home.viewPlayers')}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>;
};
export default Index;
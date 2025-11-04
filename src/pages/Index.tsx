
import { HeroSection } from "@/components/home/HeroSection";
import { LatestNews } from "@/components/home/LatestNews";
import { UpcomingMatch } from "@/components/home/UpcomingMatch";
import { PlayerSpotlight } from "@/components/home/PlayerSpotlight";
import FeaturedKits from "@/components/home/FeaturedKits";
import { VideoSection } from "@/components/home/VideoSection";
import YouTubeVideos from "@/components/home/YouTubeVideos";
import FeaturedYouTubeVideo from "@/components/home/FeaturedYouTubeVideo";
import { TrophiesShowcase } from "@/components/home/TrophiesShowcase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText, Video, Users, Image } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <>
      <Navbar />
      <main>
      <HeroSection />
      <FeaturedYouTubeVideo />
      <LatestNews />
      <VideoSection />
      <YouTubeVideos />
      <TrophiesShowcase />
      <UpcomingMatch />
      <PlayerSpotlight />
      <FeaturedKits />
        
        {/* Section pour les liens rapides vers les nouvelles sections */}
        <section className="py-6 sm:py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
          <div className="madrid-container">
            <h2 className="section-title mb-4 sm:mb-6 md:mb-8 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">Explorez HALA MADRID TV</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <Card className="card-hover">
                <CardContent className="p-3 sm:p-4 md:p-6 text-center flex flex-col items-center">
                  <Video className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-madrid-blue mb-2 sm:mb-3 md:mb-4" />
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">Entrainement</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-2 sm:mb-3 md:mb-4 leading-tight">Accédez aux vidéos des séances d'entrainement de l'équipe</p>
                  <Button asChild variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                    <Link to="/training">Voir les vidéos</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-3 sm:p-4 md:p-6 text-center flex flex-col items-center">
                  <FileText className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-madrid-blue mb-2 sm:mb-3 md:mb-4" />
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">Conférences</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-2 sm:mb-3 md:mb-4 leading-tight">Regardez les conférences de presse des joueurs et du staff</p>
                  <Button asChild variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                    <Link to="/press">Voir les conférences</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-3 sm:p-4 md:p-6 text-center flex flex-col items-center">
                  <Image className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-madrid-blue mb-2 sm:mb-3 md:mb-4" />
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">Maillots</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-2 sm:mb-3 md:mb-4 leading-tight">Découvrez les nouveaux maillots du Real Madrid</p>
                  <Button asChild variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                    <Link to="/kits">Voir les maillots</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-3 sm:p-4 md:p-6 text-center flex flex-col items-center">
                  <Calendar className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-madrid-blue mb-2 sm:mb-3 md:mb-4" />
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">Calendrier</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-2 sm:mb-3 md:mb-4 leading-tight">Consultez les dates des prochains matchs de l'équipe</p>
                  <Button asChild variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                    <Link to="/calendar">Voir le calendrier</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-4 sm:mt-6 md:mt-8 text-center">
              <Button asChild className="bg-madrid-blue hover:bg-blue-700 w-full xs:w-auto text-sm md:text-base">
                <Link to="/players">
                  <Users className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Voir les profils des joueurs
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Index;

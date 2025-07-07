
import { HeroSection } from "@/components/home/HeroSection";
import { LatestNews } from "@/components/home/LatestNews";
import { UpcomingMatch } from "@/components/home/UpcomingMatch";
import { PlayerSpotlight } from "@/components/home/PlayerSpotlight";
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
        <LatestNews />
        <UpcomingMatch />
        <PlayerSpotlight />
        
        {/* Section pour les liens rapides vers les nouvelles sections */}
        <section className="py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
          <div className="madrid-container">
            <h2 className="section-title mb-6 md:mb-8 text-2xl md:text-3xl lg:text-4xl">Explorez HALA MADRID TV</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="card-hover">
                <CardContent className="p-4 md:p-6 text-center flex flex-col items-center">
                  <Video className="h-10 w-10 md:h-12 md:w-12 text-madrid-blue mb-3 md:mb-4" />
                  <h3 className="text-lg md:text-xl font-bold mb-2">Entrainement</h3>
                  <p className="text-sm md:text-base text-gray-500 mb-3 md:mb-4">Accédez aux vidéos des séances d'entrainement de l'équipe</p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/training">Voir les vidéos</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-4 md:p-6 text-center flex flex-col items-center">
                  <FileText className="h-10 w-10 md:h-12 md:w-12 text-madrid-blue mb-3 md:mb-4" />
                  <h3 className="text-lg md:text-xl font-bold mb-2">Conférences</h3>
                  <p className="text-sm md:text-base text-gray-500 mb-3 md:mb-4">Regardez les conférences de presse des joueurs et du staff</p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/press">Voir les conférences</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-4 md:p-6 text-center flex flex-col items-center">
                  <Image className="h-10 w-10 md:h-12 md:w-12 text-madrid-blue mb-3 md:mb-4" />
                  <h3 className="text-lg md:text-xl font-bold mb-2">Maillots</h3>
                  <p className="text-sm md:text-base text-gray-500 mb-3 md:mb-4">Découvrez les nouveaux maillots du Real Madrid</p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/kits">Voir les maillots</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-4 md:p-6 text-center flex flex-col items-center">
                  <Calendar className="h-10 w-10 md:h-12 md:w-12 text-madrid-blue mb-3 md:mb-4" />
                  <h3 className="text-lg md:text-xl font-bold mb-2">Calendrier</h3>
                  <p className="text-sm md:text-base text-gray-500 mb-3 md:mb-4">Consultez les dates des prochains matchs de l'équipe</p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/calendar">Voir le calendrier</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 md:mt-8 text-center">
              <Button asChild className="bg-madrid-blue hover:bg-blue-700 w-full sm:w-auto">
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

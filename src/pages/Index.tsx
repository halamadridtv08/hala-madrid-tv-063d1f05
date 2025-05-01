
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
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="madrid-container">
            <h2 className="section-title mb-8">Explorez HALA MADRID TV</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card-hover">
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <Video className="h-12 w-12 text-madrid-blue mb-4" />
                  <h3 className="text-xl font-bold mb-2">Entrainement</h3>
                  <p className="text-gray-500 mb-4">Accédez aux vidéos des séances d'entrainement de l'équipe</p>
                  <Button asChild variant="outline">
                    <Link to="/training">Voir les vidéos</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <FileText className="h-12 w-12 text-madrid-blue mb-4" />
                  <h3 className="text-xl font-bold mb-2">Conférences</h3>
                  <p className="text-gray-500 mb-4">Regardez les conférences de presse des joueurs et du staff</p>
                  <Button asChild variant="outline">
                    <Link to="/press">Voir les conférences</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <Image className="h-12 w-12 text-madrid-blue mb-4" />
                  <h3 className="text-xl font-bold mb-2">Maillots</h3>
                  <p className="text-gray-500 mb-4">Découvrez les nouveaux maillots du Real Madrid</p>
                  <Button asChild variant="outline">
                    <Link to="/kits">Voir les maillots</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <Calendar className="h-12 w-12 text-madrid-blue mb-4" />
                  <h3 className="text-xl font-bold mb-2">Calendrier</h3>
                  <p className="text-gray-500 mb-4">Consultez les dates des prochains matchs de l'équipe</p>
                  <Button asChild variant="outline">
                    <Link to="/calendar">Voir le calendrier</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 text-center">
              <Button asChild className="bg-madrid-blue hover:bg-blue-700">
                <Link to="/players">
                  <Users className="mr-2 h-5 w-5" />
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

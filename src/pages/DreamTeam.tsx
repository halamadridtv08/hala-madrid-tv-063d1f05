import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DreamTeamBuilder } from "@/components/dreamteam/DreamTeamBuilder";
import { SEOHead } from "@/components/SEOHead";

const DreamTeam = () => {
  return (
    <>
      <SEOHead 
        title="Dream Team - Créez votre XI de rêve"
        description="Créez votre équipe de rêve du Real Madrid avec un budget limité. Composez votre XI idéal et partagez-le avec la communauté."
        url="/dream-team"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 madrid-container py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-madrid-blue">Dream</span>
              <span className="text-madrid-gold"> Team</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Créez votre XI de rêve du Real Madrid ! Sélectionnez vos joueurs préférés 
              avec un budget limité et partagez votre équipe avec la communauté.
            </p>
          </div>
          
          <DreamTeamBuilder />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default DreamTeam;

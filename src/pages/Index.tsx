
import { HeroSection } from "@/components/home/HeroSection";
import { LatestNews } from "@/components/home/LatestNews";
import { UpcomingMatch } from "@/components/home/UpcomingMatch";
import { PlayerSpotlight } from "@/components/home/PlayerSpotlight";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <LatestNews />
        <UpcomingMatch />
        <PlayerSpotlight />
      </main>
      <Footer />
    </>
  );
};

export default Index;

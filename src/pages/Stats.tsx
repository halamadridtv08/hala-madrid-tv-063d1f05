
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CompetitionTabs } from "@/components/stats/CompetitionTabs";
import { 
  topScorers,
  topAssists,
  mostPlayed,
  teamPerformance,
  standings
} from "@/components/stats/StatsData";

const Stats = () => {
  return (
    <>
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          <h1 className="section-title mb-8">Statistiques</h1>
          
          <CompetitionTabs 
            topScorers={topScorers}
            topAssists={topAssists}
            mostPlayed={mostPlayed}
            teamPerformance={teamPerformance}
            standings={standings}
          />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Stats;

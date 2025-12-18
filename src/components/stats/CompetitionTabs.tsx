import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsPerformance } from "./StatsPerformance";
import { StatsTopScorers } from "./StatsTopScorers";
import { StatsTopAssists } from "./StatsTopAssists";
import { StatsMostPlayed } from "./StatsMostPlayed";
import { StatsStandings } from "./StatsStandings";
import { StatsGlobalOverview } from "./StatsGlobalOverview";
import { LaLigaStandings } from "./LaLigaStandings";
import { LiveScores } from "./LiveScores";
import { TeamStatsLive } from "./TeamStatsLive";
import { Radio } from "lucide-react";

interface CompetitionTabsProps {
  topScorers: Record<string, any[]>;
  topAssists: Record<string, any[]>;
  mostPlayed: Record<string, any[]>;
  teamPerformance: Record<string, any[]>;
  standings: Record<string, any[]>;
}

export const CompetitionTabs = ({
  topScorers,
  topAssists,
  mostPlayed,
  teamPerformance,
  standings
}: CompetitionTabsProps) => {
  const [activeTab, setActiveTab] = useState("live");

  return (
    <Tabs defaultValue="live" value={activeTab} onValueChange={setActiveTab}>
      <div className="w-full overflow-x-auto mb-8">
        <TabsList className="inline-flex w-full md:w-auto min-w-full md:min-w-0">
          <TabsTrigger value="live" className="text-xs sm:text-sm whitespace-nowrap flex items-center gap-1">
            <Radio className="h-3 w-3 text-destructive animate-pulse" />
            La Liga Live
          </TabsTrigger>
          <TabsTrigger value="global" className="text-xs sm:text-sm whitespace-nowrap">Global</TabsTrigger>
          <TabsTrigger value="laliga" className="text-xs sm:text-sm whitespace-nowrap">La Liga</TabsTrigger>
          <TabsTrigger value="cl" className="text-xs sm:text-sm whitespace-nowrap">Champions League</TabsTrigger>
          <TabsTrigger value="copaDelRey" className="text-xs sm:text-sm whitespace-nowrap">Copa del Rey</TabsTrigger>
          <TabsTrigger value="supercoupeEurope" className="text-xs sm:text-sm whitespace-nowrap">Supercoupe d'Europe</TabsTrigger>
          <TabsTrigger value="supercoupeEspagne" className="text-xs sm:text-sm whitespace-nowrap">Supercoupe d'Espagne</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="live" className="space-y-8">
        <LiveScores />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LaLigaStandings />
          <TeamStatsLive />
        </div>
      </TabsContent>

      <TabsContent value="global" className="space-y-8">
        <StatsGlobalOverview />
      </TabsContent>

      {["laliga", "cl", "copaDelRey", "supercoupeEurope", "supercoupeEspagne"].map((competition) => (
        <TabsContent key={competition} value={competition} className="space-y-8">
          <StatsPerformance teamPerformance={teamPerformance[competition]} />
          <StatsTopScorers topScorers={topScorers[competition]} />
          <StatsTopAssists topAssists={topAssists[competition]} />
          <StatsMostPlayed mostPlayed={mostPlayed[competition]} />
          <StatsStandings standings={standings[competition]} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

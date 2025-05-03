
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsPerformance } from "./StatsPerformance";
import { StatsTopScorers } from "./StatsTopScorers";
import { StatsTopAssists } from "./StatsTopAssists";
import { StatsMostPlayed } from "./StatsMostPlayed";
import { StatsStandings } from "./StatsStandings";
import { StatsGlobalOverview } from "./StatsGlobalOverview";

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
  const [activeTab, setActiveTab] = useState("laliga");

  return (
    <Tabs defaultValue="laliga" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-6 mb-8">
        <TabsTrigger value="global">Global</TabsTrigger>
        <TabsTrigger value="laliga">La Liga</TabsTrigger>
        <TabsTrigger value="cl">Champions League</TabsTrigger>
        <TabsTrigger value="copaDelRey">Copa del Rey</TabsTrigger>
        <TabsTrigger value="supercoupeEurope">Supercoupe d'Europe</TabsTrigger>
        <TabsTrigger value="supercoupeEspagne">Supercoupe d'Espagne</TabsTrigger>
      </TabsList>

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

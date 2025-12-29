import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AlertCircle, Radio, ChevronDown, Check } from "lucide-react";
import { TacticalFormation } from "./TacticalFormation";
import { MatchEvents } from "./MatchEvents";
import { MatchStatistics } from "./MatchStatistics";
import { ProbableLineupFormation } from "./ProbableLineupFormation";
import { LiveBlog } from "./LiveBlog";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MobileTabSelectorProps {
  match: any;
  isVisible: (key: string) => boolean;
  loading: boolean;
  realMadridLineup: any[];
  realMadridSubs: any[];
  finalOpposingLineup: any[];
  finalOpposingSubs: any[];
  absentPlayers: any[];
}

interface TabOption {
  value: string;
  label: string;
  hasLiveIndicator?: boolean;
}

export const MobileTabSelector = ({
  match,
  isVisible,
  loading,
  realMadridLineup,
  realMadridSubs,
  finalOpposingLineup,
  finalOpposingSubs,
  absentPlayers,
}: MobileTabSelectorProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("tactical");
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const tabOptions: TabOption[] = [
    { value: "tactical", label: "Compositions" },
    ...(isVisible('live_blog_match') ? [{ value: "live-blog", label: "Live Blog", hasLiveIndicator: match.status === 'live' }] : []),
    { value: "events", label: "Événements" },
    { value: "stats", label: "Stats" },
    { value: "lineups", label: "Probables" },
    { value: "absents", label: "Absents" },
  ];

  const currentTabLabel = tabOptions.find(t => t.value === activeTab)?.label || "Compositions";

  const handleSelectTab = (value: string) => {
    setActiveTab(value);
    setIsSelectOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "tactical":
        return <TacticalFormation matchId={match.id} matchData={match} />;
      case "live-blog":
        return isVisible('live_blog_match') ? <LiveBlog matchId={match.id} /> : null;
      case "events":
        return <MatchEvents matchDetails={match.match_details} />;
      case "stats":
        return <MatchStatistics matchDetails={match.match_details} homeTeam={match.homeTeam.name} awayTeam={match.awayTeam.name} />;
      case "lineups":
        return (
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8">
                  Chargement des compositions...
                </div>
              ) : (
                <ProbableLineupFormation
                  realMadridLineup={realMadridLineup}
                  realMadridSubs={realMadridSubs}
                  opposingLineup={finalOpposingLineup}
                  opposingSubs={finalOpposingSubs}
                  opposingTeamName={match.homeTeam.name === 'Real Madrid' ? match.awayTeam.name : match.homeTeam.name}
                  homeTeamName={match.homeTeam.name}
                />
              )}
            </CardContent>
          </Card>
        );
      case "absents":
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                <h3 className="font-bold">Joueurs absents ou incertains</h3>
              </div>
              
              {absentPlayers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Aucun joueur absent pour ce match</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Joueur</TableHead>
                        <TableHead className="text-xs">Équipe</TableHead>
                        <TableHead className="text-xs">Raison</TableHead>
                        <TableHead className="text-xs">Retour</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {absentPlayers.map(player => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium text-xs">{player.player_name}</TableCell>
                          <TableCell className="text-xs">{player.team_type === 'real_madrid' ? 'Real Madrid' : 'Adverse'}</TableCell>
                          <TableCell className="text-xs">{player.reason}</TableCell>
                          <TableCell className="text-xs">{player.return_date ? new Date(player.return_date).toLocaleDateString('fr-FR') : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  // Mobile: Select dropdown with modal
  if (isMobile) {
    return (
      <div className="mt-4">
        {/* Select trigger button */}
        <button
          onClick={() => setIsSelectOpen(true)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span className="flex items-center gap-2">
            {tabOptions.find(t => t.value === activeTab)?.hasLiveIndicator && (
              <Radio className="h-3 w-3 text-red-500 animate-pulse" />
            )}
            {currentTabLabel}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        {/* Modal for selecting tab */}
        <Dialog open={isSelectOpen} onOpenChange={setIsSelectOpen}>
          <DialogContent className="w-[90vw] max-w-[300px] p-0 gap-0">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="text-base">Sélectionner une section</DialogTitle>
            </DialogHeader>
            <div className="p-1">
              {tabOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelectTab(option.value)}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${
                    activeTab === option.value ? 'bg-accent' : ''
                  }`}
                >
                  {activeTab === option.value && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  <span className={activeTab === option.value ? '' : 'ml-6'}>
                    {option.hasLiveIndicator && (
                      <Radio className="h-3 w-3 text-red-500 animate-pulse inline mr-2" />
                    )}
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Tab content */}
        <div className="mt-4">
          {renderTabContent()}
        </div>
      </div>
    );
  }

  // Desktop: Regular tabs
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <TabsList className={`grid w-full ${isVisible('live_blog_match') ? 'grid-cols-6' : 'grid-cols-5'}`}>
        <TabsTrigger value="tactical">Compositions</TabsTrigger>
        {isVisible('live_blog_match') && (
          <TabsTrigger value="live-blog" className="flex items-center gap-1">
            {match.status === 'live' && <Radio className="h-3 w-3 text-red-500 animate-pulse" />}
            Live Blog
          </TabsTrigger>
        )}
        <TabsTrigger value="events">Événements</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="lineups">Probables</TabsTrigger>
        <TabsTrigger value="absents">Absents</TabsTrigger>
      </TabsList>
      
      <TabsContent value="tactical">
        <TacticalFormation matchId={match.id} matchData={match} />
      </TabsContent>

      {isVisible('live_blog_match') && (
        <TabsContent value="live-blog">
          <LiveBlog matchId={match.id} />
        </TabsContent>
      )}

      <TabsContent value="events">
        <MatchEvents matchDetails={match.match_details} />
      </TabsContent>

      <TabsContent value="stats">
        <MatchStatistics matchDetails={match.match_details} homeTeam={match.homeTeam.name} awayTeam={match.awayTeam.name} />
      </TabsContent>

      <TabsContent value="lineups">
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">
                Chargement des compositions...
              </div>
            ) : (
              <ProbableLineupFormation
                realMadridLineup={realMadridLineup}
                realMadridSubs={realMadridSubs}
                opposingLineup={finalOpposingLineup}
                opposingSubs={finalOpposingSubs}
                opposingTeamName={match.homeTeam.name === 'Real Madrid' ? match.awayTeam.name : match.homeTeam.name}
                homeTeamName={match.homeTeam.name}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="absents">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              <h3 className="font-bold">Joueurs absents ou incertains</h3>
            </div>
            
            {absentPlayers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucun joueur absent pour ce match</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Joueur</TableHead>
                    <TableHead>Équipe</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead>Retour prévu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absentPlayers.map(player => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">{player.player_name}</TableCell>
                      <TableCell>{player.team_type === 'real_madrid' ? 'Real Madrid' : 'Équipe adverse'}</TableCell>
                      <TableCell>{player.reason}</TableCell>
                      <TableCell>{player.return_date ? new Date(player.return_date).toLocaleDateString('fr-FR') : 'Non défini'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Player } from "@/types/Player";
import PlayerPositionManager from "./PlayerPositionManager";
import { List, Grid, BarChart3 } from "lucide-react";
import { PlayerStatsManager } from "./PlayerStatsManager";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlayerTableProps {
  players: Player[];
  setPlayers: (players: Player[]) => void;
}

const PlayerTable = ({ players, setPlayers }: PlayerTableProps) => {
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState<string | null>(null);

  return (
    <Tabs defaultValue="positions" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="positions" className="flex items-center gap-2">
          <Grid className="h-4 w-4" />
          Par Postes
        </TabsTrigger>
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          Liste Simple
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Statistiques
        </TabsTrigger>
      </TabsList>

      <TabsContent value="positions">
        <PlayerPositionManager players={players} setPlayers={setPlayers} />
      </TabsContent>

      <TabsContent value="list">
        <div className="text-center py-8 text-gray-500">
          Vue liste simple - À implémenter si nécessaire
        </div>
      </TabsContent>

      <TabsContent value="stats">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Statistiques des Joueurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sélectionner un joueur pour gérer ses statistiques
                </label>
                <Select 
                  value={selectedPlayerForStats || ""} 
                  onValueChange={(value) => setSelectedPlayerForStats(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un joueur..." />
                  </SelectTrigger>
                  <SelectContent>
                    {players.filter(p => p.is_active).map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} ({player.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlayerForStats && (
                <PlayerStatsManager 
                  playerId={selectedPlayerForStats}
                  playerName={players.find(p => p.id === selectedPlayerForStats)?.name || ""}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default PlayerTable;

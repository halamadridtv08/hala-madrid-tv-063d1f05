import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Player } from "@/types/Player";
import PlayerPositionManager from "./PlayerPositionManager";
import { List, Grid } from "lucide-react";

interface PlayerTableProps {
  players: Player[];
  setPlayers: (players: Player[]) => void;
}

const PlayerTable = ({ players, setPlayers }: PlayerTableProps) => {
  return (
    <Tabs defaultValue="positions" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="positions" className="flex items-center gap-2">
          <Grid className="h-4 w-4" />
          Par Postes
        </TabsTrigger>
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          Liste Simple
        </TabsTrigger>
      </TabsList>

      <TabsContent value="positions">
        <PlayerPositionManager players={players} setPlayers={setPlayers} />
      </TabsContent>

      <TabsContent value="list">
        {/* Keep existing simple list view as fallback */}
        <div className="text-center py-8 text-gray-500">
          Vue liste simple - À implémenter si nécessaire
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default PlayerTable;

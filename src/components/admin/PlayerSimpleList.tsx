import { useState } from "react";
import { Player } from "@/types/Player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Edit, Trash2, UserCheck, UserX, ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlayerEditForm } from "./PlayerEditForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PlayerSimpleListProps {
  players: Player[];
  setPlayers: (players: Player[]) => void;
}

const PlayerSimpleList = ({ players, setPlayers }: PlayerSimpleListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Player;
    direction: "asc" | "desc";
  } | null>(null);
  const { toast } = useToast();

  const handleSort = (key: keyof Player) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  let filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortConfig) {
    filteredPlayers.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }

  const togglePlayerStatus = async (player: Player) => {
    try {
      const { error } = await supabase
        .from("players")
        .update({ is_active: !player.is_active })
        .eq("id", player.id);

      if (error) throw error;

      setPlayers(
        players.map((p) =>
          p.id === player.id ? { ...p, is_active: !p.is_active } : p
        )
      );

      toast({
        title: "Statut mis à jour",
        description: `${player.name} est maintenant ${
          !player.is_active ? "actif" : "inactif"
        }`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletePlayer = async (player: Player) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${player.name} ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("players")
        .delete()
        .eq("id", player.id);

      if (error) throw error;

      setPlayers(players.filter((p) => p.id !== player.id));

      toast({
        title: "Joueur supprimé",
        description: `${player.name} a été supprimé`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePlayerUpdated = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("name");

    if (!error && data) {
      setPlayers(data);
    }
    setEditingPlayer(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Liste des Joueurs</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, poste ou nationalité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-1"
                    >
                      Joueur
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("position")}
                      className="flex items-center gap-1"
                    >
                      Position
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Nationalité</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("age")}
                      className="flex items-center gap-1"
                    >
                      Âge
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm
                        ? "Aucun joueur trouvé"
                        : "Aucun joueur disponible"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlayers.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">
                        {player.jersey_number || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={player.image_url || player.profile_image_url || undefined}
                              alt={player.name}
                            />
                            <AvatarFallback>
                              {player.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{player.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{player.position}</Badge>
                      </TableCell>
                      <TableCell>{player.nationality || "-"}</TableCell>
                      <TableCell>{player.age || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={player.is_active ? "default" : "secondary"}
                          className="gap-1"
                        >
                          {player.is_active ? (
                            <>
                              <UserCheck className="h-3 w-3" />
                              Actif
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3" />
                              Inactif
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPlayer(player)}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePlayerStatus(player)}
                            title={player.is_active ? "Désactiver" : "Activer"}
                          >
                            {player.is_active ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePlayer(player)}
                            className="text-destructive hover:text-destructive"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Total: {filteredPlayers.length} joueur(s)
            {searchTerm && ` sur ${players.length}`}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingPlayer} onOpenChange={(open) => !open && setEditingPlayer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier {editingPlayer?.name}</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <PlayerEditForm
              player={{
                id: editingPlayer.id,
                name: editingPlayer.name,
                position: editingPlayer.position,
                jersey_number: editingPlayer.jersey_number ?? null,
                nationality: editingPlayer.nationality ?? "",
                age: editingPlayer.age ?? null,
                height: editingPlayer.height ?? null,
                weight: editingPlayer.weight ?? null,
                image_url: editingPlayer.image_url ?? null,
                bio: editingPlayer.bio ?? null,
                profile_image_url: editingPlayer.profile_image_url ?? null,
                biography: editingPlayer.biography ?? null,
                social_media: editingPlayer.social_media,
                is_active: editingPlayer.is_active ?? true,
                is_featured: editingPlayer.is_featured,
              }}
              onPlayerUpdated={handlePlayerUpdated}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlayerSimpleList;

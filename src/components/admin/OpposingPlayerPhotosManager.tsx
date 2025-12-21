import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Upload, Image, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OpposingTeam {
  id: string;
  name: string;
  logo_url?: string;
}

interface OpposingPlayer {
  id: string;
  team_id: string;
  name: string;
  position: string;
  jersey_number?: number;
  is_starter: boolean;
  photo_url?: string;
  created_at: string;
}

export const OpposingPlayerPhotosManager = () => {
  const [teams, setTeams] = useState<OpposingTeam[]>([]);
  const [players, setPlayers] = useState<OpposingPlayer[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<OpposingPlayer | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [playerForm, setPlayerForm] = useState({
    name: "",
    position: "CM",
    jersey_number: "",
    is_starter: true
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchPlayers(selectedTeam);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('opposing_teams')
      .select('id, name, logo_url')
      .order('name');

    if (error) {
      toast.error("Erreur lors du chargement des équipes");
      return;
    }
    setTeams(data || []);
  };

  const fetchPlayers = async (teamId: string) => {
    const { data, error } = await supabase
      .from('opposing_players')
      .select('*')
      .eq('team_id', teamId)
      .order('jersey_number');

    if (error) {
      toast.error("Erreur lors du chargement des joueurs");
      return;
    }
    setPlayers(data || []);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPG, PNG ou WebP.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La taille maximum est de 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadPhoto = async (playerId: string): Promise<string | null> => {
    if (!selectedFile) return null;

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${playerId}-${Date.now()}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('opposing-players')
      .upload(filePath, selectedFile, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('opposing-players')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const deleteOldPhoto = async (photoUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/opposing-players/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('opposing-players').remove([filePath]);
      }
    } catch (err) {
      console.error('Error deleting old photo:', err);
    }
  };

  const handleSavePlayer = async () => {
    if (!playerForm.name.trim() || !selectedTeam) {
      toast.error("Le nom et l'équipe sont requis");
      return;
    }

    setUploading(true);

    try {
      let photoUrl = editingPlayer?.photo_url || null;

      // Delete old photo if updating with new one
      if (selectedFile && editingPlayer?.photo_url) {
        await deleteOldPhoto(editingPlayer.photo_url);
      }

      if (editingPlayer) {
        // Upload new photo if selected
        if (selectedFile) {
          photoUrl = await uploadPhoto(editingPlayer.id);
        }

        const { error } = await supabase
          .from('opposing_players')
          .update({
            name: playerForm.name,
            position: playerForm.position,
            jersey_number: playerForm.jersey_number ? parseInt(playerForm.jersey_number) : null,
            is_starter: playerForm.is_starter,
            photo_url: photoUrl
          })
          .eq('id', editingPlayer.id);

        if (error) throw error;
        toast.success("Joueur modifié avec succès");
      } else {
        // Create player first
        const { data: newPlayer, error: insertError } = await supabase
          .from('opposing_players')
          .insert([{
            team_id: selectedTeam,
            name: playerForm.name,
            position: playerForm.position,
            jersey_number: playerForm.jersey_number ? parseInt(playerForm.jersey_number) : null,
            is_starter: playerForm.is_starter
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        // Upload photo if selected
        if (selectedFile && newPlayer) {
          photoUrl = await uploadPhoto(newPlayer.id);
          
          await supabase
            .from('opposing_players')
            .update({ photo_url: photoUrl })
            .eq('id', newPlayer.id);
        }

        toast.success("Joueur créé avec succès");
      }

      resetForm();
      fetchPlayers(selectedTeam);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePlayer = async (player: OpposingPlayer) => {
    if (!confirm(`Supprimer ${player.name} ?`)) return;

    try {
      // Delete photo from storage
      if (player.photo_url) {
        await deleteOldPhoto(player.photo_url);
      }

      const { error } = await supabase
        .from('opposing_players')
        .delete()
        .eq('id', player.id);

      if (error) throw error;
      
      toast.success("Joueur supprimé");
      fetchPlayers(selectedTeam);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const openDialog = (player?: OpposingPlayer) => {
    if (player) {
      setEditingPlayer(player);
      setPlayerForm({
        name: player.name,
        position: player.position,
        jersey_number: player.jersey_number?.toString() || "",
        is_starter: player.is_starter
      });
      setPreviewUrl(player.photo_url || null);
    } else {
      setEditingPlayer(null);
      setPlayerForm({ name: "", position: "CM", jersey_number: "", is_starter: true });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingPlayer(null);
    setPlayerForm({ name: "", position: "CM", jersey_number: "", is_starter: true });
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case "GK": return "bg-yellow-500";
      case "RB": case "LB": case "CB": return "bg-blue-500";
      case "CM": case "CDM": case "CAM": case "AM": return "bg-green-500";
      case "RW": case "LW": case "ST": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Gestion des Photos - Joueurs Adverses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Sélectionner une équipe" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      {team.logo_url && (
                        <img src={team.logo_url} alt="" className="w-5 h-5 object-contain" />
                      )}
                      {team.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTeam && (
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un joueur
              </Button>
            )}
          </div>

          {selectedTeam && players.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>N°</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.photo_url || undefined} alt={player.name} />
                        <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>{player.jersey_number || "-"}</TableCell>
                    <TableCell>
                      <Badge className={`${getPositionColor(player.position)} text-white`}>
                        {player.position}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={player.is_starter ? "default" : "secondary"}>
                        {player.is_starter ? "Titulaire" : "Remplaçant"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDialog(player)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePlayer(player)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {selectedTeam && players.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Aucun joueur dans cette équipe
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlayer ? "Modifier le joueur" : "Ajouter un joueur"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Photo upload */}
            <div className="flex flex-col items-center gap-4">
              <div 
                className="relative w-32 h-32 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-0 right-0 p-1 bg-destructive text-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewUrl(null);
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Upload className="h-8 w-8 mx-auto mb-1" />
                    <span className="text-xs">Cliquer pour uploader</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
              <p className="text-xs text-muted-foreground">JPG, PNG ou WebP. Max 5MB</p>
            </div>

            <Input
              placeholder="Nom du joueur"
              value={playerForm.name}
              onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
            />

            <Input
              type="number"
              placeholder="Numéro de maillot"
              value={playerForm.jersey_number}
              onChange={(e) => setPlayerForm({ ...playerForm, jersey_number: e.target.value })}
            />

            <Select 
              value={playerForm.position} 
              onValueChange={(v) => setPlayerForm({ ...playerForm, position: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GK">Gardien (GK)</SelectItem>
                <SelectItem value="CB">Défenseur central (CB)</SelectItem>
                <SelectItem value="RB">Arrière droit (RB)</SelectItem>
                <SelectItem value="LB">Arrière gauche (LB)</SelectItem>
                <SelectItem value="CDM">Milieu défensif (CDM)</SelectItem>
                <SelectItem value="CM">Milieu (CM)</SelectItem>
                <SelectItem value="AM">Milieu offensif (AM)</SelectItem>
                <SelectItem value="RW">Ailier droit (RW)</SelectItem>
                <SelectItem value="LW">Ailier gauche (LW)</SelectItem>
                <SelectItem value="ST">Attaquant (ST)</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={playerForm.is_starter ? "true" : "false"} 
              onValueChange={(v) => setPlayerForm({ ...playerForm, is_starter: v === "true" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Titulaire</SelectItem>
                <SelectItem value="false">Remplaçant</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>Annuler</Button>
              <Button onClick={handleSavePlayer} disabled={uploading}>
                {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingPlayer ? "Modifier" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

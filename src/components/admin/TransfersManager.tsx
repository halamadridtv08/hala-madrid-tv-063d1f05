import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ArrowRight, Eye, EyeOff, Check, Search, User } from "lucide-react";
import { toast } from "sonner";
import { Transfer } from "@/hooks/useTransfers";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Player {
  id: string;
  name: string;
  jersey_number: number | null;
  image_url: string | null;
  position: string;
}

interface TransferFormData {
  player_name: string;
  player_image: string;
  from_team: string;
  from_team_logo: string;
  to_team: string;
  to_team_logo: string;
  transfer_type: 'loan' | 'permanent' | 'free' | 'return';
  transfer_fee: string;
  is_official: boolean;
  is_published: boolean;
  description: string;
  transfer_date: string;
  return_date: string;
  display_order: number;
}

const defaultFormData: TransferFormData = {
  player_name: "",
  player_image: "",
  from_team: "Real Madrid",
  from_team_logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  to_team: "",
  to_team_logo: "",
  transfer_type: "permanent",
  transfer_fee: "",
  is_official: false,
  is_published: false,
  description: "",
  transfer_date: "",
  return_date: "",
  display_order: 0
};

const transferTypeLabels = {
  loan: "Prêt",
  permanent: "Transfert définitif",
  free: "Libre",
  return: "Retour de prêt"
};

export const TransfersManager = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const [formData, setFormData] = useState<TransferFormData>(defaultFormData);
  const [playerSearch, setPlayerSearch] = useState("");
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);

  useEffect(() => {
    fetchTransfers();
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("id, name, jersey_number, image_url, position")
      .eq("is_active", true)
      .order("name");

    if (!error && data) {
      setPlayers(data);
    }
  };

  const filteredPlayers = useMemo(() => {
    if (!playerSearch) return players;
    const search = playerSearch.toLowerCase();
    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        (p.jersey_number && p.jersey_number.toString().includes(search))
    );
  }, [players, playerSearch]);

  const selectPlayer = (player: Player) => {
    setFormData({
      ...formData,
      player_name: player.name,
      player_image: player.image_url || ""
    });
    setPlayerSearch("");
    setShowPlayerDropdown(false);
  };

  const fetchTransfers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transfers")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des transferts");
      console.error(error);
    } else {
      setTransfers((data as Transfer[]) || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (transfer?: Transfer) => {
    if (transfer) {
      setEditingTransfer(transfer);
      setFormData({
        player_name: transfer.player_name,
        player_image: transfer.player_image || "",
        from_team: transfer.from_team,
        from_team_logo: transfer.from_team_logo || "",
        to_team: transfer.to_team,
        to_team_logo: transfer.to_team_logo || "",
        transfer_type: transfer.transfer_type,
        transfer_fee: transfer.transfer_fee || "",
        is_official: transfer.is_official,
        is_published: transfer.is_published,
        description: transfer.description || "",
        transfer_date: transfer.transfer_date || "",
        return_date: transfer.return_date || "",
        display_order: transfer.display_order
      });
    } else {
      setEditingTransfer(null);
      setFormData(defaultFormData);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.player_name || !formData.from_team || !formData.to_team) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    const payload = {
      player_name: formData.player_name,
      player_image: formData.player_image || null,
      from_team: formData.from_team,
      from_team_logo: formData.from_team_logo || null,
      to_team: formData.to_team,
      to_team_logo: formData.to_team_logo || null,
      transfer_type: formData.transfer_type,
      transfer_fee: formData.transfer_fee || null,
      is_official: formData.is_official,
      is_published: formData.is_published,
      description: formData.description || null,
      transfer_date: formData.transfer_date || null,
      return_date: formData.return_date || null,
      display_order: formData.display_order
    };

    if (editingTransfer) {
      const { error } = await supabase
        .from("transfers")
        .update(payload)
        .eq("id", editingTransfer.id);

      if (error) {
        toast.error("Erreur lors de la mise à jour");
        console.error(error);
      } else {
        toast.success("Transfert mis à jour");
        setDialogOpen(false);
        fetchTransfers();
      }
    } else {
      const { error } = await supabase
        .from("transfers")
        .insert([payload]);

      if (error) {
        toast.error("Erreur lors de la création");
        console.error(error);
      } else {
        toast.success("Transfert créé");
        setDialogOpen(false);
        fetchTransfers();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("transfers").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    } else {
      toast.success("Transfert supprimé");
      fetchTransfers();
    }
  };

  const togglePublished = async (transfer: Transfer) => {
    const { error } = await supabase
      .from("transfers")
      .update({ is_published: !transfer.is_published })
      .eq("id", transfer.id);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success(transfer.is_published ? "Transfert masqué" : "Transfert publié");
      fetchTransfers();
    }
  };

  const toggleOfficial = async (transfer: Transfer) => {
    const { error } = await supabase
      .from("transfers")
      .update({ is_official: !transfer.is_official })
      .eq("id", transfer.id);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success(transfer.is_official ? "Marqué comme non-officiel" : "Marqué comme officiel");
      fetchTransfers();
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Transferts</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un transfert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTransfer ? "Modifier le transfert" : "Nouveau transfert"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Player Selector */}
              <div className="space-y-2">
                <Label>Joueur *</Label>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={playerSearch}
                        onChange={(e) => {
                          setPlayerSearch(e.target.value);
                          setShowPlayerDropdown(true);
                        }}
                        onFocus={() => setShowPlayerDropdown(true)}
                        placeholder="Rechercher un joueur..."
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  {showPlayerDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg">
                      <ScrollArea className="h-[200px]">
                        {filteredPlayers.length === 0 ? (
                          <p className="p-3 text-sm text-muted-foreground text-center">
                            Aucun joueur trouvé
                          </p>
                        ) : (
                          filteredPlayers.map((player) => (
                            <button
                              key={player.id}
                              type="button"
                              onClick={() => selectPlayer(player)}
                              className="w-full flex items-center gap-3 p-2 hover:bg-accent text-left transition-colors"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={player.image_url || undefined} alt={player.name} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{player.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  #{player.jersey_number} · {player.position}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </ScrollArea>
                    </div>
                  )}
                </div>

                {/* Selected player display */}
                {formData.player_name && (
                  <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={formData.player_image || undefined} alt={formData.player_name} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{formData.player_name}</p>
                      <p className="text-xs text-muted-foreground">Sélectionné</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, player_name: "", player_image: "" })}
                    >
                      Changer
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from_team">Club de départ *</Label>
                  <Input
                    id="from_team"
                    value={formData.from_team}
                    onChange={(e) => setFormData({ ...formData, from_team: e.target.value })}
                    placeholder="Ex: Real Madrid"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_team_logo">Logo club de départ (URL)</Label>
                  <Input
                    id="from_team_logo"
                    value={formData.from_team_logo}
                    onChange={(e) => setFormData({ ...formData, from_team_logo: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="to_team">Club d'arrivée *</Label>
                  <Input
                    id="to_team"
                    value={formData.to_team}
                    onChange={(e) => setFormData({ ...formData, to_team: e.target.value })}
                    placeholder="Ex: Olympique Lyonnais"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to_team_logo">Logo club d'arrivée (URL)</Label>
                  <Input
                    id="to_team_logo"
                    value={formData.to_team_logo}
                    onChange={(e) => setFormData({ ...formData, to_team_logo: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transfer_type">Type de transfert</Label>
                  <Select
                    value={formData.transfer_type}
                    onValueChange={(value: 'loan' | 'permanent' | 'free' | 'return') => 
                      setFormData({ ...formData, transfer_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Transfert définitif</SelectItem>
                      <SelectItem value="loan">Prêt</SelectItem>
                      <SelectItem value="free">Libre</SelectItem>
                      <SelectItem value="return">Retour de prêt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer_fee">Montant</Label>
                  <Input
                    id="transfer_fee"
                    value={formData.transfer_fee}
                    onChange={(e) => setFormData({ ...formData, transfer_fee: e.target.value })}
                    placeholder="Ex: 30M€"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer_date">Date</Label>
                  <Input
                    id="transfer_date"
                    type="date"
                    value={formData.transfer_date}
                    onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Return date - only show for loan transfers */}
              {formData.transfer_type === 'loan' && (
                <div className="space-y-2">
                  <Label htmlFor="return_date">Date de retour (fin de prêt)</Label>
                  <Input
                    id="return_date"
                    type="date"
                    value={formData.return_date}
                    onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Real Madrid have loaned Endrick to Olympique Lyonnais"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Ordre d'affichage</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_official"
                    checked={formData.is_official}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_official: checked })}
                  />
                  <Label htmlFor="is_official">Officiel</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label htmlFor="is_published">Publié</Label>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                {editingTransfer ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Transferts</CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucun transfert enregistré</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joueur</TableHead>
                  <TableHead>Transfert</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transfer.player_image && (
                          <img 
                            src={transfer.player_image} 
                            alt={transfer.player_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <span className="font-medium">{transfer.player_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <span>{transfer.from_team}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span>{transfer.to_team}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transferTypeLabels[transfer.transfer_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {transfer.is_official && (
                          <Badge className="bg-green-600">Officiel</Badge>
                        )}
                        <Badge variant={transfer.is_published ? "default" : "secondary"}>
                          {transfer.is_published ? "Publié" : "Brouillon"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleOfficial(transfer)}
                          title={transfer.is_official ? "Retirer officiel" : "Marquer officiel"}
                        >
                          <Check className={`h-4 w-4 ${transfer.is_official ? "text-green-600" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublished(transfer)}
                          title={transfer.is_published ? "Masquer" : "Publier"}
                        >
                          {transfer.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(transfer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer ce transfert ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(transfer.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

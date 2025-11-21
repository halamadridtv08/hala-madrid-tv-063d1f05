import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Save, Tag } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface CompetitionAlias {
  id: string;
  canonical_name: string;
  aliases: string[];
  is_active: boolean;
}

export const CompetitionAliasManager = () => {
  const [aliases, setAliases] = useState<CompetitionAlias[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCanonicalName, setNewCanonicalName] = useState("");
  const [newAliases, setNewAliases] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAliases();
  }, []);

  const loadAliases = async () => {
    try {
      const { data, error } = await supabase
        .from('competition_aliases')
        .select('*')
        .order('canonical_name');

      if (error) throw error;
      setAliases(data || []);
    } catch (error) {
      console.error('Error loading aliases:', error);
      toast.error("Erreur lors du chargement des alias");
    }
  };

  const handleSave = async () => {
    if (!newCanonicalName.trim()) {
      toast.error("Le nom canonique est requis");
      return;
    }

    setIsLoading(true);
    try {
      const aliasArray = newAliases
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      if (editingId) {
        const { error } = await supabase
          .from('competition_aliases')
          .update({
            canonical_name: newCanonicalName.trim(),
            aliases: aliasArray
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Alias mis à jour avec succès");
      } else {
        const { error } = await supabase
          .from('competition_aliases')
          .insert({
            canonical_name: newCanonicalName.trim(),
            aliases: aliasArray
          });

        if (error) throw error;
        toast.success("Alias créé avec succès");
      }

      setNewCanonicalName("");
      setNewAliases("");
      setEditingId(null);
      loadAliases();
    } catch (error: any) {
      console.error('Error saving alias:', error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (alias: CompetitionAlias) => {
    setEditingId(alias.id);
    setNewCanonicalName(alias.canonical_name);
    setNewAliases(alias.aliases.join(', '));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet alias ?")) return;

    try {
      const { error } = await supabase
        .from('competition_aliases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Alias supprimé");
      loadAliases();
    } catch (error) {
      console.error('Error deleting alias:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('competition_aliases')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentStatus ? "Alias désactivé" : "Alias activé");
      loadAliases();
    } catch (error) {
      console.error('Error toggling alias:', error);
      toast.error("Erreur lors de la modification");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setNewCanonicalName("");
    setNewAliases("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Gestion des Alias de Compétitions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <Label htmlFor="canonical">Nom Canonique</Label>
              <Input
                id="canonical"
                value={newCanonicalName}
                onChange={(e) => setNewCanonicalName(e.target.value)}
                placeholder="Ex: UEFA CHAMPIONS LEAGUE"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aliases">Alias (séparés par des virgules)</Label>
              <Input
                id="aliases"
                value={newAliases}
                onChange={(e) => setNewAliases(e.target.value)}
                placeholder="Ex: Champions League, UCL, C1, Ligue des Champions"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingId ? 'Mettre à jour' : 'Ajouter'}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {aliases.map((alias) => (
              <div
                key={alias.id}
                className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{alias.canonical_name}</h3>
                      <Badge variant={alias.is_active ? "default" : "secondary"}>
                        {alias.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {alias.aliases.map((a, idx) => (
                        <Badge key={idx} variant="outline">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alias.is_active}
                        onCheckedChange={() => handleToggleActive(alias.id, alias.is_active)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(alias)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(alias.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

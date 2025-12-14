import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, Copy } from "lucide-react";

interface FormationTemplate {
  id: string;
  name: string;
  formation: string;
  description: string | null;
  positions: Array<{ position: string; x: number; y: number }>;
  is_default: boolean;
  created_at: string;
}

export const FormationTemplateManager = () => {
  const [templates, setTemplates] = useState<FormationTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FormationTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    formation: "",
    description: "",
    positions: [] as Array<{ position: string; x: number; y: number }>
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('formation_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors du chargement des templates");
      return;
    }

    // Convert Json type to proper array
    const formattedData = (data || []).map(item => ({
      ...item,
      positions: Array.isArray(item.positions) ? item.positions : []
    })) as unknown as FormationTemplate[];

    setTemplates(formattedData);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.formation.trim()) {
      toast.error("Le nom et la formation sont requis");
      return;
    }

    if (formData.positions.length === 0) {
      toast.error("Au moins une position est requise");
      return;
    }

    setLoading(true);
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('formation_templates')
          .update({
            name: formData.name,
            formation: formData.formation,
            description: formData.description || null,
            positions: formData.positions
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success("Template modifié avec succès");
      } else {
        const { error } = await supabase
          .from('formation_templates')
          .insert([{
            name: formData.name,
            formation: formData.formation,
            description: formData.description || null,
            positions: formData.positions,
            is_default: false
          }]);

        if (error) throw error;
        toast.success("Template créé avec succès");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, isDefault: boolean) => {
    if (isDefault) {
      toast.error("Impossible de supprimer un template par défaut");
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer ce template ?")) return;

    try {
      const { error } = await supabase
        .from('formation_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Template supprimé avec succès");
      fetchTemplates();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDuplicate = (template: FormationTemplate) => {
    setFormData({
      name: `${template.name} (copie)`,
      formation: template.formation,
      description: template.description || "",
      positions: [...template.positions]
    });
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (template: FormationTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      formation: template.formation,
      description: template.description || "",
      positions: [...template.positions]
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      formation: "",
      description: "",
      positions: []
    });
    setEditingTemplate(null);
  };

  const addPosition = () => {
    setFormData({
      ...formData,
      positions: [...formData.positions, { position: "CM", x: 50, y: 50 }]
    });
  };

  const updatePosition = (index: number, field: string, value: any) => {
    const newPositions = [...formData.positions];
    newPositions[index] = { ...newPositions[index], [field]: value };
    setFormData({ ...formData, positions: newPositions });
  };

  const removePosition = (index: number) => {
    const newPositions = formData.positions.filter((_, i) => i !== index);
    setFormData({ ...formData, positions: newPositions });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Templates de Formation
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Modifier le template" : "Nouveau template"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: 4-3-3 Offensif"
                  />
                </div>
                <div>
                  <Label htmlFor="formation">Formation</Label>
                  <Input
                    id="formation"
                    value={formData.formation}
                    onChange={(e) => setFormData({ ...formData, formation: e.target.value })}
                    placeholder="Ex: 4-3-3"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la formation..."
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Positions ({formData.positions.length})</Label>
                    <Button type="button" size="sm" onClick={addPosition}>
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter Position
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
                    {formData.positions.map((pos, index) => (
                      <div key={index} className="flex gap-2 items-center p-2 bg-muted rounded">
                        <Input
                          placeholder="Poste"
                          value={pos.position}
                          onChange={(e) => updatePosition(index, 'position', e.target.value)}
                          className="w-24"
                        />
                        <Input
                          type="number"
                          placeholder="X"
                          value={pos.x}
                          onChange={(e) => updatePosition(index, 'x', parseFloat(e.target.value))}
                          className="w-20"
                          min="0"
                          max="100"
                        />
                        <Input
                          type="number"
                          placeholder="Y"
                          value={pos.y}
                          onChange={(e) => updatePosition(index, 'y', parseFloat(e.target.value))}
                          className="w-20"
                          min="0"
                          max="100"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removePosition(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Formation</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Positions</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{template.formation}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{template.description || "-"}</TableCell>
                <TableCell>{template.positions.length} positions</TableCell>
                <TableCell>
                  {template.is_default ? (
                    <Badge>Par défaut</Badge>
                  ) : (
                    <Badge variant="secondary">Personnalisé</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                      title="Dupliquer"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {!template.is_default && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(template.id, template.is_default)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
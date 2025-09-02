import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Kit } from "@/types/Kit";
import { KitForm } from "./KitForm";
import { Plus, Edit, Trash2, Shirt, Star } from "lucide-react";
import { toast } from "sonner";

interface KitTableProps {
  kits: Kit[];
  setKits: (kits: Kit[]) => void;
}

const KitTable = ({ kits, setKits }: KitTableProps) => {
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | undefined>(undefined);

  const refreshKits = async () => {
    try {
      const { data, error } = await supabase
        .from('kits')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setKits((data || []) as Kit[]);
    } catch (error) {
      console.error('Erreur lors du rechargement des maillots:', error);
      toast.error("Erreur lors du rechargement des maillots");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce maillot ?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('kits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setKits(kits.filter(kit => kit.id !== id));
      toast.success("Maillot supprimé avec succès");
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error("Erreur lors de la suppression du maillot");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (kit: Kit) => {
    setEditingKit(kit);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingKit(undefined);
    refreshKits();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingKit(undefined);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'domicile':
        return 'bg-white text-black';
      case 'exterieur':
        return 'bg-purple-500 text-white';
      case 'third':
        return 'bg-pink-500 text-white';
      case 'fourth':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'domicile':
        return 'Domicile';
      case 'exterieur':
        return 'Extérieur';
      case 'third':
        return 'Troisième';
      case 'fourth':
        return 'Quatrième';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Maillots</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau maillot
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kits.map((kit) => (
          <Card key={kit.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{kit.title}</CardTitle>
                {kit.is_featured && (
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(kit.type)}>
                  {getTypeLabel(kit.type)}
                </Badge>
                <Badge variant={kit.is_published ? "default" : "secondary"}>
                  {kit.is_published ? "Publié" : "Brouillon"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {kit.image_url && (
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={kit.image_url}
                    alt={kit.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Saison:</strong> {kit.season}
                </p>
                {kit.price && (
                  <p className="text-sm text-gray-600">
                    <strong>Prix:</strong> {kit.price}€
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <strong>Ordre:</strong> {kit.display_order}
                </p>
              </div>

              {kit.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {kit.description}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(kit)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(kit.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {kits.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shirt className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun maillot trouvé
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Commencez par ajouter votre premier maillot à la collection.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un maillot
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingKit ? "Modifier le maillot" : "Nouveau maillot"}
            </DialogTitle>
          </DialogHeader>
          <KitForm
            kit={editingKit}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KitTable;
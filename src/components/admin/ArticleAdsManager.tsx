import { useState } from "react";
import { useArticleAdsAdmin, ArticleAd } from "@/hooks/useArticleAds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ExternalLink, Eye, MousePointer } from "lucide-react";
import { MediaUploader } from "./MediaUploader";

export function ArticleAdsManager() {
  const { ads, loading, createAd, updateAd, deleteAd } = useArticleAdsAdmin();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<ArticleAd | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    aspect_ratio: '16:9',
    custom_width: null as number | null,
    custom_height: null as number | null,
    position: 'sidebar',
    display_order: 0,
    is_active: true,
    start_date: null as string | null,
    end_date: null as string | null,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      aspect_ratio: '16:9',
      custom_width: null,
      custom_height: null,
      position: 'sidebar',
      display_order: 0,
      is_active: true,
      start_date: null,
      end_date: null,
    });
    setEditingAd(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataToSave = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (editingAd) {
        await updateAd(editingAd.id, dataToSave);
        toast({ title: "Publicité mise à jour" });
      } else {
        await createAd(dataToSave);
        toast({ title: "Publicité ajoutée" });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  };

  const handleEdit = (ad: ArticleAd) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image_url: ad.image_url,
      link_url: ad.link_url || '',
      aspect_ratio: ad.aspect_ratio,
      custom_width: ad.custom_width,
      custom_height: ad.custom_height,
      position: ad.position,
      display_order: ad.display_order,
      is_active: ad.is_active,
      start_date: ad.start_date ? ad.start_date.split('T')[0] : null,
      end_date: ad.end_date ? ad.end_date.split('T')[0] : null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) return;
    
    try {
      await deleteAd(id);
      toast({ title: "Publicité supprimée" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  };

  const handleToggleActive = async (ad: ArticleAd) => {
    try {
      await updateAd(ad.id, { is_active: !ad.is_active });
      toast({ title: ad.is_active ? "Publicité désactivée" : "Publicité activée" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  };

  const positionLabels: Record<string, string> = {
    sidebar: 'Barre latérale',
    bottom: 'Bas de page',
    inline: 'Dans l\'article',
  };

  const aspectRatioLabels: Record<string, string> = {
    '16:9': '16:9 (Paysage)',
    '4:3': '4:3 (Standard)',
    '1:1': '1:1 (Carré)',
    '9:16': '9:16 (Portrait)',
    'custom': 'Personnalisé',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestion des Publicités Articles</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAd ? 'Modifier' : 'Ajouter'} une publicité</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Titre (interne)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label>Média (Image, GIF, Vidéo)</Label>
                <MediaUploader
                  onSuccess={(url) => setFormData({ ...formData, image_url: url })}
                  acceptTypes="image/*,video/*,.gif"
                  currentValue={formData.image_url}
                  maxSizeMB={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formats supportés: JPG, PNG, GIF, WebP, MP4, WebM, MOV
                </p>
              </div>

              <div>
                <Label>URL de destination</Label>
                <Input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>Ratio d'affichage</Label>
                <Select value={formData.aspect_ratio} onValueChange={(v) => setFormData({ ...formData, aspect_ratio: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Paysage)</SelectItem>
                    <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                    <SelectItem value="1:1">1:1 (Carré)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.aspect_ratio === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Largeur</Label>
                    <Input
                      type="number"
                      value={formData.custom_width || ''}
                      onChange={(e) => setFormData({ ...formData, custom_width: parseInt(e.target.value) || null })}
                      placeholder="ex: 300"
                    />
                  </div>
                  <div>
                    <Label>Hauteur</Label>
                    <Input
                      type="number"
                      value={formData.custom_height || ''}
                      onChange={(e) => setFormData({ ...formData, custom_height: parseInt(e.target.value) || null })}
                      placeholder="ex: 250"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>Position</Label>
                <Select value={formData.position} onValueChange={(v) => setFormData({ ...formData, position: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sidebar">Barre latérale (sous dernières infos)</SelectItem>
                    <SelectItem value="bottom">Bas de l'article</SelectItem>
                    <SelectItem value="inline">Dans l'article</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date de début (optionnel)</Label>
                  <Input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value || null })}
                  />
                </div>
                <div>
                  <Label>Date de fin (optionnel)</Label>
                  <Input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                  />
                </div>
              </div>

              <div>
                <Label>Ordre d'affichage</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <Button type="submit" className="w-full">
                {editingAd ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Chargement...</p>
        ) : ads.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucune publicité</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Ratio</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => {
                const isVideo = ad.image_url && /\.(mp4|webm|ogg|mov)$/i.test(ad.image_url);
                return (
                <TableRow key={ad.id}>
                  <TableCell>
                    {isVideo ? (
                      <video src={ad.image_url} className="h-12 w-20 object-cover rounded" muted />
                    ) : (
                      <img src={ad.image_url} alt={ad.title} className="h-12 w-20 object-cover rounded" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{ad.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{positionLabels[ad.position] || ad.position}</Badge>
                  </TableCell>
                  <TableCell>{aspectRatioLabels[ad.aspect_ratio] || ad.aspect_ratio}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {ad.impression_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointer className="h-3 w-3" />
                        {ad.click_count}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={ad.is_active}
                      onCheckedChange={() => handleToggleActive(ad)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {ad.link_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(ad)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(ad.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

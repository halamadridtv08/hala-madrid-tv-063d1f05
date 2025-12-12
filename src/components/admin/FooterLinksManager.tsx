import { useState } from "react";
import { useFooterLinksAdmin, FooterLink } from "@/hooks/useFooterLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, FileText, Shield, Cookie, Mail, ScrollText, Link, ExternalLink } from "lucide-react";

const iconOptions = [
  { value: 'FileText', label: 'Document', icon: FileText },
  { value: 'Shield', label: 'Bouclier', icon: Shield },
  { value: 'Cookie', label: 'Cookie', icon: Cookie },
  { value: 'Mail', label: 'Email', icon: Mail },
  { value: 'ScrollText', label: 'Contrat', icon: ScrollText },
  { value: 'Link', label: 'Lien', icon: Link },
  { value: 'ExternalLink', label: 'Lien externe', icon: ExternalLink },
];

export function FooterLinksManager() {
  const { links, loading, createLink, updateLink, deleteLink } = useFooterLinksAdmin();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    link_type: 'internal' as 'internal' | 'external' | 'modal',
    section: 'legal' as 'legal' | 'quick_links' | 'social',
    display_order: 0,
    is_visible: true,
    icon: 'FileText',
    content: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      link_type: 'internal',
      section: 'legal',
      display_order: 0,
      is_visible: true,
      icon: 'FileText',
      content: '',
    });
    setEditingLink(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLink) {
        await updateLink(editingLink.id, formData);
        toast({ title: "Lien mis à jour" });
      } else {
        await createLink(formData);
        toast({ title: "Lien ajouté" });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  };

  const handleEdit = (link: FooterLink) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url || '',
      link_type: link.link_type as 'internal' | 'external' | 'modal',
      section: link.section as 'legal' | 'quick_links' | 'social',
      display_order: link.display_order,
      is_visible: link.is_visible,
      icon: link.icon || 'FileText',
      content: link.content || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) return;
    
    try {
      await deleteLink(id);
      toast({ title: "Lien supprimé" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  };

  const handleToggleVisible = async (link: FooterLink) => {
    try {
      await updateLink(link.id, { is_visible: !link.is_visible });
      toast({ title: link.is_visible ? "Lien masqué" : "Lien affiché" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  };

  const sectionLabels = {
    legal: 'Légal',
    quick_links: 'Liens rapides',
    social: 'Social',
  };

  const typeLabels = {
    internal: 'Interne',
    external: 'Externe',
    modal: 'Modal',
  };

  const getIcon = (iconName: string) => {
    const option = iconOptions.find(o => o.value === iconName);
    if (option) {
      const Icon = option.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestion des Liens du Footer</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLink ? 'Modifier' : 'Ajouter'} un lien</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Titre</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label>Type</Label>
                <Select value={formData.link_type} onValueChange={(v: 'internal' | 'external' | 'modal') => setFormData({ ...formData, link_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Lien interne</SelectItem>
                    <SelectItem value="external">Lien externe</SelectItem>
                    <SelectItem value="modal">Modal (avec contenu)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.link_type !== 'modal' && (
                <div>
                  <Label>URL</Label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder={formData.link_type === 'internal' ? '/page' : 'https://...'}
                  />
                </div>
              )}

              {formData.link_type === 'modal' && (
                <div>
                  <Label>Contenu (HTML autorisé)</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    placeholder="<h2>Mentions légales</h2><p>...</p>"
                  />
                </div>
              )}

              <div>
                <Label>Section</Label>
                <Select value={formData.section} onValueChange={(v: 'legal' | 'quick_links' | 'social') => setFormData({ ...formData, section: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="legal">Légal</SelectItem>
                    <SelectItem value="quick_links">Liens rapides</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Icône</Label>
                <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                />
                <Label>Visible</Label>
              </div>

              <Button type="submit" className="w-full">
                {editingLink ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Chargement...</p>
        ) : links.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucun lien</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icône</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>{getIcon(link.icon || 'FileText')}</TableCell>
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell>{typeLabels[link.link_type]}</TableCell>
                  <TableCell>{sectionLabels[link.section]}</TableCell>
                  <TableCell>
                    <Switch
                      checked={link.is_visible}
                      onCheckedChange={() => handleToggleVisible(link)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(link)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

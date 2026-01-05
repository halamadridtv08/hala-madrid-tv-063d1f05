import { useState } from "react";
import { useFooterLinksAdmin, FooterLink } from "@/hooks/useFooterLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, FileText, Shield, Cookie, Mail, ScrollText, Link, ExternalLink, Wand2, Eye } from "lucide-react";
import DOMPurify from "dompurify";

const iconOptions = [
  { value: 'FileText', label: 'Document', icon: FileText },
  { value: 'Shield', label: 'Bouclier', icon: Shield },
  { value: 'Cookie', label: 'Cookie', icon: Cookie },
  { value: 'Mail', label: 'Email', icon: Mail },
  { value: 'ScrollText', label: 'Contrat', icon: ScrollText },
  { value: 'Link', label: 'Lien', icon: Link },
  { value: 'ExternalLink', label: 'Lien externe', icon: ExternalLink },
];

// Contenu légal pré-rempli
const legalContentTemplates: Record<string, string> = {
  'Mentions légales': `<h2>Mentions Légales</h2>
<p><strong>Éditeur du site</strong></p>
<p>Ce site est édité par un fan club dédié au Real Madrid CF. Il s'agit d'un site non officiel, sans affiliation avec le Real Madrid C.F.</p>

<p><strong>Hébergement</strong></p>
<p>Ce site est hébergé par Lovable (Supabase Inc.).</p>

<p><strong>Propriété intellectuelle</strong></p>
<p>Tous les contenus présents sur ce site (textes, images, vidéos, logos) sont protégés par le droit d'auteur. Les marques et logos du Real Madrid CF appartiennent à leurs propriétaires respectifs.</p>

<p><strong>Responsabilité</strong></p>
<p>Les informations fournies sur ce site le sont à titre informatif uniquement. Nous nous efforçons d'assurer l'exactitude des informations, mais nous ne pouvons garantir leur exhaustivité ou leur actualité.</p>

<p><strong>Contact</strong></p>
<p>Pour toute question concernant ce site, vous pouvez nous contacter via notre formulaire de contact.</p>`,

  'Politique de confidentialité': `<h2>Politique de Confidentialité</h2>

<p><strong>Collecte des données</strong></p>
<p>Nous collectons les données suivantes : nom, adresse email (lors de l'inscription ou des commentaires), données de navigation (cookies).</p>

<p><strong>Utilisation des données</strong></p>
<p>Vos données sont utilisées pour :</p>
<ul>
<li>Gérer votre compte utilisateur</li>
<li>Personnaliser votre expérience</li>
<li>Envoyer des notifications (avec votre consentement)</li>
<li>Améliorer nos services</li>
</ul>

<p><strong>Protection des données</strong></p>
<p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès, modification, divulgation ou destruction non autorisée.</p>

<p><strong>Vos droits</strong></p>
<p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Vous pouvez exercer ces droits en nous contactant.</p>

<p><strong>Conservation des données</strong></p>
<p>Vos données sont conservées pendant la durée de votre inscription et sont supprimées sur demande.</p>`,

  'Préférences cookies': `<h2>Préférences Cookies</h2>

<p><strong>Qu'est-ce qu'un cookie ?</strong></p>
<p>Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur notre site.</p>

<p><strong>Types de cookies utilisés</strong></p>
<ul>
<li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site (authentification, sécurité)</li>
<li><strong>Cookies de préférences :</strong> Sauvegardent vos choix (langue, thème sombre/clair)</li>
<li><strong>Cookies analytiques :</strong> Nous aident à comprendre l'utilisation du site (Google Analytics)</li>
<li><strong>Cookies publicitaires :</strong> Permettent d'afficher des publicités pertinentes</li>
</ul>

<p><strong>Gestion des cookies</strong></p>
<p>Vous pouvez à tout moment modifier vos préférences de cookies via les paramètres de votre navigateur. Notez que le blocage de certains cookies peut affecter votre expérience sur le site.</p>

<p><strong>Durée de conservation</strong></p>
<p>Les cookies sont conservés pour une durée maximale de 13 mois.</p>`,

  'Contact': `<h2>Contactez-nous</h2>

<p>Nous sommes à votre écoute ! N'hésitez pas à nous contacter pour toute question, suggestion ou demande.</p>

<p><strong>Email</strong></p>
<p>contact@realmadrid-fans.com</p>

<p><strong>Réseaux sociaux</strong></p>
<p>Suivez-nous sur nos réseaux sociaux pour rester informé des dernières actualités :</p>
<ul>
<li>Twitter/X</li>
<li>Instagram</li>
<li>Facebook</li>
<li>YouTube</li>
</ul>

<p><strong>Délai de réponse</strong></p>
<p>Nous nous efforçons de répondre à toutes les demandes dans un délai de 48 heures ouvrées.</p>

<p><strong>Signalement</strong></p>
<p>Pour signaler un contenu inapproprié ou une erreur sur le site, merci de nous contacter en précisant l'URL de la page concernée.</p>`,

  'CGU': `<h2>Conditions Générales d'Utilisation</h2>

<p><strong>Acceptation des CGU</strong></p>
<p>En accédant à ce site, vous acceptez les présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site.</p>

<p><strong>Utilisation du site</strong></p>
<p>Ce site est destiné à un usage personnel et non commercial. Vous vous engagez à :</p>
<ul>
<li>Ne pas reproduire le contenu sans autorisation</li>
<li>Ne pas perturber le fonctionnement du site</li>
<li>Respecter les autres utilisateurs</li>
<li>Ne pas publier de contenu illégal ou offensant</li>
</ul>

<p><strong>Compte utilisateur</strong></p>
<p>Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute activité effectuée depuis votre compte est sous votre responsabilité.</p>

<p><strong>Contenu utilisateur</strong></p>
<p>En publiant du contenu (commentaires, prédictions), vous accordez au site une licence non exclusive pour utiliser ce contenu. Nous nous réservons le droit de supprimer tout contenu inapproprié.</p>

<p><strong>Modifications</strong></p>
<p>Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications prennent effet dès leur publication.</p>`,
};

export function FooterLinksManager() {
  const { links, loading, createLink, updateLink, deleteLink } = useFooterLinksAdmin();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');
  
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
    setPreviewTab('edit');
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

  const handleAutoFillContent = () => {
    const template = legalContentTemplates[formData.title];
    if (template) {
      setFormData({ ...formData, content: template });
      toast({ title: "Contenu généré", description: "Le contenu a été pré-rempli automatiquement" });
    } else {
      toast({ variant: "destructive", title: "Pas de modèle", description: "Aucun modèle disponible pour ce titre" });
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
        <div>
          <CardTitle>Gestion des Liens du Footer</CardTitle>
          <CardDescription>Gérez les liens légaux, CGU, politique de confidentialité, etc.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

              {formData.link_type === 'external' && (
                <div>
                  <Label>URL</Label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}

              {formData.link_type === 'internal' && (
                <div>
                  <Label>URL (page interne)</Label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="/mentions-legales"
                  />
                </div>
              )}

              {(formData.link_type === 'modal' || formData.link_type === 'internal') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Contenu de la page (HTML)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAutoFillContent}
                      className="flex items-center gap-1"
                    >
                      <Wand2 className="h-3 w-3" />
                      Auto-générer
                    </Button>
                  </div>
                  
                  <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as 'edit' | 'preview')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="edit">Éditer</TabsTrigger>
                      <TabsTrigger value="preview" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Aperçu
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit">
                      <Textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={12}
                        placeholder="<h2>Mentions légales</h2><p>...</p>"
                        className="font-mono text-sm"
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <div 
                        className="prose dark:prose-invert max-w-none p-4 border rounded-md bg-background min-h-[200px] max-h-[400px] overflow-y-auto"
                        dangerouslySetInnerHTML={{ 
                          __html: DOMPurify.sanitize(formData.content, {
                            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'div', 'span'],
                            ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
                          })
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                  <p className="text-xs text-muted-foreground">
                    Balises supportées: h2, h3, h4, p, ul, ol, li, strong, em, a
                  </p>
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
                <TableHead>Contenu</TableHead>
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
                    {link.link_type === 'modal' ? (
                      link.content ? (
                        <span className="text-green-600 text-sm">✓ Contenu défini</span>
                      ) : (
                        <span className="text-orange-500 text-sm">⚠ Pas de contenu</span>
                      )
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
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

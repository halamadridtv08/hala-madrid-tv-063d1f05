import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/utils/fileUpload';
import { Loader2, Plus, Trash2, Clock, Star, Image as ImageIcon, Film } from 'lucide-react';
import { StoryRing, StoryItem, fetchStoryRings } from '@/hooks/useStories';

const db = supabase as any;

export function StoriesManager() {
  const { toast } = useToast();
  const [rings, setRings] = useState<StoryRing[]>([]);
  const [loading, setLoading] = useState(true);
  const [ringDialogOpen, setRingDialogOpen] = useState(false);
  const [savingRing, setSavingRing] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);

  const [newRing, setNewRing] = useState({
    title: '',
    cover_url: '',
    is_highlight: false,
    is_published: true,
    display_order: 0,
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchStoryRings(true);
      setRings(data);
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    const res = await uploadFile(file, 'stories', 'covers');
    setUploadingCover(false);
    if (res.error) {
      toast({ title: 'Erreur upload', description: res.error, variant: 'destructive' });
      return;
    }
    setNewRing((r) => ({ ...r, cover_url: res.url! }));
  };

  const createRing = async () => {
    if (!newRing.title.trim()) {
      toast({ title: 'Titre requis', variant: 'destructive' });
      return;
    }
    setSavingRing(true);
    const expires_at = newRing.is_highlight ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { error } = await db.from('story_rings').insert({ ...newRing, expires_at });
    setSavingRing(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Story créée' });
    setRingDialogOpen(false);
    setNewRing({ title: '', cover_url: '', is_highlight: false, is_published: true, display_order: 0 });
    load();
  };

  const updateRing = async (id: string, patch: Record<string, unknown>) => {
    const { error } = await db.from('story_rings').update(patch).eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    load();
  };

  const deleteRing = async (id: string) => {
    if (!confirm('Supprimer cette story et tous ses contenus ?')) return;
    const { error } = await db.from('story_rings').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Story supprimée' });
    load();
  };

  const addItem = async (ring: StoryRing, file: File) => {
    setUploadingItem(ring.id);
    const res = await uploadFile(file, 'stories', 'items');
    if (res.error) {
      setUploadingItem(null);
      toast({ title: 'Erreur upload', description: res.error, variant: 'destructive' });
      return;
    }
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    const { error } = await db.from('story_items').insert({
      ring_id: ring.id,
      media_url: res.url,
      media_type: mediaType,
      duration_seconds: mediaType === 'video' ? 15 : 6,
      display_order: ring.items.length,
      expires_at: ring.is_highlight ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    setUploadingItem(null);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    // Prolonge le cercle 24 h à partir du dernier contenu ajouté
    if (!ring.is_highlight) {
      await db
        .from('story_rings')
        .update({ expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
        .eq('id', ring.id);
    }
    toast({ title: 'Contenu ajouté' });
    load();
  };

  const updateItem = async (id: string, patch: Partial<StoryItem>) => {
    const { error } = await db.from('story_items').update(patch).eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    load();
  };

  const deleteItem = async (id: string) => {
    const { error } = await db.from('story_items').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    load();
  };

  const now = Date.now();
  const isExpired = (ring: StoryRing) =>
    !ring.is_highlight && !!ring.expires_at && new Date(ring.expires_at).getTime() <= now;

  const daily = rings.filter((r) => !r.is_highlight && !isExpired(r));
  const highlights = rings.filter((r) => r.is_highlight);
  const archived = rings.filter((r) => isExpired(r));

  const renderRing = (ring: StoryRing) => (
    <Card key={ring.id}>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
          {(ring.cover_url || ring.items[0]?.media_url) && ring.items[0]?.media_type !== 'video' ? (
            <img src={ring.cover_url || ring.items[0]?.media_url} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-base">{ring.title}</CardTitle>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant={ring.is_highlight ? 'default' : 'secondary'} className="gap-1">
              {ring.is_highlight ? <Star className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {ring.is_highlight ? 'À la une' : '24 h'}
            </Badge>
            <span className="text-xs text-muted-foreground">{ring.items.length} contenu(s)</span>
            {ring.expires_at && !ring.is_highlight && (
              <span className="text-xs text-muted-foreground">
                expire le {new Date(ring.expires_at).toLocaleString('fr-FR')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={ring.is_published}
            onCheckedChange={(v) => updateRing(ring.id, { is_published: v })}
            aria-label="Publiée"
          />
          <Button variant="ghost" size="icon" onClick={() => deleteRing(ring.id)} aria-label="Supprimer">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ring.items.map((item) => (
            <div key={item.id} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-start gap-3">
                <div className="h-20 w-14 shrink-0 overflow-hidden rounded bg-muted">
                  {item.media_type === 'video' ? (
                    <video src={item.media_url} className="h-full w-full object-cover" muted />
                  ) : (
                    <img src={item.media_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Textarea
                    defaultValue={item.caption ?? ''}
                    placeholder="Légende"
                    rows={2}
                    onBlur={(e) => e.target.value !== (item.caption ?? '') && updateItem(item.id, { caption: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Input
                      defaultValue={item.link_url ?? ''}
                      placeholder="Lien (optionnel)"
                      onBlur={(e) => e.target.value !== (item.link_url ?? '') && updateItem(item.id, { link_url: e.target.value })}
                    />
                    <Input
                      type="number"
                      min={2}
                      max={60}
                      className="w-20"
                      defaultValue={item.duration_seconds}
                      onBlur={(e) => updateItem(item.id, { duration_seconds: Number(e.target.value) || 6 })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {item.media_type === 'video' ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                  {item.media_type}
                </span>
                <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                  <Trash2 className="mr-1 h-3 w-3" /> Retirer
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <Label htmlFor={`upload-${ring.id}`} className="sr-only">
            Ajouter un contenu
          </Label>
          <Input
            id={`upload-${ring.id}`}
            type="file"
            accept="image/*,video/*"
            disabled={uploadingItem === ring.id}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) addItem(ring, file);
              e.target.value = '';
            }}
          />
          {uploadingItem === ring.id && (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Upload en cours...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Stories</h2>
          <p className="text-sm text-muted-foreground">
            Stories 24 h (archivées automatiquement) et stories à la une (permanentes).
          </p>
        </div>
        <Button onClick={() => setRingDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle story
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">24 h ({daily.length})</TabsTrigger>
            <TabsTrigger value="highlights">À la une ({highlights.length})</TabsTrigger>
            <TabsTrigger value="archived">Archives ({archived.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="mt-4 space-y-4">
            {daily.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune story active.</p>
            ) : (
              daily.map(renderRing)
            )}
          </TabsContent>
          <TabsContent value="highlights" className="mt-4 space-y-4">
            {highlights.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune story à la une.</p>
            ) : (
              highlights.map(renderRing)
            )}
          </TabsContent>
          <TabsContent value="archived" className="mt-4 space-y-4">
            {archived.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune story archivée.</p>
            ) : (
              archived.map((ring) => (
                <Card key={ring.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base">{ring.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Expirée le {ring.expires_at ? new Date(ring.expires_at).toLocaleString('fr-FR') : '—'} ·{' '}
                        {ring.items.length} contenu(s)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateRing(ring.id, { is_highlight: true, expires_at: null })}>
                        <Star className="mr-1 h-4 w-4" /> Mettre à la une
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteRing(ring.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={ringDialogOpen} onOpenChange={setRingDialogOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="story-title">Titre</Label>
              <Input
                id="story-title"
                value={newRing.title}
                onChange={(e) => setNewRing((r) => ({ ...r, title: e.target.value }))}
                placeholder="Ex: Entraînement du jour"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="story-cover">Image de couverture (cercle)</Label>
              <Input
                id="story-cover"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                }}
              />
              {uploadingCover && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Upload...
                </p>
              )}
              {newRing.cover_url && (
                <img src={newRing.cover_url} alt="" className="h-16 w-16 rounded-full object-cover" />
              )}
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium">Story à la une</p>
                <p className="text-sm text-muted-foreground">
                  {newRing.is_highlight ? 'Reste visible jusqu’à suppression' : 'Disparaît après 24 h'}
                </p>
              </div>
              <Switch
                checked={newRing.is_highlight}
                onCheckedChange={(v) => setNewRing((r) => ({ ...r, is_highlight: v }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="story-order">Ordre d'affichage</Label>
              <Input
                id="story-order"
                type="number"
                value={newRing.display_order}
                onChange={(e) => setNewRing((r) => ({ ...r, display_order: Number(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRingDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={createRing} disabled={savingRing}>
              {savingRing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Créer
            </Button>
          </DialogFooter>
        </DialogContent>

      </Dialog>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/utils/fileUpload';
import { StoryExpiryLog } from './StoryExpiryLog';
import {
  Loader2,
  Plus,
  Trash2,
  Clock,
  Star,
  Image as ImageIcon,
  Film,
  Archive,
  RotateCcw,
  CalendarClock,
} from 'lucide-react';
import { StoryRing, StoryItem, fetchStoryRings, isRingArchived, isRingScheduled } from '@/hooks/useStories';
import { StoriesAnalyticsPanel } from './StoriesAnalyticsPanel';
import { StoryDisplaySettingsPanel } from './StoryDisplaySettingsPanel';
import { StoryDiagnosticsPanel } from './StoryDiagnosticsPanel';

const db = supabase as any;

const DAY_MS = 24 * 60 * 60 * 1000;

const toLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
};

const readVideoDuration = (file: File): Promise<number> =>
  new Promise((resolve) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.ceil(video.duration) : 15;
      URL.revokeObjectURL(objectUrl);
      resolve(Math.max(1, Math.min(21600, duration)));
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(15);
    };
    video.src = objectUrl;
  });

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

const readVideoCodecSignature = async (file: File): Promise<string> => {
  const sampleSize = Math.min(file.size, 2 * 1024 * 1024);
  const samples = [file.slice(0, sampleSize)];
  if (file.size > sampleSize) samples.push(file.slice(Math.max(0, file.size - sampleSize)));
  const buffers = await Promise.all(samples.map((sample) => sample.arrayBuffer()));
  return buffers.map((buffer) => new TextDecoder('iso-8859-1').decode(buffer)).join('');
};

const validateVideoCodec = async (file: File): Promise<string | null> => {
  const signature = await readVideoCodecSignature(file);
  if (/hvc1|hev1|dvh1|dvhe/.test(signature)) {
    return 'Cette vidéo utilise HEVC/H.265, un format non compatible avec tous les navigateurs. Convertissez-la en MP4 H.264 avec audio AAC avant de la réimporter.';
  }
  if ((file.type === 'video/quicktime' || /\.mov$/i.test(file.name)) && !signature.includes('avc1')) {
    return 'Cette vidéo MOV n’est pas compatible avec tous les navigateurs. Convertissez-la en MP4 H.264 avec audio AAC avant de la réimporter.';
  }
  return null;
};

const probeMedia = (file: File, kind: 'image' | 'video'): Promise<boolean> =>
  new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const done = (ok: boolean) => {
      URL.revokeObjectURL(objectUrl);
      resolve(ok);
    };
    if (kind === 'image') {
      const img = new Image();
      img.onload = () => done(img.naturalWidth > 0 && img.naturalHeight > 0);
      img.onerror = () => done(false);
      img.src = objectUrl;
    } else {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => done(Number.isFinite(video.duration) && video.duration > 0);
      video.onerror = () => done(false);
      video.src = objectUrl;
    }
  });

// Validates a story upload before sending it to storage: type, size and readability.
type StoryFileCheck = { ok: boolean; kind: 'image' | 'video'; message?: string };

const validateStoryFile = async (file: File): Promise<StoryFileCheck> => {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');
  const kind: 'image' | 'video' = isVideo ? 'video' : 'image';
  if (!isVideo && !isImage) return { ok: false, kind, message: 'Format non pris en charge : choisissez une image ou une vidéo.' };
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    return { ok: false, kind, message: `Fichier trop lourd (${Math.round(file.size / 1024 / 1024)} Mo). Maximum ${Math.round(limit / 1024 / 1024)} Mo.` };
  }
  if (file.size === 0) return { ok: false, kind, message: 'Le fichier est vide.' };
  const readable = await probeMedia(file, kind);
  if (!readable) return { ok: false, kind, message: 'Le fichier semble corrompu ou illisible par le navigateur.' };
  if (isVideo) {
    const codecError = await validateVideoCodec(file);
    if (codecError) return { ok: false, kind, message: codecError };
  }
  return { ok: true, kind };
};



export function StoriesManager() {
  const { toast } = useToast();
  const [rings, setRings] = useState<StoryRing[]>([]);
  const [loading, setLoading] = useState(true);
  const [ringDialogOpen, setRingDialogOpen] = useState(false);
  const [savingRing, setSavingRing] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveType, setArchiveType] = useState('all');

  const [newRing, setNewRing] = useState({
    title: '',
    cover_url: '',
    is_highlight: false,
    is_published: true,
    display_order: 0,
    scheduled_at: '',
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
    const check = await validateStoryFile(file);
    if (!check.ok || check.kind !== 'image') {
      toast({ title: 'Fichier refusé', description: check.message || 'La couverture doit être une image.', variant: 'destructive' });
      return;
    }
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
    const startAt = newRing.scheduled_at ? new Date(newRing.scheduled_at).getTime() : Date.now();
    const expires_at = newRing.is_highlight ? null : new Date(startAt + DAY_MS).toISOString();
    const { error } = await db.from('story_rings').insert({
      title: newRing.title,
      cover_url: newRing.cover_url || null,
      is_highlight: newRing.is_highlight,
      is_published: newRing.is_published,
      display_order: newRing.display_order,
      scheduled_at: newRing.scheduled_at ? new Date(newRing.scheduled_at).toISOString() : null,
      expires_at,
    });
    setSavingRing(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    toast({
      title: newRing.scheduled_at ? 'Story programmée' : 'Story créée',
      description: newRing.scheduled_at
        ? `Publication le ${new Date(newRing.scheduled_at).toLocaleString('fr-FR')}`
        : undefined,
    });
    setRingDialogOpen(false);
    setNewRing({ title: '', cover_url: '', is_highlight: false, is_published: true, display_order: 0, scheduled_at: '' });
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

  const archiveRing = async (ring: StoryRing) => {
    await updateRing(ring.id, { archived_at: new Date().toISOString(), is_published: false });
    toast({ title: 'Story archivée' });
  };

  const restoreRing = async (ring: StoryRing, asHighlight: boolean) => {
    await updateRing(ring.id, {
      archived_at: null,
      is_published: true,
      is_highlight: asHighlight,
      scheduled_at: null,
      expires_at: asHighlight ? null : new Date(Date.now() + DAY_MS).toISOString(),
    });
    toast({ title: asHighlight ? 'Story remise à la une' : 'Story republiée pour 24 h' });
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
    const check = await validateStoryFile(file);
    if (!check.ok) {
      toast({ title: 'Fichier refusé', description: check.message, variant: 'destructive' });
      return;
    }
    setUploadingItem(ring.id);
    const mediaType = check.kind;
    const durationSeconds = mediaType === 'video' ? await readVideoDuration(file) : 30;

    const res = await uploadFile(file, 'stories', 'items');
    if (res.error) {
      setUploadingItem(null);
      toast({ title: 'Erreur upload', description: res.error, variant: 'destructive' });
      return;
    }
    const { error } = await db.from('story_items').insert({
      ring_id: ring.id,
      media_url: res.url,
      media_type: mediaType,
      duration_seconds: durationSeconds,
      display_order: ring.items.length,
      expires_at: ring.is_highlight ? null : new Date(Date.now() + DAY_MS).toISOString(),
    });
    setUploadingItem(null);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    if (!ring.is_highlight && !ring.scheduled_at) {
      await db.from('story_rings').update({ expires_at: new Date(Date.now() + DAY_MS).toISOString() }).eq('id', ring.id);
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
  const active = rings.filter((r) => !isRingArchived(r, now));
  const daily = active.filter((r) => !r.is_highlight);
  const highlights = active.filter((r) => r.is_highlight);
  const archived = useMemo(
    () =>
      rings
        .filter((r) => isRingArchived(r, now))
        .filter((r) => r.title.toLowerCase().includes(archiveSearch.toLowerCase()))
        .filter((r) => (archiveType === 'all' ? true : archiveType === 'highlight' ? r.is_highlight : !r.is_highlight)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rings, archiveSearch, archiveType],
  );

  const renderRing = (ring: StoryRing) => {
    const scheduled = isRingScheduled(ring, now);
    return (
      <Card key={ring.id}>
        <CardHeader className="flex flex-col gap-3 space-y-0 pb-3 sm:flex-row sm:items-center">
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
              {scheduled && (
                <Badge variant="outline" className="gap-1">
                  <CalendarClock className="h-3 w-3" />
                  Programmée
                </Badge>
              )}
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
            <Button variant="outline" size="sm" onClick={() => archiveRing(ring)}>
              <Archive className="mr-1 h-4 w-4" /> Archiver
            </Button>
            {!ring.is_highlight && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateRing(ring.id, { is_highlight: true, expires_at: null })}
              >
                <Star className="mr-1 h-4 w-4" /> À la une
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => deleteRing(ring.id)} aria-label="Supprimer">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Publication programmée</Label>
              <Input
                type="datetime-local"
                defaultValue={toLocalInput(ring.scheduled_at)}
                onBlur={(e) =>
                  updateRing(ring.id, {
                    scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
              />
            </div>
            {!ring.is_highlight && (
              <div className="space-y-1">
                <Label className="text-xs">Expiration</Label>
                <Input
                  type="datetime-local"
                  defaultValue={toLocalInput(ring.expires_at)}
                  onBlur={(e) =>
                    updateRing(ring.id, {
                      expires_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                />
              </div>
            )}
          </div>

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
                      onBlur={(e) =>
                        e.target.value !== (item.caption ?? '') && updateItem(item.id, { caption: e.target.value })
                      }
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        defaultValue={item.link_url ?? ''}
                        placeholder="Lien (optionnel)"
                        onBlur={(e) =>
                          e.target.value !== (item.link_url ?? '') && updateItem(item.id, { link_url: e.target.value })
                        }
                      />
                      {item.media_type === 'image' ? (
                        <Select
                          value={String(item.duration_seconds)}
                          onValueChange={(value) => updateItem(item.id, { duration_seconds: Number(value) })}
                        >
                          <SelectTrigger aria-label="Durée d’affichage"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 secondes</SelectItem>
                            <SelectItem value="45">45 secondes</SelectItem>
                            <SelectItem value="60">1 minute</SelectItem>
                            <SelectItem value="180">3 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center rounded-md border border-border px-3 text-sm text-muted-foreground">
                          Durée vidéo : {item.duration_seconds}s
                        </div>
                      )}
                    </div>
                    <Input
                      defaultValue={item.link_label ?? ''}
                      placeholder="Texte du bouton (ex: Les 36 équipes...)"
                      onBlur={(e) =>
                        e.target.value !== (item.link_label ?? '') &&
                        updateItem(item.id, { link_label: e.target.value })
                      }
                    />
                    <div className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Flou : {item.backdrop_blur ?? 32}px</Label>
                        <Input type="range" min="0" max="64" value={item.backdrop_blur ?? 32} onChange={(e) => setRings((current) => current.map((r) => ({ ...r, items: r.items.map((it) => it.id === item.id ? { ...it, backdrop_blur: Number(e.target.value) } : it) })))} onMouseUp={(e) => updateItem(item.id, { backdrop_blur: Number(e.currentTarget.value) })} onTouchEnd={(e) => updateItem(item.id, { backdrop_blur: Number(e.currentTarget.value) })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Opacité : {item.backdrop_opacity ?? 55}%</Label>
                        <Input type="range" min="0" max="100" value={item.backdrop_opacity ?? 55} onChange={(e) => setRings((current) => current.map((r) => ({ ...r, items: r.items.map((it) => it.id === item.id ? { ...it, backdrop_opacity: Number(e.target.value) } : it) })))} onMouseUp={(e) => updateItem(item.id, { backdrop_opacity: Number(e.currentTarget.value) })} onTouchEnd={(e) => updateItem(item.id, { backdrop_opacity: Number(e.currentTarget.value) })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Zoom : {Number(item.media_zoom ?? 1).toFixed(2)}×</Label>
                        <Input type="range" min="1" max="2" step="0.05" value={Number(item.media_zoom ?? 1)} onChange={(e) => setRings((current) => current.map((r) => ({ ...r, items: r.items.map((it) => it.id === item.id ? { ...it, media_zoom: Number(e.target.value) } : it) })))} onMouseUp={(e) => updateItem(item.id, { media_zoom: Number(e.currentTarget.value) })} onTouchEnd={(e) => updateItem(item.id, { media_zoom: Number(e.currentTarget.value) })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Position horizontale : {item.media_position_x ?? 50}%</Label>
                        <Input type="range" min="0" max="100" value={item.media_position_x ?? 50} onChange={(e) => setRings((current) => current.map((r) => ({ ...r, items: r.items.map((it) => it.id === item.id ? { ...it, media_position_x: Number(e.target.value) } : it) })))} onMouseUp={(e) => updateItem(item.id, { media_position_x: Number(e.currentTarget.value) })} onTouchEnd={(e) => updateItem(item.id, { media_position_x: Number(e.currentTarget.value) })} />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Position verticale : {item.media_position_y ?? 50}%</Label>
                        <Input type="range" min="0" max="100" value={item.media_position_y ?? 50} onChange={(e) => setRings((current) => current.map((r) => ({ ...r, items: r.items.map((it) => it.id === item.id ? { ...it, media_position_y: Number(e.target.value) } : it) })))} onMouseUp={(e) => updateItem(item.id, { media_position_y: Number(e.currentTarget.value) })} onTouchEnd={(e) => updateItem(item.id, { media_position_y: Number(e.currentTarget.value) })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Diffusion programmée</Label>
                      <Input
                        type="datetime-local"
                        defaultValue={toLocalInput(item.scheduled_at)}
                        onBlur={(e) =>
                          updateItem(item.id, {
                            scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                          } as Partial<StoryItem>)
                        }
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
            <Label htmlFor={`upload-${ring.id}`} className="text-xs">
              Ajouter une image ou une vidéo
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
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Stories</h2>
          <p className="text-sm text-muted-foreground">
            Stories 24 h et stories à la une, avec programmation, archives et statistiques.
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
          <TabsList className="flex-wrap">
            <TabsTrigger value="daily">24 h ({daily.length})</TabsTrigger>
            <TabsTrigger value="highlights">À la une ({highlights.length})</TabsTrigger>
            <TabsTrigger value="archived">Archives ({archived.length})</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostic</TabsTrigger>
            <TabsTrigger value="display">Affichage</TabsTrigger>
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
            <StoryExpiryLog onArchived={load} />
            <div className="flex flex-wrap gap-2">

              <Input
                placeholder="Rechercher une story archivée..."
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                className="max-w-xs"
              />
              <Select value={archiveType} onValueChange={setArchiveType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="daily">24 h</SelectItem>
                  <SelectItem value="highlight">À la une</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {archived.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune story archivée.</p>
            ) : (
              archived.map((ring) => (
                <Card key={ring.id}>
                  <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                        {ring.cover_url && <img src={ring.cover_url} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div>
                        <CardTitle className="text-base">{ring.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Archivée le{' '}
                          {new Date(ring.archived_at || ring.expires_at || ring.created_at).toLocaleString('fr-FR')} ·{' '}
                          {ring.items.length} contenu(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => restoreRing(ring, false)}>
                        <RotateCcw className="mr-1 h-4 w-4" /> Restaurer 24 h
                      </Button>
                      <Button size="sm" onClick={() => restoreRing(ring, true)}>
                        <Star className="mr-1 h-4 w-4" /> Rendre à la une
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

          <TabsContent value="stats" className="mt-4">
            <StoriesAnalyticsPanel />
          </TabsContent>

          <TabsContent value="diagnostics" className="mt-4">
            <StoryDiagnosticsPanel />
          </TabsContent>

          <TabsContent value="display" className="mt-4">
            <StoryDisplaySettingsPanel />
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
                  {newRing.is_highlight ? 'Reste visible jusqu’à archivage' : 'Disparaît 24 h après publication'}
                </p>
              </div>
              <Switch
                checked={newRing.is_highlight}
                onCheckedChange={(v) => setNewRing((r) => ({ ...r, is_highlight: v }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="story-schedule">Publication programmée (optionnel)</Label>
              <Input
                id="story-schedule"
                type="datetime-local"
                value={newRing.scheduled_at}
                onChange={(e) => setNewRing((r) => ({ ...r, scheduled_at: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Vide = publication immédiate. Sinon la story apparaît sur le site à la date choisie.
              </p>
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

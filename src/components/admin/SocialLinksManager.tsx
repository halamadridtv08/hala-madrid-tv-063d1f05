import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Plus, Trash2, Loader2, GripVertical, Share2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

const PLATFORMS = [
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'discord', label: 'Discord' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'threads', label: 'Threads' },
];

// Platform SVG icons with brand colors
const getPlatformIcon = (platform: string, size: number = 24) => {
  switch (platform) {
    case 'twitter':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#1DA1F2">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id={`instagram-gradient-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f09433"/>
              <stop offset="25%" stopColor="#e6683c"/>
              <stop offset="50%" stopColor="#dc2743"/>
              <stop offset="75%" stopColor="#cc2366"/>
              <stop offset="100%" stopColor="#bc1888"/>
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="20" height="20" rx="5" stroke={`url(#instagram-gradient-${size})`} strokeWidth="2" fill="none"/>
          <circle cx="12" cy="12" r="4" stroke={`url(#instagram-gradient-${size})`} strokeWidth="2" fill="none"/>
          <circle cx="17.5" cy="6.5" r="1.5" fill={`url(#instagram-gradient-${size})`}/>
        </svg>
      );
    case 'youtube':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF0000">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    case 'discord':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#5865F2">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
        </svg>
      );
    case 'twitch':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#9146FF">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
        </svg>
      );
    case 'threads':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.333-3.022.812-.672 1.927-1.073 3.222-1.16 1.009-.066 1.955.02 2.823.254-.06-.97-.378-1.71-.948-2.2-.665-.572-1.632-.861-2.874-.861h-.06c-.94.013-2.312.331-3.104 1.288l-1.535-1.3c1.216-1.47 3.034-2.104 4.62-2.104h.082c3.322.037 5.136 2.02 5.396 5.146.126.006.25.018.376.033 1.637.2 2.926.79 3.834 1.755.982 1.044 1.474 2.45 1.463 4.18-.014 2.088-.903 3.84-2.572 5.07C17.848 23.12 15.32 24 12.186 24zM8.843 15.407c.02.373.188.686.5.934.356.283.87.428 1.53.432.847-.045 1.497-.334 1.932-.862.392-.476.628-1.164.703-2.046-.561-.108-1.163-.154-1.795-.137-.718.02-1.375.148-1.897.372-.667.287-1.002.694-.973 1.307z"/>
        </svg>
      );
    default:
      return <Share2 size={size} className="text-muted-foreground" />;
  }
};

export function SocialLinksManager() {
  const { toast } = useToast();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const newOrder = links.length > 0 ? Math.max(...links.map(l => l.display_order)) + 1 : 1;
      const { data, error } = await supabase
        .from('social_links')
        .insert({
          platform: 'twitter',
          url: 'https://',
          display_order: newOrder,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setLinks([...links, data]);
      toast({ title: "Succès", description: "Lien ajouté" });
    } catch (error) {
      console.error('Error adding:', error);
      toast({ title: "Erreur", description: "Impossible d'ajouter", variant: "destructive" });
    }
  };

  const handleUpdate = async (id: string, field: keyof SocialLink, value: any) => {
    setLinks(prev => prev.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const link of links) {
        const { error } = await supabase
          .from('social_links')
          .update({
            platform: link.platform,
            url: link.url,
            is_active: link.is_active,
            display_order: link.display_order
          })
          .eq('id', link.id);

        if (error) throw error;
      }
      toast({ title: "Succès", description: "Liens sauvegardés" });
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce lien ?")) return;

    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLinks(prev => prev.filter(l => l.id !== id));
      toast({ title: "Succès", description: "Lien supprimé" });
    } catch (error) {
      console.error('Error deleting:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Réseaux Sociaux</h2>
          <p className="text-muted-foreground">Gérez les liens vers vos réseaux sociaux</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {links.map((link, index) => (
          <Card key={link.id}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-5 w-5" />
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                
                {/* Brand colored icon */}
                <div className="w-10 h-10 rounded-lg bg-card border flex items-center justify-center">
                  {getPlatformIcon(link.platform, 22)}
                </div>

                <Select
                  value={link.platform}
                  onValueChange={(v) => handleUpdate(link.id, 'platform', v)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(p.value, 16)}
                          <span>{p.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={link.url}
                  onChange={(e) => handleUpdate(link.id, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />

                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Actif</Label>
                  <Switch
                    checked={link.is_active}
                    onCheckedChange={(checked) => handleUpdate(link.id, 'is_active', checked)}
                  />
                </div>

                <Button size="icon" variant="ghost" onClick={() => handleDelete(link.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {links.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun réseau social configuré. Cliquez sur "Ajouter" pour commencer.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview */}
      {links.filter(l => l.is_active).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 justify-center py-4">
              {links.filter(l => l.is_active).map(link => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full bg-card border-2 border-border flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                >
                  {getPlatformIcon(link.platform, 28)}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

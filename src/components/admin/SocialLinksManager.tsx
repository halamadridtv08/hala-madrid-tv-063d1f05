import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Plus, Trash2, Loader2, GripVertical, Twitter, Instagram, Youtube, Music2, Facebook, Linkedin, Globe } from "lucide-react";
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
  { value: 'twitter', label: 'Twitter / X', icon: Twitter },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'tiktok', label: 'TikTok', icon: Music2 },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'other', label: 'Autre', icon: Globe },
];

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

  const getPlatformIcon = (platform: string) => {
    const p = PLATFORMS.find(pl => pl.value === platform);
    return p ? p.icon : Globe;
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
        {links.map((link, index) => {
          const PlatformIcon = getPlatformIcon(link.platform);
          return (
            <Card key={link.id}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  
                  <div className="p-2 rounded-lg bg-primary/10">
                    <PlatformIcon className="h-5 w-5 text-primary" />
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
                            <p.icon className="h-4 w-4" />
                            {p.label}
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
          );
        })}

        {links.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun réseau social configuré. Cliquez sur "Ajouter" pour commencer.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 justify-center">
            {links.filter(l => l.is_active).map(link => {
              const PlatformIcon = getPlatformIcon(link.platform);
              return (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <PlatformIcon className="h-5 w-5 text-primary" />
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

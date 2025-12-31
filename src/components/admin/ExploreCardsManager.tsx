import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Plus, Trash2, Loader2, GripVertical, Dumbbell, Mic, Shirt, CalendarDays, Trophy, Users, Video, FileText, Star, Zap, Heart, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExploreCard {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  url: string;
  display_order: number;
  is_active: boolean;
}

const ICON_OPTIONS = [
  { value: 'Dumbbell', label: 'Haltère', icon: Dumbbell },
  { value: 'Mic', label: 'Micro', icon: Mic },
  { value: 'Shirt', label: 'Maillot', icon: Shirt },
  { value: 'CalendarDays', label: 'Calendrier', icon: CalendarDays },
  { value: 'Trophy', label: 'Trophée', icon: Trophy },
  { value: 'Users', label: 'Équipe', icon: Users },
  { value: 'Video', label: 'Vidéo', icon: Video },
  { value: 'FileText', label: 'Article', icon: FileText },
  { value: 'Star', label: 'Étoile', icon: Star },
  { value: 'Zap', label: 'Éclair', icon: Zap },
  { value: 'Heart', label: 'Cœur', icon: Heart },
  { value: 'Settings', label: 'Paramètres', icon: Settings },
];

export function ExploreCardsManager() {
  const { toast } = useToast();
  const [cards, setCards] = useState<ExploreCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('explore_cards')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const newOrder = cards.length > 0 ? Math.max(...cards.map(c => c.display_order)) + 1 : 1;
      const { data, error } = await supabase
        .from('explore_cards')
        .insert({
          title: 'Nouvelle section',
          description: 'Description',
          icon: 'Star',
          url: '/',
          display_order: newOrder,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setCards([...cards, data]);
      toast({ title: "Succès", description: "Carte ajoutée" });
    } catch (error) {
      console.error('Error adding:', error);
      toast({ title: "Erreur", description: "Impossible d'ajouter", variant: "destructive" });
    }
  };

  const handleUpdate = (id: string, field: keyof ExploreCard, value: any) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const card of cards) {
        const { error } = await supabase
          .from('explore_cards')
          .update({
            title: card.title,
            description: card.description,
            icon: card.icon,
            url: card.url,
            is_active: card.is_active,
            display_order: card.display_order
          })
          .eq('id', card.id);

        if (error) throw error;
      }
      toast({ title: "Succès", description: "Cartes sauvegardées" });
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette carte ?")) return;

    try {
      const { error } = await supabase
        .from('explore_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCards(prev => prev.filter(c => c.id !== id));
      toast({ title: "Succès", description: "Carte supprimée" });
    } catch (error) {
      console.error('Error deleting:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  const getIconComponent = (iconName: string) => {
    const option = ICON_OPTIONS.find(o => o.value === iconName);
    return option ? option.icon : Star;
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
          <h2 className="text-2xl font-bold">Cartes Explorer</h2>
          <p className="text-muted-foreground">Gérez les cartes de raccourcis affichées sur la page d'accueil</p>
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
        {cards.map((card, index) => {
          const IconComponent = getIconComponent(card.icon);
          return (
            <Card key={card.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground pt-2">
                    <GripVertical className="h-5 w-5" />
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                    <div>
                      <Label className="text-xs">Icône</Label>
                      <Select
                        value={card.icon}
                        onValueChange={(v) => handleUpdate(card.id, 'icon', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ICON_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <opt.icon className="h-4 w-4" />
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Titre</Label>
                      <Input
                        value={card.title}
                        onChange={(e) => handleUpdate(card.id, 'title', e.target.value)}
                        placeholder="Titre"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={card.description || ''}
                        onChange={(e) => handleUpdate(card.id, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">URL</Label>
                      <Input
                        value={card.url}
                        onChange={(e) => handleUpdate(card.id, 'url', e.target.value)}
                        placeholder="/page"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={card.is_active}
                          onCheckedChange={(checked) => handleUpdate(card.id, 'is_active', checked)}
                        />
                        <Label className="text-xs">Actif</Label>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(card.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {cards.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune carte configurée. Cliquez sur "Ajouter" pour commencer.
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.filter(c => c.is_active).map(card => {
              const IconComponent = getIconComponent(card.icon);
              return (
                <div 
                  key={card.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-colors"
                >
                  <div className="p-3 rounded-full bg-primary/10">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm">{card.title}</h4>
                  {card.description && (
                    <p className="text-xs text-muted-foreground text-center">{card.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

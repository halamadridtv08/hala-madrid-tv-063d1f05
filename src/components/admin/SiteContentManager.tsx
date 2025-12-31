import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Plus, Trash2, Edit2, X, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SiteContent {
  id: string;
  content_key: string;
  content_value: string;
  content_type: string;
  section: string;
  description: string | null;
  language: string;
}

const SECTIONS = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'footer', label: 'Footer' },
  { value: 'home', label: 'Page d\'accueil' },
  { value: 'global', label: 'Global' },
  { value: 'navbar', label: 'Navigation' },
];

export function SiteContentManager() {
  const { toast } = useToast();
  const [content, setContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newContent, setNewContent] = useState({
    content_key: '',
    content_value: '',
    section: 'global',
    description: '',
    content_type: 'text'
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('section', { ascending: true });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({ title: "Erreur", description: "Impossible de charger le contenu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item: SiteContent) => {
    setSaving(item.id);
    try {
      const { error } = await supabase
        .from('site_content')
        .update({ content_value: editValue })
        .eq('id', item.id);

      if (error) throw error;

      setContent(prev => prev.map(c => 
        c.id === item.id ? { ...c, content_value: editValue } : c
      ));
      setEditingId(null);
      toast({ title: "Succès", description: "Contenu mis à jour" });
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const handleAdd = async () => {
    if (!newContent.content_key || !newContent.content_value) {
      toast({ title: "Erreur", description: "Remplissez tous les champs obligatoires", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('site_content')
        .insert({
          content_key: newContent.content_key,
          content_value: newContent.content_value,
          section: newContent.section,
          description: newContent.description || null,
          content_type: newContent.content_type,
          language: 'fr'
        });

      if (error) throw error;

      await fetchContent();
      setShowAddDialog(false);
      setNewContent({ content_key: '', content_value: '', section: 'global', description: '', content_type: 'text' });
      toast({ title: "Succès", description: "Contenu ajouté" });
    } catch (error: any) {
      console.error('Error adding:', error);
      toast({ title: "Erreur", description: error.message || "Impossible d'ajouter", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce contenu ?")) return;

    try {
      const { error } = await supabase
        .from('site_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setContent(prev => prev.filter(c => c.id !== id));
      toast({ title: "Succès", description: "Contenu supprimé" });
    } catch (error) {
      console.error('Error deleting:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  const groupedContent = SECTIONS.map(section => ({
    ...section,
    items: content.filter(c => c.section === section.value)
  }));

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
          <h2 className="text-2xl font-bold">Contenu du Site</h2>
          <p className="text-muted-foreground">Gérez tous les textes affichés sur le site</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau contenu</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Clé unique</Label>
                <Input 
                  placeholder="ex: hero_title" 
                  value={newContent.content_key}
                  onChange={(e) => setNewContent(prev => ({ ...prev, content_key: e.target.value }))}
                />
              </div>
              <div>
                <Label>Valeur</Label>
                <Textarea 
                  placeholder="Texte à afficher" 
                  value={newContent.content_value}
                  onChange={(e) => setNewContent(prev => ({ ...prev, content_value: e.target.value }))}
                />
              </div>
              <div>
                <Label>Section</Label>
                <Select value={newContent.section} onValueChange={(v) => setNewContent(prev => ({ ...prev, section: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description (optionnel)</Label>
                <Input 
                  placeholder="Description pour l'admin" 
                  value={newContent.description}
                  onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="flex-wrap h-auto gap-1">
          {SECTIONS.map(section => (
            <TabsTrigger key={section.value} value={section.value} className="text-sm">
              {section.label} ({groupedContent.find(g => g.value === section.value)?.items.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTIONS.map(section => (
          <TabsContent key={section.value} value={section.value} className="mt-4">
            <div className="grid gap-4">
              {groupedContent.find(g => g.value === section.value)?.items.map(item => (
                <Card key={item.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{item.content_key}</code>
                          {item.description && (
                            <span className="text-xs text-muted-foreground">— {item.description}</span>
                          )}
                        </div>
                        
                        {editingId === item.id ? (
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="min-h-[80px]"
                          />
                        ) : (
                          <p className="text-sm text-foreground whitespace-pre-wrap">{item.content_value}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {editingId === item.id ? (
                          <>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleSave(item)}
                              disabled={saving === item.id}
                            >
                              {saving === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-500" />}
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => {
                                setEditingId(item.id);
                                setEditValue(item.content_value);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {(groupedContent.find(g => g.value === section.value)?.items.length || 0) === 0 && (
                <p className="text-center text-muted-foreground py-8">Aucun contenu dans cette section</p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

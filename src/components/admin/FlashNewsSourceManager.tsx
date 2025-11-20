import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlashNewsSource } from '@/types/FlashNewsSource';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { MediaUploader } from './MediaUploader';

export const FlashNewsSourceManager = () => {
  const [sources, setSources] = useState<FlashNewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    avatar_url: '',
    is_active: true,
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const { data, error } = await supabase
        .from('flash_news_sources')
        .select('*')
        .order('name');

      if (error) throw error;
      setSources(data || []);
    } catch (error) {
      console.error('Error fetching sources:', error);
      toast.error('Erreur lors du chargement des sources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('flash_news_sources')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Source mise à jour');
      } else {
        const { error } = await supabase
          .from('flash_news_sources')
          .insert([formData]);

        if (error) throw error;
        toast.success('Source créée');
      }

      resetForm();
      fetchSources();
    } catch (error) {
      console.error('Error saving source:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (source: FlashNewsSource) => {
    setEditingId(source.id);
    setFormData({
      name: source.name,
      handle: source.handle,
      avatar_url: source.avatar_url || '',
      is_active: source.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette source ?')) return;

    try {
      const { error } = await supabase
        .from('flash_news_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Source supprimée');
      fetchSources();
    } catch (error) {
      console.error('Error deleting source:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      handle: '',
      avatar_url: '',
      is_active: true,
    });
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Modifier' : 'Ajouter'} une source</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handle">Handle (ex: @fabri)</Label>
                <Input
                  id="handle"
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  placeholder="@username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Avatar</Label>
              <MediaUploader
                onSuccess={(url) => setFormData({ ...formData, avatar_url: url })}
                acceptTypes="image/*"
                maxSizeMB={2}
                folderPath="flash-news-sources"
                bucketName="media"
                buttonText="Télécharger l'avatar"
                showPreview
                currentValue={formData.avatar_url}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? 'Mettre à jour' : 'Créer'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sources existantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((source) => (
              <Card key={source.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarImage src={source.avatar_url || undefined} />
                      <AvatarFallback>{source.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold">{source.name}</div>
                      <div className="text-sm text-muted-foreground">{source.handle}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${source.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                      {source.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(source)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

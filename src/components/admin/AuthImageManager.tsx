import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MediaUploader } from './MediaUploader';
import { Loader2 } from 'lucide-react';

export function AuthImageManager() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentImage();
  }, []);

  const fetchCurrentImage = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'auth_hero_image')
        .single();

      if (error) throw error;
      
      if (data?.setting_value) {
        setImageUrl(data.setting_value);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (url: string) => {
    setImageUrl(url);
  };

  const handleSave = async () => {
    if (!imageUrl) {
      toast({
        title: "Erreur",
        description: "Veuillez uploader une image",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: imageUrl })
        .eq('setting_key', 'auth_hero_image');

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'image d'authentification a été mise à jour",
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'image",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Image de Connexion/Inscription</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Image Héro (affichée à gauche sur les pages d'authentification)
          </label>
          <MediaUploader
            onSuccess={handleImageUpload}
            acceptTypes="image/*"
            buttonText="Choisir une image"
            showPreview={true}
            currentValue={imageUrl}
          />
        </div>

        {imageUrl && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Aperçu actuel :</p>
            <img 
              src={imageUrl} 
              alt="Auth Hero Preview" 
              className="w-full max-w-md h-64 object-cover rounded-lg"
            />
          </div>
        )}

        <Button onClick={handleSave} className="w-full">
          Enregistrer l'image
        </Button>
      </div>
    </Card>
  );
}

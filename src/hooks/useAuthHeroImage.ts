import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAuthHeroImage() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
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
        console.error('Erreur lors du chargement de l\'image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, []);

  return { imageUrl, isLoading };
}

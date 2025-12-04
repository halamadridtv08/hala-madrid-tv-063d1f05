import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type EntityType = 'player' | 'article' | 'match' | 'kit' | 'video';

interface Favorite {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  created_at: string;
}

export function useFavorites(entityType?: EntityType) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch favorites from Supabase or localStorage
  const fetchFavorites = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        let query = supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', user.id);
        
        if (entityType) {
          query = query.eq('entity_type', entityType);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Cast the data to our Favorite type
        const typedData: Favorite[] = (data || []).map(item => ({
          id: item.id,
          user_id: item.user_id,
          entity_type: item.entity_type as EntityType,
          entity_id: item.entity_id,
          created_at: item.created_at
        }));
        
        setFavorites(typedData);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback to localStorage for non-authenticated users
      const stored = localStorage.getItem('guestFavorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (entityType) {
          setFavorites(parsed.filter((f: Favorite) => f.entity_type === entityType));
        } else {
          setFavorites(parsed);
        }
      }
    }
  }, [user, entityType]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((entityId: string, type?: EntityType) => {
    const checkType = type || entityType;
    return favorites.some(f => f.entity_id === entityId && (!checkType || f.entity_type === checkType));
  }, [favorites, entityType]);

  const addFavorite = useCallback(async (entityId: string, type: EntityType) => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            entity_type: type,
            entity_id: entityId
          })
          .select()
          .single();
        
        if (error) {
          if (error.code === '23505') {
            toast.info('Déjà dans vos favoris');
            return;
          }
          throw error;
        }
        
        const newFavorite: Favorite = {
          id: data.id,
          user_id: data.user_id,
          entity_type: data.entity_type as EntityType,
          entity_id: data.entity_id,
          created_at: data.created_at
        };
        
        setFavorites(prev => [newFavorite, ...prev]);
        toast.success('Ajouté aux favoris');
      } catch (error) {
        console.error('Error adding favorite:', error);
        toast.error('Erreur lors de l\'ajout aux favoris');
      }
    } else {
      // localStorage fallback for guests
      const stored = localStorage.getItem('guestFavorites');
      const parsed: Favorite[] = stored ? JSON.parse(stored) : [];
      
      if (parsed.some(f => f.entity_id === entityId && f.entity_type === type)) {
        toast.info('Déjà dans vos favoris');
        return;
      }
      
      const newFavorite: Favorite = {
        id: crypto.randomUUID(),
        user_id: 'guest',
        entity_type: type,
        entity_id: entityId,
        created_at: new Date().toISOString()
      };
      
      const updated = [newFavorite, ...parsed];
      localStorage.setItem('guestFavorites', JSON.stringify(updated));
      setFavorites(prev => [newFavorite, ...prev]);
      toast.success('Ajouté aux favoris (connectez-vous pour les sauvegarder)');
    }
  }, [user]);

  const removeFavorite = useCallback(async (entityId: string, type: EntityType) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('entity_type', type)
          .eq('entity_id', entityId);
        
        if (error) throw error;
        
        setFavorites(prev => prev.filter(f => !(f.entity_id === entityId && f.entity_type === type)));
        toast.success('Retiré des favoris');
      } catch (error) {
        console.error('Error removing favorite:', error);
        toast.error('Erreur lors de la suppression');
      }
    } else {
      const stored = localStorage.getItem('guestFavorites');
      const parsed: Favorite[] = stored ? JSON.parse(stored) : [];
      const updated = parsed.filter(f => !(f.entity_id === entityId && f.entity_type === type));
      localStorage.setItem('guestFavorites', JSON.stringify(updated));
      setFavorites(prev => prev.filter(f => !(f.entity_id === entityId && f.entity_type === type)));
      toast.success('Retiré des favoris');
    }
  }, [user]);

  const toggleFavorite = useCallback(async (entityId: string, type: EntityType) => {
    if (isFavorite(entityId, type)) {
      await removeFavorite(entityId, type);
    } else {
      await addFavorite(entityId, type);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    isLoading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refetch: fetchFavorites
  };
}


import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Save, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Player } from "@/types/Player";

export function FeaturedPlayerManager() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentFeaturedPlayer, setCurrentFeaturedPlayer] = useState<Player | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlayersAndFeatured();
  }, []);

  const fetchPlayersAndFeatured = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les joueurs actifs
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (playersError) throw playersError;
      setPlayers(playersData || []);

      // Récupérer le joueur en vedette actuel (utiliser stats.isFeatured)
      const { data: featuredData, error: featuredError } = await supabase
        .from('players')
        .select('*')
        .eq('is_active', true)
        .not('stats', 'is', null)
        .order('created_at', { ascending: false });

      if (featuredError) throw featuredError;
      
      // Chercher le joueur marqué comme featured dans ses stats
      const featured = featuredData?.find(player => 
        player.stats && typeof player.stats === 'object' && player.stats.isFeatured
      );
      
      if (featured) {
        setCurrentFeaturedPlayer(featured);
        setSelectedPlayerId(featured.id);
      }

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeaturedPlayer = async () => {
    if (!selectedPlayerId) {
      toast.error('Veuillez sélectionner un joueur');
      return;
    }

    setSaving(true);
    try {
      // Retirer le statut "featured" de tous les joueurs
      const { error: unfeaturedError } = await supabase.rpc('remove_featured_status');
      
      if (unfeaturedError) {
        // Si la fonction n'existe pas, faire manuellement
        const { data: allPlayers } = await supabase
          .from('players')
          .select('id, stats')
          .eq('is_active', true);

        if (allPlayers) {
          for (const player of allPlayers) {
            if (player.stats && typeof player.stats === 'object' && player.stats.isFeatured) {
              const updatedStats = { ...player.stats, isFeatured: false };
              await supabase
                .from('players')
                .update({ stats: updatedStats })
                .eq('id', player.id);
            }
          }
        }
      }

      // Marquer le joueur sélectionné comme featured
      const selectedPlayer = players.find(p => p.id === selectedPlayerId);
      if (selectedPlayer) {
        const updatedStats = {
          ...selectedPlayer.stats,
          isFeatured: true
        };

        const { error } = await supabase
          .from('players')
          .update({ stats: updatedStats })
          .eq('id', selectedPlayerId);

        if (error) throw error;

        setCurrentFeaturedPlayer(selectedPlayer);
        toast.success('Joueur en vedette mis à jour avec succès');
      }

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Joueur en Vedette
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Joueur en Vedette
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Joueur actuellement en vedette */}
        {currentFeaturedPlayer && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Joueur actuellement en vedette
            </h3>
            <div className="flex items-center gap-3">
              <img
                src={currentFeaturedPlayer.image_url || `https://placehold.co/60x60/1a365d/ffffff/?text=${currentFeaturedPlayer.name.charAt(0)}`}
                alt={currentFeaturedPlayer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{currentFeaturedPlayer.name}</p>
                <p className="text-sm text-gray-600">{currentFeaturedPlayer.position}</p>
                <Badge variant="secondary" className="text-xs">
                  #{currentFeaturedPlayer.jersey_number}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Sélection du nouveau joueur en vedette */}
        <div className="space-y-3">
          <h3 className="font-semibold">Changer le joueur en vedette</h3>
          <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un joueur" />
            </SelectTrigger>
            <SelectContent>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  <div className="flex items-center gap-2">
                    <span>#{player.jersey_number}</span>
                    <span>{player.name}</span>
                    <span className="text-sm text-gray-500">({player.position})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bouton de sauvegarde */}
        <Button 
          onClick={handleSaveFeaturedPlayer}
          disabled={saving || !selectedPlayerId}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder le joueur en vedette'}
        </Button>
      </CardContent>
    </Card>
  );
}

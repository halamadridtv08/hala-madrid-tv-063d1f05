
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { realMadridPlayers } from "@/data/realMadridPlayers";
import { realMadridCoaches } from "@/data/realMadridCoaches";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SyncStatus {
  players: 'idle' | 'syncing' | 'success' | 'error';
  coaches: 'idle' | 'syncing' | 'success' | 'error';
}

export function DataSynchronizer() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    players: 'idle',
    coaches: 'idle'
  });

  const syncPlayers = async () => {
    setSyncStatus(prev => ({ ...prev, players: 'syncing' }));
    
    try {
      // Récupérer les joueurs existants
      const { data: existingPlayers } = await supabase
        .from('players')
        .select('name');
      
      const existingNames = existingPlayers?.map(p => p.name) || [];
      
      // Filtrer les nouveaux joueurs
      const newPlayers = realMadridPlayers.filter(
        player => !existingNames.includes(player.name)
      );

      if (newPlayers.length > 0) {
        // Insérer les nouveaux joueurs
        const { error } = await supabase
          .from('players')
          .insert(newPlayers.map(player => ({
            name: player.name,
            position: player.position,
            jersey_number: player.jerseyNumber,
            age: player.age,
            nationality: player.nationality,
            image_url: player.imageUrl,
            bio: player.bio,
            is_active: true
          })));

        if (error) throw error;
        
        toast.success(`${newPlayers.length} nouveaux joueurs synchronisés`);
      } else {
        toast.info("Tous les joueurs sont déjà synchronisés");
      }
      
      setSyncStatus(prev => ({ ...prev, players: 'success' }));
    } catch (error) {
      console.error('Erreur lors de la synchronisation des joueurs:', error);
      setSyncStatus(prev => ({ ...prev, players: 'error' }));
      toast.error("Erreur lors de la synchronisation des joueurs");
    }
  };

  const syncCoaches = async () => {
    setSyncStatus(prev => ({ ...prev, coaches: 'syncing' }));
    
    try {
      // Récupérer les entraîneurs existants
      const { data: existingCoaches } = await supabase
        .from('coaches')
        .select('name');
      
      const existingNames = existingCoaches?.map(c => c.name) || [];
      
      // Filtrer les nouveaux entraîneurs
      const newCoaches = realMadridCoaches.filter(
        coach => !existingNames.includes(coach.name)
      );

      if (newCoaches.length > 0) {
        // Insérer les nouveaux entraîneurs
        const { error } = await supabase
          .from('coaches')
          .insert(newCoaches.map(coach => ({
            name: coach.name,
            role: coach.role,
            age: coach.age,
            nationality: coach.nationality,
            image_url: coach.imageUrl,
            bio: coach.bio,
            experience_years: coach.experienceYears,
            is_active: true
          })));

        if (error) throw error;
        
        toast.success(`${newCoaches.length} nouveaux entraîneurs synchronisés`);
      } else {
        toast.info("Tous les entraîneurs sont déjà synchronisés");
      }
      
      setSyncStatus(prev => ({ ...prev, coaches: 'success' }));
    } catch (error) {
      console.error('Erreur lors de la synchronisation des entraîneurs:', error);
      setSyncStatus(prev => ({ ...prev, coaches: 'error' }));
      toast.error("Erreur lors de la synchronisation des entraîneurs");
    }
  };

  const syncAll = async () => {
    await syncPlayers();
    await syncCoaches();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'syncing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'syncing':
        return <Badge variant="secondary">En cours...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Synchronisé</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return <Badge variant="outline">En attente</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Synchronisation des données</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 border rounded">
            <div className="flex items-center gap-2">
              {getStatusIcon(syncStatus.players)}
              <span>Joueurs ({realMadridPlayers.length})</span>
            </div>
            {getStatusBadge(syncStatus.players)}
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded">
            <div className="flex items-center gap-2">
              {getStatusIcon(syncStatus.coaches)}
              <span>Entraîneurs ({realMadridCoaches.length})</span>
            </div>
            {getStatusBadge(syncStatus.coaches)}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={syncPlayers}
            disabled={syncStatus.players === 'syncing'}
            variant="outline"
          >
            Sync Joueurs
          </Button>
          <Button 
            onClick={syncCoaches}
            disabled={syncStatus.coaches === 'syncing'}
            variant="outline"
          >
            Sync Entraîneurs
          </Button>
          <Button 
            onClick={syncAll}
            disabled={syncStatus.players === 'syncing' || syncStatus.coaches === 'syncing'}
          >
            Tout synchroniser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

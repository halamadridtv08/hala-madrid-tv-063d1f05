
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Sync, Database, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import { realMadridPlayers } from "@/data/realMadridPlayers";
import { realMadridCoaches } from "@/data/realMadridCoaches";

export const DataSynchronizer = () => {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    players: 'En attente',
    coaches: 'En attente'
  });

  const syncPlayers = async () => {
    setSyncing(true);
    setSyncStatus(prev => ({ ...prev, players: 'En cours...' }));
    
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
        const { error } = await supabase
          .from('players')
          .insert(newPlayers.map(player => ({
            name: player.name,
            position: player.position,
            jersey_number: player.jersey_number,
            age: player.age,
            nationality: player.nationality,
            height: player.height,
            weight: player.weight,
            image_url: player.image_url,
            bio: player.bio,
            is_active: true
          })));

        if (error) throw error;
        
        setSyncStatus(prev => ({ ...prev, players: `${newPlayers.length} ajoutés` }));
        toast.success(`${newPlayers.length} nouveaux joueurs synchronisés`);
      } else {
        setSyncStatus(prev => ({ ...prev, players: 'À jour' }));
        toast.info("Tous les joueurs sont déjà synchronisés");
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des joueurs:', error);
      setSyncStatus(prev => ({ ...prev, players: 'Erreur' }));
      toast.error("Erreur lors de la synchronisation des joueurs");
    }
  };

  const syncCoaches = async () => {
    setSyncing(true);
    setSyncStatus(prev => ({ ...prev, coaches: 'En cours...' }));
    
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
        const { error } = await supabase
          .from('coaches')
          .insert(newCoaches.map(coach => ({
            name: coach.name,
            role: coach.role,
            age: coach.age,
            nationality: coach.nationality,
            image_url: coach.image_url,
            bio: coach.bio,
            experience_years: coach.experience_years,
            is_active: true
          })));

        if (error) throw error;
        
        setSyncStatus(prev => ({ ...prev, coaches: `${newCoaches.length} ajoutés` }));
        toast.success(`${newCoaches.length} nouveaux entraîneurs synchronisés`);
      } else {
        setSyncStatus(prev => ({ ...prev, coaches: 'À jour' }));
        toast.info("Tous les entraîneurs sont déjà synchronisés");
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des entraîneurs:', error);
      setSyncStatus(prev => ({ ...prev, coaches: 'Erreur' }));
      toast.error("Erreur lors de la synchronisation des entraîneurs");
    }
  };

  const syncAll = async () => {
    setSyncing(true);
    toast.info("Début de la synchronisation complète...");
    
    await syncPlayers();
    await syncCoaches();
    
    setSyncing(false);
    toast.success("Synchronisation complète terminée !");
  };

  const handleSyncPlayers = async () => {
    await syncPlayers();
    setSyncing(false);
  };

  const handleSyncCoaches = async () => {
    await syncCoaches();
    setSyncing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Synchronisation des données
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Joueurs ({realMadridPlayers.length})</span>
              </div>
              <Badge variant={syncStatus.players === 'À jour' ? 'default' : 'secondary'}>
                {syncStatus.players}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Entraîneurs ({realMadridCoaches.length})</span>
              </div>
              <Badge variant={syncStatus.coaches === 'À jour' ? 'default' : 'secondary'}>
                {syncStatus.coaches}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleSyncPlayers}
              disabled={syncing}
              variant="outline"
              size="sm"
            >
              <Sync className="h-4 w-4 mr-2" />
              Sync Joueurs
            </Button>
            
            <Button 
              onClick={handleSyncCoaches}
              disabled={syncing}
              variant="outline"
              size="sm"
            >
              <Sync className="h-4 w-4 mr-2" />
              Sync Entraîneurs
            </Button>
            
            <Button 
              onClick={syncAll}
              disabled={syncing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Sync className="h-4 w-4 mr-2" />
              Tout synchroniser
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

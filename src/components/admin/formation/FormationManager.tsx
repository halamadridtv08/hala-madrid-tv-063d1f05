import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FootballPitch } from './FootballPitch';
import { PlayerCard } from './PlayerCard';
import { FormationSelector } from './FormationSelector';
import { FormationPlayerData, FORMATIONS, FormationPosition } from '@/types/Formation';
import { Player } from '@/types/Player';
import { RotateCcw, Save, Users, Shield } from 'lucide-react';
import { OpposingTeamFormation } from './OpposingTeamFormation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const FormationManager: React.FC = () => {
  const [selectedFormation, setSelectedFormation] = useState<string>('4-3-3');
  const [players, setPlayers] = useState<FormationPlayerData[]>([]);
  const [playerPositions, setPlayerPositions] = useState<Record<string, FormationPosition>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Charger les vrais joueurs depuis la base de données
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, position, jersey_number, image_url, profile_image_url')
        .eq('is_active', true)
        .order('jersey_number');

      if (error) throw error;

      if (data) {
        const formationPlayers: FormationPlayerData[] = data.map(player => ({
          id: player.id,
          name: player.name,
          position: player.position,
          jerseyNumber: player.jersey_number || 0,
          imageUrl: player.profile_image_url || player.image_url,
          rating: 8.0, // Note par défaut
          isStarter: true
        }));

        setPlayers(formationPlayers);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Erreur lors du chargement des joueurs');
    } finally {
      setLoading(false);
    }
  };

  // Initialiser les positions des joueurs selon la formation et leur poste
  useEffect(() => {
    const formation = FORMATIONS[selectedFormation];
    if (formation && players.length > 0) {
      const newPositions: Record<string, FormationPosition> = {};
      
      // Grouper les joueurs par poste
      const playersByPosition = {
        GK: players.filter(p => p.position === 'Gardien'),
        DEF: players.filter(p => ['Défenseur Central', 'Arrière Gauche', 'Arrière Droit'].includes(p.position)),
        MID: players.filter(p => ['Milieu Central', 'Milieu Défensif', 'Milieu Offensif'].includes(p.position)),
        FWD: players.filter(p => ['Attaquant', 'Ailier Gauche', 'Ailier Droit'].includes(p.position))
      };

      // Assigner les positions selon la formation et le poste réel
      let positionIndex = 0;
      
      // Gardien (1 position)
      if (playersByPosition.GK[0] && formation.positions[positionIndex]) {
        newPositions[playersByPosition.GK[0].id] = formation.positions[positionIndex];
        positionIndex++;
      }
      
      // Défenseurs (positions suivantes selon formation)
      const defCount = formation.name === '4-3-3' ? 4 : formation.name === '3-5-2' ? 3 : 4;
      for (let i = 0; i < defCount && i < playersByPosition.DEF.length; i++) {
        if (formation.positions[positionIndex]) {
          newPositions[playersByPosition.DEF[i].id] = formation.positions[positionIndex];
          positionIndex++;
        }
      }
      
      // Milieux
      const midCount = formation.name === '4-3-3' ? 3 : formation.name === '3-5-2' ? 5 : 3;
      for (let i = 0; i < midCount && i < playersByPosition.MID.length; i++) {
        if (formation.positions[positionIndex]) {
          newPositions[playersByPosition.MID[i].id] = formation.positions[positionIndex];
          positionIndex++;
        }
      }
      
      // Attaquants
      const fwdCount = formation.name === '4-3-3' ? 3 : formation.name === '3-5-2' ? 2 : 3;
      for (let i = 0; i < fwdCount && i < playersByPosition.FWD.length; i++) {
        if (formation.positions[positionIndex]) {
          newPositions[playersByPosition.FWD[i].id] = formation.positions[positionIndex];
          positionIndex++;
        }
      }
      
      setPlayerPositions(newPositions);
    }
  }, [selectedFormation, players]);

  const handleFormationChange = (formation: string) => {
    setSelectedFormation(formation);
    toast.success(`Formation changée vers ${formation}`);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    const playerId = String(active.id);
    
    // Si on fait un drop sur un autre joueur, échanger les positions
    if (over && over.id !== active.id) {
      const targetPlayerId = String(over.id);
      handleSwapPlayers(playerId, targetPlayerId);
    } 
    // Sinon, déplacer le joueur selon le delta
    else if (delta.x !== 0 || delta.y !== 0) {
      const currentPosition = playerPositions[playerId];
      if (currentPosition) {
        // Calculer la nouvelle position en pourcentage
        const pitchElement = document.querySelector('.relative.w-full.h-\\[600px\\]');
        if (pitchElement) {
          const rect = pitchElement.getBoundingClientRect();
          const newX = Math.max(5, Math.min(95, currentPosition.x + (delta.x / rect.width) * 100));
          const newY = Math.max(5, Math.min(95, currentPosition.y + (delta.y / rect.height) * 100));
          
          setPlayerPositions(prev => ({
            ...prev,
            [playerId]: { x: newX, y: newY }
          }));
        }
      }
    }
    
    setActiveId(null);
  };

  const handleSwapPlayers = (playerId1: string, playerId2: string) => {
    const pos1 = playerPositions[playerId1];
    const pos2 = playerPositions[playerId2];
    
    if (pos1 && pos2) {
      setPlayerPositions(prev => ({
        ...prev,
        [playerId1]: pos2,
        [playerId2]: pos1
      }));
      toast.success('Positions échangées');
    }
  };

  const handleUpdatePlayer = (playerId: string, updates: Partial<FormationPlayerData>) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId ? { ...player, ...updates } : player
    ));
    toast.success('Joueur mis à jour');
  };

  const handleResetFormation = () => {
    const formation = FORMATIONS[selectedFormation];
    if (formation) {
      const newPositions: Record<string, FormationPosition> = {};
      players.slice(0, 11).forEach((player, index) => {
        if (formation.positions[index]) {
          newPositions[player.id] = formation.positions[index];
        }
      });
      setPlayerPositions(newPositions);
      toast.success('Formation réinitialisée');
    }
  };

  const handleSaveFormation = () => {
    const formationData = {
      formation: selectedFormation,
      players: players.slice(0, 11),
      positions: playerPositions
    };
    
    // Sauvegarder dans localStorage
    localStorage.setItem('savedFormation', JSON.stringify(formationData));
    toast.success('Formation sauvegardée');
  };

  const handleLoadFormation = () => {
    const saved = localStorage.getItem('savedFormation');
    if (saved) {
      try {
        const formationData = JSON.parse(saved);
        setSelectedFormation(formationData.formation);
        setPlayers(formationData.players);
        setPlayerPositions(formationData.positions);
        toast.success('Formation chargée');
      } catch (error) {
        toast.error('Erreur lors du chargement de la formation');
      }
    } else {
      toast.error('Aucune formation sauvegardée trouvée');
    }
  };

  const activeDragPlayer = activeId ? players.find(p => p.id === activeId) : null;
  const activeDragPosition = activeId ? playerPositions[activeId] : null;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des joueurs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="real-madrid" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="real-madrid" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Real Madrid
          </TabsTrigger>
          <TabsTrigger value="opposing-team" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Équipe Adverse
          </TabsTrigger>
        </TabsList>

        <TabsContent value="real-madrid">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Composition Real Madrid
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
          {/* Sélecteur de formation */}
          <FormationSelector
            selectedFormation={selectedFormation}
            onFormationChange={handleFormationChange}
          />

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleResetFormation} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={handleSaveFormation} variant="default" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button onClick={handleLoadFormation} variant="secondary" size="sm">
              Charger
            </Button>
          </div>

          {/* Information sur la formation */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Badge variant="default" className="text-lg px-3 py-1">
              {selectedFormation}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {FORMATIONS[selectedFormation]?.description}
            </div>
          </div>

          {/* Terrain de football avec drag & drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <FootballPitch>
              {players.slice(0, 11).map((player) => {
                const position = playerPositions[player.id];
                if (!position) return null;
                
                return (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    position={position}
                    onUpdatePlayer={handleUpdatePlayer}
                  />
                );
              })}
            </FootballPitch>

            <DragOverlay>
              {activeDragPlayer && activeDragPosition && (
                <PlayerCard
                  player={activeDragPlayer}
                  position={activeDragPosition}
                  onUpdatePlayer={handleUpdatePlayer}
                  isDragOverlay
                />
              )}
            </DragOverlay>
          </DndContext>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Instructions :</h4>
            <ul className="space-y-1 text-xs">
              <li>• Glissez-déposez les joueurs pour modifier leur position</li>
              <li>• Cliquez sur l'icône d'édition pour modifier les informations d'un joueur</li>
              <li>• Utilisez le sélecteur pour changer de formation</li>
              <li>• Sauvegardez vos formations personnalisées</li>
              <li>• Le bouton réinitialiser remet les positions par défaut de la formation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="opposing-team">
      <OpposingTeamFormation />
    </TabsContent>
  </Tabs>
</div>
);
};
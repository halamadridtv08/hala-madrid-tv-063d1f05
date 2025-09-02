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
import { FootballPitch } from './FootballPitch';
import { PlayerCard } from './PlayerCard';
import { FormationSelector } from './FormationSelector';
import { FormationPlayerData, FORMATIONS, DEFAULT_PLAYERS, FormationPosition } from '@/types/Formation';
import { RotateCcw, Save, Users } from 'lucide-react';

export const FormationManager: React.FC = () => {
  const [selectedFormation, setSelectedFormation] = useState<string>('4-3-3');
  const [players, setPlayers] = useState<FormationPlayerData[]>(DEFAULT_PLAYERS);
  const [playerPositions, setPlayerPositions] = useState<Record<string, FormationPosition>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Initialiser les positions des joueurs selon la formation
  useEffect(() => {
    const formation = FORMATIONS[selectedFormation];
    if (formation) {
      const newPositions: Record<string, FormationPosition> = {};
      players.slice(0, 11).forEach((player, index) => {
        if (formation.positions[index]) {
          newPositions[player.id] = formation.positions[index];
        }
      });
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
    const { active, delta } = event;
    const playerId = String(active.id);
    
    if (delta.x !== 0 || delta.y !== 0) {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des Compositions
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
    </div>
  );
};
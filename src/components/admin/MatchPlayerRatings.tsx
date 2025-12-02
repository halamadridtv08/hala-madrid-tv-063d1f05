import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Star } from 'lucide-react';

interface MatchPlayerRatingsProps {
  matchId: string;
}

interface FormationPlayer {
  id: string;
  player_name: string;
  player_position: string;
  jersey_number: number;
  player_image_url?: string;
  player_rating: number;
  is_starter: boolean;
}

export const MatchPlayerRatings: React.FC<MatchPlayerRatingsProps> = ({ matchId }) => {
  const [formations, setFormations] = useState<any>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [activeTeam, setActiveTeam] = useState<"real_madrid" | "opposing">("real_madrid");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (matchId) {
      fetchFormations();
    }
  }, [matchId]);

  const fetchFormations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('match_formations')
      .select(`
        id,
        team_type,
        formation,
        match_formation_players (
          id,
          player_name,
          player_position,
          jersey_number,
          player_image_url,
          player_rating,
          is_starter
        )
      `)
      .eq('match_id', matchId);

    if (error) {
      console.error('Error fetching formations:', error);
      toast.error('Erreur lors du chargement des compositions');
      setLoading(false);
      return;
    }

    const formationsData: any = {};
    const ratingsData: Record<string, number> = {};
    
    data?.forEach(formation => {
      formationsData[formation.team_type] = {
        id: formation.id,
        formation: formation.formation,
        players: formation.match_formation_players || []
      };
      
      // Initialize ratings
      formation.match_formation_players?.forEach((player: any) => {
        ratingsData[player.id] = player.player_rating || 0;
      });
    });

    setFormations(formationsData);
    setRatings(ratingsData);
    setLoading(false);
  };

  const handleRatingChange = (playerId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      setRatings(prev => ({ ...prev, [playerId]: numValue }));
    }
  };

  const saveRatings = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(ratings).map(([playerId, rating]) => 
        supabase
          .from('match_formation_players')
          .update({ player_rating: rating })
          .eq('id', playerId)
      );

      await Promise.all(updates);
      toast.success('Notes sauvegardées avec succès');
      fetchFormations();
    } catch (error) {
      console.error('Error saving ratings:', error);
      toast.error('Erreur lors de la sauvegarde des notes');
    } finally {
      setSaving(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'bg-green-500';
    if (rating >= 7) return 'bg-yellow-500';
    if (rating >= 6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const renderPlayers = (teamType: "real_madrid" | "opposing") => {
    const formation = formations[teamType];
    if (!formation) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>Aucune composition disponible pour cette équipe</p>
        </div>
      );
    }

    const starters = formation.players.filter((p: FormationPlayer) => p.is_starter);
    const substitutes = formation.players.filter((p: FormationPlayer) => !p.is_starter);

    return (
      <div className="space-y-6">
        {/* Titulaires */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5" />
            Titulaires ({starters.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starters.map((player: FormationPlayer) => (
              <Card key={player.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Photo */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary">
                        {player.player_image_url ? (
                          <img 
                            src={player.player_image_url} 
                            alt={player.player_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-foreground">
                              {player.player_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                          </div>
                        )}
                      </div>
                      <Badge className="absolute -top-1 -right-1 w-6 h-6 rounded-full p-0 flex items-center justify-center">
                        {player.jersey_number}
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{player.player_name}</p>
                      <p className="text-sm text-muted-foreground">{player.player_position}</p>
                    </div>

                    {/* Note */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={ratings[player.id] || 0}
                        onChange={(e) => handleRatingChange(player.id, e.target.value)}
                        className="w-16 text-center"
                      />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRatingColor(ratings[player.id] || 0)} text-white font-bold`}>
                        {(ratings[player.id] || 0).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Remplaçants */}
        {substitutes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Remplaçants ({substitutes.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {substitutes.map((player: FormationPlayer) => (
                <Card key={player.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Photo */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-muted">
                          {player.player_image_url ? (
                            <img 
                              src={player.player_image_url} 
                              alt={player.player_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              <span className="text-sm font-bold text-primary-foreground">
                                {player.player_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </span>
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="absolute -top-1 -right-1 w-6 h-6 rounded-full p-0 flex items-center justify-center">
                          {player.jersey_number}
                        </Badge>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{player.player_name}</p>
                        <p className="text-sm text-muted-foreground">{player.player_position}</p>
                      </div>

                      {/* Note */}
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={ratings[player.id] || 0}
                          onChange={(e) => handleRatingChange(player.id, e.target.value)}
                          className="w-16 text-center"
                        />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRatingColor(ratings[player.id] || 0)} text-white font-bold`}>
                          {(ratings[player.id] || 0).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Notation des joueurs
          </CardTitle>
          <Button onClick={saveRatings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTeam} onValueChange={value => setActiveTeam(value as "real_madrid" | "opposing")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="real_madrid">Real Madrid</TabsTrigger>
            <TabsTrigger value="opposing">Équipe Adverse</TabsTrigger>
          </TabsList>

          <TabsContent value="real_madrid">
            {renderPlayers("real_madrid")}
          </TabsContent>

          <TabsContent value="opposing">
            {renderPlayers("opposing")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

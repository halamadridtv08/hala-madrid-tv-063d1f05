
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { importRealMadridPlayers, importRealMadridCoaches } from '@/utils/importPlayers';
import { Trash2, Edit2, Plus, Upload } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number | null;
  age: number | null;
  nationality: string | null;
  image_url: string | null;
  bio: string | null;
  stats: any;
  is_active: boolean | null;
}

interface Coach {
  id: string;
  name: string;
  role: string;
  age: number | null;
  nationality: string | null;
  image_url: string | null;
  bio: string | null;
  experience_years: number | null;
  is_active: boolean | null;
}

const Admin = () => {
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

  const [playerForm, setPlayerForm] = useState({
    name: '',
    position: '',
    jersey_number: '',
    age: '',
    nationality: '',
    image_url: '',
    bio: '',
    secondaryPosition: ''
  });

  const [coachForm, setCoachForm] = useState({
    name: '',
    role: '',
    age: '',
    nationality: '',
    image_url: '',
    bio: '',
    experience_years: ''
  });

  // Charger les données au montage du composant
  useEffect(() => {
    loadPlayers();
    loadCoaches();
  }, []);

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('jersey_number', { ascending: true });
      
      if (error) throw error;
      
      console.log('Joueurs chargés:', data);
      setPlayers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des joueurs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les joueurs",
        variant: "destructive"
      });
    }
  };

  const loadCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      console.log('Entraîneurs chargés:', data);
      setCoaches(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des entraîneurs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les entraîneurs",
        variant: "destructive"
      });
    }
  };

  const handleImportPlayers = async () => {
    setLoading(true);
    try {
      const success = await importRealMadridPlayers();
      if (success) {
        toast({
          title: "Succès",
          description: "Joueurs du Real Madrid importés avec succès"
        });
        loadPlayers();
      } else {
        toast({
          title: "Information",
          description: "Les joueurs sont déjà présents dans la base de données"
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'importation des joueurs",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleImportCoaches = async () => {
    setLoading(true);
    try {
      const success = await importRealMadridCoaches();
      if (success) {
        toast({
          title: "Succès",
          description: "Staff du Real Madrid importé avec succès"
        });
        loadCoaches();
      } else {
        toast({
          title: "Information",
          description: "Le staff est déjà présent dans la base de données"
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'importation du staff",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const playerData = {
        name: playerForm.name,
        position: playerForm.position,
        jersey_number: playerForm.jersey_number ? parseInt(playerForm.jersey_number) : null,
        age: playerForm.age ? parseInt(playerForm.age) : null,
        nationality: playerForm.nationality || null,
        image_url: playerForm.image_url || null,
        bio: playerForm.bio || null,
        stats: {
          secondaryPosition: playerForm.secondaryPosition === 'none' ? null : playerForm.secondaryPosition
        },
        is_active: true
      };

      if (editingPlayer) {
        const { error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', editingPlayer.id);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Joueur modifié avec succès"
        });
      } else {
        const { error } = await supabase
          .from('players')
          .insert([playerData]);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Joueur ajouté avec succès"
        });
      }
      
      // Réinitialiser le formulaire et recharger les données
      resetPlayerForm();
      loadPlayers();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement du joueur",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const handleCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const coachData = {
        name: coachForm.name,
        role: coachForm.role,
        age: coachForm.age ? parseInt(coachForm.age) : null,
        nationality: coachForm.nationality || null,
        image_url: coachForm.image_url || null,
        bio: coachForm.bio || null,
        experience_years: coachForm.experience_years ? parseInt(coachForm.experience_years) : null,
        is_active: true
      };

      if (editingCoach) {
        const { error } = await supabase
          .from('coaches')
          .update(coachData)
          .eq('id', editingCoach.id);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Entraîneur modifié avec succès"
        });
      } else {
        const { error } = await supabase
          .from('coaches')
          .insert([coachData]);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Entraîneur ajouté avec succès"
        });
      }
      
      // Réinitialiser le formulaire et recharger les données
      resetCoachForm();
      loadCoaches();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement de l'entraîneur",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const deletePlayer = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) return;
    
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Joueur supprimé avec succès"
      });
      
      loadPlayers();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du joueur",
        variant: "destructive"
      });
    }
  };

  const deleteCoach = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet entraîneur ?')) return;
    
    try {
      const { error } = await supabase
        .from('coaches')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Entraîneur supprimé avec succès"
      });
      
      loadCoaches();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de l'entraîneur",
        variant: "destructive"
      });
    }
  };

  const editPlayer = (player: Player) => {
    setEditingPlayer(player);
    setPlayerForm({
      name: player.name,
      position: player.position,
      jersey_number: player.jersey_number?.toString() || '',
      age: player.age?.toString() || '',
      nationality: player.nationality || '',
      image_url: player.image_url || '',
      bio: player.bio || '',
      secondaryPosition: player.stats?.secondaryPosition || 'none'
    });
  };

  const editCoach = (coach: Coach) => {
    setEditingCoach(coach);
    setCoachForm({
      name: coach.name,
      role: coach.role,
      age: coach.age?.toString() || '',
      nationality: coach.nationality || '',
      image_url: coach.image_url || '',
      bio: coach.bio || '',
      experience_years: coach.experience_years?.toString() || ''
    });
  };

  const resetPlayerForm = () => {
    setEditingPlayer(null);
    setPlayerForm({
      name: '',
      position: '',
      jersey_number: '',
      age: '',
      nationality: '',
      image_url: '',
      bio: '',
      secondaryPosition: ''
    });
  };

  const resetCoachForm = () => {
    setEditingCoach(null);
    setCoachForm({
      name: '',
      role: '',
      age: '',
      nationality: '',
      image_url: '',
      bio: '',
      experience_years: ''
    });
  };

  const handlePlayerImageUpload = (url: string) => {
    setPlayerForm(prev => ({ ...prev, image_url: url }));
  };

  const handleCoachImageUpload = (url: string) => {
    setCoachForm(prev => ({ ...prev, image_url: url }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>
      
      <Tabs defaultValue="players" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="players">Gestion des Joueurs</TabsTrigger>
          <TabsTrigger value="coaches">Gestion des Entraîneurs</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={handleImportPlayers} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importer effectif RM
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire d'ajout/modification de joueur */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingPlayer ? 'Modifier le joueur' : 'Ajouter un joueur'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlayerSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="player-name">Nom *</Label>
                    <Input
                      id="player-name"
                      value={playerForm.name}
                      onChange={(e) => setPlayerForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="player-position">Position *</Label>
                    <Select
                      value={playerForm.position}
                      onValueChange={(value) => setPlayerForm(prev => ({ ...prev, position: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gardien">Gardien</SelectItem>
                        <SelectItem value="défenseur">Défenseur</SelectItem>
                        <SelectItem value="milieu">Milieu</SelectItem>
                        <SelectItem value="attaquant">Attaquant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="player-secondary-position">Position secondaire</Label>
                    <Select
                      value={playerForm.secondaryPosition}
                      onValueChange={(value) => setPlayerForm(prev => ({ ...prev, secondaryPosition: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Position secondaire (optionnel)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        <SelectItem value="défenseur central">Défenseur central</SelectItem>
                        <SelectItem value="défenseur latéral gauche">Défenseur latéral gauche</SelectItem>
                        <SelectItem value="défenseur latéral droite">Défenseur latéral droite</SelectItem>
                        <SelectItem value="milieu de terrain">Milieu de terrain</SelectItem>
                        <SelectItem value="milieu offensif">Milieu offensif</SelectItem>
                        <SelectItem value="ailier gauche">Ailier gauche</SelectItem>
                        <SelectItem value="ailier droit">Ailier droit</SelectItem>
                        <SelectItem value="attaquant">Attaquant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="player-jersey">Numéro</Label>
                      <Input
                        id="player-jersey"
                        type="number"
                        value={playerForm.jersey_number}
                        onChange={(e) => setPlayerForm(prev => ({ ...prev, jersey_number: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="player-age">Âge</Label>
                      <Input
                        id="player-age"
                        type="number"
                        value={playerForm.age}
                        onChange={(e) => setPlayerForm(prev => ({ ...prev, age: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="player-nationality">Nationalité</Label>
                    <Input
                      id="player-nationality"
                      value={playerForm.nationality}
                      onChange={(e) => setPlayerForm(prev => ({ ...prev, nationality: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Photo de profil</Label>
                    <MediaUploader
                      onSuccess={handlePlayerImageUpload}
                      acceptTypes="image/*"
                      maxSizeMB={10}
                      folderPath="players"
                      bucketName="media"
                      buttonText="Choisir une photo"
                      currentValue={playerForm.image_url}
                    />
                  </div>

                  <div>
                    <Label htmlFor="player-bio">Biographie</Label>
                    <Textarea
                      id="player-bio"
                      value={playerForm.bio}
                      onChange={(e) => setPlayerForm(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {editingPlayer ? 'Modifier' : 'Ajouter'}
                    </Button>
                    {editingPlayer && (
                      <Button type="button" variant="outline" onClick={resetPlayerForm}>
                        Annuler
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Liste des joueurs */}
            <Card>
              <CardHeader>
                <CardTitle>Joueurs ({players.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {player.image_url && (
                        <img
                          src={player.image_url}
                          alt={player.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{player.name}</h3>
                        <div className="flex gap-2 text-sm text-gray-600">
                          <Badge variant="outline">{player.position}</Badge>
                          {player.jersey_number && (
                            <Badge variant="secondary">#{player.jersey_number}</Badge>
                          )}
                          {player.stats?.secondaryPosition && (
                            <Badge variant="outline">{player.stats.secondaryPosition}</Badge>
                          )}
                        </div>
                        {player.nationality && (
                          <p className="text-sm text-gray-500">{player.nationality}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => editPlayer(player)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deletePlayer(player.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coaches" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={handleImportCoaches} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importer staff RM
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire d'ajout/modification d'entraîneur */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingCoach ? 'Modifier l\'entraîneur' : 'Ajouter un entraîneur'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCoachSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="coach-name">Nom *</Label>
                    <Input
                      id="coach-name"
                      value={coachForm.name}
                      onChange={(e) => setCoachForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="coach-role">Rôle *</Label>
                    <Input
                      id="coach-role"
                      value={coachForm.role}
                      onChange={(e) => setCoachForm(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="ex: Entraîneur principal, Entraîneur adjoint..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coach-age">Âge</Label>
                      <Input
                        id="coach-age"
                        type="number"
                        value={coachForm.age}
                        onChange={(e) => setCoachForm(prev => ({ ...prev, age: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="coach-experience">Expérience (années)</Label>
                      <Input
                        id="coach-experience"
                        type="number"
                        value={coachForm.experience_years}
                        onChange={(e) => setCoachForm(prev => ({ ...prev, experience_years: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="coach-nationality">Nationalité</Label>
                    <Input
                      id="coach-nationality"
                      value={coachForm.nationality}
                      onChange={(e) => setCoachForm(prev => ({ ...prev, nationality: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Photo de profil</Label>
                    <MediaUploader
                      onSuccess={handleCoachImageUpload}
                      acceptTypes="image/*"
                      maxSizeMB={10}
                      folderPath="coaches"
                      bucketName="media"
                      buttonText="Choisir une photo"
                      currentValue={coachForm.image_url}
                    />
                  </div>

                  <div>
                    <Label htmlFor="coach-bio">Biographie</Label>
                    <Textarea
                      id="coach-bio"
                      value={coachForm.bio}
                      onChange={(e) => setCoachForm(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {editingCoach ? 'Modifier' : 'Ajouter'}
                    </Button>
                    {editingCoach && (
                      <Button type="button" variant="outline" onClick={resetCoachForm}>
                        Annuler
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Liste des entraîneurs */}
            <Card>
              <CardHeader>
                <CardTitle>Staff technique ({coaches.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {coaches.map((coach) => (
                  <div key={coach.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {coach.image_url && (
                        <img
                          src={coach.image_url}
                          alt={coach.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{coach.name}</h3>
                        <Badge variant="outline">{coach.role}</Badge>
                        {coach.nationality && (
                          <p className="text-sm text-gray-500 mt-1">{coach.nationality}</p>
                        )}
                        {coach.experience_years && (
                          <p className="text-sm text-gray-500">{coach.experience_years} ans d'expérience</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => editCoach(coach)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteCoach(coach.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;

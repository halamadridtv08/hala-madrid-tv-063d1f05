import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Users, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminMenuBar } from "@/components/layout/AdminMenuBar";

import { ImportPlayersButton } from "@/components/admin/ImportPlayersButton";
import { MediaUploader } from "@/components/admin/MediaUploader";

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number | null;
  age: number | null;
  nationality: string | null;
  height: string | null;
  weight: string | null;
  image_url: string | null;
  bio: string | null;
  stats?: {
    secondaryPosition?: string;
  };
}

interface Coach {
  id: string;
  name: string;
  role: string;
  age: number | null;
  nationality: string | null;
  experience_years: number | null;
  image_url: string | null;
  bio: string | null;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("content");
  const [creationType, setCreationType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [playersData, setPlayersData] = useState<Player[] | null>(null);
  const [coachesData, setCoachesData] = useState<Coach[] | null>(null);
  const { toast } = useToast();

  const [playerForm, setPlayerForm] = useState({
    name: "",
    position: "",
    jersey_number: null,
    age: null,
    nationality: "",
    height: "",
    weight: "",
    image_url: "",
    bio: "",
  });

  const [coachForm, setCoachForm] = useState({
    name: "",
    role: "",
    age: null,
    nationality: "",
    experience_years: null,
    image_url: "",
    bio: "",
  });

  // Fetch players data
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from("players")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching players:", error);
          toast({
            title: "Erreur",
            description: "Erreur lors de la récupération des joueurs",
            variant: "destructive",
          });
        }

        setPlayersData(data);
      } catch (error) {
        console.error("Unexpected error fetching players:", error);
        toast({
          title: "Erreur",
          description: "Erreur inattendue lors de la récupération des joueurs",
          variant: "destructive",
        });
      }
    };

    fetchPlayers();
  }, []);

  // Fetch coaches data
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const { data, error } = await supabase
          .from("coaches")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching coaches:", error);
          toast({
            title: "Erreur",
            description: "Erreur lors de la récupération du staff technique",
            variant: "destructive",
          });
        }

        setCoachesData(data);
      } catch (error) {
        console.error("Unexpected error fetching coaches:", error);
        toast({
          title: "Erreur",
          description:
            "Erreur inattendue lors de la récupération du staff technique",
          variant: "destructive",
        });
      }
    };

    fetchCoaches();
  }, []);

  const handlePlayerInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPlayerForm({
      ...playerForm,
      [name]: value,
    });
  };

  const handleCoachInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCoachForm({
      ...coachForm,
      [name]: value,
    });
  };

  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingPlayer) {
        // Update existing player
        const { data, error } = await supabase
          .from("players")
          .update(playerForm)
          .eq("id", editingPlayer.id);

        if (error) {
          console.error("Error updating player:", error);
          toast({
            title: "Erreur",
            description: "Erreur lors de la mise à jour du joueur",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Succès",
            description: "Joueur mis à jour avec succès",
          });
          setPlayersData(
            playersData?.map((player) =>
              player.id === editingPlayer.id ? { ...player, ...playerForm } : player
            ) || null
          );
        }
      } else {
        // Create new player
        const { data, error } = await supabase.from("players").insert([playerForm]);

        if (error) {
          console.error("Error creating player:", error);
          toast({
            title: "Erreur",
            description: "Erreur lors de la création du joueur",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Succès",
            description: "Joueur créé avec succès",
          });
          setPlayersData([...(playersData || []), ...data]);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la soumission du formulaire",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setEditingPlayer(null);
      setCreationType(null);
      setPlayerForm({
        name: "",
        position: "",
        jersey_number: null,
        age: null,
        nationality: "",
        height: "",
        weight: "",
        image_url: "",
        bio: "",
      });
    }
  };

  const handleCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCoach) {
        // Update existing coach
        const { data, error } = await supabase
          .from("coaches")
          .update(coachForm)
          .eq("id", editingCoach.id);

        if (error) {
          console.error("Error updating coach:", error);
          toast({
            title: "Erreur",
            description: "Erreur lors de la mise à jour du membre du staff",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Succès",
            description: "Membre du staff mis à jour avec succès",
          });
          setCoachesData(
            coachesData?.map((coach) =>
              coach.id === editingCoach.id ? { ...coach, ...coachForm } : coach
            ) || null
          );
        }
      } else {
        // Create new coach
        const { data, error } = await supabase.from("coaches").insert([coachForm]);

        if (error) {
          console.error("Error creating coach:", error);
          toast({
            title: "Erreur",
            description: "Erreur lors de la création du membre du staff",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Succès",
            description: "Membre du staff créé avec succès",
          });
          setCoachesData([...(coachesData || []), ...data]);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la soumission du formulaire",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setEditingCoach(null);
      setCreationType(null);
      setCoachForm({
        name: "",
        role: "",
        age: null,
        nationality: "",
        experience_years: null,
        image_url: "",
        bio: "",
      });
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase.from("players").delete().eq("id", playerId);

      if (error) {
        console.error("Error deleting player:", error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la suppression du joueur",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Joueur supprimé avec succès",
        });
        setPlayersData(playersData?.filter((player) => player.id !== playerId) || null);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la suppression du joueur",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCoach = async (coachId: string) => {
    try {
      const { error } = await supabase.from("coaches").delete().eq("id", coachId);

      if (error) {
        console.error("Error deleting coach:", error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la suppression du membre du staff",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Membre du staff supprimé avec succès",
        });
        setCoachesData(coachesData?.filter((coach) => coach.id !== coachId) || null);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la suppression du membre du staff",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-madrid-navy">Administration</h1>
          <p className="text-muted-foreground mt-2">Gérez le contenu et les données du site</p>
        </div>
        <AdminMenuBar />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="players">Joueurs</TabsTrigger>
          <TabsTrigger value="coaches">Staff</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenu du site</CardTitle>
              <CardDescription>
                Gérez les articles, vidéos et autres contenus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Liste des contenus</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Date de publication</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">1</TableCell>
                    <TableCell>Article</TableCell>
                    <TableCell>Titre de l'article</TableCell>
                    <TableCell>2024-01-01</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Modifier
                      </Button>
                      <Button variant="destructive" size="sm">
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">2</TableCell>
                    <TableCell>Vidéo</TableCell>
                    <TableCell>Titre de la vidéo</TableCell>
                    <TableCell>2024-01-02</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Modifier
                      </Button>
                      <Button variant="destructive" size="sm">
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>
                      Total: 2 contenus
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestion des Joueurs
                  </CardTitle>
                  <CardDescription>
                    Gérez l'effectif complet avec toutes les positions
                  </CardDescription>
                </div>
                <ImportPlayersButton />
              </div>
            </CardHeader>
            <CardContent>
              {/* Formulaire de création/édition de joueur */}
              {creationType === "player" && (
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingPlayer ? "Modifier le joueur" : "Ajouter un nouveau joueur"}
                  </h3>
                  <form onSubmit={handlePlayerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="player-name">Nom complet *</Label>
                      <Input
                        id="player-name"
                        name="name"
                        value={playerForm.name}
                        onChange={handlePlayerInputChange}
                        required
                        placeholder="ex: Karim Benzema"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="player-position">Position principale *</Label>
                      <Select value={playerForm.position} onValueChange={(value) => setPlayerForm({...playerForm, position: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gardien">Gardien</SelectItem>
                          <SelectItem value="Défenseur">Défenseur</SelectItem>
                          <SelectItem value="Milieu">Milieu</SelectItem>
                          <SelectItem value="Attaquant">Attaquant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="player-jersey">Numéro de maillot</Label>
                      <Input
                        id="player-jersey"
                        name="jersey_number"
                        type="number"
                        min="1"
                        max="99"
                        value={playerForm.jersey_number || ''}
                        onChange={handlePlayerInputChange}
                        placeholder="ex: 9"
                      />
                    </div>

                    <div>
                      <Label htmlFor="player-age">Âge</Label>
                      <Input
                        id="player-age"
                        name="age"
                        type="number"
                        min="16"
                        max="45"
                        value={playerForm.age || ''}
                        onChange={handlePlayerInputChange}
                        placeholder="ex: 25"
                      />
                    </div>

                    <div>
                      <Label htmlFor="player-nationality">Nationalité</Label>
                      <Input
                        id="player-nationality"
                        name="nationality"
                        value={playerForm.nationality}
                        onChange={handlePlayerInputChange}
                        placeholder="ex: France"
                      />
                    </div>

                    <div>
                      <Label htmlFor="player-height">Taille</Label>
                      <Input
                        id="player-height"
                        name="height"
                        value={playerForm.height}
                        onChange={handlePlayerInputChange}
                        placeholder="ex: 185 cm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Photo de profil</Label>
                      <MediaUploader
                        onSuccess={(url) => setPlayerForm({...playerForm, image_url: url})}
                        acceptTypes="image/*"
                        maxSizeMB={10}
                        folderPath="players"
                        buttonText="Ajouter une photo"
                        currentValue={playerForm.image_url}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="player-bio">Biographie</Label>
                      <textarea
                        id="player-bio"
                        name="bio"
                        value={playerForm.bio}
                        onChange={handlePlayerInputChange}
                        className="w-full min-h-[100px] p-3 border rounded-md"
                        placeholder="Biographie du joueur..."
                      />
                    </div>

                    <div className="md:col-span-2 flex gap-2">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? "Enregistrement..." : editingPlayer ? "Mettre à jour" : "Créer le joueur"}
                      </Button>
                      {editingPlayer && (
                        <Button type="button" variant="outline" onClick={() => {
                          setEditingPlayer(null);
                          setCreationType(null);
                          setPlayerForm({
                            name: "",
                            position: "",
                            jersey_number: null,
                            age: null,
                            nationality: "",
                            height: "",
                            weight: "",
                            image_url: "",
                            bio: ""
                          });
                        }}>
                          Annuler
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Liste des joueurs */}
              <div className="grid gap-4">
                {playersData?.map((player) => (
                  <Card key={player.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {player.image_url ? (
                            <img 
                              src={player.image_url} 
                              alt={player.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-madrid-blue text-white font-bold">
                              {player.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{player.name}</h3>
                            {player.jersey_number && (
                              <span className="bg-madrid-blue text-white px-2 py-1 rounded text-sm font-bold">
                                #{player.jersey_number}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span className="bg-gray-100 px-2 py-1 rounded">{player.position}</span>
                            {player.stats?.secondaryPosition && (
                              <span className="bg-gray-100 px-2 py-1 rounded">{player.stats.secondaryPosition}</span>
                            )}
                            {player.age && <span>{player.age} ans</span>}
                            {player.nationality && <span>{player.nationality}</span>}
                            {player.height && <span>{player.height}</span>}
                          </div>
                          {player.bio && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{player.bio}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPlayer(player);
                              setCreationType("player");
                              setPlayerForm({
                                name: player.name,
                                position: player.position,
                                jersey_number: player.jersey_number,
                                age: player.age,
                                nationality: player.nationality || "",
                                height: player.height || "",
                                weight: player.weight || "",
                                image_url: player.image_url || "",
                                bio: player.bio || ""
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePlayer(player.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coaches" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Gestion du Staff Technique
                  </CardTitle>
                  <CardDescription>
                    Gérez l'ensemble du staff technique et encadrement
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Formulaire de création/édition d'entraîneur */}
              {creationType === "coach" && (
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingCoach ? "Modifier le membre du staff" : "Ajouter un nouveau membre du staff"}
                  </h3>
                  <form onSubmit={handleCoachSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coach-name">Nom complet *</Label>
                      <Input
                        id="coach-name"
                        name="name"
                        value={coachForm.name}
                        onChange={handleCoachInputChange}
                        required
                        placeholder="ex: Carlo Ancelotti"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="coach-role">Rôle *</Label>
                      <Input
                        id="coach-role"
                        name="role"
                        value={coachForm.role}
                        onChange={handleCoachInputChange}
                        required
                        placeholder="ex: Entraîneur principal"
                      />
                    </div>

                    <div>
                      <Label htmlFor="coach-age">Âge</Label>
                      <Input
                        id="coach-age"
                        name="age"
                        type="number"
                        min="25"
                        max="80"
                        value={coachForm.age || ''}
                        onChange={handleCoachInputChange}
                        placeholder="ex: 64"
                      />
                    </div>

                    <div>
                      <Label htmlFor="coach-nationality">Nationalité</Label>
                      <Input
                        id="coach-nationality"
                        name="nationality"
                        value={coachForm.nationality}
                        onChange={handleCoachInputChange}
                        placeholder="ex: Italie"
                      />
                    </div>

                    <div>
                      <Label htmlFor="coach-experience">Années d'expérience</Label>
                      <Input
                        id="coach-experience"
                        name="experience_years"
                        type="number"
                        min="0"
                        max="50"
                        value={coachForm.experience_years || ''}
                        onChange={handleCoachInputChange}
                        placeholder="ex: 30"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Photo de profil</Label>
                      <MediaUploader
                        onSuccess={(url) => setCoachForm({...coachForm, image_url: url})}
                        acceptTypes="image/*"
                        maxSizeMB={10}
                        folderPath="coaches"
                        buttonText="Ajouter une photo"
                        currentValue={coachForm.image_url}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="coach-bio">Biographie</Label>
                      <textarea
                        id="coach-bio"
                        name="bio"
                        value={coachForm.bio}
                        onChange={handleCoachInputChange}
                        className="w-full min-h-[100px] p-3 border rounded-md"
                        placeholder="Biographie du membre du staff..."
                      />
                    </div>

                    <div className="md:col-span-2 flex gap-2">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? "Enregistrement..." : editingCoach ? "Mettre à jour" : "Ajouter au staff"}
                      </Button>
                      {editingCoach && (
                        <Button type="button" variant="outline" onClick={() => {
                          setEditingCoach(null);
                          setCreationType(null);
                          setCoachForm({
                            name: "",
                            role: "",
                            age: null,
                            nationality: "",
                            experience_years: null,
                            image_url: "",
                            bio: ""
                          });
                        }}>
                          Annuler
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Liste du staff */}
              <div className="grid gap-4">
                {coachesData?.map((coach) => (
                  <Card key={coach.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {coach.image_url ? (
                            <img 
                              src={coach.image_url} 
                              alt={coach.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-green-600 text-white font-bold">
                              {coach.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{coach.name}</h3>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                              {coach.role}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            {coach.age && <span>{coach.age} ans</span>}
                            {coach.nationality && <span>{coach.nationality}</span>}
                            {coach.experience_years && <span>{coach.experience_years} ans d'expérience</span>}
                          </div>
                          {coach.bio && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{coach.bio}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCoach(coach);
                              setCreationType("coach");
                              setCoachForm({
                                name: coach.name,
                                role: coach.role,
                                age: coach.age,
                                nationality: coach.nationality || "",
                                experience_years: coach.experience_years,
                                image_url: coach.image_url || "",
                                bio: coach.bio || ""
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCoach(coach.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du site</CardTitle>
              <CardDescription>
                Gérez les paramètres généraux du site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenu des paramètres</p>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

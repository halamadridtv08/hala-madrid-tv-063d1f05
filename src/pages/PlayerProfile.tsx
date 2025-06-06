import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Flag, Shield, Star, User, Heart, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/Player";

const PlayerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    const fetchPlayer = async () => {
      if (!id) return;
      
      try {
        const { data: playerData, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching player:', error);
          setPlayer(null);
        } else {
          setPlayer(playerData);
          
          // Check if this player is in favorites
          const favoritePlayers = JSON.parse(localStorage.getItem('favoritePlayers') || '[]');
          setIsFavorite(favoritePlayers.includes(Number(id)));
        }
      } catch (error) {
        console.error('Error fetching player:', error);
        setPlayer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const calculateAge = (birthDateString: string) => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getPositionColor = (pos: string) => {
    if (pos.includes("Gardien")) return "bg-yellow-600 hover:bg-yellow-700";
    if (pos.includes("Défenseur")) return "bg-blue-600 hover:bg-blue-700";
    if (pos.includes("Milieu")) return "bg-green-600 hover:bg-green-700";
    if (pos.includes("Ailier") || pos.includes("Attaquant")) return "bg-red-600 hover:bg-red-700";
    return "bg-gray-600 hover:bg-gray-700";
  };

  const getPositionIcon = (pos: string) => {
    if (pos.includes("Gardien")) return <Star className="h-5 w-5" />;
    if (pos.includes("Défenseur")) return <Shield className="h-5 w-5" />;
    if (pos.includes("Milieu")) return <Award className="h-5 w-5" />;
    if (pos.includes("Ailier") || pos.includes("Attaquant")) return <Flag className="h-5 w-5" />;
    return <User className="h-5 w-5" />;
  };

  const toggleFavorite = () => {
    if (!player) return;
    
    // Get current favorites from localStorage
    const favoritePlayers = JSON.parse(localStorage.getItem('favoritePlayers') || '[]');
    
    let updatedFavorites;
    if (isFavorite) {
      // Remove player from favorites
      updatedFavorites = favoritePlayers.filter((playerId: number) => playerId !== parseInt(player.id));
    } else {
      // Add player to favorites
      updatedFavorites = [...favoritePlayers, parseInt(player.id)];
    }
    
    // Update localStorage
    localStorage.setItem('favoritePlayers', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="madrid-container py-8">
          <Button 
            onClick={() => navigate('/players')} 
            variant="outline" 
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'effectif
          </Button>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-madrid-blue"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!player) {
    return (
      <>
        <Navbar />
        <main className="madrid-container py-8">
          <Button 
            onClick={() => navigate('/players')} 
            variant="outline" 
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'effectif
          </Button>
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">Joueur non trouvé</h3>
                <p className="mt-1 text-gray-500">Le joueur que vous recherchez n'existe pas</p>
                <Button onClick={() => navigate('/players')} variant="outline" className="mt-4">
                  Voir tous les joueurs
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  // Extract stats from player data
  const playerStats = player.stats || {};
  const secondaryPosition = playerStats.secondaryPosition || playerStats.secondary_position;

  return (
    <>
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          <Button 
            onClick={() => navigate('/players')} 
            variant="outline" 
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'effectif
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Colonne de gauche avec photo et infos */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-0">
                  <div className="bg-madrid-blue text-white p-4">
                    <div className="flex justify-between items-center">
                      <h1 className="text-2xl font-bold">{player.name}</h1>
                      <Button 
                        onClick={toggleFavorite} 
                        variant="ghost" 
                        size="sm"
                        className={`text-white hover:bg-blue-700 p-2 h-8 w-8 ${isFavorite ? 'bg-blue-700' : ''}`}
                      >
                        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-transparent'}`} />
                        <span className="sr-only">{isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-madrid-gold text-black">
                        N°{player.jersey_number || 0}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {getPositionIcon(player.position)}
                        <span>{player.position}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={player.image_url || `https://placehold.co/300x400/1a365d/ffffff/?text=${player.name.charAt(0)}`}
                        alt={player.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nationalité:</span>
                        <span className="font-semibold">{player.nationality || "Non renseigné"}</span>
                      </div>
                      {player.age && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Âge:</span>
                          <span className="font-semibold">{player.age} ans</span>
                        </div>
                      )}
                      {player.height && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Taille:</span>
                          <span className="font-semibold">{player.height}</span>
                        </div>
                      )}
                      {player.weight && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Poids:</span>
                          <span className="font-semibold">{player.weight}</span>
                        </div>
                      )}
                      {secondaryPosition && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Poste secondaire:</span>
                          <span className="font-semibold">{secondaryPosition}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Colonne de droite avec onglets d'informations */}
            <div className="md:col-span-2">
              <Tabs defaultValue="bio">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="bio">Biographie</TabsTrigger>
                  <TabsTrigger value="stats">Statistiques</TabsTrigger>
                  <TabsTrigger value="media">Médias</TabsTrigger>
                </TabsList>
                
                <TabsContent value="bio">
                  <Card>
                    <CardHeader>
                      <h2 className="text-2xl font-bold">Biographie</h2>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg">{player.bio || player.biography || "Biographie non disponible"}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        {player.position.includes("Gardien") ? (
                          <>
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                              <div className="text-4xl font-bold text-madrid-blue">{playerStats.cleanSheets || 0}</div>
                              <div className="text-gray-500">Clean Sheets</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                              <div className="text-4xl font-bold text-madrid-blue">{playerStats.matches || 0}</div>
                              <div className="text-gray-500">Matchs joués</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                              <div className="text-4xl font-bold text-madrid-blue">{playerStats.goalsConceded || 0}</div>
                              <div className="text-gray-500">Buts encaissés</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                              <div className="text-4xl font-bold text-madrid-blue">{Math.round((playerStats.minutesPlayed || 0) / 60)}</div>
                              <div className="text-gray-500">Heures de jeu</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                              <div className="text-4xl font-bold text-madrid-blue">{playerStats.goals || 0}</div>
                              <div className="text-gray-500">Buts</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                              <div className="text-4xl font-bold text-madrid-blue">{playerStats.matches || 0}</div>
                              <div className="text-gray-500">Matchs joués</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                              <div className="text-4xl font-bold text-madrid-blue">{playerStats.assists || 0}</div>
                              <div className="text-gray-500">Passes décisives</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                              <div className="text-4xl font-bold text-madrid-blue">{Math.round((playerStats.minutesPlayed || 0) / 60)}</div>
                              <div className="text-gray-500">Heures de jeu</div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="stats">
                  <Card>
                    <CardHeader>
                      <h2 className="text-2xl font-bold">Statistiques détaillées 2024/2025</h2>
                    </CardHeader>
                    <CardContent>
                      {playerStats.matches > 0 ? (
                        <div className="mt-8">
                          <h3 className="text-xl font-bold mb-4">Statistiques générales</h3>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {player.position.includes("Gardien") ? (
                              <>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                                  <div className="text-3xl font-bold text-madrid-blue">
                                    {(((playerStats.cleanSheets || 0) / (playerStats.matches || 1)) * 100).toFixed(0)}%
                                  </div>
                                  <div className="text-sm text-gray-500">% Clean Sheets</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                                  <div className="text-3xl font-bold text-madrid-blue">
                                    {((playerStats.goalsConceded || 0) / (playerStats.matches || 1)).toFixed(2)}
                                  </div>
                                  <div className="text-sm text-gray-500">Buts encaissés/match</div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                                  <div className="text-3xl font-bold text-madrid-blue">
                                    {((playerStats.goals || 0) / (playerStats.matches || 1)).toFixed(2)}
                                  </div>
                                  <div className="text-sm text-gray-500">Buts par match</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                                  <div className="text-3xl font-bold text-madrid-blue">
                                    {playerStats.goals ? ((playerStats.minutesPlayed || 0) / playerStats.goals).toFixed(0) : "N/A"}
                                  </div>
                                  <div className="text-sm text-gray-500">Minutes par but</div>
                                </div>
                              </>
                            )}
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                              <div className="text-3xl font-bold text-madrid-blue">
                                {((playerStats.minutesPlayed || 0) / (playerStats.matches || 1)).toFixed(0)}
                              </div>
                              <div className="text-sm text-gray-500">Min. par match</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                              <div className="text-3xl font-bold text-madrid-blue">
                                {playerStats.matches || 0}
                              </div>
                              <div className="text-sm text-gray-500">Matchs joués</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500">Aucune statistique disponible pour ce joueur</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="media">
                  <Card>
                    <CardHeader>
                      <h2 className="text-2xl font-bold">Photos et vidéos</h2>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <div className="text-gray-500">Vidéos du joueur</div>
                        </div>
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <div className="text-gray-500">Interviews</div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-xl font-bold mb-4">Galerie photos</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PlayerProfile;

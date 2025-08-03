import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PlayerCard } from "@/components/players/PlayerCard";
import { CoachCard } from "@/components/players/CoachCard";
import { Search, User, Users, X, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/Player";
import { Coach } from "@/types/Coach";
import { useNavigate } from "react-router-dom";

const Players = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch players
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('is_active', true);

        if (playersError) {
          console.error('Error fetching players:', playersError);
        } else {
          setPlayers(playersData || []);
        }

        // Fetch coaches
        const { data: coachesData, error: coachesError } = await supabase
          .from('coaches')
          .select('*')
          .eq('is_active', true);

        if (coachesError) {
          console.error('Error fetching coaches:', coachesError);
        } else {
          setCoaches(coachesData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter players based on active tab and search term - synchronized with admin logic
  const filteredPlayers = players.filter(player => {
    let matchesTab = false;
    
    if (activeTab === "all") {
      matchesTab = true;
    } else if (activeTab === "goalkeepers") {
      matchesTab = player.position.toLowerCase().includes("gardien") ||
                   player.position.toLowerCase().includes("goalkeeper");
    } else if (activeTab === "defenders") {
      matchesTab = player.position.toLowerCase().includes("défenseur") ||
                   player.position.toLowerCase().includes("defenseur") ||
                   player.position.toLowerCase().includes("arrière") ||
                   player.position.toLowerCase().includes("latéral") ||
                   player.position.toLowerCase().includes("lateral") ||
                   player.position.toLowerCase().includes("central") ||
                   player.position.toLowerCase().includes("defender");
    } else if (activeTab === "midfielders") {
      matchesTab = player.position.toLowerCase().includes("milieu") ||
                   player.position.toLowerCase().includes("midfielder") ||
                   player.position.toLowerCase().includes("centre") ||
                   player.position.toLowerCase().includes("médian") ||
                   player.position.toLowerCase().includes("median");
    } else if (activeTab === "forwards") {
      matchesTab = player.position.toLowerCase().includes("attaquant") ||
                   player.position.toLowerCase().includes("ailier") ||
                   player.position.toLowerCase().includes("avant") ||
                   player.position.toLowerCase().includes("striker") ||
                   player.position.toLowerCase().includes("forward") ||
                   player.position.toLowerCase().includes("winger");
    }
    
    const matchesSearch = searchTerm === "" || 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (player.nationality && player.nationality.toLowerCase().includes(searchTerm.toLowerCase())) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.jersey_number && player.jersey_number.toString().includes(searchTerm));
    
    return matchesTab && matchesSearch;
  });

  const togglePlayerSelection = (id: string) => {
    const numericId = parseInt(id);
    if (selectedPlayers.includes(numericId)) {
      setSelectedPlayers(selectedPlayers.filter(playerId => playerId !== numericId));
    } else if (selectedPlayers.length < 2) {
      setSelectedPlayers([...selectedPlayers, numericId]);
    } else {
      // If already 2 players selected, replace the first one
      setSelectedPlayers([selectedPlayers[1], numericId]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
  };

  // Find main coach (Entraîneur Principal)
  const mainCoach = coaches.find(coach => 
    coach.role.toLowerCase().includes('principal') || 
    coach.role.toLowerCase().includes('entraîneur') ||
    coach.name.toLowerCase().includes('ancelotti')
  ) || coaches[0];

  // Get other staff members
  const staffMembers = coaches.filter(coach => coach.id !== mainCoach?.id).slice(0, 4);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-madrid-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de l'effectif...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="bg-madrid-blue py-10">
          <div className="madrid-container">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-madrid-blue"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-4xl font-bold text-white">Effectif</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center mt-6">
              <div className="relative flex-grow w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, nationalité, poste..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
                {searchTerm && (
                  <button 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchTerm("")}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {(searchTerm || activeTab !== "all") && (
                <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap text-white border-white hover:bg-white hover:text-madrid-blue">
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="madrid-container py-8">
          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            <div className="lg:w-1/4">
              {mainCoach && (
                <CoachCard 
                  name={mainCoach.name} 
                  title={mainCoach.role}
                  nationality={mainCoach.nationality || "Italienne"}
                  birthDate="10 juin 1959"
                  atClubSince="2021"
                  image={mainCoach.image_url}
                />
              )}
            </div>
            <div className="lg:w-3/4">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold">Staff Technique</h2>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-madrid-blue" />
                    <span className="text-sm font-medium">{coaches.length} membres</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staffMembers.map((coach) => (
                    <div key={coach.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                      <h3 className="font-bold">{coach.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{coach.role}</p>
                    </div>
                  ))}
                  {staffMembers.length < 4 && (
                    <>
                      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                        <h3 className="font-bold">Francesco Mauri</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Préparateur Physique</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                        <h3 className="font-bold">Luis Llopis</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Entraîneur des Gardiens</p>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 flex flex-wrap">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="goalkeepers">Gardiens</TabsTrigger>
              <TabsTrigger value="defenders">Défenseurs</TabsTrigger>
              <TabsTrigger value="midfielders">Milieux</TabsTrigger>
              <TabsTrigger value="forwards">Attaquants</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {filteredPlayers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredPlayers.map(player => {
                    // Extract secondary position from stats if it exists
                    const secondaryPosition = player.stats?.secondaryPosition || player.stats?.secondary_position;
                    
                    return (
                      <PlayerCard 
                        key={player.id} 
                        id={player.id}
                        name={player.name}
                        number={player.jersey_number || 0}
                        position={player.position}
                        secondaryPosition={secondaryPosition}
                        nationality={player.nationality}
                        image={player.image_url}
                        stats={{
                          matches: player.stats?.matches || 0,
                          goals: player.stats?.goals || 0,
                          assists: player.stats?.assists || 0,
                          cleanSheets: player.stats?.cleanSheets || 0,
                          goalsConceded: player.stats?.goalsConceded || 0,
                          minutesPlayed: player.stats?.minutesPlayed || 0
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">Aucun joueur trouvé</h3>
                  <p className="mt-1 text-gray-500">Essayez de modifier vos critères de recherche</p>
                  <Button onClick={clearFilters} variant="outline" className="mt-4">
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {searchTerm && filteredPlayers.length > 0 && (
            <div className="mt-8 text-center text-gray-500">
              {filteredPlayers.length} joueur{filteredPlayers.length > 1 ? 's' : ''} trouvé{filteredPlayers.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Players;

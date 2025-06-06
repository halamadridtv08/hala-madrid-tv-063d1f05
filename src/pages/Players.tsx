
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PlayerCard } from "@/components/players/PlayerCard";
import { CoachCard } from "@/components/players/CoachCard";
import { Search, User, Users, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/Player";
import { Coach } from "@/types/Coach";

const Players = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayersAndCoaches = async () => {
      try {
        // Récupérer les joueurs actifs
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('is_active', true);

        if (playersError) throw playersError;

        // Récupérer les entraîneurs actifs
        const { data: coachesData, error: coachesError } = await supabase
          .from('coaches')
          .select('*')
          .eq('is_active', true);

        if (coachesError) throw coachesError;

        setPlayers(playersData || []);
        setCoaches(coachesData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayersAndCoaches();
  }, []);

  // Convertir les données Supabase au format attendu par PlayerCard
  const convertedPlayers = players.map(player => ({
    id: parseInt(player.id.substring(0, 8), 16), // Convertir UUID en nombre pour l'ID
    name: player.name,
    number: player.jersey_number || 0,
    position: player.position,
    nationality: player.nationality || "",
    image: player.image_url,
    stats: player.stats || {}
  }));

  // Filter players based on active tab and search term
  const filteredPlayers = convertedPlayers.filter(player => {
    const matchesTab = activeTab === "all" || 
      (activeTab === "goalkeepers" && player.position.toLowerCase().includes("gardien")) ||
      (activeTab === "defenders" && player.position.toLowerCase().includes("défenseur")) ||
      (activeTab === "midfielders" && player.position.toLowerCase().includes("milieu")) ||
      (activeTab === "forwards" && (player.position.toLowerCase().includes("attaquant") || player.position.toLowerCase().includes("ailier")));
    
    const matchesSearch = searchTerm === "" || 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      player.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.number.toString().includes(searchTerm);
    
    return matchesTab && matchesSearch;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
  };

  // Trouver l'entraîneur principal
  const mainCoach = coaches.find(coach => 
    coach.role.toLowerCase().includes('principal') || 
    coach.role.toLowerCase().includes('entraîneur')
  );

  // Autres membres du staff
  const staffMembers = coaches.filter(coach => 
    coach.id !== mainCoach?.id
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen">
          <div className="bg-madrid-blue py-10">
            <div className="madrid-container">
              <h1 className="text-4xl font-bold text-white mb-4">Effectif</h1>
            </div>
          </div>
          <div className="madrid-container py-8">
            <div className="text-center">Chargement...</div>
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
            <h1 className="text-4xl font-bold text-white mb-4">Effectif</h1>
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
                <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap">
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="madrid-container py-8">
          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            <div className="lg:w-1/4">
              {mainCoach ? (
                <CoachCard 
                  name={mainCoach.name}
                  title={mainCoach.role}
                  image={mainCoach.image_url}
                  nationality={mainCoach.nationality}
                  birthDate={mainCoach.age ? `${new Date().getFullYear() - mainCoach.age}` : "Non renseigné"}
                  atClubSince={mainCoach.experience_years ? `${new Date().getFullYear() - mainCoach.experience_years}` : "Non renseigné"}
                />
              ) : (
                <CoachCard 
                  name="Carlo Ancelotti" 
                  title="Entraîneur Principal"
                  nationality="Italienne"
                  birthDate="10 juin 1959"
                  atClubSince="2021"
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
                  {staffMembers.length === 0 && (
                    <>
                      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                        <h3 className="font-bold">Davide Ancelotti</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Assistant Entraîneur</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                        <h3 className="font-bold">Francesco Mauri</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Préparateur Physique</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                        <h3 className="font-bold">Luis Llopis</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Entraîneur des Gardiens</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                        <h3 className="font-bold">Antonio Pintus</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Responsable Préparation Physique</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Palmarès avec le Real Madrid</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Ligue des Champions (2022, 2024)</li>
                    <li>Liga (2022, 2024)</li>
                    <li>Supercoupe d'Espagne (2022, 2024)</li>
                    <li>Supercoupe d'Europe (2022)</li>
                    <li>Coupe du Monde des Clubs FIFA (2022)</li>
                  </ul>
                  <p className="mt-4 text-sm">Carlo Ancelotti est le seul entraîneur à avoir remporté quatre Ligues des Champions et à avoir gagné les cinq grands championnats européens (Italie, Angleterre, France, Allemagne et Espagne).</p>
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
                  {filteredPlayers.map(player => (
                    <PlayerCard key={player.id} {...player} />
                  ))}
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

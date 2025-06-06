
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PlayerCard } from "@/components/players/PlayerCard";
import { CoachCard } from "@/components/players/CoachCard";
import { Search, User, Users, X } from "lucide-react";
import playersData, { PlayerData } from "@/data/playerData";

const Players = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  
  // Convert playerData object to array
  const playersList = Object.values(playersData);

  // Filter players based on active tab and search term
  const filteredPlayers = playersList.filter(player => {
    const matchesTab = activeTab === "all" || 
      (activeTab === "goalkeepers" && player.position.includes("Gardien")) ||
      (activeTab === "defenders" && player.position.includes("Défenseur")) ||
      (activeTab === "midfielders" && player.position.includes("Milieu")) ||
      (activeTab === "forwards" && (player.position.includes("Attaquant") || player.position.includes("Ailier")));
    
    const matchesSearch = searchTerm === "" || 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      player.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.secondaryPosition && player.secondaryPosition.toLowerCase().includes(searchTerm.toLowerCase())) ||
      player.number.toString().includes(searchTerm);
    
    return matchesTab && matchesSearch;
  });

  const togglePlayerSelection = (id: number) => {
    if (selectedPlayers.includes(id)) {
      setSelectedPlayers(selectedPlayers.filter(playerId => playerId !== id));
    } else if (selectedPlayers.length < 2) {
      setSelectedPlayers([...selectedPlayers, id]);
    } else {
      // If already 2 players selected, replace the first one
      setSelectedPlayers([selectedPlayers[1], id]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
  };

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
              <CoachCard 
                name="Carlo Ancelotti" 
                title="Entraîneur Principal"
                nationality="Italienne"
                birthDate="10 juin 1959"
                atClubSince="2021"
              />
            </div>
            <div className="lg:w-3/4">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold">Staff Technique</h2>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-madrid-blue" />
                    <span className="text-sm font-medium">4 membres</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

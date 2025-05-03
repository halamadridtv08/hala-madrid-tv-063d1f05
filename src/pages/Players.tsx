
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PlayerCard } from "@/components/players/PlayerCard";
import { CoachCard } from "@/components/players/CoachCard";
import { Search, User, Users, X } from "lucide-react";

const Players = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  
  // Full player roster with all details
  const players = [
    // Gardiens
    { id: 1, name: "Courtois", number: 1, position: "Gardien de but", nationality: "Belge" },
    { id: 2, name: "Andriy Lunin", number: 13, position: "Gardien de but", nationality: "Ukrainien" },
    { id: 3, name: "Fran González", number: 26, position: "Gardien de but", nationality: "Espagnol" },
    { id: 4, name: "Sergio Mestre", number: 34, position: "Gardien de but", nationality: "Espagnol" },
    
    // Défenseurs
    { id: 5, name: "Carvajal", number: 2, position: "Défenseur Latéral Droite", nationality: "Espagnol" },
    { id: 6, name: "E. Militão", number: 3, position: "Défenseur Central", nationality: "Brésilien" },
    { id: 7, name: "Alaba", number: 4, position: "Défenseur Central", nationality: "Autrichien" },
    { id: 8, name: "Lucas Vázquez", number: 17, position: "Défenseur Latéral Droite", nationality: "Espagnol" },
    { id: 9, name: "Vallejo", number: 18, position: "Défenseur Central", nationality: "Espagnol" },
    { id: 10, name: "Fran García", number: 20, position: "Défenseur Latéral Gauche", nationality: "Espagnol" },
    { id: 11, name: "Rüdiger", number: 22, position: "Défenseur Central", nationality: "Allemand" },
    { id: 12, name: "F. Mendy", number: 23, position: "Défenseur Latéral Gauche", nationality: "Français" },
    { id: 13, name: "Jacobo Ramón", number: 31, position: "Défenseur Central", nationality: "Espagnol" },
    { id: 14, name: "Diego Aguado", number: 43, position: "Défenseur Central", nationality: "Espagnol" },
    { id: 15, name: "Lorenzo Aguado", number: 39, position: "Défenseur Latéral Droit", nationality: "Espagnol" },
    { id: 16, name: "Raúl Asencio", number: 35, position: "Défenseur Central", nationality: "Espagnol" },
    
    // Milieux
    { id: 17, name: "Bellingham", number: 5, position: "Milieu de terrain", nationality: "Anglais" },
    { id: 18, name: "Camavinga", number: 6, position: "Milieu de terrain", secondaryPosition: "Défenseur Latéral Gauche", nationality: "Français" },
    { id: 19, name: "Valverde", number: 8, position: "Milieu de terrain", secondaryPosition: "Défenseur Latéral Droite", nationality: "Uruguayen" },
    { id: 20, name: "Modrić", number: 10, position: "Milieu de terrain", nationality: "Croate" },
    { id: 21, name: "Tchouameni", number: 14, position: "Milieu de terrain défensif", secondaryPosition: "Défenseur Central", nationality: "Français" },
    { id: 22, name: "Arda Güler", number: 15, position: "Milieu de terrain", secondaryPosition: "Ailier droit", nationality: "Turc" },
    { id: 23, name: "D. Ceballos", number: 19, position: "Milieu de terrain", nationality: "Espagnol" },
    { id: 24, name: "Chema Andrés", number: 36, position: "Milieu de terrain", nationality: "Espagnol" },
    
    // Attaquants
    { id: 25, name: "Vini Jr.", number: 7, position: "Ailier gauche", secondaryPosition: "Attaquant", nationality: "Brésilien" },
    { id: 26, name: "Mbappé", number: 9, position: "Attaquant", secondaryPosition: "Ailier Gauche", nationality: "Français" },
    { id: 27, name: "Rodrygo", number: 11, position: "Ailier droit", secondaryPosition: "Ailier Gauche", nationality: "Brésilien" },
    { id: 28, name: "Endrick", number: 16, position: "Attaquant", nationality: "Brésilien" },
    { id: 29, name: "Brahim", number: 21, position: "Ailier droit", secondaryPosition: "Milieu de terrain", nationality: "Espagnol/Marocain" },
    { id: 30, name: "Gonzalo García", number: 30, position: "Attaquant", nationality: "Espagnol" }
  ];

  // Filter players based on active tab and search term
  const filteredPlayers = players.filter(player => {
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

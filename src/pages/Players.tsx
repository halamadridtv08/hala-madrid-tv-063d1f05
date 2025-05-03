
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PlayerCard } from "@/components/players/PlayerCard";
import { CoachCard } from "@/components/players/CoachCard";

const Players = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Full player roster with all details
  const players = [
    // Gardiens
    { id: 1, name: "Courtois", number: 1, position: "Gardien de but" },
    { id: 2, name: "Andriy Lunin", number: 13, position: "Gardien de but" },
    { id: 3, name: "Fran González", number: 26, position: "Gardien de but" },
    { id: 4, name: "Sergio Mestre", number: 34, position: "Gardien de but" },
    
    // Défenseurs
    { id: 5, name: "Carvajal", number: 2, position: "Défenseur Latéral Droite" },
    { id: 6, name: "E. Militão", number: 3, position: "Défenseur Central" },
    { id: 7, name: "Alaba", number: 4, position: "Défenseur Central" },
    { id: 8, name: "Lucas Vázquez", number: 17, position: "Défenseur Latéral Droite" },
    { id: 9, name: "Vallejo", number: 18, position: "Défenseur Central" },
    { id: 10, name: "Fran García", number: 20, position: "Défenseur Latéral Gauche" },
    { id: 11, name: "Rüdiger", number: 22, position: "Défenseur Central" },
    { id: 12, name: "F. Mendy", number: 23, position: "Défenseur Latéral Gauche" },
    { id: 13, name: "Jacobo Ramón", number: 31, position: "Défenseur Central" },
    { id: 14, name: "Diego Aguado", number: 43, position: "Défenseur Central" },
    { id: 15, name: "Lorenzo Aguado", number: 39, position: "Défenseur Latéral Droit" },
    { id: 16, name: "Raúl Asencio", number: 35, position: "Défenseur Central" },
    
    // Milieux
    { id: 17, name: "Bellingham", number: 5, position: "Milieu de terrain" },
    { id: 18, name: "Camavinga", number: 6, position: "Milieu de terrain", secondaryPosition: "Défenseur Latéral Gauche" },
    { id: 19, name: "Valverde", number: 8, position: "Milieu de terrain", secondaryPosition: "Défenseur Latéral Droite" },
    { id: 20, name: "Modrić", number: 10, position: "Milieu de terrain" },
    { id: 21, name: "Tchouameni", number: 14, position: "Milieu de terrain défensif", secondaryPosition: "Défenseur Central" },
    { id: 22, name: "Arda Güler", number: 15, position: "Milieu de terrain", secondaryPosition: "Ailier droit" },
    { id: 23, name: "D. Ceballos", number: 19, position: "Milieu de terrain" },
    { id: 24, name: "Chema Andrés", number: 36, position: "Milieu de terrain" },
    
    // Attaquants
    { id: 25, name: "Vini Jr.", number: 7, position: "Ailier gauche", secondaryPosition: "Attaquant" },
    { id: 26, name: "Mbappé", number: 9, position: "Attaquant", secondaryPosition: "Ailier Gauche" },
    { id: 27, name: "Rodrygo", number: 11, position: "Ailier droit", secondaryPosition: "Ailier Gauche" },
    { id: 28, name: "Endrick", number: 16, position: "Attaquant" },
    { id: 29, name: "Brahim", number: 21, position: "Ailier droit", secondaryPosition: "Milieu de terrain" },
    { id: 30, name: "Gonzalo García", number: 30, position: "Attaquant" }
  ];

  // Filter players based on active tab
  const filteredPlayers = players.filter(player => {
    switch (activeTab) {
      case "goalkeepers":
        return player.position.includes("Gardien");
      case "defenders":
        return player.position.includes("Défenseur");
      case "midfielders":
        return player.position.includes("Milieu");
      case "forwards":
        return player.position.includes("Attaquant") || player.position.includes("Ailier");
      default:
        return true;
    }
  });

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
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="md:w-1/4">
              <CoachCard 
                name="Carlo Ancelotti" 
                title="Entraîneur Principal" 
              />
            </div>
            <div className="md:w-3/4">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-full">
                <h2 className="text-2xl font-bold mb-4">Carlo Ancelotti</h2>
                <p className="mb-2"><strong>Nationalité:</strong> Italienne</p>
                <p className="mb-2"><strong>Né le:</strong> 10 juin 1959</p>
                <p className="mb-2"><strong>Au club depuis:</strong> 2021</p>
                <h3 className="text-lg font-semibold mt-4 mb-2">Palmarès avec le Real Madrid</h3>
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

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="goalkeepers">Gardiens</TabsTrigger>
              <TabsTrigger value="defenders">Défenseurs</TabsTrigger>
              <TabsTrigger value="midfielders">Milieux</TabsTrigger>
              <TabsTrigger value="forwards">Attaquants</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredPlayers.map(player => (
                  <PlayerCard key={player.id} {...player} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Players;

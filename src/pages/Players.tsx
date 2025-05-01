
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";

const Players = () => {
  // Simuler des données de joueurs
  const allPlayers = [
    {
      id: 1,
      name: "Kylian Mbappé",
      position: "Attaquant",
      number: 10,
      image: "https://media.gettyimages.com/id/1809515629/photo/real-madrid-cf-unveil-new-signing-kylian-mbappe-at-estadio-santiago-bernabeu-on-july-16-2024.jpg?s=2048x2048&w=gi&k=20&c=YecqQkxXHhuhfLrqKDsz-lIj-fPlMNZZnt-EvIr1L40=",
      nationality: "France"
    },
    {
      id: 2,
      name: "Vinicius Jr",
      position: "Attaquant",
      number: 7,
      image: "https://media.gettyimages.com/id/1249999107/photo/vinicius-junior-of-real-madrid-cf-looks-on-during-the-la-liga-santander-match-between-real.jpg?s=2048x2048&w=gi&k=20&c=oR9kSZ1swHdoU5uNsF9fGP4yLPs-A6Z3gCT_BPxz-aU=",
      nationality: "Brésil"
    },
    {
      id: 3,
      name: "Thibaut Courtois",
      position: "Gardien",
      number: 1,
      image: "https://media.gettyimages.com/id/1425883860/photo/thibaut-courtois-of-real-madrid-cf-celebrates-their-sides-first-goal-scored-by-marco-asensio.jpg?s=2048x2048&w=gi&k=20&c=fCMnt0di1PtANcXrWMfgeRc4MQOdsQ2YMkKfQA_O_ZI=",
      nationality: "Belgique"
    },
    {
      id: 4,
      name: "Jude Bellingham",
      position: "Milieu",
      number: 5,
      image: "https://media.gettyimages.com/id/1671695416/photo/jude-bellingham-of-real-madrid-celebrates-after-scoring-their-sides-first-goal-during-the-uefa.jpg?s=2048x2048&w=gi&k=20&c=DAmDURM_TcmVamgDF8BnAj6c17jD7XPFBbSBSSJMIfM=",
      nationality: "Angleterre"
    },
    {
      id: 5,
      name: "Antonio Rüdiger",
      position: "Défenseur",
      number: 22,
      image: "https://media.gettyimages.com/id/1670675766/photo/antonio-rudiger-of-real-madrid-runs-with-the-ball-whilst-under-pressure-from-hugo-duro-of.jpg?s=2048x2048&w=gi&k=20&c=KxRQnpHQX1lPXp1EuCCNYb4pA_UBUi8DYYpksXbiy84=",
      nationality: "Allemagne"
    },
    {
      id: 6,
      name: "Rodrygo",
      position: "Attaquant",
      number: 11,
      image: "https://media.gettyimages.com/id/1806909513/photo/rodrygo-of-real-madrid-celebrates-after-scoring-the-teams-second-goal-during-the-preseason.jpg?s=2048x2048&w=gi&k=20&c=tZe5HIAqvlwDTJHSPd9yY3loVt2AwVdabRCv0xzxjGY=",
      nationality: "Brésil"
    },
    {
      id: 7,
      name: "Federico Valverde",
      position: "Milieu",
      number: 15,
      image: "https://media.gettyimages.com/id/1250005341/photo/federico-valverde-of-real-madrid-controls-the-ball-during-the-la-liga-santander-match-between.jpg?s=2048x2048&w=gi&k=20&c=Is7Q9cIisQk7VWXAu4o83oHjc4vvIhZzb_C415UZ9uw=",
      nationality: "Uruguay"
    },
    {
      id: 8,
      name: "Ferland Mendy",
      position: "Défenseur",
      number: 23,
      image: "https://media.gettyimages.com/id/1650571769/photo/ferland-mendy-of-real-madrid-controls-the-ball-during-the-laliga-ea-sports-match-between-real.jpg?s=2048x2048&w=gi&k=20&c=YKniNXjdwRVv_IX2rry3Onct_y5Q873xAw-us4RKdYk=",
      nationality: "France"
    },
    {
      id: 9,
      name: "Aurélien Tchouaméni",
      position: "Milieu",
      number: 8,
      image: "https://media.gettyimages.com/id/1681470796/photo/aurelien-tchouameni-of-real-madrid-controls-the-ball-during-the-uefa-champions-league-2023-24.jpg?s=2048x2048&w=gi&k=20&c=Fv0iEGjE14j1qJvE1ggOMC5EM-9SIhNFiaAO8KoM7-s=",
      nationality: "France"
    }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          player.nationality.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPosition = selectedPosition === null || player.position === selectedPosition;
    
    return matchesSearch && matchesPosition;
  });

  const getPositionColor = (position: string) => {
    switch (position) {
      case "Gardien": return "bg-yellow-600";
      case "Défenseur": return "bg-blue-600";
      case "Milieu": return "bg-green-600";
      case "Attaquant": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  const positions = [
    { name: "Tous", value: null },
    { name: "Gardien", value: "Gardien" },
    { name: "Défenseur", value: "Défenseur" },
    { name: "Milieu", value: "Milieu" },
    { name: "Attaquant", value: "Attaquant" }
  ];

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
          <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between">
            <Input
              placeholder="Rechercher un joueur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            
            <div className="flex flex-wrap gap-2">
              {positions.map(position => (
                <Badge
                  key={position.value ?? "all"}
                  className={`cursor-pointer ${
                    selectedPosition === position.value 
                    ? "bg-madrid-gold text-black" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedPosition(position.value)}
                >
                  {position.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPlayers.map(player => (
              <Link to={`/players/${player.id}`} key={player.id}>
                <Card className="overflow-hidden card-hover h-full">
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={player.image} 
                      alt={player.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <CardContent className="flex flex-col items-center text-center p-4">
                    <Badge className={`${getPositionColor(player.position)} text-white mb-2`}>
                      {player.position}
                    </Badge>
                    <h3 className="text-lg font-bold mb-1">{player.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <span>#{player.number}</span>
                      <span>•</span>
                      <span>{player.nationality}</span>
                    </div>
                    <Button variant="link" className="mt-2 text-madrid-blue dark:text-blue-400">
                      Voir le profil
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredPlayers.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Aucun joueur trouvé</h3>
              <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Players;

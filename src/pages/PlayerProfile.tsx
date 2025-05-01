
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";

const PlayerProfile = () => {
  const { id } = useParams();
  
  // Simuler les données d'un joueur (en production, ces données viendraient d'une API ou d'une base de données)
  const player = {
    id: 1,
    name: "Kylian Mbappé",
    number: 9,
    position: "Attaquant",
    nationality: "France",
    birthDate: "1998-12-20",
    height: "178 cm",
    weight: "73 kg",
    image: "https://static.independent.co.uk/2024/01/30/11/AFP_34A2227.jpg",
    bio: "Kylian Mbappé est un footballeur français qui évolue au poste d'attaquant au Real Madrid. Considéré comme l'un des meilleurs joueurs du monde, il est connu pour sa vitesse, ses dribbles et sa finition.",
    stats: {
      matches: 42,
      goals: 35,
      assists: 12,
      yellowCards: 3,
      redCards: 0,
      minutesPlayed: 3450,
    },
    seasonStats: [
      {
        season: "2024/2025",
        competition: "La Liga",
        matches: 28,
        goals: 23,
        assists: 8,
        minutesPlayed: 2380
      },
      {
        season: "2024/2025",
        competition: "Champions League",
        matches: 10,
        goals: 9,
        assists: 3,
        minutesPlayed: 870
      },
      {
        season: "2024/2025",
        competition: "Copa del Rey",
        matches: 4,
        goals: 3,
        assists: 1,
        minutesPlayed: 200
      }
    ],
    recentMatches: [
      {
        id: 1,
        date: "2025-04-30",
        competition: "Champions League",
        opponent: "Manchester City",
        result: "3-1",
        goals: 2,
        assists: 1,
        minutes: 90
      },
      {
        id: 2,
        date: "2025-04-26",
        competition: "La Liga",
        opponent: "Getafe",
        result: "4-0",
        goals: 1,
        assists: 2,
        minutes: 75
      },
      {
        id: 3,
        date: "2025-04-19",
        competition: "La Liga",
        opponent: "FC Barcelona",
        result: "3-2",
        goals: 2,
        assists: 0,
        minutes: 90
      }
    ]
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const calculateAge = (birthDateString) => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <>
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Colonne de gauche avec photo et infos */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-0">
                  <div className="bg-madrid-blue text-white p-4">
                    <h1 className="text-2xl font-bold">{player.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-madrid-gold text-black">
                        N°{player.number}
                      </Badge>
                      <span>{player.position}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nationalité:</span>
                        <span className="font-semibold">{player.nationality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date de naissance:</span>
                        <span className="font-semibold">{formatDate(player.birthDate)} ({calculateAge(player.birthDate)} ans)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Taille:</span>
                        <span className="font-semibold">{player.height}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Poids:</span>
                        <span className="font-semibold">{player.weight}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Colonne de droite avec onglets d'informations */}
            <div className="md:col-span-2">
              <Tabs defaultValue="bio">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="bio">Biographie</TabsTrigger>
                  <TabsTrigger value="stats">Statistiques</TabsTrigger>
                  <TabsTrigger value="matches">Matchs récents</TabsTrigger>
                  <TabsTrigger value="media">Médias</TabsTrigger>
                </TabsList>
                
                <TabsContent value="bio">
                  <Card>
                    <CardHeader>
                      <h2 className="text-2xl font-bold">Biographie</h2>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg">{player.bio}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                          <div className="text-4xl font-bold text-madrid-blue">{player.stats.goals}</div>
                          <div className="text-gray-500">Buts</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                          <div className="text-4xl font-bold text-madrid-blue">{player.stats.matches}</div>
                          <div className="text-gray-500">Matchs joués</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                          <div className="text-4xl font-bold text-madrid-blue">{player.stats.assists}</div>
                          <div className="text-gray-500">Passes décisives</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                          <div className="text-4xl font-bold text-madrid-blue">{Math.round(player.stats.minutesPlayed / 60)}</div>
                          <div className="text-gray-500">Heures de jeu</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="stats">
                  <Card>
                    <CardHeader>
                      <h2 className="text-2xl font-bold">Statistiques par compétition 2024/2025</h2>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800">
                              <th className="p-3 text-left">Compétition</th>
                              <th className="p-3 text-center">Matches</th>
                              <th className="p-3 text-center">Buts</th>
                              <th className="p-3 text-center">Passes déc.</th>
                              <th className="p-3 text-center">Minutes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {player.seasonStats.map((stat, index) => (
                              <tr key={index} className="border-b dark:border-gray-700">
                                <td className="p-3 font-medium">{stat.competition}</td>
                                <td className="p-3 text-center">{stat.matches}</td>
                                <td className="p-3 text-center font-bold text-madrid-blue">{stat.goals}</td>
                                <td className="p-3 text-center">{stat.assists}</td>
                                <td className="p-3 text-center">{stat.minutesPlayed}</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                              <td className="p-3">TOTAL</td>
                              <td className="p-3 text-center">{player.stats.matches}</td>
                              <td className="p-3 text-center text-madrid-blue">{player.stats.goals}</td>
                              <td className="p-3 text-center">{player.stats.assists}</td>
                              <td className="p-3 text-center">{player.stats.minutesPlayed}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4">Statistiques avancées</h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                            <div className="text-3xl font-bold text-madrid-blue">
                              {(player.stats.goals / player.stats.matches).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">Buts par match</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                            <div className="text-3xl font-bold text-madrid-blue">
                              {(player.stats.minutesPlayed / player.stats.goals).toFixed(0)}
                            </div>
                            <div className="text-sm text-gray-500">Minutes par but</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                            <div className="text-3xl font-bold text-madrid-blue">
                              {player.stats.yellowCards}
                            </div>
                            <div className="text-sm text-gray-500">Cartons jaunes</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                            <div className="text-3xl font-bold text-madrid-blue">
                              {player.stats.redCards}
                            </div>
                            <div className="text-sm text-gray-500">Cartons rouges</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="matches">
                  <Card>
                    <CardHeader>
                      <h2 className="text-2xl font-bold">Derniers matchs joués</h2>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {player.recentMatches.map((match) => (
                          <div key={match.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <Badge className="bg-madrid-blue text-white">
                                  {match.competition}
                                </Badge>
                                <span className="ml-2 text-gray-500">{formatDate(match.date)}</span>
                              </div>
                              <div className="font-bold text-lg">{match.result}</div>
                            </div>
                            
                            <div className="flex justify-between">
                              <div>vs {match.opponent}</div>
                              <div className="text-gray-500">{match.minutes} minutes jouées</div>
                            </div>
                            
                            <div className="mt-4 grid grid-cols-2 gap-4">
                              <div className="bg-white dark:bg-gray-700 p-3 rounded text-center">
                                <div className="text-2xl font-bold text-madrid-blue">
                                  {match.goals}
                                </div>
                                <div className="text-sm text-gray-500">Buts</div>
                              </div>
                              <div className="bg-white dark:bg-gray-700 p-3 rounded text-center">
                                <div className="text-2xl font-bold text-madrid-blue">
                                  {match.assists}
                                </div>
                                <div className="text-sm text-gray-500">Passes déc.</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
                          <div className="text-gray-500">Video du joueur</div>
                        </div>
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <div className="text-gray-500">Video du joueur</div>
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

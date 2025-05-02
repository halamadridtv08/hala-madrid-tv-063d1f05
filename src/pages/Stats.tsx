import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { 
  ChartContainer, 
  ChartLegend, 
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { ChartBarIcon, ChartLine, ChartPie } from "lucide-react";
import { useState } from "react";

const Stats = () => {
  const [activeTab, setActiveTab] = useState("laliga");
  
  // Données pour les meilleurs buteurs
  const topScorers = {
    laliga: [
      { name: "Bellingham", goals: 18, team: "Real Madrid", matches: 26, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Jude_Bellingham_2023_%28cropped%29.jpg/1200px-Jude_Bellingham_2023_%28cropped%29.jpg" },
      { name: "Vinicius Jr", goals: 15, team: "Real Madrid", matches: 25, image: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Vinicius_Junior_2021.jpg" },
      { name: "Rodrygo", goals: 12, team: "Real Madrid", matches: 28, image: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Rodrygo_Goes_2021.jpg" },
      { name: "Joselu", goals: 10, team: "Real Madrid", matches: 30, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Joselu_2020.jpg/640px-Joselu_2020.jpg" },
      { name: "Valverde", goals: 8, team: "Real Madrid", matches: 32, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Federico_Valverde_2022.jpg/640px-Federico_Valverde_2022.jpg" }
    ],
    cl: [
      { name: "Vinicius Jr", goals: 8, team: "Real Madrid", matches: 10, image: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Vinicius_Junior_2021.jpg" },
      { name: "Bellingham", goals: 6, team: "Real Madrid", matches: 9, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Jude_Bellingham_2023_%28cropped%29.jpg/1200px-Jude_Bellingham_2023_%28cropped%29.jpg" },
      { name: "Rodrygo", goals: 5, team: "Real Madrid", matches: 10, image: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Rodrygo_Goes_2021.jpg" },
      { name: "Valverde", goals: 4, team: "Real Madrid", matches: 10, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Federico_Valverde_2022.jpg/640px-Federico_Valverde_2022.jpg" },
      { name: "Carvajal", goals: 3, team: "Real Madrid", matches: 10, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Dani_Carvajal_2018.jpg/640px-Dani_Carvajal_2018.jpg" }
    ],
    copaDelRey: [
      { name: "Joselu", goals: 4, team: "Real Madrid", matches: 5, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Joselu_2020.jpg/640px-Joselu_2020.jpg" },
      { name: "Brahim", goals: 3, team: "Real Madrid", matches: 5, image: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Brahim_D%C3%ADaz_2019.jpg" },
      { name: "Güler", goals: 2, team: "Real Madrid", matches: 4, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Arda_G%C3%BCler_2023.jpg/1024px-Arda_G%C3%BCler_2023.jpg" },
      { name: "Modric", goals: 1, team: "Real Madrid", matches: 3, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Luka_Modri%C4%87_2021.jpg/640px-Luka_Modri%C4%87_2021.jpg" },
      { name: "Ceballos", goals: 1, team: "Real Madrid", matches: 4, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Dani_Ceballos_2019.jpg/640px-Dani_Ceballos_2019.jpg" }
    ]
  };

  // Données pour les meilleurs passeurs
  const topAssists = {
    laliga: [
      { name: "Kroos", assists: 12, team: "Real Madrid", matches: 29, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2023_UEFA_Champions_League_Final_-_Kroos_with_trophy_%28cropped%29.jpg/640px-2023_UEFA_Champions_League_Final_-_Kroos_with_trophy_%28cropped%29.jpg" },
      { name: "Vinicius Jr", assists: 9, team: "Real Madrid", matches: 25, image: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Vinicius_Junior_2021.jpg" },
      { name: "Bellingham", assists: 8, team: "Real Madrid", matches: 26, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Jude_Bellingham_2023_%28cropped%29.jpg/1200px-Jude_Bellingham_2023_%28cropped%29.jpg" },
      { name: "Modric", assists: 6, team: "Real Madrid", matches: 26, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Luka_Modri%C4%87_2021.jpg/640px-Luka_Modri%C4%87_2021.jpg" },
      { name: "Carvajal", assists: 6, team: "Real Madrid", matches: 31, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Dani_Carvajal_2018.jpg/640px-Dani_Carvajal_2018.jpg" }
    ],
    cl: [
      { name: "Kroos", assists: 6, team: "Real Madrid", matches: 10, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2023_UEFA_Champions_League_Final_-_Kroos_with_trophy_%28cropped%29.jpg/640px-2023_UEFA_Champions_League_Final_-_Kroos_with_trophy_%28cropped%29.jpg" },
      { name: "Bellingham", assists: 5, team: "Real Madrid", matches: 9, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Jude_Bellingham_2023_%28cropped%29.jpg/1200px-Jude_Bellingham_2023_%28cropped%29.jpg" },
      { name: "Rodrygo", assists: 4, team: "Real Madrid", matches: 10, image: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Rodrygo_Goes_2021.jpg" },
      { name: "Vinicius Jr", assists: 4, team: "Real Madrid", matches: 10, image: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Vinicius_Junior_2021.jpg" },
      { name: "Modric", assists: 3, team: "Real Madrid", matches: 9, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Luka_Modri%C4%87_2021.jpg/640px-Luka_Modri%C4%87_2021.jpg" }
    ],
    copaDelRey: [
      { name: "Modric", assists: 3, team: "Real Madrid", matches: 3, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Luka_Modri%C4%87_2021.jpg/640px-Luka_Modri%C4%87_2021.jpg" },
      { name: "Ceballos", assists: 2, team: "Real Madrid", matches: 4, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Dani_Ceballos_2019.jpg/640px-Dani_Ceballos_2019.jpg" },
      { name: "Valverde", assists: 2, team: "Real Madrid", matches: 4, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Federico_Valverde_2022.jpg/640px-Federico_Valverde_2022.jpg" },
      { name: "Vinicius Jr", assists: 1, team: "Real Madrid", matches: 3, image: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Vinicius_Junior_2021.jpg" },
      { name: "Tchouameni", assists: 1, team: "Real Madrid", matches: 5, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Aurelien_Tchouameni_2022.jpg/640px-Aurelien_Tchouameni_2022.jpg" }
    ]
  };

  // Données pour les matchs joués
  const mostPlayed = {
    laliga: [
      { name: "Courtois", matches: 32, minutes: 2880, image: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Thibaut_Courtois_2021.jpg" },
      { name: "Carvajal", matches: 31, minutes: 2740, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Dani_Carvajal_2018.jpg/640px-Dani_Carvajal_2018.jpg" },
      { name: "Rüdiger", matches: 30, minutes: 2700, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Antonio_R%C3%BCdiger_2018.jpg/640px-Antonio_R%C3%BCdiger_2018.jpg" },
      { name: "Valverde", matches: 32, minutes: 2670, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Federico_Valverde_2022.jpg/640px-Federico_Valverde_2022.jpg" },
      { name: "Camavinga", matches: 29, minutes: 2130, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Eduardo_Camavinga_2022.jpg/1200px-Eduardo_Camavinga_2022.jpg" }
    ],
    cl: [
      { name: "Courtois", matches: 10, minutes: 900, image: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Thibaut_Courtois_2021.jpg" },
      { name: "Rüdiger", matches: 10, minutes: 900, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Antonio_R%C3%BCdiger_2018.jpg/640px-Antonio_R%C3%BCdiger_2018.jpg" },
      { name: "Valverde", matches: 10, minutes: 890, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Federico_Valverde_2022.jpg/640px-Federico_Valverde_2022.jpg" },
      { name: "Vinicius Jr", matches: 10, minutes: 880, image: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Vinicius_Junior_2021.jpg" },
      { name: "Carvajal", matches: 10, minutes: 875, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Dani_Carvajal_2018.jpg/640px-Dani_Carvajal_2018.jpg" }
    ],
    copaDelRey: [
      { name: "Lunin", matches: 5, minutes: 450, image: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Lunin_2021.jpg" },
      { name: "Nacho", matches: 5, minutes: 450, image: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Nacho_Fernandez_2018.jpg" },
      { name: "Tchouameni", matches: 5, minutes: 430, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Aurelien_Tchouameni_2022.jpg/640px-Aurelien_Tchouameni_2022.jpg" },
      { name: "Ceballos", matches: 4, minutes: 325, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Dani_Ceballos_2019.jpg/640px-Dani_Ceballos_2019.jpg" },
      { name: "Joselu", matches: 5, minutes: 305, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Joselu_2020.jpg/640px-Joselu_2020.jpg" }
    ]
  };

  // Données pour les performances d'équipe
  const teamPerformance = {
    laliga: [
      { name: "Victoires", value: 28 },
      { name: "Nuls", value: 6 },
      { name: "Défaites", value: 4 }
    ],
    cl: [
      { name: "Victoires", value: 9 },
      { name: "Nuls", value: 1 },
      { name: "Défaites", value: 0 }
    ],
    copaDelRey: [
      { name: "Victoires", value: 4 },
      { name: "Nuls", value: 1 },
      { name: "Défaites", value: 0 }
    ]
  };

  // Données pour le classement des compétitions
  const standings = {
    laliga: [
      { position: 1, team: "Real Madrid", played: 38, won: 28, drawn: 6, lost: 4, goalsFor: 88, goalsAgainst: 28, points: 90 },
      { position: 2, team: "FC Barcelone", played: 38, won: 27, drawn: 4, lost: 7, goalsFor: 79, goalsAgainst: 40, points: 85 },
      { position: 3, team: "Girona FC", played: 38, won: 25, drawn: 7, lost: 6, goalsFor: 77, goalsAgainst: 44, points: 82 },
      { position: 4, team: "Atlético Madrid", played: 38, won: 22, drawn: 6, lost: 10, goalsFor: 69, goalsAgainst: 43, points: 72 },
      { position: 5, team: "Athletic Bilbao", played: 38, won: 20, drawn: 9, lost: 9, goalsFor: 61, goalsAgainst: 39, points: 69 }
    ],
    cl: [
      { position: 1, team: "Real Madrid", played: 13, won: 12, drawn: 1, lost: 0, goalsFor: 36, goalsAgainst: 11, points: 37 },
      { position: 2, team: "Dortmund", played: 13, won: 8, drawn: 2, lost: 3, goalsFor: 23, goalsAgainst: 16, points: 26 },
      { position: 3, team: "PSG", played: 11, won: 7, drawn: 1, lost: 3, goalsFor: 21, goalsAgainst: 13, points: 22 },
      { position: 4, team: "Bayern Munich", played: 11, won: 6, drawn: 2, lost: 3, goalsFor: 24, goalsAgainst: 14, points: 20 },
      { position: 5, team: "Man City", played: 12, won: 5, drawn: 4, lost: 3, goalsFor: 22, goalsAgainst: 15, points: 19 }
    ],
    copaDelRey: [
      { position: "Vainqueur", team: "Athletic Bilbao", played: 6, won: 6, drawn: 0, lost: 0, goalsFor: 15, goalsAgainst: 4, points: 18 },
      { position: "Finaliste", team: "RCD Mallorca", played: 6, won: 4, drawn: 1, lost: 1, goalsFor: 8, goalsAgainst: 3, points: 13 },
      { position: "Demi-finaliste", team: "Atlético Madrid", played: 5, won: 3, drawn: 1, lost: 1, goalsFor: 11, goalsAgainst: 6, points: 10 },
      { position: "Demi-finaliste", team: "FC Barcelone", played: 5, won: 3, drawn: 0, lost: 2, goalsFor: 9, goalsAgainst: 7, points: 9 },
      { position: "Quart de finale", team: "Real Madrid", played: 5, won: 4, drawn: 0, lost: 1, goalsFor: 11, goalsAgainst: 5, points: 12 }
    ],
    supercoupeEurope: [
      { position: "À déterminer", team: "Real Madrid", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { position: "À déterminer", team: "Atalanta", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
    ],
    supercoupeEspagne: [
      { position: "Vainqueur", team: "Real Madrid", played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, points: 6 },
      { position: "Finaliste", team: "FC Barcelone", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 4, points: 3 },
      { position: "Demi-finaliste", team: "Atlético Madrid", played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 1, goalsAgainst: 5, points: 0 },
      { position: "Demi-finaliste", team: "Osasuna", played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 0, goalsAgainst: 2, points: 0 }
    ]
  };

  // Couleurs pour les graphiques
  const COLORS = ["#00529F", "#FEBE10", "#FFFFFF", "#D5D5D5", "#111111"];

  return (
    <>
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          <h1 className="section-title mb-8">Statistiques</h1>
          
          <Tabs defaultValue="laliga" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-5 mb-8">
              <TabsTrigger value="laliga">La Liga</TabsTrigger>
              <TabsTrigger value="cl">Champions League</TabsTrigger>
              <TabsTrigger value="copaDelRey">Copa del Rey</TabsTrigger>
              <TabsTrigger value="supercoupeEurope">Supercoupe d'Europe</TabsTrigger>
              <TabsTrigger value="supercoupeEspagne">Supercoupe d'Espagne</TabsTrigger>
            </TabsList>

            {["laliga", "cl", "copaDelRey", "supercoupeEurope", "supercoupeEspagne"].map((competition) => (
              <TabsContent key={competition} value={competition} className="space-y-8">
                {/* Performance de l'équipe */}
                <Card className="transform transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChartPie className="h-5 w-5 text-madrid-gold" />
                      Performance de l'Équipe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {teamPerformance[competition] ? (
                      <ChartContainer 
                        config={{
                          Victoires: { color: "#00529F" },
                          Nuls: { color: "#FEBE10" },
                          Défaites: { color: "#D5D5D5" }
                        }}
                        className="h-72"
                      >
                        <PieChart>
                          <Pie
                            data={teamPerformance[competition]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {teamPerformance[competition].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend content={<ChartLegendContent />} />
                        </PieChart>
                      </ChartContainer>
                    ) : (
                      <div className="flex justify-center items-center h-72">
                        <p className="text-gray-500">Données non disponibles</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Meilleurs buteurs */}
                <Card className="transform transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5 text-madrid-gold" />
                      Meilleurs Buteurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topScorers[competition] ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <ChartContainer 
                            config={{
                              goals: { color: "#00529F" }
                            }}
                            className="h-72"
                          >
                            <BarChart data={topScorers[competition]}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="goals" name="Buts" fill="#00529F" />
                            </BarChart>
                          </ChartContainer>
                        </div>
                        <div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Joueur</TableHead>
                                <TableHead className="text-right">Buts</TableHead>
                                <TableHead className="text-right">Matchs</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {topScorers[competition].map((player) => (
                                <TableRow key={player.name} className="hover:bg-muted/50 transition-colors">
                                  <TableCell className="font-medium flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                      <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                                    </div>
                                    {player.name}
                                  </TableCell>
                                  <TableCell className="text-right">{player.goals}</TableCell>
                                  <TableCell className="text-right">{player.matches}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-72">
                        <p className="text-gray-500">Données non disponibles</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Meilleurs passeurs */}
                <Card className="transform transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChartLine className="h-5 w-5 text-madrid-gold" />
                      Meilleurs Passeurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topAssists[competition] ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <ChartContainer 
                            config={{
                              assists: { color: "#FEBE10" }
                            }}
                            className="h-72"
                          >
                            <LineChart data={topAssists[competition]}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Line type="monotone" dataKey="assists" name="Passes décisives" stroke="#FEBE10" strokeWidth={2} />
                            </LineChart>
                          </ChartContainer>
                        </div>
                        <div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Joueur</TableHead>
                                <TableHead className="text-right">Passes</TableHead>
                                <TableHead className="text-right">Matchs</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {topAssists[competition].map((player) => (
                                <TableRow key={player.name} className="hover:bg-muted/50 transition-colors">
                                  <TableCell className="font-medium flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                      <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                                    </div>
                                    {player.name}
                                  </TableCell>
                                  <TableCell className="text-right">{player.assists}</TableCell>
                                  <TableCell className="text-right">{player.matches}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-72">
                        <p className="text-gray-500">Données non disponibles</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Plus de matchs joués */}
                <Card className="transform transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>Plus de Matchs Joués</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mostPlayed[competition] ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Joueur</TableHead>
                            <TableHead className="text-right">Matchs</TableHead>
                            <TableHead className="text-right">Minutes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mostPlayed[competition].map((player) => (
                            <TableRow key={player.name} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="font-medium flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden">
                                  <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                                </div>
                                {player.name}
                              </TableCell>
                              <TableCell className="text-right">{player.matches}</TableCell>
                              <TableCell className="text-right">{player.minutes}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex justify-center items-center h-20">
                        <p className="text-gray-500">Données non disponibles</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Classement */}
                <Card className="transform transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>Classement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {standings[competition] ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Pos</TableHead>
                              <TableHead>Équipe</TableHead>
                              <TableHead className="text-center">J</TableHead>
                              <TableHead className="text-center">V</TableHead>
                              <TableHead className="text-center">N</TableHead>
                              <TableHead className="text-center">D</TableHead>
                              <TableHead className="text-center">BP</TableHead>
                              <TableHead className="text-center">BC</TableHead>
                              <TableHead className="text-center">Pts</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {standings[competition].map((team) => (
                              <TableRow key={team.team} className={team.team === "Real Madrid" ? "bg-madrid-blue/10 font-bold" : "hover:bg-muted/50"}>
                                <TableCell>{team.position}</TableCell>
                                <TableCell className="font-medium">{team.team}</TableCell>
                                <TableCell className="text-center">{team.played}</TableCell>
                                <TableCell className="text-center">{team.won}</TableCell>
                                <TableCell className="text-center">{team.drawn}</TableCell>
                                <TableCell className="text-center">{team.lost}</TableCell>
                                <TableCell className="text-center">{team.goalsFor}</TableCell>
                                <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                                <TableCell className="text-center font-bold">{team.points}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-20">
                        <p className="text-gray-500">Données non disponibles</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Stats;

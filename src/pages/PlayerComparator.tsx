import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, Trophy, Target, Clock, ArrowRight, Shuffle, X } from "lucide-react";

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number | null;
  image_url: string | null;
  nationality: string | null;
}

interface AggregatedStats {
  matches_played: number;
  goals: number;
  assists: number;
  minutes_played: number;
  yellow_cards: number;
  red_cards: number;
}

export default function PlayerComparator() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [stats1, setStats1] = useState<AggregatedStats | null>(null);
  const [stats2, setStats2] = useState<AggregatedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (player1) fetchPlayerStats(player1.id, 1);
  }, [player1]);

  useEffect(() => {
    if (player2) fetchPlayerStats(player2.id, 2);
  }, [player2]);

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from('players')
      .select('id, name, position, jersey_number, image_url, nationality')
      .eq('is_active', true)
      .order('name');
    
    setPlayers(data || []);
    setLoading(false);
  };

  const fetchPlayerStats = async (playerId: string, playerNum: 1 | 2) => {
    // Aggregate stats from all matches for this player
    const { data } = await supabase
      .from('player_stats')
      .select('goals, assists, minutes_played, yellow_cards, red_cards')
      .eq('player_id', playerId);

    if (data && data.length > 0) {
      const aggregated: AggregatedStats = {
        matches_played: data.length,
        goals: data.reduce((sum, s) => sum + (s.goals || 0), 0),
        assists: data.reduce((sum, s) => sum + (s.assists || 0), 0),
        minutes_played: data.reduce((sum, s) => sum + (s.minutes_played || 0), 0),
        yellow_cards: data.reduce((sum, s) => sum + (s.yellow_cards || 0), 0),
        red_cards: data.reduce((sum, s) => sum + (s.red_cards || 0), 0),
      };
      if (playerNum === 1) setStats1(aggregated);
      else setStats2(aggregated);
    } else {
      if (playerNum === 1) setStats1(null);
      else setStats2(null);
    }
  };

  const handleRandomize = () => {
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    if (shuffled.length >= 2) {
      setPlayer1(shuffled[0]);
      setPlayer2(shuffled[1]);
    }
  };

  const handleSwap = () => {
    const temp = player1;
    setPlayer1(player2);
    setPlayer2(temp);
  };

  const getStatComparison = (stat1: number, stat2: number) => {
    const max = Math.max(stat1, stat2, 1);
    return {
      percent1: (stat1 / max) * 100,
      percent2: (stat2 / max) * 100,
      winner: stat1 > stat2 ? 1 : stat2 > stat1 ? 2 : 0
    };
  };

  const stats = [
    { label: "Matchs joués", key: "matches_played", icon: Trophy },
    { label: "Buts", key: "goals", icon: Target },
    { label: "Passes décisives", key: "assists", icon: Users },
    { label: "Minutes jouées", key: "minutes_played", icon: Clock },
  ];

  return (
    <>
      <SEOHead 
        title="Comparateur de Joueurs | Real Madrid Fan"
        description="Comparez les statistiques des joueurs du Real Madrid"
      />
      <Navbar />
      
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8">
        <div className="madrid-container">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Comparateur de Joueurs
            </h1>
            <p className="text-muted-foreground">
              Comparez les performances de vos joueurs préférés
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4 mb-8"
          >
            <Button variant="outline" onClick={handleRandomize} className="gap-2">
              <Shuffle className="h-4 w-4" />
              Aléatoire
            </Button>
            {player1 && player2 && (
              <Button variant="outline" onClick={handleSwap} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Inverser
              </Button>
            )}
          </motion.div>

          {/* Player Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Player 1 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-primary/10">
                  <CardTitle className="text-center text-lg">Joueur 1</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Select
                    value={player1?.id || ""}
                    onValueChange={(id) => setPlayer1(players.find(p => p.id === id) || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un joueur" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.filter(p => p.id !== player2?.id).map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.jersey_number ? `#${player.jersey_number} ` : ''}{player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {player1 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 text-center"
                    >
                      <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary">
                        <AvatarImage src={player1.image_url || ''} alt={player1.name} />
                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                          {player1.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-xl">{player1.name}</h3>
                      <div className="flex justify-center gap-2 mt-2">
                        <Badge variant="secondary">{player1.position}</Badge>
                        {player1.jersey_number && (
                          <Badge variant="outline">#{player1.jersey_number}</Badge>
                        )}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Player 2 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-secondary/20">
                  <CardTitle className="text-center text-lg">Joueur 2</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Select
                    value={player2?.id || ""}
                    onValueChange={(id) => setPlayer2(players.find(p => p.id === id) || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un joueur" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.filter(p => p.id !== player1?.id).map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.jersey_number ? `#${player.jersey_number} ` : ''}{player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {player2 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 text-center"
                    >
                      <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-secondary">
                        <AvatarImage src={player2.image_url || ''} alt={player2.name} />
                        <AvatarFallback className="text-2xl bg-secondary text-secondary-foreground">
                          {player2.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-xl">{player2.name}</h3>
                      <div className="flex justify-center gap-2 mt-2">
                        <Badge variant="secondary">{player2.position}</Badge>
                        {player2.jersey_number && (
                          <Badge variant="outline">#{player2.jersey_number}</Badge>
                        )}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stats Comparison */}
          {player1 && player2 && (stats1 || stats2) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    Comparaison des Statistiques
                    <Badge variant="outline" className="ml-2">Saison 2024-2025</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {stats.map((stat, index) => {
                    const val1 = (stats1 as any)?.[stat.key] || 0;
                    const val2 = (stats2 as any)?.[stat.key] || 0;
                    const comparison = getStatComparison(val1, val2);

                    return (
                      <motion.div
                        key={stat.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className={`font-semibold ${comparison.winner === 1 ? 'text-primary' : ''}`}>
                            {val1}
                          </span>
                          <div className="flex items-center gap-2">
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{stat.label}</span>
                          </div>
                          <span className={`font-semibold ${comparison.winner === 2 ? 'text-primary' : ''}`}>
                            {val2}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Progress 
                            value={comparison.percent1} 
                            className="h-3 flex-1 rotate-180"
                          />
                          <Progress 
                            value={comparison.percent2} 
                            className="h-3 flex-1"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Empty state */}
          {(!player1 || !player2) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Sélectionnez deux joueurs pour comparer leurs statistiques
              </p>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
}

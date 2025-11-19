import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const searchTerm = `%${query}%`;

        // Rechercher les joueurs
        const { data: playersData } = await supabase
          .from("players")
          .select("*")
          .or(`name.ilike.${searchTerm},position.ilike.${searchTerm}`)
          .eq("is_active", true)
          .order("name")
          .limit(10);

        // Rechercher les articles
        const { data: articlesData } = await supabase
          .from("articles")
          .select("*")
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},content.ilike.${searchTerm}`)
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(10);

        // Rechercher les matchs
        const { data: matchesData } = await supabase
          .from("matches")
          .select("*")
          .or(`home_team.ilike.${searchTerm},away_team.ilike.${searchTerm},venue.ilike.${searchTerm},competition.ilike.${searchTerm}`)
          .order("match_date", { ascending: false })
          .limit(10);

        setPlayers(playersData || []);
        setArticles(articlesData || []);
        setMatches(matchesData || []);
      } catch (error) {
        console.error("Erreur de recherche:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const totalResults = players.length + articles.length + matches.length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="flex-1 madrid-container py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Résultats de recherche
          </h1>
          {query && (
            <p className="text-muted-foreground">
              {loading ? (
                "Recherche en cours..."
              ) : (
                <>
                  <span className="font-medium">{totalResults}</span> résultat{totalResults !== 1 ? "s" : ""} pour "{query}"
                </>
              )}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !query ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Entrez un terme de recherche pour commencer</p>
            </CardContent>
          </Card>
        ) : totalResults === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Aucun résultat trouvé pour "{query}"</p>
              <p className="text-sm text-muted-foreground mt-2">Essayez avec d'autres mots-clés</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                Tout ({totalResults})
              </TabsTrigger>
              <TabsTrigger value="players">
                <Users className="h-4 w-4 mr-2" />
                Joueurs ({players.length})
              </TabsTrigger>
              <TabsTrigger value="articles">
                <FileText className="h-4 w-4 mr-2" />
                Actualités ({articles.length})
              </TabsTrigger>
              <TabsTrigger value="matches">
                <Calendar className="h-4 w-4 mr-2" />
                Matchs ({matches.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {players.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Joueurs</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {players.map((player) => (
                      <Link key={player.id} to={`/players/${player.id}`}>
                        <Card className="card-hover">
                          <CardContent className="p-4 flex items-center gap-4">
                            <img
                              src={player.image_url || "/placeholder.svg"}
                              alt={player.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-semibold">{player.name}</p>
                              <Badge variant="secondary" className="mt-1">{player.position}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {articles.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Actualités</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {articles.map((article) => (
                      <Link key={article.id} to={`/news/${article.id}`}>
                        <Card className="card-hover">
                          <CardContent className="p-4">
                            {article.image_url && (
                              <img
                                src={article.image_url}
                                alt={article.title}
                                className="w-full h-40 object-cover rounded-md mb-3"
                              />
                            )}
                            <Badge className="mb-2">{article.category}</Badge>
                            <h3 className="font-semibold line-clamp-2 mb-2">{article.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{article.description}</p>
                            {article.published_at && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(article.published_at), "d MMMM yyyy", { locale: fr })}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {matches.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Matchs</h2>
                  <div className="space-y-3">
                    {matches.map((match) => (
                      <Link key={match.id} to="/matches">
                        <Card className="card-hover">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <p className="font-semibold">{match.home_team}</p>
                                  <p className="text-2xl font-bold text-primary">{match.home_score ?? "-"}</p>
                                </div>
                                <span className="text-muted-foreground">vs</span>
                                <div className="text-center">
                                  <p className="font-semibold">{match.away_team}</p>
                                  <p className="text-2xl font-bold text-primary">{match.away_score ?? "-"}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">{match.competition}</Badge>
                                <p className="text-sm text-muted-foreground mt-2">
                                  {format(new Date(match.match_date), "d MMM yyyy", { locale: fr })}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="players">
              {players.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {players.map((player) => (
                    <Link key={player.id} to={`/players/${player.id}`}>
                      <Card className="card-hover">
                        <CardContent className="p-4 flex items-center gap-4">
                          <img
                            src={player.image_url || "/placeholder.svg"}
                            alt={player.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold">{player.name}</p>
                            <Badge variant="secondary" className="mt-1">{player.position}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Aucun joueur trouvé</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="articles">
              {articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map((article) => (
                    <Link key={article.id} to={`/news/${article.id}`}>
                      <Card className="card-hover">
                        <CardContent className="p-4">
                          {article.image_url && (
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-full h-40 object-cover rounded-md mb-3"
                            />
                          )}
                          <Badge className="mb-2">{article.category}</Badge>
                          <h3 className="font-semibold line-clamp-2 mb-2">{article.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{article.description}</p>
                          {article.published_at && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(article.published_at), "d MMMM yyyy", { locale: fr })}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Aucune actualité trouvée</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="matches">
              {matches.length > 0 ? (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <Link key={match.id} to="/matches">
                      <Card className="card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="font-semibold">{match.home_team}</p>
                                <p className="text-2xl font-bold text-primary">{match.home_score ?? "-"}</p>
                              </div>
                              <span className="text-muted-foreground">vs</span>
                              <div className="text-center">
                                <p className="font-semibold">{match.away_team}</p>
                                <p className="text-2xl font-bold text-primary">{match.away_score ?? "-"}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{match.competition}</Badge>
                              <p className="text-sm text-muted-foreground mt-2">
                                {format(new Date(match.match_date), "d MMM yyyy", { locale: fr })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Aucun match trouvé</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Footer />
    </div>
  );
}

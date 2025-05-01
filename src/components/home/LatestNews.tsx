
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Simuler des données d'articles
const latestNews = [
  {
    id: 1,
    title: "Victoire éclatante 3-0 contre Barcelone",
    description: "Le Real Madrid s'impose face au rival catalan avec un triplé de Mbappé",
    image: "https://assets.goal.com/v3/assets/bltcc7a7ffd2fbf71f5/blt40833499a1994542/658321c05d0e6e040ab07374/GOAL_-_Blank_WEB_-_Facebook_-_2023-12-20T153722.101.jpg",
    category: "match",
    date: "2025-04-20"
  },
  {
    id: 2,
    title: "Blessure de Rodrygo: absence de 3 semaines",
    description: "L'attaquant brésilien souffre d'une légère entorse à la cheville",
    image: "https://phantom-marca.unidadeditorial.es/d8170d7ac737a7f930879cefb7707136/resize/1320/f/jpg/assets/multimedia/imagenes/2023/12/21/17031472010196.jpg",
    category: "joueur",
    date: "2025-04-28"
  },
  {
    id: 3,
    title: "Conférence de presse: Ancelotti évoque le prochain match",
    description: "L'entraîneur italien se montre confiant avant d'affronter Manchester City",
    image: "https://phantom-marca.unidadeditorial.es/b27fbf1825a7aba57c963304f457655a/resize/1320/f/jpg/assets/multimedia/imagenes/2024/01/02/17042104099793.jpg",
    category: "conférence",
    date: "2025-04-30"
  }
];

export function LatestNews() {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "match": return "bg-green-600";
      case "joueur": return "bg-blue-600";
      case "conférence": return "bg-purple-600";
      case "mercato": return "bg-orange-600";
      default: return "bg-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <section className="py-12">
      <div className="madrid-container">
        <div className="flex justify-between items-center mb-8">
          <h2 className="section-title">Dernières Actualités</h2>
          <Button asChild variant="outline">
            <Link to="/news">Voir toutes</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestNews.map((news) => (
            <Card key={news.id} className="overflow-hidden card-hover">
              <div className="h-48 overflow-hidden">
                <img 
                  src={news.image} 
                  alt={news.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className={`${getCategoryColor(news.category)} text-white`}>
                    {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(news.date)}
                  </span>
                </div>
                <CardTitle className="line-clamp-2">{news.title}</CardTitle>
                <CardDescription className="line-clamp-2">{news.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="link" className="p-0 text-madrid-blue dark:text-blue-400">
                  <Link to={`/news/${news.id}`}>Lire l'article</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

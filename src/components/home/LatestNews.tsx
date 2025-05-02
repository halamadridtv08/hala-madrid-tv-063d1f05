
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";

// Données d'articles enrichies avec plus de détails
const latestNews = [
  {
    id: 1,
    title: "Victoire éclatante 3-0 contre Barcelone",
    description: "Le Real Madrid s'impose face au rival catalan avec un triplé de Mbappé et une performance exceptionnelle de toute l'équipe",
    image: "https://assets.goal.com/v3/assets/bltcc7a7ffd2fbf71f5/blt40833499a1994542/658321c05d0e6e040ab07374/GOAL_-_Blank_WEB_-_Facebook_-_2023-12-20T153722.101.jpg",
    category: "match",
    date: "2025-04-20",
    author: "Carlos Rodriguez",
    readTime: "4 min"
  },
  {
    id: 2,
    title: "Blessure de Rodrygo: absence de 3 semaines",
    description: "L'attaquant brésilien souffre d'une légère entorse à la cheville et devra suivre un protocole de récupération spécifique",
    image: "https://phantom-marca.unidadeditorial.es/d8170d7ac737a7f930879cefb7707136/resize/1320/f/jpg/assets/multimedia/imagenes/2023/12/21/17031472010196.jpg",
    category: "joueur",
    date: "2025-04-28",
    author: "Maria Gonzalez",
    readTime: "3 min"
  },
  {
    id: 3,
    title: "Conférence de presse: Ancelotti évoque le prochain match",
    description: "L'entraîneur italien se montre confiant avant d'affronter Manchester City en demi-finale de Ligue des Champions",
    image: "https://phantom-marca.unidadeditorial.es/b27fbf1825a7aba57c963304f457655a/resize/1320/f/jpg/assets/multimedia/imagenes/2024/01/02/17042104099793.jpg",
    category: "conférence",
    date: "2025-04-30",
    author: "Luis Fernandez",
    readTime: "5 min"
  },
  {
    id: 4,
    title: "Kroos envisage de prolonger son contrat",
    description: "Le milieu de terrain allemand réfléchit à une possible extension de son contrat avec le Real Madrid",
    image: "https://media.gettyimages.com/id/1600540657/photo/real-madrid-v-fc-barcelona-laliga-ea-sports.jpg?s=2048x2048&w=gi&k=20&c=ffydsit1NVQygII42U9y0edWjb-0cocZkWZ_M2jxzd4=",
    category: "mercato",
    date: "2025-05-01",
    author: "Sofia Martinez",
    readTime: "2 min"
  },
  {
    id: 5,
    title: "Hommage à Roberto Carlos au Bernabéu",
    description: "Le légendaire défenseur brésilien sera honoré lors d'une cérémonie spéciale avant le prochain match à domicile",
    image: "https://media.gettyimages.com/id/1550618809/photo/uefa-champions-league-finale-real-madrid-cf-v-borussia-dortmund-celebration.jpg?s=2048x2048&w=gi&k=20&c=UGkoaMV5npG7_iXc1G2EcCBeBURQZXOk1bYgwx-z3Po=",
    category: "hommage",
    date: "2025-05-03",
    author: "Javier Moreno",
    readTime: "4 min"
  },
  {
    id: 6,
    title: "Le programme de formation des jeunes se renforce",
    description: "Le Real Madrid investit dans de nouvelles infrastructures pour son académie afin de développer les futures stars",
    image: "https://media.gettyimages.com/id/1254136250/photo/the-main-entrance-of-real-madrid-city-training-ground-during-the-uefa-super-cup-final-between.jpg?s=2048x2048&w=gi&k=20&c=9MNRMHESNyhcfLvReS-1FdnLPX2gBnBGWmtoyVx0fSk=",
    category: "formation",
    date: "2025-05-05",
    author: "Ana Lopez",
    readTime: "6 min"
  }
];

export function LatestNews() {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "match": return "bg-green-600";
      case "joueur": return "bg-blue-600";
      case "conférence": return "bg-purple-600";
      case "mercato": return "bg-orange-600";
      case "hommage": return "bg-red-600";
      case "formation": return "bg-teal-600";
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
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={news.image} 
                  alt={news.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white text-gray-800 font-medium">
                    {news.readTime} de lecture
                  </Badge>
                </div>
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
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>{news.author}</span>
                </div>
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

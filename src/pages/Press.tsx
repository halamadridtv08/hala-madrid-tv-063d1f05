
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar } from "lucide-react";

const Press = () => {
  // Simuler des données de conférences de presse
  const pressConferences = [
    {
      id: 1,
      title: "Conférence d'avant-match: Real Madrid - Manchester City",
      description: "Carlo Ancelotti et Toni Kroos s'expriment avant la demi-finale de Ligue des Champions",
      thumbnail: "https://phantom-marca.unidadeditorial.es/b27fbf1825a7aba57c963304f457655a/resize/1320/f/jpg/assets/multimedia/imagenes/2024/01/02/17042104099793.jpg",
      date: "2025-04-30",
      duration: "25:14"
    },
    {
      id: 2,
      title: "Réactions d'après-match: El Clásico",
      description: "Les réactions des joueurs après la victoire face au FC Barcelone",
      thumbnail: "https://assets.goal.com/v3/assets/bltcc7a7ffd2fbf71f5/blt40833499a1994542/658321c05d0e6e040ab07374/GOAL_-_Blank_WEB_-_Facebook_-_2023-12-20T153722.101.jpg",
      date: "2025-04-21",
      duration: "18:33"
    },
    {
      id: 3,
      title: "Présentation du nouveau joueur: Kylian Mbappé",
      description: "Conférence de presse de présentation du nouvel attaquant français",
      thumbnail: "https://static.independent.co.uk/2024/01/30/11/AFP_34A2227.jpg",
      date: "2025-04-15",
      duration: "32:47"
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <>
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          <h1 className="section-title mb-8">Conférences de Presse</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pressConferences.map((conference) => (
              <Card key={conference.id} className="overflow-hidden card-hover">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={conference.thumbnail} 
                    alt={conference.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    {conference.duration}
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-purple-600 text-white">
                      Conférence
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(conference.date)}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{conference.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{conference.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="secondary" className="w-full">
                    <Video className="mr-2 h-4 w-4" /> Regarder la conférence
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Press;


import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

const Training = () => {
  // Simuler des données de vidéos d'entrainement
  const trainingVideos = [
    {
      id: 1,
      title: "Séance d'entrainement intensive avant le Clasico",
      description: "L'équipe se prépare pour le grand match contre le FC Barcelone",
      thumbnail: "https://phantom-marca.unidadeditorial.es/f926afc1dd62c436570f750a872cbd0d/resize/1320/f/jpg/assets/multimedia/imagenes/2023/10/14/16972436453790.jpg",
      date: "2025-04-25",
      duration: "15:32"
    },
    {
      id: 2,
      title: "Exercices tactiques avec Ancelotti",
      description: "Le coach explique les nouvelles stratégies à l'équipe",
      thumbnail: "https://phantom-marca.unidadeditorial.es/0868f59fa246c137d3a8c61b3d922fee/resize/1320/f/jpg/assets/multimedia/imagenes/2024/01/23/17060101265743.jpg",
      date: "2025-04-22",
      duration: "12:45"
    },
    {
      id: 3,
      title: "Séance de récupération post-match",
      description: "Les joueurs après la victoire contre Manchester City",
      thumbnail: "https://img.a.transfermarkt.technology/portrait/big/342229-1663071254.jpg?lm=1",
      date: "2025-04-18",
      duration: "08:21"
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
          <h1 className="section-title mb-8">Séances d'Entrainement</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden card-hover">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    {video.duration}
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-madrid-blue text-white">
                      Entrainement
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(video.date)}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="secondary" className="w-full">
                    <Video className="mr-2 h-4 w-4" /> Regarder la vidéo
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

export default Training;

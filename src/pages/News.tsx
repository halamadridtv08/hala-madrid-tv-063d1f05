
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";

const News = () => {
  // Simuler des données d'articles
  const allNews = [
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
    },
    {
      id: 4,
      title: "Rumeur mercato: Le Real Madrid s'intéresse à un jeune talent brésilien",
      description: "Le club madrilène aurait des vues sur Endrick, jeune prodige de Palmeiras",
      image: "https://library.sportingnews.com/styles/twitter_card_120x120/s3/2023-01/Endrick%20-%20cropped.jpg?itok=UxmGMXxM",
      category: "mercato",
      date: "2025-04-15"
    },
    {
      id: 5,
      title: "Extension de contrat pour Valverde",
      description: "Le milieu uruguayen prolonge l'aventure jusqu'en 2029",
      image: "https://assets-fr.imgfoot.com/media/cache/642x382/federico-valverde-2223.jpg",
      category: "joueur",
      date: "2025-04-10"
    },
    {
      id: 6,
      title: "Le Real Madrid établit un nouveau record de possession",
      description: "Avec 78% de possession contre Getafe, l'équipe établit un nouveau record du club",
      image: "https://images2.minutemediacdn.com/image/upload/c_crop,w_5196,h_2922,x_0,y_542/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/images/GettyImages/mmsport/90min_fr_international_web/01gwwnb3f6m0vpbqzqwn.jpg",
      category: "match",
      date: "2025-04-05"
    }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredNews = allNews.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         news.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === null || news.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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

  const categories = [
    { name: "Tous", value: null },
    { name: "Match", value: "match" },
    { name: "Joueur", value: "joueur" },
    { name: "Conférence", value: "conférence" },
    { name: "Mercato", value: "mercato" }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="bg-madrid-blue py-10">
          <div className="madrid-container">
            <h1 className="text-4xl font-bold text-white mb-4">Actualités</h1>
          </div>
        </div>

        <div className="madrid-container py-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between">
            <Input
              placeholder="Rechercher une actualité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category.value ?? "all"}
                  className={`cursor-pointer ${
                    selectedCategory === category.value 
                    ? "bg-madrid-gold text-black" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map(news => (
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

          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Aucune actualité trouvée</h3>
              <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default News;

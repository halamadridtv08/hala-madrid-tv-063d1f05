
import { useEffect, useState } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';

export function NewsCarousel() {
  // Données enrichies avec plus de détails et d'images
  const slides = [
    {
      id: 1,
      title: "Mbappé signe au Real Madrid",
      description: "La star française rejoint enfin le club madrilène avec un contrat de 5 ans",
      image: "https://media.gettyimages.com/id/1809515629/photo/real-madrid-cf-unveil-new-signing-kylian-mbappe-at-estadio-santiago-bernabeu-on-july-16-2024.jpg?s=2048x2048&w=gi&k=20&c=YecqQkxXHhuhfLrqKDsz-lIj-fPlMNZZnt-EvIr1L40=",
      category: "Transfert",
      date: "16/07/2025",
      link: "/news/1",
      author: "Carlos Mendoza"
    },
    {
      id: 2,
      title: "Victoire éclatante 3-0 contre Barcelone",
      description: "Le Real Madrid s'impose avec autorité dans le Clasico grâce à un jeu collectif remarquable",
      image: "https://assets.goal.com/v3/assets/bltcc7a7ffd2fbf71f5/blt40833499a1994542/658321c05d0e6e040ab07374/GOAL_-_Blank_WEB_-_Facebook_-_2023-12-20T153722.101.jpg",
      category: "Match",
      date: "20/04/2025",
      link: "/news/2",
      author: "Sofia Martinez"
    },
    {
      id: 3,
      title: "Bellingham élu joueur du mois",
      description: "Le milieu anglais continue d'impressionner avec ses performances exceptionnelles",
      image: "https://phantom-marca.unidadeditorial.es/d8170d7ac737a7f930879cefb7707136/resize/1320/f/jpg/assets/multimedia/imagenes/2023/12/21/17031472010196.jpg",
      category: "Récompense",
      date: "01/04/2025",
      link: "/news/3",
      author: "Luis Rodriguez"
    },
    {
      id: 4,
      title: "Nouvelles installations d'entraînement inaugurées",
      description: "Le club dévoile des installations ultramodernes pour optimiser la préparation des joueurs",
      image: "https://media.gettyimages.com/id/1647102199/photo/real-madrid-players-have-a-training-session-at-real-madrid-city-on-october-22-2023-in-madrid.jpg?s=2048x2048&w=gi&k=20&c=DrjnAEQUQHZXetCdUyxFNiy7pO7ZbJ9DQv1ju-eawvI=",
      category: "Infrastructure",
      date: "15/03/2025",
      link: "/news/4",
      author: "Maria Sanchez"
    },
    {
      id: 5,
      title: "Ancelotti prolonge son contrat jusqu'en 2027",
      description: "L'entraîneur italien s'engage pour deux saisons supplémentaires avec le club merengue",
      image: "https://media.gettyimages.com/id/2055944671/photo/la-liga-santander-atletico-de-madrid-v-real-madrid-cf.jpg?s=2048x2048&w=gi&k=20&c=A28ZqpQ8XoNWHCvG4EOwiYVXonAnrX0QkYdKmG2gBrk=",
      category: "Contrat",
      date: "10/03/2025",
      link: "/news/5",
      author: "Miguel Torres"
    }
  ];

  const [api, setApi] = useState<any>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    if (emblaApi) {
      setApi(emblaApi);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [api]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Match": return "bg-green-600";
      case "Transfert": return "bg-blue-600";
      case "Récompense": return "bg-purple-600";
      case "Infrastructure": return "bg-orange-600";
      case "Contrat": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="relative overflow-hidden">
      <Carousel 
        setApi={setApi}
        className="w-full"
        opts={{ loop: true }}
      >
        <CarouselContent ref={emblaRef}>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="p-1">
                <Card className="overflow-hidden border-none">
                  <CardContent className="p-0">
                    <div className="relative h-[500px] w-full">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex justify-between items-center mb-2">
                          <Badge className={`${getCategoryColor(slide.category)} mb-2`}>
                            {slide.category}
                          </Badge>
                          <span className="text-sm opacity-80">{slide.date} | Par {slide.author}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                        <p className="text-lg mb-4 opacity-90">{slide.description}</p>
                        <Button asChild className="bg-madrid-gold text-black hover:bg-yellow-400">
                          <Link to={slide.link}>Lire l'article</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          <CarouselPrevious className="h-8 w-8 rounded-full bg-white/50 hover:bg-white -translate-y-0 static" />
          <CarouselNext className="h-8 w-8 rounded-full bg-white/50 hover:bg-white -translate-y-0 static" />
        </div>
      </Carousel>
    </div>
  );
}

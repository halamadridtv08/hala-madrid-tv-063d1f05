
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
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import useEmblaCarousel from 'embla-carousel-react';
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  category: string;
  published_at: string;
  read_time: string | null;
  author_id: string;
}

export function NewsCarousel() {
  const [slides, setSlides] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<any>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('is_published', true)
          .eq('featured', true)
          .order('published_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        setSlides(data || []);
      } catch (error) {
        console.error('Error fetching featured articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArticles();
  }, []);

  useEffect(() => {
    if (emblaApi) {
      setApi(emblaApi);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!api || slides.length <= 1) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [api, slides.length]);

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

  if (loading) {
    return (
      <div className="relative overflow-hidden">
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 h-[300px] flex items-center justify-center">
        <div className="text-center p-8">
          <h3 className="text-2xl font-bold mb-2">Pas d'articles à la une</h3>
          <p className="text-gray-500 mb-4">Marquez des articles comme "À la une" pour qu'ils apparaissent ici</p>
        </div>
      </div>
    );
  }

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
                        src={slide.image_url || "https://via.placeholder.com/1200x500?text=Real+Madrid"}
                        alt={slide.title}
                        className="w-full h-full object-cover object-center"
                        width="1200"
                        height="500"
                        fetchPriority="high"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="flex justify-between items-center mb-1">
                          <Badge className={`${getCategoryColor(slide.category)} text-xs`}>
                            {slide.category.charAt(0).toUpperCase() + slide.category.slice(1)}
                          </Badge>
                          <span className="text-xs opacity-80">
                            {formatDate(slide.published_at)} {slide.read_time && `| ${slide.read_time} de lecture`}
                          </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold mb-1 line-clamp-2">{slide.title}</h2>
                        <p className="text-sm mb-3 opacity-90 line-clamp-2">{slide.description}</p>
                        <Button asChild className="bg-madrid-gold text-black hover:bg-yellow-400 text-sm py-1 h-8">
                          <Link to={`/news/${slide.id}`}>Lire l'article</Link>
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

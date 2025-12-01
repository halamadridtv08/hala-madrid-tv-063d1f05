import { useEffect, useState } from "react";
import { stripHtml } from "@/utils/stripHtml";
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
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

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
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
      setProgress(0);
    });
  }, [api]);

  useEffect(() => {
    if (!api || slides.length <= 1 || isPaused) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          api.scrollNext();
          return 0;
        }
        return prev + (100 / 70); // 7000ms / 100ms = 70 steps
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [api, slides.length, isPaused]);

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
    <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-4">
      <div 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <Carousel 
          setApi={setApi}
          className="w-full"
          opts={{ 
            loop: true,
            duration: 30
          }}
        >
        <CarouselContent>
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
                        <p className="text-sm mb-3 opacity-90 line-clamp-2">{stripHtml(slide.description)}</p>
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
        
        {/* Progress indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className="group relative"
              aria-label={`Aller à l'article ${index + 1}`}
            >
              <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{ 
                    width: current === index ? `${progress}%` : current > index ? '100%' : '0%'
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </Carousel>
      </div>

      {/* Desktop sidebar thumbnails */}
      <div className="hidden lg:block">
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-2">
          <h3 className="text-sm font-semibold text-foreground mb-2">Autres actualités</h3>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => api?.scrollTo(index)}
              className={`group relative flex gap-3 p-2 rounded-lg transition-all hover:bg-accent/10 ${
                current === index ? 'bg-accent/20 ring-2 ring-primary' : ''
              }`}
            >
              <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden">
                <img
                  src={slide.image_url || "https://via.placeholder.com/200x100?text=RM"}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                {current === index && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <Badge className={`${getCategoryColor(slide.category)} text-xs mb-1`}>
                  {slide.category}
                </Badge>
                <p className="text-xs font-medium line-clamp-2 text-foreground">
                  {slide.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(slide.published_at).split(' ').slice(0, 2).join(' ')}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

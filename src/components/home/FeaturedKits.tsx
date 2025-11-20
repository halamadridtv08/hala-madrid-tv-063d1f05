import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const FeaturedKits = () => {
  const [featuredKits, setFeaturedKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedKits = async () => {
      try {
        const { data: kitsData, error: kitsError } = await supabase
          .from('kits')
          .select('*')
          .eq('is_featured', true)
          .eq('is_published', true)
          .order('display_order', { ascending: true });

        if (kitsError) {
          console.error('Error fetching kits:', kitsError);
          return;
        }

        // Fetch primary image for each kit
        const kitsWithImages = await Promise.all(
          (kitsData || []).map(async (kit) => {
            const { data: imagesData } = await supabase
              .from('kit_images')
              .select('*')
              .eq('kit_id', kit.id)
              .order('is_primary', { ascending: false })
              .order('display_order', { ascending: true })
              .limit(1);

            return { 
              ...kit, 
              image_url: imagesData?.[0]?.image_url || kit.image_url 
            };
          })
        );

        setFeaturedKits(kitsWithImages || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedKits();
  }, []);

  if (loading) {
    return (
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="madrid-container">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="madrid-container">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="section-title text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
            Collections en vedette
          </h2>
          <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
            <Link to="/kits" className="flex items-center gap-2">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {/* Mobile carousel */}
        <div className="sm:hidden">
          <Carousel
            opts={{
              align: "start",
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {featuredKits.map((kit) => (
                <CarouselItem key={kit.id} className="pl-4 basis-[85%]">
                  <Card className="group overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500">
                    <CardContent className="p-0 relative">
                      <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-background to-muted">
                        {kit.image_url ? (
                          <img
                            src={kit.image_url}
                            alt={kit.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'flex flex-col items-center justify-center h-full text-muted-foreground bg-muted';
                                placeholder.innerHTML = '<div class="text-6xl mb-4">👕</div><div class="text-lg font-semibold">IMAGE COMING SOON</div>';
                                parent.appendChild(placeholder);
                              }
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <div className="text-6xl mb-4">👕</div>
                            <div className="text-lg font-semibold">IMAGE COMING SOON</div>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                          <h3 className="text-white font-bold text-lg mb-2 drop-shadow-lg">
                            {kit.title}
                          </h3>
                          <p className="text-white/90 text-sm mb-3 drop-shadow-lg line-clamp-2">
                            {kit.description}
                          </p>
                          <Button asChild size="sm" className="w-full bg-madrid-gold text-madrid-blue hover:bg-madrid-gold/90">
                            <Link to="/kits">
                              Découvrir
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredKits.map((kit) => (
            <Card key={kit.id} className="group overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <CardContent className="p-0 relative">
                <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-background to-muted">
                  {kit.image_url ? (
                    <img
                      src={kit.image_url}
                      alt={kit.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'flex flex-col items-center justify-center h-full text-muted-foreground bg-muted';
                          placeholder.innerHTML = '<div class="text-6xl mb-4">👕</div><div class="text-lg font-semibold">IMAGE COMING SOON</div>';
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted">
                      <div className="text-6xl mb-4">👕</div>
                      <div className="text-lg font-semibold">IMAGE COMING SOON</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {kit.title}
                  </h3>
                  
                  <Button 
                    asChild
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-300 transform group-hover:scale-105"
                    size="lg"
                  >
                    <Link to="/kits">
                      Voir la collection
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedKits;
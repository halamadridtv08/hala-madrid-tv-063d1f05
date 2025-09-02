import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const FeaturedKits = () => {
  const [featuredKits, setFeaturedKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedKits = async () => {
      try {
        const { data, error } = await supabase
          .from('kits')
          .select('*')
          .eq('is_featured', true)
          .eq('is_published', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error fetching kits:', error);
          return;
        }

        setFeaturedKits(data || []);
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredKits.map((kit) => (
            <Card key={kit.id} className="group overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <CardContent className="p-0 relative">
                <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-background to-muted">
                  <img
                    src={kit.image_url || '/placeholder.svg'}
                    alt={kit.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FeaturedKits = () => {
  // Collections en vedette - 3 maillots principaux
  const featuredKits = [
    {
      id: 1,
      title: "Domicile 25/26",
      image: "https://images.footballfanatics.com/real-madrid/real-madrid-home-shirt-2023-24_ss4_p-13369593+u-qwaj5h4fejb6c10qmv0g+v-a2ffe158eaf84f48b03382217c591319.jpg?_hv=2&w=900",
      type: "Domicile"
    },
    {
      id: 2,
      title: "Tenue extérieur 25/26",
      image: "https://images.footballfanatics.com/real-madrid/real-madrid-away-shirt-2023-24_ss4_p-13369599+u-9wlae8hv115ibm12y76w+v-3e891a40dc0f4d079a5c5cb41d35cf2a.jpg?_hv=2&w=900",
      type: "Extérieur"
    },
    {
      id: 3,
      title: "Troisième kit 25/26",
      image: "https://shop.adidas.jp/contents/product/GY8597/main/adidas_GY8597_standard-F3F4F6-standard-F3F4F6-standard-E2E2E2-standard-E2E2E2-standard-F3F4F6-standard-F3F4F6.jpg",
      type: "Third"
    }
  ];

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {featuredKits.map((kit) => (
            <Card key={kit.id} className="group overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <CardContent className="p-0 relative">
                <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-background to-muted">
                  <img
                    src={kit.image}
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
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-300 transform group-hover:scale-105"
                    size="lg"
                  >
                    Acheter maintenant
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

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, ShoppingCart } from "lucide-react";

const Kits = () => {
  // Simuler des données de maillots
  const kits = [
    {
      id: 1,
      title: "Maillot Domicile 2024/25",
      description: "Le nouveau maillot domicile pour la saison 2024/25",
      image: "https://images.footballfanatics.com/real-madrid/real-madrid-home-shirt-2023-24_ss4_p-13369593+u-qwaj5h4fejb6c10qmv0g+v-a2ffe158eaf84f48b03382217c591319.jpg?_hv=2&w=900",
      type: "Domicile",
      price: "€99,99",
      season: "2024/2025"
    },
    {
      id: 2,
      title: "Maillot Extérieur 2024/25",
      description: "Le nouveau maillot extérieur pour la saison 2024/25",
      image: "https://images.footballfanatics.com/real-madrid/real-madrid-away-shirt-2023-24_ss4_p-13369599+u-9wlae8hv115ibm12y76w+v-3e891a40dc0f4d079a5c5cb41d35cf2a.jpg?_hv=2&w=900",
      type: "Extérieur",
      price: "€99,99",
      season: "2024/2025"
    },
    {
      id: 3,
      title: "Maillot Third 2024/25",
      description: "Le troisième maillot pour la saison 2024/25",
      image: "https://shop.adidas.jp/contents/product/GY8597/main/adidas_GY8597_standard-F3F4F6-standard-F3F4F6-standard-E2E2E2-standard-E2E2E2-standard-F3F4F6-standard-F3F4F6.jpg",
      type: "Third",
      price: "€89,99",
      season: "2024/2025"
    },
    {
      id: 4,
      title: "Maillot Gardien 2024/25",
      description: "Le maillot de gardien pour la saison 2024/25",
      image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/8f2e66ed6aaa41fd9991afac00a85c7e_9366/Maillot_Gardien_de_but_Real_Madrid_23-24_Vert_HR1740_01_laydown.jpg",
      type: "Gardien",
      price: "€89,99",
      season: "2024/2025"
    },
  ];

  const getKitColor = (type) => {
    switch (type) {
      case "Domicile": return "bg-madrid-blue";
      case "Extérieur": return "bg-black";
      case "Third": return "bg-purple-600";
      case "Gardien": return "bg-green-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          <h1 className="section-title mb-8">Nouveaux Maillots</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kits.map((kit) => (
              <Card key={kit.id} className="overflow-hidden card-hover">
                <div className="relative h-60 overflow-hidden bg-gray-50">
                  <img 
                    src={kit.image} 
                    alt={kit.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={`${getKitColor(kit.type)} text-white`}>
                      {kit.type}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {kit.season}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-1">{kit.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{kit.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between items-center">
                  <span className="font-bold text-lg">{kit.price}</span>
                  <Button size="sm">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Acheter
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

export default Kits;

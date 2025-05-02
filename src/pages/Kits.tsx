
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState } from "react";

const Kits = () => {
  // Données simplifiées des maillots
  const kits = [
    {
      id: 1,
      title: "Maillot Domicile 2024/25",
      image: "https://images.footballfanatics.com/real-madrid/real-madrid-home-shirt-2023-24_ss4_p-13369593+u-qwaj5h4fejb6c10qmv0g+v-a2ffe158eaf84f48b03382217c591319.jpg?_hv=2&w=900",
      type: "Domicile",
      season: "2024/2025"
    },
    {
      id: 2,
      title: "Maillot Extérieur 2024/25",
      image: "https://images.footballfanatics.com/real-madrid/real-madrid-away-shirt-2023-24_ss4_p-13369599+u-9wlae8hv115ibm12y76w+v-3e891a40dc0f4d079a5c5cb41d35cf2a.jpg?_hv=2&w=900",
      type: "Extérieur",
      season: "2024/2025"
    },
    {
      id: 3,
      title: "Maillot Third 2024/25",
      image: "https://shop.adidas.jp/contents/product/GY8597/main/adidas_GY8597_standard-F3F4F6-standard-F3F4F6-standard-E2E2E2-standard-E2E2E2-standard-F3F4F6-standard-F3F4F6.jpg",
      type: "Third",
      season: "2024/2025"
    },
    {
      id: 4,
      title: "Maillot Gardien 2024/25",
      image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/8f2e66ed6aaa41fd9991afac00a85c7e_9366/Maillot_Gardien_de_but_Real_Madrid_23-24_Vert_HR1740_01_laydown.jpg",
      type: "Gardien",
      season: "2024/2025"
    }
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

  const [hoveredKit, setHoveredKit] = useState(null);

  return (
    <>
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          <h1 className="section-title mb-8">Maillots 2024/2025</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {kits.map((kit) => (
              <motion.div
                key={kit.id}
                className="h-full"
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                onHoverStart={() => setHoveredKit(kit.id)}
                onHoverEnd={() => setHoveredKit(null)}
              >
                <Card className="overflow-hidden h-full shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-96 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <motion.img 
                      src={kit.image} 
                      alt={kit.title}
                      className="object-contain max-h-full max-w-full"
                      initial={{ rotateY: 0 }}
                      animate={{ 
                        rotateY: hoveredKit === kit.id ? [0, -15, 0, 15, 0] : 0,
                        y: hoveredKit === kit.id ? [0, -10, 0] : 0
                      }}
                      transition={{ 
                        duration: hoveredKit === kit.id ? 3 : 0.5,
                        ease: "easeInOut",
                        repeat: hoveredKit === kit.id ? Infinity : 0,
                        repeatDelay: 1
                      }}
                      style={{ 
                        transformStyle: "preserve-3d",
                        transformOrigin: "center"
                      }}
                    />
                    
                    {hoveredKit === kit.id && (
                      <motion.div
                        className="absolute inset-0 z-10 bg-gradient-to-t from-black/20 to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>

                  <CardContent className="p-4 text-center">
                    <Badge className={`${getKitColor(kit.type)} text-white mb-2`}>
                      {kit.type}
                    </Badge>
                    <h3 className="text-xl font-bold">{kit.title}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Kits;

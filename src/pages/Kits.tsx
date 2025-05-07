
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const Kits = () => {
  // Données simplifiées des maillots
  const kits = [
    {
      id: 1,
      title: "Maillot Domicile 2024/25",
      image: "https://images.footballfanatics.com/real-madrid/real-madrid-home-shirt-2023-24_ss4_p-13369593+u-qwaj5h4fejb6c10qmv0g+v-a2ffe158eaf84f48b03382217c591319.jpg?_hv=2&w=900",
      type: "Domicile",
      season: "2024/2025",
      gallery: [
        "https://images.footballfanatics.com/real-madrid/real-madrid-home-shirt-2023-24_ss4_p-13369593+u-qwaj5h4fejb6c10qmv0g+v-a2ffe158eaf84f48b03382217c591319.jpg?_hv=2&w=900",
        "https://store.realmadrid.com/dw/image/v2/BJYX_PRD/on/demandware.static/-/Sites-rmg-master-catalog-basketball/es/dwbbdf37f5/images/GR4327/GR432711_GR4327_1.jpg?sw=800&sh=800&q=80&strip=false",
        "https://store.realmadrid.com/dw/image/v2/BJYX_PRD/on/demandware.static/-/Sites-rmg-master-catalog-basketball/es/dw05eef974/images/GR4327/GR432711_GR4327_2.jpg?sw=800&sh=800&q=80&strip=false"
      ]
    },
    {
      id: 2,
      title: "Maillot Extérieur 2024/25",
      image: "https://images.footballfanatics.com/real-madrid/real-madrid-away-shirt-2023-24_ss4_p-13369599+u-9wlae8hv115ibm12y76w+v-3e891a40dc0f4d079a5c5cb41d35cf2a.jpg?_hv=2&w=900",
      type: "Extérieur",
      season: "2024/2025",
      gallery: [
        "https://images.footballfanatics.com/real-madrid/real-madrid-away-shirt-2023-24_ss4_p-13369599+u-9wlae8hv115ibm12y76w+v-3e891a40dc0f4d079a5c5cb41d35cf2a.jpg?_hv=2&w=900",
        "https://store.realmadrid.com/dw/image/v2/BJYX_PRD/on/demandware.static/-/Sites-rmg-master-catalog-basketball/es/dwe89b7b6d/images/GR4334/GR433411_GR4334_1.jpg?sw=800&sh=800&q=80&strip=false",
        "https://store.realmadrid.com/dw/image/v2/BJYX_PRD/on/demandware.static/-/Sites-rmg-master-catalog-basketball/es/dwb464118e/images/GR4334/GR433411_GR4334_2.jpg?sw=800&sh=800&q=80&strip=false"
      ]
    },
    {
      id: 3,
      title: "Maillot Third 2024/25",
      image: "https://shop.adidas.jp/contents/product/GY8597/main/adidas_GY8597_standard-F3F4F6-standard-F3F4F6-standard-E2E2E2-standard-E2E2E2-standard-F3F4F6-standard-F3F4F6.jpg",
      type: "Third",
      season: "2024/2025",
      gallery: [
        "https://shop.adidas.jp/contents/product/GY8597/main/adidas_GY8597_standard-F3F4F6-standard-F3F4F6-standard-E2E2E2-standard-E2E2E2-standard-F3F4F6-standard-F3F4F6.jpg",
        "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/b50d7e435f5645dba239afbe00b2dccb_9366/Maillot_Third_Real_Madrid_23-24_Noir_HT1394_21_model.jpg",
        "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/a0120661d30e4173aad9afbe00b2e7b9_9366/Maillot_Third_Real_Madrid_23-24_Noir_HT1394_23_hover_model.jpg"
      ]
    },
    {
      id: 4,
      title: "Maillot Gardien 2024/25",
      image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/8f2e66ed6aaa41fd9991afac00a85c7e_9366/Maillot_Gardien_de_but_Real_Madrid_23-24_Vert_HR1740_01_laydown.jpg",
      type: "Gardien",
      season: "2024/2025",
      gallery: [
        "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/8f2e66ed6aaa41fd9991afac00a85c7e_9366/Maillot_Gardien_de_but_Real_Madrid_23-24_Vert_HR1740_01_laydown.jpg",
        "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/73db90601ba74224af3fafbe00b3446c_9366/Maillot_Gardien_de_but_Real_Madrid_23-24_Vert_HR1740_02_laydown.jpg"
      ]
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
  const [selectedKit, setSelectedKit] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openGallery = (kit) => {
    setSelectedKit(kit);
    setCurrentImageIndex(0);
  };

  const closeGallery = () => {
    setSelectedKit(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedKit) {
      setCurrentImageIndex((prev) => 
        prev === selectedKit.gallery.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedKit) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedKit.gallery.length - 1 : prev - 1
      );
    }
  };

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
                onClick={() => openGallery(kit)}
              >
                <Card className="overflow-hidden h-full shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer">
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
                        className="absolute inset-0 z-10 bg-gradient-to-t from-black/20 to-transparent flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium">
                          Voir plus d'images
                        </span>
                      </motion.div>
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

        {/* Gallery Modal */}
        <Dialog open={selectedKit !== null} onOpenChange={(open) => !open && closeGallery()}>
          <DialogContent className="max-w-4xl w-[90vw]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedKit?.title}
                {selectedKit && (
                  <Badge className={`${getKitColor(selectedKit.type)} text-white ml-2`}>
                    {selectedKit.type}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="relative mt-2 bg-gray-100 rounded-md overflow-hidden">
              {selectedKit && (
                <div className="aspect-[4/3] w-full relative">
                  <motion.img 
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    src={selectedKit.gallery[currentImageIndex]} 
                    alt={`${selectedKit.title} - Image ${currentImageIndex + 1}`}
                    className="object-contain w-full h-full"
                  />
                </div>
              )}

              <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-full bg-white/80 hover:bg-white shadow-md" 
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white/80 hover:bg-white shadow-md"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
              <div className="absolute top-4 right-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white/80 hover:bg-white shadow-md"
                  onClick={(e) => { e.stopPropagation(); closeGallery(); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Thumbnails */}
            {selectedKit && (
              <div className="flex gap-2 overflow-x-auto py-2 px-1 mt-4">
                {selectedKit.gallery.map((img, index) => (
                  <motion.div 
                    key={index}
                    className={`h-16 w-16 rounded-md overflow-hidden cursor-pointer border-2 ${
                      currentImageIndex === index ? 'border-madrid-blue' : 'border-transparent'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </>
  );
};

export default Kits;

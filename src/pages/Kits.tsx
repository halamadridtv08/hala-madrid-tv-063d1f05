
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
      <main className="min-h-screen">
        <div className="madrid-container py-4 sm:py-6 lg:py-8">
          <h1 className="section-title mb-6 sm:mb-8 text-center sm:text-left text-2xl sm:text-3xl md:text-4xl">
            Maillots 2024/2025
          </h1>
          
          {/* Responsive grid with better breakpoints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {kits.map((kit) => (
              <motion.div
                key={kit.id}
                className="h-full"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setHoveredKit(kit.id)}
                onHoverEnd={() => setHoveredKit(null)}
                onClick={() => openGallery(kit)}
              >
                <Card className="overflow-hidden h-full shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                  <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <motion.img 
                      src={kit.image} 
                      alt={kit.title}
                      className="object-contain max-h-full max-w-full p-2 sm:p-4"
                      initial={{ rotateY: 0 }}
                      animate={{ 
                        rotateY: hoveredKit === kit.id ? [0, -10, 0, 10, 0] : 0,
                        y: hoveredKit === kit.id ? [0, -5, 0] : 0
                      }}
                      transition={{ 
                        duration: hoveredKit === kit.id ? 2 : 0.5,
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
                        className="absolute inset-0 z-10 bg-gradient-to-t from-black/30 to-transparent flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-white bg-black/60 px-3 py-2 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
                          Voir plus d'images
                        </span>
                      </motion.div>
                    )}
                  </div>

                  <CardContent className="p-3 sm:p-4 text-center">
                    <Badge className={`${getKitColor(kit.type)} text-white mb-2 text-xs sm:text-sm`}>
                      {kit.type}
                    </Badge>
                    <h3 className="text-lg sm:text-xl font-bold line-clamp-2">{kit.title}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Enhanced responsive gallery modal */}
        <Dialog open={selectedKit !== null} onOpenChange={(open) => !open && closeGallery()}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl w-full h-[90vh] sm:h-auto max-h-[90vh] p-2 sm:p-6">
            <DialogHeader className="px-2 sm:px-0">
              <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
                <span className="line-clamp-2">{selectedKit?.title}</span>
                {selectedKit && (
                  <Badge className={`${getKitColor(selectedKit.type)} text-white self-start sm:ml-2 text-xs sm:text-sm`}>
                    {selectedKit.type}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="relative mt-2 bg-gray-100 rounded-md overflow-hidden flex-1">
              {selectedKit && (
                <div className="aspect-[4/3] w-full relative">
                  <motion.img 
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    src={selectedKit.gallery[currentImageIndex]} 
                    alt={`${selectedKit.title} - Image ${currentImageIndex + 1}`}
                    className="object-contain w-full h-full p-2 sm:p-4"
                  />
                </div>
              )}

              {/* Navigation buttons with better mobile positioning */}
              <div className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-full bg-white/90 hover:bg-white shadow-lg h-8 w-8 sm:h-10 sm:w-10" 
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                >
                  <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                </Button>
              </div>
              
              <div className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white/90 hover:bg-white shadow-lg h-8 w-8 sm:h-10 sm:w-10"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                >
                  <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
                </Button>
              </div>
              
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white/90 hover:bg-white shadow-lg h-8 w-8 sm:h-10 sm:w-10"
                  onClick={(e) => { e.stopPropagation(); closeGallery(); }}
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>

              {/* Image counter for mobile */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 sm:hidden">
                <div className="bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                  {currentImageIndex + 1} / {selectedKit?.gallery.length}
                </div>
              </div>
            </div>
            
            {/* Enhanced responsive thumbnails */}
            {selectedKit && (
              <div className="flex gap-1 sm:gap-2 overflow-x-auto py-2 px-1 mt-2 sm:mt-4 scrollbar-thin scrollbar-thumb-gray-300">
                {selectedKit.gallery.map((img, index) => (
                  <motion.div 
                    key={index}
                    className={`flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                      currentImageIndex === index 
                        ? 'border-madrid-blue shadow-md' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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


import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Kit } from "@/types/Kit";
import { KitImageGallery } from "@/components/kits/KitImageGallery";

const Kits = () => {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKits = async () => {
      try {
        const { data: kitsData, error: kitsError } = await supabase
          .from('kits')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true });

        if (kitsError) {
          console.error('Error fetching kits:', kitsError);
          return;
        }

        // Fetch images for each kit
        const kitsWithImages = await Promise.all(
          (kitsData || []).map(async (kit) => {
            const { data: imagesData, error: imagesError } = await supabase
              .from('kit_images')
              .select('*')
              .eq('kit_id', kit.id)
              .order('display_order', { ascending: true });

            if (imagesError) {
              console.error('Error fetching kit images:', imagesError);
              return { ...kit, kit_images: [] };
            }

            return { ...kit, kit_images: imagesData || [] };
          })
        );

        setKits(kitsWithImages as Kit[]);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKits();
  }, []);

  const getKitColor = (type: string) => {
    switch (type) {
      case "domicile": return "bg-madrid-blue";
      case "exterieur": return "bg-black";
      case "third": return "bg-purple-600";
      case "fourth": return "bg-green-600";
      default: return "bg-gray-600";
    }
  };

  const getKitLabel = (type: string) => {
    switch (type) {
      case "domicile": return "Domicile";
      case "exterieur": return "Extérieur";
      case "third": return "Third";
      case "fourth": return "Gardien";
      default: return type;
    }
  };

  const [hoveredKit, setHoveredKit] = useState<string | null>(null);
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openGallery = (kit: Kit) => {
    setSelectedKit(kit);
    setCurrentImageIndex(0);
  };

  const closeGallery = () => {
    setSelectedKit(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    // For now, single image per kit
    setCurrentImageIndex(0);
  };

  const prevImage = () => {
    // For now, single image per kit
    setCurrentImageIndex(0);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen">
          <div className="madrid-container py-4 sm:py-6 lg:py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="madrid-container py-4 sm:py-6 lg:py-8">
          <h1 className="section-title mb-6 sm:mb-8 text-center sm:text-left text-2xl sm:text-3xl md:text-4xl">
            Maillots {new Date().getFullYear()}/{(new Date().getFullYear() + 1).toString().slice(-2)}
          </h1>
          
          {/* Responsive grid with better breakpoints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {kits.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">Aucun maillot disponible pour le moment.</p>
              </div>
            ) : (
              kits.map((kit) => (
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
                    <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                      {kit.kit_images && kit.kit_images.length > 0 ? (
                        <>
                          <motion.img 
                            src={kit.kit_images.find(img => img.is_primary)?.image_url || kit.kit_images[0].image_url} 
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
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'flex flex-col items-center justify-center h-full text-muted-foreground';
                                placeholder.innerHTML = '<div class="text-6xl mb-4">👕</div><div class="text-lg font-semibold">IMAGE COMING SOON</div>';
                                parent.appendChild(placeholder);
                              }
                            }}
                          />
                          {kit.kit_images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                              +{kit.kit_images.length - 1} photos
                            </div>
                          )}
                        </>
                      ) : kit.image_url ? (
                        <motion.img 
                          src={kit.image_url} 
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
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'flex flex-col items-center justify-center h-full text-muted-foreground';
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
                    
                    {hoveredKit === kit.id && (
                      <motion.div
                        className="absolute inset-0 z-10 bg-gradient-to-t from-black/30 to-transparent flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-white bg-black/60 px-3 py-2 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
                          {kit.kit_images && kit.kit_images.length > 1 ? 'Voir la galerie' : 'Voir plus d\'images'}
                        </span>
                      </motion.div>
                    )}
                  </div>

                  <CardContent className="p-3 sm:p-4 text-center">
                    <Badge className={`${getKitColor(kit.type)} text-white mb-2 text-xs sm:text-sm`}>
                      {getKitLabel(kit.type)}
                    </Badge>
                    <h3 className="text-lg sm:text-xl font-bold line-clamp-2">{kit.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{kit.season}</p>
                    {kit.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{kit.description}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
            )}
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
                    {getKitLabel(selectedKit.type)}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-2">
              {selectedKit && (
                <div className="w-full">
                  <KitImageGallery 
                    images={selectedKit.kit_images || []} 
                    kitTitle={selectedKit.title}
                  />
                  {selectedKit.description && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm">{selectedKit.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </>
  );
};

export default Kits;

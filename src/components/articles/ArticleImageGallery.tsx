import { useState, useEffect, memo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyImage, preloadImages } from "@/components/common/LazyImage";

interface ArticleImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface ArticleImageGalleryProps {
  images: ArticleImage[];
}

const GalleryImage = memo(({ 
  image, 
  index, 
  onClick, 
  isLastVisible, 
  remainingCount,
  priority = false
}: { 
  image: ArticleImage; 
  index: number; 
  onClick: () => void;
  isLastVisible: boolean;
  remainingCount: number;
  priority?: boolean;
}) => (
  <div
    className="relative aspect-video rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
    onClick={onClick}
  >
    <LazyImage
      src={image.image_url}
      alt={`Photo ${index + 1}`}
      className="w-full h-full"
      priority={priority}
    />
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
    
    {isLastVisible && remainingCount > 0 && (
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="bg-white rounded-full px-4 py-2 shadow-lg">
          <span className="text-foreground font-semibold text-lg">
            +{remainingCount}
          </span>
        </div>
      </div>
    )}
  </div>
));

GalleryImage.displayName = 'GalleryImage';

export const ArticleImageGallery = memo(({ images }: ArticleImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);

  // Précharger les premières images immédiatement
  useEffect(() => {
    if (sortedImages.length > 0) {
      const firstImages = sortedImages.slice(0, 6).map(img => img.image_url);
      preloadImages(firstImages, 3);
    }
  }, [sortedImages]);

  // Précharger les images adjacentes quand une image est sélectionnée
  useEffect(() => {
    if (selectedImage !== null) {
      const imagesToPreload: string[] = [];
      if (selectedImage > 0) {
        imagesToPreload.push(sortedImages[selectedImage - 1].image_url);
      }
      if (selectedImage < sortedImages.length - 1) {
        imagesToPreload.push(sortedImages[selectedImage + 1].image_url);
      }
      preloadImages(imagesToPreload, 2);
    }
  }, [selectedImage, sortedImages]);

  const openImage = (index: number) => {
    setSelectedImage(index);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const goToNext = () => {
    if (selectedImage !== null && selectedImage < sortedImages.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  const goToPrevious = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  // Gestion du clavier
  useEffect(() => {
    if (selectedImage === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'Escape') closeImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  if (images.length === 0) return null;

  const MAX_VISIBLE_IMAGES = 12;
  const visibleImages = sortedImages.slice(0, MAX_VISIBLE_IMAGES);
  const remainingCount = sortedImages.length - MAX_VISIBLE_IMAGES;

  return (
    <>
      <div className="w-full py-8">
        <h2 className="text-2xl font-bold mb-6">Galerie Photos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleImages.map((image, index) => (
            <GalleryImage
              key={image.id}
              image={image}
              index={index}
              onClick={() => openImage(index)}
              isLastVisible={index === visibleImages.length - 1}
              remainingCount={remainingCount}
              priority={index < 3} // Les 3 premières images sont prioritaires
            />
          ))}
        </div>
      </div>

      <Dialog open={selectedImage !== null} onOpenChange={closeImage}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
          <VisuallyHidden>
            <DialogTitle>Galerie d'images</DialogTitle>
          </VisuallyHidden>
          <div className="relative w-full h-[95vh] flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={closeImage}
            >
              <X className="h-6 w-6" />
            </Button>

            {selectedImage !== null && (
              <>
                {selectedImage > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                )}

                <img
                  src={sortedImages[selectedImage].image_url}
                  alt={`Photo ${selectedImage + 1}`}
                  className="max-w-full max-h-full object-contain"
                  loading="eager"
                />

                {selectedImage < sortedImages.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
                  {selectedImage + 1} / {sortedImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

ArticleImageGallery.displayName = 'ArticleImageGallery';

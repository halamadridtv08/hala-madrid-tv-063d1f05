import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleImage } from "@/types/Article";

interface ImageGalleryProps {
  images: ArticleImage[];
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  return (
    <div className="my-12 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Galerie Photos</h2>
      
      {/* Grille responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            onClick={() => openModal(index)}
            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300"
          >
            <img
              src={image.image_url}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </div>
        ))}
      </div>

      {/* Modal plein écran */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={closeModal}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-[95vh] flex items-center justify-center">
            {/* Bouton fermer */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Boutons navigation */}
            {selectedImageIndex !== null && selectedImageIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 z-50 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {selectedImageIndex !== null && selectedImageIndex < images.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 z-50 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            {/* Image */}
            {selectedImageIndex !== null && (
              <img
                src={images[selectedImageIndex].image_url}
                alt={`Image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Compteur */}
            {selectedImageIndex !== null && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
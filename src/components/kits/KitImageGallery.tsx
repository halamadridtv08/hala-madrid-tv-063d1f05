import React, { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { KitImage } from "@/types/Kit";

interface KitImageGalleryProps {
  images: KitImage[];
  kitTitle: string;
}

export const KitImageGallery = ({ images, kitTitle }: KitImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainViewportRef, emblaMainApi] = useEmblaCarousel({ loop: true });
  const [thumbViewportRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const onThumbClick = useCallback((index: number) => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    emblaMainApi.scrollTo(index);
  }, [emblaMainApi, emblaThumbsApi]);

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  const scrollPrev = useCallback(() => {
    emblaMainApi?.scrollPrev();
  }, [emblaMainApi]);

  const scrollNext = useCallback(() => {
    emblaMainApi?.scrollNext();
  }, [emblaMainApi]);

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/20 rounded-lg">
        <div className="text-6xl mb-4">👕</div>
        <div className="text-lg font-semibold">IMAGE COMING SOON</div>
      </div>
    );
  }

  // Sort images: primary first, then by display_order
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  return (
    <div className="space-y-4">
      {/* Main Image Carousel */}
      <div className="relative">
        <div className="overflow-hidden rounded-lg" ref={mainViewportRef}>
          <div className="flex">
            {sortedImages.map((image, index) => (
              <div
                key={image.id}
                className="relative flex-[0_0_100%] min-w-0"
              >
                <div className="aspect-[3/4] bg-muted/20 flex items-center justify-center">
                  <img
                    src={image.image_url}
                    alt={`${kitTitle} - Image ${index + 1}`}
                    className="max-h-full max-w-full object-contain p-4"
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
                </div>
                
                {/* Zoom Button */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
                  onClick={() => setZoomImage(image.image_url)}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
              onClick={scrollNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="overflow-hidden" ref={thumbViewportRef}>
          <div className="flex gap-2">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => onThumbClick(index)}
                className={cn(
                  "relative flex-[0_0_80px] min-w-0 rounded-lg overflow-hidden border-2 transition-all",
                  index === selectedIndex
                    ? "border-primary opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <div className="aspect-square">
                  <img
                    src={image.image_url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zoom Dialog */}
      <Dialog open={zoomImage !== null} onOpenChange={() => setZoomImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <div className="relative w-full h-[95vh] flex items-center justify-center bg-black">
            <img
              src={zoomImage || ""}
              alt={kitTitle}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

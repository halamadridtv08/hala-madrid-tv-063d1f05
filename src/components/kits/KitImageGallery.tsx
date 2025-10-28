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
export const KitImageGallery = ({
  images,
  kitTitle
}: KitImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainViewportRef, emblaMainApi] = useEmblaCarousel({
    loop: true
  });
  const [thumbViewportRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true
  });
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomViewportRef, emblaZoomApi] = useEmblaCarousel({
    loop: true
  });
  const onThumbClick = useCallback((index: number) => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    emblaMainApi.scrollTo(index);
  }, [emblaMainApi, emblaThumbsApi]);
  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);
  const scrollZoomPrev = useCallback(() => {
    emblaZoomApi?.scrollPrev();
  }, [emblaZoomApi]);
  const scrollZoomNext = useCallback(() => {
    emblaZoomApi?.scrollNext();
  }, [emblaZoomApi]);
  const openZoom = useCallback((index: number) => {
    setZoomOpen(true);
    setTimeout(() => {
      emblaZoomApi?.scrollTo(index);
    }, 0);
  }, [emblaZoomApi]);
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
    return <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/20 rounded-lg">
        <div className="text-6xl mb-4">👕</div>
        <div className="text-lg font-semibold">IMAGE COMING SOON</div>
      </div>;
  }

  // Sort images: primary first, then by display_order
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });
  return <div className="h-full flex flex-col gap-3 sm:gap-4">
      {/* Main Image Carousel */}
      <div className="relative flex-1 min-h-0">
        <div className="overflow-hidden rounded-lg h-full bg-muted/10" ref={mainViewportRef}>
          <div className="flex h-full">
            {sortedImages.map((image, index) => <div key={image.id} className="relative flex-[0_0_100%] min-w-0 h-full">
                <div className="h-full w-full flex items-center justify-center p-2 sm:p-4">
                  <img src={image.image_url} alt={`${kitTitle} - Image ${index + 1}`} className="max-h-full max-w-full w-auto h-auto object-contain" onError={e => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'flex flex-col items-center justify-center h-full text-muted-foreground';
                  placeholder.innerHTML = '<div class="text-6xl mb-4">👕</div><div class="text-lg font-semibold">IMAGE COMING SOON</div>';
                  parent.appendChild(placeholder);
                }
              }} />
                </div>
                
                {/* Zoom Button */}
                <Button size="icon" variant="secondary" onClick={() => openZoom(index)} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/80 hover:bg-background text-madrid-white mx-[15px]">
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </div>)}
          </div>
        </div>

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && <>
            <Button size="icon" variant="secondary" onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 hover:bg-background text-madrid-white mx-[15px]">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="secondary" onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 hover:bg-background text-madrid-white mx-[15px]">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>}

        {/* Image Counter */}
        {sortedImages.length > 1 && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {sortedImages.length}
          </div>}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && <div className="overflow-hidden shrink-0" ref={thumbViewportRef}>
          <div className="flex gap-2 sm:gap-3 py-2">
            {sortedImages.map((image, index) => <button key={image.id} onClick={() => onThumbClick(index)} className={cn("relative flex-[0_0_60px] sm:flex-[0_0_80px] min-w-0 rounded-md overflow-hidden border-2 transition-all shrink-0", index === selectedIndex ? "border-primary opacity-100 scale-105" : "border-border opacity-60 hover:opacity-100 hover:scale-105")}>
                <div className="aspect-square bg-muted/20">
                  <img src={image.image_url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" onError={e => {
              e.currentTarget.src = '/placeholder.svg';
            }} />
                </div>
              </button>)}
          </div>
        </div>}

      {/* Zoom Dialog with Carousel */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 border-0 bg-transparent">
          <div className="relative w-full h-[98vh] bg-black/95 rounded-lg overflow-hidden">
            {/* Carousel Container */}
            <div className="overflow-hidden h-full w-full" ref={zoomViewportRef}>
              <div className="flex h-full w-full">
                {sortedImages.map((image, index) => <div key={image.id} className="relative flex-[0_0_100%] min-w-0 h-full flex items-center justify-center px-16 py-12">
                    <img src={image.image_url} alt={`${kitTitle} - Image ${index + 1}`} className="max-w-full max-h-full w-auto h-auto object-contain" style={{
                  maxHeight: 'calc(98vh - 6rem)'
                }} onError={e => {
                  e.currentTarget.src = '/placeholder.svg';
                }} />
                  </div>)}
              </div>
            </div>

            {/* Navigation Arrows */}
            {sortedImages.length > 1 && <>
                <Button size="icon" variant="secondary" className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/90 hover:bg-background z-10" onClick={scrollZoomPrev}>
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button size="icon" variant="secondary" className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/90 hover:bg-background z-10" onClick={scrollZoomNext}>
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
import React, { useState } from "react";
import { ArticleImage } from "@/types/Article";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ImageGalleryProps {
  images: ArticleImage[];
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => setSelectedImage(image.image_url)}
          >
            <img
              src={image.image_url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-7xl w-full p-0 overflow-hidden">
          <div className="relative">
            <img
              src={selectedImage || ""}
              alt=""
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

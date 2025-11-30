import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VideoType } from "@/types/Video";
import { Button } from "@/components/ui/button";
interface VideoPlayerProps {
  video: VideoType | null;
  isOpen: boolean;
  onClose: () => void;
}
export const VideoPlayer = ({
  video,
  isOpen,
  onClose
}: VideoPlayerProps) => {
  if (!video) return null;
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-6xl h-[95vh] p-0 bg-black/95 border-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-white text-xl font-bold">
                  {video.title}
                </DialogTitle>
                {video.description && <DialogDescription className="text-gray-400 mt-2">
                    {video.description}
                  </DialogDescription>}
              </div>
              
            </div>
          </DialogHeader>

          {/* Video Container */}
          <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-black">
            <video src={video.video_url} controls autoPlay className="w-full h-full max-h-[calc(95vh-120px)] object-contain rounded-lg" controlsList="nodownload" playsInline>
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
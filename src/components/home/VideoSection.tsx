import React, { useState } from "react";
import { useVideos } from "@/hooks/useVideos";
import { VideoPlayer } from "./VideoPlayer";
import { VideoType } from "@/types/Video";
import { Play, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
export const VideoSection = () => {
  const {
    videos,
    isLoading
  } = useVideos();
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const handleVideoClick = (video: VideoType) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };
  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setTimeout(() => setSelectedVideo(null), 300);
  };
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  if (isLoading) {
    return <section className="py-16 bg-background">
        <div className="madrid-container">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
            Dernières Vidéos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-video rounded-lg" />)}
          </div>
        </div>
      </section>;
  }
  if (!videos || videos.length === 0) {
    return <section className="py-16 bg-background">
        <div className="madrid-container">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
            Dernières Vidéos
          </h2>
          <Card className="p-12 text-center bg-card">
            <p className="text-muted-foreground text-lg">
              Aucune vidéo disponible pour le moment
            </p>
          </Card>
        </div>
      </section>;
  }
  return <>
      

      {/* Video Player Modal */}
      <VideoPlayer video={selectedVideo} isOpen={isPlayerOpen} onClose={handleClosePlayer} />

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>;
};
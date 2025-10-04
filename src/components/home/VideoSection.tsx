import React, { useState } from "react";
import { useVideos } from "@/hooks/useVideos";
import { VideoPlayer } from "./VideoPlayer";
import { VideoType } from "@/types/Video";
import { Play, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const VideoSection = () => {
  const { videos, isLoading } = useVideos();
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
    return (
      <section className="py-16 bg-background">
        <div className="madrid-container">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
            Dernières Vidéos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-video rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <section className="py-16 bg-background">
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
      </section>
    );
  }

  return (
    <>
      <section className="py-16 bg-background">
        <div className="madrid-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Dernières Vidéos
            </h2>
            <div className="hidden md:block text-sm text-muted-foreground">
              {videos.length} vidéo{videos.length > 1 ? 's' : ''} disponible{videos.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Horizontal Scroll Container - Netflix Style */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-4 min-w-max">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="group relative w-[280px] sm:w-[320px] flex-shrink-0 cursor-pointer"
                  onClick={() => handleVideoClick(video)}
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Play className="h-16 w-16 text-primary/40" />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                      <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="mt-3 space-y-1">
                    <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    {video.category && (
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {video.category}
                      </p>
                    )}
                    {video.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Show count */}
          <div className="md:hidden mt-4 text-center text-sm text-muted-foreground">
            {videos.length} vidéo{videos.length > 1 ? 's' : ''} disponible{videos.length > 1 ? 's' : ''}
          </div>
        </div>
      </section>

      {/* Video Player Modal */}
      <VideoPlayer
        video={selectedVideo}
        isOpen={isPlayerOpen}
        onClose={handleClosePlayer}
      />

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

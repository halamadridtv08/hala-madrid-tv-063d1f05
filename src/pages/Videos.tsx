import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAllVideos, UnifiedVideo } from "@/hooks/useAllVideos";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Play, Clock, Film } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Videos = () => {
  const { videos, shorts, isLoading } = useAllVideos();
  const [selectedVideo, setSelectedVideo] = useState<UnifiedVideo | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCategoryColor = (source: string) => {
    switch (source) {
      case 'training': return 'bg-green-500';
      case 'press': return 'bg-blue-500';
      case 'youtube': return 'bg-red-500';
      default: return 'bg-madrid-gold';
    }
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
    return url;
  };

  const handleVideoClick = (video: UnifiedVideo) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="madrid-container py-8 md:py-12">
          <div className="flex items-center gap-3 mb-8">
            <Film className="h-8 w-8 text-madrid-gold" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Toutes les Vidéos
            </h1>
          </div>

          {isLoading ? (
            <div className="space-y-8">
              {/* Regular videos skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="w-full aspect-video" />
                    <div className="p-3">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">Toutes ({videos.length + shorts.length})</TabsTrigger>
                <TabsTrigger value="videos">Vidéos ({videos.length})</TabsTrigger>
                {shorts.length > 0 && (
                  <TabsTrigger value="shorts">Shorts ({shorts.length})</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="all" className="space-y-10">
                {/* Regular Videos Section */}
                {videos.length > 0 && (
                  <section>
                    <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                      <Play className="h-5 w-5 text-madrid-gold" />
                      Vidéos
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {videos.map((video) => (
                        <VideoCard
                          key={`${video.source}-${video.id}`}
                          video={video}
                          onClick={() => handleVideoClick(video)}
                          formatDuration={formatDuration}
                          getCategoryColor={getCategoryColor}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Shorts Section */}
                {shorts.length > 0 && (
                  <section>
                    <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                      <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                        <Play className="h-3 w-3 text-white" />
                      </div>
                      Shorts
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {shorts.map((video) => (
                        <ShortCard
                          key={`${video.source}-${video.id}`}
                          video={video}
                          onClick={() => handleVideoClick(video)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {videos.length === 0 && shorts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      Aucune vidéo disponible pour le moment.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="videos">
                {videos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {videos.map((video) => (
                      <VideoCard
                        key={`${video.source}-${video.id}`}
                        video={video}
                        onClick={() => handleVideoClick(video)}
                        formatDuration={formatDuration}
                        getCategoryColor={getCategoryColor}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      Aucune vidéo disponible pour le moment.
                    </p>
                  </div>
                )}
              </TabsContent>

              {shorts.length > 0 && (
                <TabsContent value="shorts">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {shorts.map((video) => (
                      <ShortCard
                        key={`${video.source}-${video.id}`}
                        video={video}
                        onClick={() => handleVideoClick(video)}
                      />
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </div>

      {/* Video Player Dialog */}
      <Dialog open={isPlayerOpen} onOpenChange={() => {
        setIsPlayerOpen(false);
        setSelectedVideo(null);
      }}>
        <DialogContent className="max-w-[95vw] lg:max-w-6xl h-[90vh] p-0 bg-black/95 border-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-6 py-4 border-b border-white/10">
              <DialogTitle className="text-white text-xl font-bold">
                {selectedVideo?.title}
              </DialogTitle>
              {selectedVideo?.description && (
                <DialogDescription className="text-gray-400 mt-2">
                  {selectedVideo.description}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-black">
              {selectedVideo && (
                isYouTubeUrl(selectedVideo.video_url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(selectedVideo.video_url)}
                    className="w-full h-full max-h-[calc(90vh-120px)] rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedVideo.video_url}
                    controls
                    autoPlay
                    className="w-full h-full max-h-[calc(90vh-120px)] object-contain rounded-lg"
                    controlsList="nodownload"
                    playsInline
                  >
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                )
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

// Video Card Component for regular videos
interface VideoCardProps {
  video: UnifiedVideo;
  onClick: () => void;
  formatDuration: (seconds: number | null | undefined) => string;
  getCategoryColor: (source: string) => string;
}

const VideoCard = ({ video, onClick, formatDuration, getCategoryColor }: VideoCardProps) => (
  <Card
    className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all hover:scale-[1.02] bg-card"
    onClick={onClick}
  >
    <div className="relative aspect-video bg-muted">
      {video.thumbnail_url ? (
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
          <Play className="w-12 h-12 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
          <Play className="w-7 h-7 text-black ml-1" fill="currentColor" />
        </div>
      </div>
      {video.duration && (
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(video.duration)}
        </div>
      )}
      <Badge className={`absolute top-2 left-2 ${getCategoryColor(video.source)} text-white text-xs`}>
        {video.category}
      </Badge>
    </div>
    <div className="p-3">
      <h3 className="font-semibold text-sm md:text-base line-clamp-2 text-card-foreground">
        {video.title}
      </h3>
      {video.description && (
        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
          {video.description}
        </p>
      )}
    </div>
  </Card>
);

// Short Card Component for vertical videos
interface ShortCardProps {
  video: UnifiedVideo;
  onClick: () => void;
}

const ShortCard = ({ video, onClick }: ShortCardProps) => (
  <Card
    className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all hover:scale-[1.02] bg-card"
    onClick={onClick}
  >
    <div className="relative aspect-[9/16] bg-muted">
      {video.thumbnail_url ? (
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
          <Play className="w-10 h-10 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
          <Play className="w-6 h-6 text-black ml-0.5" fill="currentColor" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="font-semibold text-xs text-white line-clamp-2">
          {video.title}
        </h3>
      </div>
    </div>
  </Card>
);

export default Videos;

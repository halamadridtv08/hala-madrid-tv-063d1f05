import { useYouTubeVideos } from "@/hooks/useYouTubeVideos";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const YouTubeVideos = () => {
  const { videos, loading } = useYouTubeVideos();

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="madrid-container">
          <h2 className="section-title mb-8">Dernières vidéos YouTube</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-video rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="py-12 bg-background">
        <div className="madrid-container">
          <h2 className="section-title mb-8">Dernières vidéos YouTube</h2>
          <p className="text-center text-muted-foreground">Aucune vidéo disponible pour le moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="madrid-container">
        <h2 className="section-title mb-8">Dernières vidéos YouTube</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {videos.slice(0, 12).map((video) => (
            <a
              key={video.id}
              href={video.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="overflow-hidden bg-card/50 backdrop-blur border-border/50 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <ExternalLink className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                </div>
              </Card>
            </a>
          ))}
        </div>

        <div className="text-center">
          <Button 
            asChild 
            variant="outline" 
            className="group"
          >
            <a 
              href="https://www.youtube.com/@HALAMADRIDTV10" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Tout voir
              <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default YouTubeVideos;

import { useFeaturedYouTubeVideo } from "@/hooks/useFeaturedYouTubeVideo";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExternalLink, Youtube } from "lucide-react";

const FeaturedYouTubeVideo = () => {
  const { video, loading } = useFeaturedYouTubeVideo();

  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url;
  };

  if (loading) {
    return (
      <section className="pb-12 bg-gradient-to-b from-background to-muted/20">
        <div className="madrid-container">
          <div className="flex items-center gap-2 mb-6">
            <Youtube className="h-6 w-6 text-primary" />
            <h2 className="section-title">Dernière Vidéo YouTube</h2>
          </div>
          <Skeleton className="w-full aspect-video rounded-2xl" />
        </div>
      </section>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <section className="pb-12 bg-gradient-to-b from-background to-muted/20">
      <div className="madrid-container">
        <div className="flex items-center gap-2 mb-6">
          <Youtube className="h-6 w-6 text-primary" />
          <h2 className="section-title">Dernière Vidéo YouTube</h2>
        </div>
        
        <Card className="overflow-hidden bg-card border-border/50 shadow-xl">
          <div className="bg-destructive/90 backdrop-blur px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                <Youtube className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">HALA MADRID TV</h3>
                <p className="text-white/80 text-sm">Dernière vidéo</p>
              </div>
            </div>
            <Button 
              asChild 
              variant="secondary"
              size="sm"
              className="bg-white hover:bg-white/90 text-destructive font-semibold"
            >
              <a 
                href="https://youtube.com/@halamadridtv" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Youtube className="h-4 w-4" />
                S'abonner
              </a>
            </Button>
          </div>
          
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={getYouTubeEmbedUrl(video.youtube_url)}
              title={video.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          <div className="p-6">
            <h4 className="font-semibold text-lg mb-2">{video.title}</h4>
            <Button 
              asChild 
              variant="ghost" 
              size="sm"
              className="group px-0 hover:text-primary"
            >
              <a 
                href={video.youtube_url}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Voir sur YouTube
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default FeaturedYouTubeVideo;

import { useState } from "react";
import { useFeaturedYouTubeVideo } from "@/hooks/useFeaturedYouTubeVideo";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExternalLink, Youtube, Radio } from "lucide-react";
import { HlsPlayer } from "./HlsPlayer";
import { LiveChat } from "./LiveChat";
import { AuthModal } from "@/components/auth/AuthModal";

const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return m ? m[1] : null;
};

const isDirectStream = (url: string) =>
  /\.(m3u8|mpd|mp4|webm|mov|m4v)($|\?)/i.test(url || "");

const FeaturedYouTubeVideo = () => {
  const { video, loading } = useFeaturedYouTubeVideo();
  const [authOpen, setAuthOpen] = useState(false);

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

  const streamUrl = video.stream_url?.trim();
  const primaryUrl = streamUrl || video.youtube_url;
  const youtubeId = getYouTubeId(primaryUrl);
  const direct = isDirectStream(primaryUrl);
  const isLive = !!video.is_live_stream || /\.m3u8($|\?)/i.test(primaryUrl);

  return (
    <section className="pb-12 bg-gradient-to-b from-background to-muted/20">
      <div className="madrid-container">
        <div className="flex items-center gap-2 mb-6">
          <Youtube className="h-6 w-6 text-primary" />
          <h2 className="section-title">{isLive ? "En direct" : "Dernière Vidéo YouTube"}</h2>
          {isLive && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-xs font-semibold">
              <Radio className="h-3 w-3 animate-pulse" /> LIVE
            </span>
          )}
        </div>

        <div className={`grid gap-6 ${isLive ? "lg:grid-cols-[minmax(0,1fr)_360px]" : "grid-cols-1"}`}>
        <Card className="overflow-hidden bg-card border-border/50 shadow-xl">
          <div className="bg-destructive/90 backdrop-blur px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                <Youtube className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">HALA MADRID TV</h3>
                <p className="text-white/80 text-sm">{isLive ? "Diffusion en direct" : "Dernière vidéo"}</p>
              </div>
            </div>
            <Button 
              asChild 
              variant="secondary"
              size="sm"
              className="bg-white hover:bg-white/90 text-destructive font-semibold"
            >
              <a 
                href="https://www.youtube.com/@HALAMADRIDTV10" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Youtube className="h-4 w-4" />
                S'abonner
              </a>
            </Button>
          </div>

          <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
            {direct ? (
              <HlsPlayer
                src={primaryUrl}
                poster={video.thumbnail_url}
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
            ) : youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isLive ? 1 : 0}`}
                title={video.title}
                className="absolute top-0 left-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <iframe
                src={primaryUrl}
                title={video.title}
                className="absolute top-0 left-0 w-full h-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            )}
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

          {isLive && (
            <LiveChat
              videoId={video.id}
              roomKey={`video:${video.id}`}
              onRequestLogin={() => setAuthOpen(true)}
            />
          )}
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </section>
  );
};

export default FeaturedYouTubeVideo;

import { AspectRatio } from "@/components/ui/aspect-ratio";

interface VideoPlayerProps {
  videoUrl: string;
}

export const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  // Detect if it's a YouTube URL
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  
  const getYouTubeEmbedUrl = (url: string): string => {
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (isYouTube) {
    const embedUrl = getYouTubeEmbedUrl(videoUrl);
    
    return (
      <div className="w-full my-8 animate-fade-in">
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video YouTube"
          />
        </AspectRatio>
      </div>
    );
  }

  // For Supabase or other video URLs
  return (
    <div className="w-full my-8 animate-fade-in">
      <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-cover"
          preload="metadata"
        >
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      </AspectRatio>
    </div>
  );
};
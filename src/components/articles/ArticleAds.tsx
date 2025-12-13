import { useArticleAds } from "@/hooks/useArticleAds";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

interface ArticleAdsProps {
  position?: 'sidebar' | 'bottom' | 'inline';
}

const aspectRatioClasses: Record<string, string> = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '9:16': 'aspect-[9/16]',
  'custom': '',
};

// Check if URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

// Check if URL is a GIF
const isGifUrl = (url: string): boolean => {
  return url.toLowerCase().includes('.gif');
};

export function ArticleAds({ position = 'sidebar' }: ArticleAdsProps) {
  const { ads, loading, trackClick } = useArticleAds(position);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full aspect-[4/3]" />
      </div>
    );
  }

  if (ads.length === 0) return null;

  const handleClick = (ad: typeof ads[0]) => {
    trackClick(ad.id);
    if (ad.link_url) {
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Layout classes based on position
  const containerClasses = position === 'bottom' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8'
    : position === 'inline'
    ? 'my-6'
    : 'space-y-4 mt-6';

  return (
    <div className={containerClasses}>
      {ads.map((ad) => {
        const aspectClass = ad.aspect_ratio === 'custom' && ad.custom_width && ad.custom_height
          ? ''
          : aspectRatioClasses[ad.aspect_ratio] || 'aspect-video';

        const customStyle = ad.aspect_ratio === 'custom' && ad.custom_width && ad.custom_height
          ? { aspectRatio: `${ad.custom_width} / ${ad.custom_height}` }
          : {};

        const isVideo = isVideoUrl(ad.image_url);
        const isGif = isGifUrl(ad.image_url);

        return (
          <div
            key={ad.id}
            className="relative group cursor-pointer overflow-hidden rounded-lg border border-border bg-card hover:border-primary/50 transition-all duration-300"
            onClick={() => handleClick(ad)}
          >
            <div className={`relative ${aspectClass}`} style={customStyle}>
              {isVideo ? (
                <video
                  src={ad.image_url}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isGif ? '' : ''}`}
                />
              )}
              {ad.link_url && (
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="h-4 w-4 text-foreground" />
                </div>
              )}
            </div>
            {/* Small "Publicité" label */}
            <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs text-muted-foreground">
              Publicité
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ArticleVideoPlayerProps {
  videoUrl: string;
}

export const ArticleVideoPlayer = ({ videoUrl }: ArticleVideoPlayerProps) => {
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  
  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url;
  };

  if (!videoUrl) return null;

  return (
    <div className="w-full py-8">
      <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
        {isYouTube ? (
          <iframe
            src={getYouTubeEmbedUrl(videoUrl)}
            title="Video"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={videoUrl}
            controls
            className="w-full h-full object-contain bg-black"
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        )}
      </div>
    </div>
  );
};

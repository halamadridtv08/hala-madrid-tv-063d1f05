import React from "react";

interface VideoPlayerProps {
  videoUrl: string;
}

export const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  
  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : url;
  };

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
      {isYouTube ? (
        <iframe
          src={getYouTubeEmbedUrl(videoUrl)}
          title="Video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-cover"
        >
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      )}
    </div>
  );
};

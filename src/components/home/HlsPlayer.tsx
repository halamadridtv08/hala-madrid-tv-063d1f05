import { useEffect, useRef } from "react";

interface HlsPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}

export const HlsPlayer = ({ src, poster, className, autoPlay = true }: HlsPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isM3u8 = /\.m3u8($|\?)/i.test(src);
    let hls: any;

    if (isM3u8 && !video.canPlayType("application/vnd.apple.mpegurl")) {
      let cancelled = false;
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled || !Hls.isSupported()) return;
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      });
      return () => {
        cancelled = true;
        if (hls) hls.destroy();
      };
    }

    video.src = src;
  }, [src]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      controls
      autoPlay={autoPlay}
      playsInline
      controlsList="nodownload"
      className={className}
    >
      Votre navigateur ne supporte pas la lecture vidéo.
    </video>
  );
};

export default HlsPlayer;
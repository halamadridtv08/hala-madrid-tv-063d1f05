import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface ResilientVideoProps {
  src: string;
  className?: string;
  posterUrl?: string;
  /** Accessible label used by the retry control. */
  label?: string;
}

/**
 * Background video that survives a flaky media load: it retries automatically
 * (twice, with a cache-busting query), falls back to the poster image, and
 * offers a manual retry when playback still cannot start.
 */
export function ResilientVideo({ src, className, posterUrl, label = 'Vidéo' }: ResilientVideoProps) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoRetries = useRef(0);

  const url = attempt > 0 ? `${src}${src.includes('?') ? '&' : '?'}r=${attempt}` : src;

  const handleError = useCallback(() => {
    if (autoRetries.current < 2) {
      autoRetries.current += 1;
      window.setTimeout(() => setAttempt((value) => value + 1), 800);
      return;
    }
    setFailed(true);
  }, []);

  const retry = () => {
    autoRetries.current = 0;
    setFailed(false);
    setAttempt((value) => value + 1);
  };

  // Autoplay can be refused (power saving, background tab): re-arm playback.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const start = () => void video.play().catch(() => undefined);
    start();
    document.addEventListener('visibilitychange', start);
    return () => document.removeEventListener('visibilitychange', start);
  }, [url]);

  if (failed) {
    return (
      <div className={`${className ?? ''} flex items-center justify-center bg-gradient-to-br from-madrid-blue/40 to-madrid-gold/20`}>
        {posterUrl && <img src={posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
        <button
          type="button"
          onClick={retry}
          aria-label={`Relancer ${label}`}
          className="relative z-10 flex items-center gap-2 rounded-lg bg-black/60 px-4 py-2 text-sm font-semibold text-white"
        >
          <RotateCcw className="h-4 w-4" /> Relancer la vidéo
        </button>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      key={url}
      className={className}
      poster={posterUrl}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      controlsList="nodownload noplaybackrate nofullscreen"
      onContextMenu={(e) => e.preventDefault()}
      onError={handleError}
      onStalled={handleError}
      src={url}
    />
  );
}

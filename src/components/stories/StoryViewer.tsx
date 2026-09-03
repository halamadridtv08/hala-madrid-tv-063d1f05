import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Send,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { DEFAULT_STORY_SETTINGS, getStoryProgress, saveStoryProgress, StoryDisplaySettings, StoryRing, trackStoryView } from '@/hooks/useStories';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface StoryViewerProps {
  rings: StoryRing[];
  startRingIndex: number;
  onClose: () => void;
  onRingSeen?: (ringId: string) => void;
  settings?: StoryDisplaySettings;
}

export function StoryViewer({ rings, startRingIndex, onClose, onRingSeen, settings = DEFAULT_STORY_SETTINGS }: StoryViewerProps) {
  const { toast } = useToast();
  const [ringIndex, setRingIndex] = useState(startRingIndex);
  const [itemIndex, setItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const imageStartedAtRef = useRef(Date.now());
  const imageElapsedRef = useRef(0);
  const progressRef = useRef(0);
  const restoredRef = useRef(false);
  const autoRetryRef = useRef(0);
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const watchRef = useRef({ startedAt: Date.now(), elapsed: 0, itemId: '', ringId: '' });

  const ring = rings[ringIndex];
  const item = ring?.items[itemIndex];
  const isVideo = item?.media_type === 'video';

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const flushView = useCallback((completed: boolean) => {
    const watch = watchRef.current;
    if (!watch.itemId) return;
    const total = watch.elapsed + (paused ? 0 : Date.now() - watch.startedAt);
    trackStoryView({ ringId: watch.ringId, itemId: watch.itemId, durationMs: total, completed });
    watch.itemId = '';
  }, [paused]);

  const persistCurrent = useCallback(() => {
    if (!ring || !item) return;
    const duration = Math.max(2, Number(item.duration_seconds) || 6);
    const positionSeconds = isVideo
      ? videoRef.current?.currentTime ?? 0
      : (progressRef.current / 100) * duration;
    void saveStoryProgress({ ringId: ring.id, itemId: item.id, positionSeconds });
  }, [ring, item, isVideo]);

  const resetTimeline = useCallback(() => {
    setProgress(0);
    progressRef.current = 0;
    imageElapsedRef.current = 0;
    imageStartedAtRef.current = Date.now();
    setMediaReady(false);
    setMediaError(false);
    autoRetryRef.current = 0;
  }, []);

  const goNext = useCallback(() => {
    flushView(true);
    resetTimeline();
    if (!ring) return;
    if (itemIndex < ring.items.length - 1) {
      const nextItem = ring.items[itemIndex + 1];
      void saveStoryProgress({ ringId: ring.id, itemId: nextItem.id, positionSeconds: 0 });
      setItemIndex((value) => value + 1);
    }
    else if (ringIndex < rings.length - 1) {
      const nextRing = rings[ringIndex + 1];
      const nextItem = nextRing.items[0];
      if (nextItem) void saveStoryProgress({ ringId: nextRing.id, itemId: nextItem.id, positionSeconds: 0 });
      setRingIndex((value) => value + 1);
      setItemIndex(0);
    } else onClose();
  }, [flushView, resetTimeline, ring, itemIndex, ringIndex, rings, onClose]);

  const goPrev = useCallback(() => {
    persistCurrent();
    resetTimeline();
    if (itemIndex > 0) setItemIndex((value) => value - 1);
    else if (ringIndex > 0) {
      const previous = ringIndex - 1;
      setRingIndex(previous);
      setItemIndex(Math.max(0, rings[previous].items.length - 1));
    }
  }, [persistCurrent, resetTimeline, itemIndex, ringIndex, rings]);

  const goNextRing = useCallback(() => {
    flushView(true);
    resetTimeline();
    if (ringIndex < rings.length - 1) {
      const nextRing = rings[ringIndex + 1];
      const nextItem = nextRing.items[0];
      if (nextItem) void saveStoryProgress({ ringId: nextRing.id, itemId: nextItem.id, positionSeconds: 0 });
      setRingIndex((value) => value + 1);
      setItemIndex(0);
    } else onClose();
  }, [flushView, resetTimeline, ringIndex, rings, onClose]);

  const goPrevRing = useCallback(() => {
    persistCurrent();
    resetTimeline();
    if (ringIndex > 0) {
      setRingIndex((value) => value - 1);
      setItemIndex(0);
    } else setItemIndex(0);
  }, [persistCurrent, resetTimeline, ringIndex]);

  // Cross-device resume: restore the saved position once, for the story the user opened.
  useEffect(() => {
    if (!ring || restoredRef.current) return;
    restoredRef.current = true;
    let active = true;
    void getStoryProgress(ring.id).then((saved) => {
      if (!active || !saved) return;
      const savedIndex = ring.items.findIndex((candidate) => candidate.id === saved.itemId);
      if (savedIndex < 0) return;
      setItemIndex(savedIndex);
      const savedItem = ring.items[savedIndex];
      if (savedItem.media_type === 'image') {
        const duration = Math.max(2, Number(savedItem.duration_seconds) || 6);
        const restoredProgress = Math.min(99, (saved.positionSeconds / duration) * 100);
        setProgress(restoredProgress);
        imageElapsedRef.current = (restoredProgress / 100) * duration * 1000;
      }
    });
    return () => { active = false; };
  }, [ring?.id]);

  useEffect(() => {
    if (!item || !ring) return;
    watchRef.current = { startedAt: Date.now(), elapsed: 0, itemId: item.id, ringId: ring.id };
    onRingSeen?.(ring.id);
    const interval = window.setInterval(persistCurrent, 3000);
    return () => {
      window.clearInterval(interval);
      persistCurrent();
      flushView(false);
    };
  }, [item?.id, ring?.id]);

  useEffect(() => {
    if (!item || isVideo || paused || !mediaReady) return;
    const durationMs = Math.max(2, Number(item.duration_seconds) || 6) * 1000;
    imageStartedAtRef.current = Date.now();
    const tick = () => {
      const elapsed = imageElapsedRef.current + Date.now() - imageStartedAtRef.current;
      const nextProgress = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(nextProgress);
      if (nextProgress >= 100) goNext();
      else animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      imageElapsedRef.current += Date.now() - imageStartedAtRef.current;
    };
  }, [item?.id, item?.duration_seconds, isVideo, paused, mediaReady, goNext]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;
    video.muted = muted;
    if (paused) video.pause();
    else void video.play().catch(() => setPaused(true));
  }, [paused, muted, item?.id, isVideo, mediaReady]);

  useEffect(() => {
    if (!isVideo || !mediaReady) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frame = 0;
    const draw = () => {
      if (video.readyState >= 2) {
        if (canvas.width !== video.videoWidth) canvas.width = Math.max(1, video.videoWidth);
        if (canvas.height !== video.videoHeight) canvas.height = Math.max(1, video.videoHeight);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      frame = window.setTimeout(draw, 180) as unknown as number;
    };
    draw();
    return () => window.clearTimeout(frame);
  }, [isVideo, mediaReady, item?.id]);

  const toggleFullscreen = useCallback(async () => {
    const node = containerRef.current;
    if (!node) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await node.requestFullscreen();
    } catch {
      /* fullscreen can be refused by the browser */
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowDown') goNextRing();
      if (event.key === 'ArrowUp') goPrevRing();
      if (key === 'm') setMuted((value) => !value);
      if (key === 'f') void toggleFullscreen();
      if (event.key === ' ') {
        event.preventDefault();
        setPaused((value) => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      persistCurrent();
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    };
  }, [goNext, goPrev, goNextRing, goPrevRing, onClose, persistCurrent, toggleFullscreen]);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 45 && Math.abs(dy) < 60) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNextRing();
      else goPrevRing();
    } else if (dy > 0) onClose();
    else void toggleFullscreen();
  };

  const retryMedia = useCallback(() => {
    setMediaError(false);
    setMediaReady(false);
    setRetryToken((value) => value + 1);
  }, []);

  const handleMediaError = useCallback(() => {
    if (autoRetryRef.current < 2) {
      autoRetryRef.current += 1;
      window.setTimeout(() => setRetryToken((value) => value + 1), 600);
      return;
    }
    setMediaError(true);
    setMediaReady(false);
  }, []);

  if (!ring || !item) return null;

  const fitClass = settings.viewer_fit === 'cover' ? 'object-cover' : 'object-contain';
  const blur = Math.max(0, Math.min(64, item.backdrop_blur ?? 32));
  const opacity = Math.max(0, Math.min(100, item.backdrop_opacity ?? 55)) / 100;
  const zoom = Math.max(1, Math.min(2, Number(item.media_zoom) || 1));
  const position = `${item.media_position_x ?? 50}% ${item.media_position_y ?? 50}%`;
  const mediaSrc = retryToken > 0 ? `${item.media_url}${item.media_url.includes('?') ? '&' : '?'}r=${retryToken}` : item.media_url;
  const posterSrc = ring.cover_url || undefined;

  const onVideoReady = async () => {
    const video = videoRef.current;
    if (!video) return;
    const saved = await getStoryProgress(ring.id);
    if (saved?.itemId === item.id && saved.positionSeconds > 0 && saved.positionSeconds < video.duration - 1) {
      video.currentTime = saved.positionSeconds;
    }
    setMediaReady(true);
    setMediaError(false);
    if (!paused) void video.play().catch(() => setPaused(true));
  };

  return createPortal(
    <div
      ref={containerRef}
      className="dark fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {settings.viewer_backdrop === 'blur' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {isVideo ? (
            <canvas ref={canvasRef} className="h-full w-full scale-125 object-cover" style={{ filter: `blur(${blur}px)`, opacity }} />
          ) : (
            <img src={mediaSrc} alt="" className="h-full w-full scale-125 object-cover" style={{ filter: `blur(${blur}px)`, opacity, objectPosition: position }} />
          )}
          <div className="absolute inset-0 bg-background/40" />
        </div>
      )}
      {settings.viewer_backdrop === 'gradient' && <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/40 via-background to-secondary/40" aria-hidden="true" />}
      {settings.viewer_backdrop === 'dark' && <div className="pointer-events-none absolute inset-0 bg-background/95" aria-hidden="true" />}

      <div className="absolute inset-y-0 left-0 z-20 hidden items-center gap-3 pl-6 md:flex">
        <button onClick={goPrevRing} aria-label="Story précédente" className="rounded-full p-3 text-foreground/80 transition hover:text-foreground"><SkipBack className="h-6 w-6" /></button>
        <button onClick={goPrev} aria-label="Contenu précédent" className="rounded-full bg-foreground p-3 text-background shadow-lg transition hover:scale-105"><ChevronLeft className="h-6 w-6" /></button>
      </div>
      <div className="absolute inset-y-0 right-0 z-20 hidden items-center gap-3 pr-6 md:flex">
        <button onClick={goNext} aria-label="Contenu suivant" className="rounded-full bg-foreground p-3 text-background shadow-lg transition hover:scale-105"><ChevronRight className="h-6 w-6" /></button>
        <button onClick={goNextRing} aria-label="Story suivante" className="rounded-full p-3 text-foreground/80 transition hover:text-foreground"><SkipForward className="h-6 w-6" /></button>
      </div>

      <div className={cn('relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 py-2 md:py-6', isFullscreen ? 'max-w-none' : 'max-w-[440px]')}>
        <div className={cn('relative h-full w-full overflow-hidden bg-background/40 shadow-2xl', isFullscreen ? '' : 'md:h-[86vh] md:rounded-2xl')}>
          <div className="absolute left-0 right-0 top-0 z-30 flex gap-1 p-3">
            {ring.items.map((candidate, index) => (
              <div key={candidate.id} className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/30">
                <div className="h-full bg-foreground" style={{ width: index < itemIndex ? '100%' : index === itemIndex ? `${progress}%` : '0%' }} />
              </div>
            ))}
          </div>

          <div className="absolute left-0 right-0 top-4 z-30 flex items-center gap-2 px-3 pt-2">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-foreground/70">{ring.cover_url ? <img src={ring.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-muted" />}</div>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground drop-shadow">{ring.title}</span>
            {isVideo && <button onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Activer le son' : 'Couper le son'} className="rounded-full p-1.5 text-foreground/90 hover:text-foreground">{muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</button>}
            <button onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Reprendre' : 'Mettre en pause'} className="rounded-full p-1.5 text-foreground/90 hover:text-foreground">{paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}</button>
            <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'} className="rounded-full p-1.5 text-foreground/90 hover:text-foreground">{isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}</button>
            <button onClick={share} aria-label="Partager" className="rounded-full p-1.5 text-foreground/90 hover:text-foreground"><Send className="h-5 w-5" /></button>
            <button onClick={onClose} aria-label="Fermer les stories" className="rounded-full p-1.5 text-foreground/90 hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>

          <div className="relative h-full w-full overflow-hidden bg-muted/20">
            {isVideo ? (
              <video
                ref={videoRef}
                key={`${item.id}-${retryToken}`}
                src={mediaSrc}
                poster={posterSrc}
                className={cn('relative h-full w-full', fitClass)}
                style={{ transform: `scale(${zoom})`, objectPosition: position }}
                autoPlay
                playsInline
                muted={muted}
                preload="auto"
                controls={false}
                onLoadedMetadata={onVideoReady}
                onCanPlay={() => setMediaReady(true)}
                onWaiting={() => setMediaReady(false)}
                onPlaying={() => setMediaReady(true)}
                onError={handleMediaError}
                onStalled={handleMediaError}
                onTimeUpdate={(event) => {
                  const video = event.currentTarget;
                  if (Number.isFinite(video.duration) && video.duration > 0) setProgress(Math.min(100, (video.currentTime / video.duration) * 100));
                }}
                onEnded={goNext}
              />
            ) : (
              <img
                key={`${item.id}-${retryToken}`}
                src={mediaSrc}
                alt={item.caption ?? ring.title}
                className={cn('relative h-full w-full', fitClass)}
                style={{ transform: `scale(${zoom})`, objectPosition: position }}
                onLoad={() => setMediaReady(true)}
                onError={handleMediaError}
              />
            )}
          </div>

          {mediaError && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-background/85 px-6 text-center">
              {posterSrc && <img src={posterSrc} alt="" className="h-24 w-24 rounded-xl object-cover opacity-70" />}
              <p className="text-sm text-foreground">Ce contenu n'a pas pu être chargé.</p>
              <div className="flex gap-2">
                <button onClick={retryMedia} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><RotateCcw className="h-4 w-4" /> Réessayer</button>
                <button onClick={goNext} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground">Passer</button>
              </div>
            </div>
          )}

          {!mediaReady && !mediaError && <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/30"><div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" /></div>}
          <button className="absolute inset-y-16 left-0 z-10 w-1/3" aria-label="Précédent" onClick={goPrev} />
          <button className="absolute inset-y-16 right-0 z-10 w-1/3" aria-label="Suivant" onClick={goNext} />
          {item.caption && <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background/90 to-transparent p-4 pt-12"><p className="text-sm text-foreground drop-shadow">{item.caption}</p></div>}
        </div>

        {item.link_url && (
          <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="z-20 flex w-[calc(100%-1rem)] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg transition hover:opacity-90 md:w-full">
            {item.link_label || 'En savoir plus'} <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>,
    document.body,
  );

  function share() {
    const url = item?.link_url || window.location.href;
    void (async () => {
      try {
        if (navigator.share) await navigator.share({ title: ring?.title, url });
        else {
          await navigator.clipboard.writeText(url);
          toast({ title: 'Lien copié' });
        }
      } catch {
        /* sharing was cancelled */
      }
    })();
  }
}

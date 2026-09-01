import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Send,
  ExternalLink,
} from 'lucide-react';
import {
  StoryRing,
  StoryDisplaySettings,
  DEFAULT_STORY_SETTINGS,
  trackStoryView,
} from '@/hooks/useStories';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface StoryViewerProps {
  rings: StoryRing[];
  startRingIndex: number;
  onClose: () => void;
  onRingSeen?: (ringId: string) => void;
  settings?: StoryDisplaySettings;
}

export function StoryViewer({
  rings,
  startRingIndex,
  onClose,
  onRingSeen,
  settings = DEFAULT_STORY_SETTINGS,
}: StoryViewerProps) {
  const { toast } = useToast();
  const [ringIndex, setRingIndex] = useState(startRingIndex);
  const [itemIndex, setItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  const ring = rings[ringIndex];
  const item = ring?.items[itemIndex];

  // --- analytics -------------------------------------------------------
  const watchRef = useRef({ startedAt: Date.now(), elapsed: 0, itemId: '', ringId: '' });

  const flushView = useCallback((completed: boolean) => {
    const w = watchRef.current;
    if (!w.itemId) return;
    const total = w.elapsed + (Date.now() - w.startedAt);
    trackStoryView({ ringId: w.ringId, itemId: w.itemId, durationMs: total, completed });
    w.itemId = '';
  }, []);

  useEffect(() => {
    if (!item || !ring) return;
    watchRef.current = { startedAt: Date.now(), elapsed: 0, itemId: item.id, ringId: ring.id };
    return () => flushView(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  const completeCurrent = useCallback(() => flushView(true), [flushView]);

  // --- navigation ------------------------------------------------------
  const goNext = useCallback(() => {
    completeCurrent();
    setProgress(0);
    if (!ring) return;
    if (itemIndex < ring.items.length - 1) {
      setItemIndex((i) => i + 1);
    } else if (ringIndex < rings.length - 1) {
      setRingIndex((i) => i + 1);
      setItemIndex(0);
    } else {
      onClose();
    }
  }, [ring, itemIndex, ringIndex, rings.length, onClose, completeCurrent]);

  const goPrev = useCallback(() => {
    setProgress(0);
    if (itemIndex > 0) {
      setItemIndex((i) => i - 1);
    } else if (ringIndex > 0) {
      const prev = ringIndex - 1;
      setRingIndex(prev);
      setItemIndex(Math.max(0, rings[prev].items.length - 1));
    }
  }, [itemIndex, ringIndex, rings]);

  const goNextRing = useCallback(() => {
    completeCurrent();
    setProgress(0);
    if (ringIndex < rings.length - 1) {
      setRingIndex((i) => i + 1);
      setItemIndex(0);
    } else {
      onClose();
    }
  }, [ringIndex, rings.length, onClose, completeCurrent]);

  const goPrevRing = useCallback(() => {
    setProgress(0);
    if (ringIndex > 0) {
      setRingIndex((i) => i - 1);
      setItemIndex(0);
    } else {
      setItemIndex(0);
    }
  }, [ringIndex]);

  // Mark ring as seen
  useEffect(() => {
    if (ring) onRingSeen?.(ring.id);
  }, [ring, onRingSeen]);

  // Progress timer
  useEffect(() => {
    if (!item || paused) return;
    const duration = Math.max(2, item.duration_seconds || 6) * 1000;
    const startPct = progress;
    const started = Date.now();
    const interval = window.setInterval(() => {
      const pct = Math.min(100, startPct + ((Date.now() - started) / duration) * 100);
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(interval);
        goNext();
      }
    }, 50);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, paused, goNext]);

  // Pause bookkeeping for watch-time
  useEffect(() => {
    const w = watchRef.current;
    if (paused) {
      w.elapsed += Date.now() - w.startedAt;
    } else {
      w.startedAt = Date.now();
    }
  }, [paused]);

  // Keyboard controls + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [goNext, goPrev, onClose]);

  // Video playback sync (foreground + blurred backdrop)
  useEffect(() => {
    const video = videoRef.current;
    const bg = bgVideoRef.current;
    [video, bg].forEach((v) => {
      if (!v) return;
      if (paused) v.pause();
      else v.play().catch(() => {});
    });
  }, [paused, item]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted, item]);

  const share = async () => {
    const url = item?.link_url || window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: ring?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Lien copié' });
      }
    } catch {
      /* user cancelled */
    }
  };

  if (!ring || !item) return null;

  const isVideo = item.media_type === 'video';
  const fitClass = settings.viewer_fit === 'cover' ? 'object-cover' : 'object-contain';

  return createPortal(
    <div className="dark fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background">
      {/* Ambient backdrop derived from the media itself (Instagram-style) */}
      {settings.viewer_backdrop === 'blur' && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {isVideo ? (
            <video
              ref={bgVideoRef}
              key={`bg-${item.id}`}
              src={item.media_url}
              className="h-full w-full scale-125 object-cover blur-3xl saturate-150"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={item.media_url}
              alt=""
              className="h-full w-full scale-125 object-cover blur-3xl saturate-150"
            />
          )}
          <div className="absolute inset-0 bg-background/40" />
        </div>
      )}
      {settings.viewer_backdrop === 'gradient' && (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/40 via-background to-secondary/40"
          aria-hidden="true"
        />
      )}
      {settings.viewer_backdrop === 'dark' && (
        <div className="pointer-events-none absolute inset-0 bg-background/95" aria-hidden="true" />
      )}

      {/* Desktop side controls, UEFA-style */}
      <div className="absolute inset-y-0 left-0 z-20 hidden items-center gap-3 pl-6 md:flex">
        <button
          onClick={goPrevRing}
          aria-label="Story précédente"
          className="rounded-full p-3 text-foreground/80 transition hover:text-foreground"
        >
          <SkipBack className="h-6 w-6" />
        </button>
        <button
          onClick={goPrev}
          aria-label="Contenu précédent"
          className="rounded-full bg-foreground p-3 text-background shadow-lg transition hover:scale-105"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 z-20 hidden items-center gap-3 pr-6 md:flex">
        <button
          onClick={goNext}
          aria-label="Contenu suivant"
          className="rounded-full bg-foreground p-3 text-background shadow-lg transition hover:scale-105"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <button
          onClick={goNextRing}
          aria-label="Story suivante"
          className="rounded-full p-3 text-foreground/80 transition hover:text-foreground"
        >
          <SkipForward className="h-6 w-6" />
        </button>
      </div>

      <div className="relative z-10 flex h-full w-full max-w-[440px] flex-col items-center justify-center gap-3 py-2 md:py-6">
        <div className="relative h-full w-full overflow-hidden rounded-none bg-black/40 shadow-2xl md:h-[86vh] md:rounded-2xl">
          {/* Progress bars */}
          <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 p-3">
            {ring.items.map((it, i) => (
              <div key={it.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-foreground/30">
                <div
                  className="h-full bg-foreground transition-[width] duration-75"
                  style={{ width: i < itemIndex ? '100%' : i === itemIndex ? `${progress}%` : '0%' }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute left-0 right-0 top-4 z-20 flex items-center gap-2 px-3 pt-2">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-foreground/70">
              {ring.cover_url ? (
                <img src={ring.cover_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
            </div>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground drop-shadow">
              {ring.title}
            </span>
            {isVideo && (
              <button
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? 'Activer le son' : 'Couper le son'}
                className="rounded-full p-1.5 text-foreground/90 hover:text-foreground"
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            )}
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? 'Reprendre' : 'Mettre en pause'}
              className="rounded-full p-1.5 text-foreground/90 hover:text-foreground"
            >
              {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </button>
            <button
              onClick={share}
              aria-label="Partager"
              className="rounded-full p-1.5 text-foreground/90 hover:text-foreground"
            >
              <Send className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              aria-label="Fermer les stories"
              className="rounded-full p-1.5 text-foreground/90 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Media with its own blurred fill so vertical/small media never shows bars */}
          <div className="relative h-full w-full overflow-hidden">
            {settings.viewer_fit === 'contain' && (
              <div className="absolute inset-0" aria-hidden="true">
                {isVideo ? (
                  <video
                    key={`fill-${item.id}`}
                    src={item.media_url}
                    className="h-full w-full scale-110 object-cover blur-2xl"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img src={item.media_url} alt="" className="h-full w-full scale-110 object-cover blur-2xl" />
                )}
              </div>
            )}
            {isVideo ? (
              <video
                ref={videoRef}
                key={item.id}
                src={item.media_url}
                className={cn('relative h-full w-full', fitClass)}
                autoPlay
                playsInline
                muted={muted}
                controls={false}
                onEnded={goNext}
              />
            ) : (
              <img
                src={item.media_url}
                alt={item.caption ?? ring.title}
                className={cn('relative h-full w-full', fitClass)}
              />
            )}
          </div>

          {/* Tap zones */}
          <button className="absolute inset-y-0 left-0 z-10 w-1/3" aria-label="Précédent" onClick={goPrev} />
          <button className="absolute inset-y-0 right-0 z-10 w-1/3" aria-label="Suivant" onClick={goNext} />

          {/* Caption overlay */}
          {item.caption && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
              <p className="text-sm text-foreground drop-shadow">{item.caption}</p>
            </div>
          )}
        </div>

        {/* CTA under the frame, like the reference layout */}
        {item.link_url && (
          <a
            href={item.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'z-20 flex w-[calc(100%-1rem)] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3',
              'text-sm font-bold text-primary-foreground shadow-lg transition hover:opacity-90 md:w-full',
            )}
          >
            {item.link_label || 'En savoir plus'}
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>,
    document.body,
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Pause, Play, ExternalLink } from 'lucide-react';
import { StoryRing } from '@/hooks/useStories';
import { cn } from '@/lib/utils';

interface StoryViewerProps {
  rings: StoryRing[];
  startRingIndex: number;
  onClose: () => void;
  onRingSeen?: (ringId: string) => void;
}

export function StoryViewer({ rings, startRingIndex, onClose, onRingSeen }: StoryViewerProps) {
  const [ringIndex, setRingIndex] = useState(startRingIndex);
  const [itemIndex, setItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const ring = rings[ringIndex];
  const item = ring?.items[itemIndex];

  const goNext = useCallback(() => {
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
  }, [ring, itemIndex, ringIndex, rings.length, onClose]);

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

  // Mark ring as seen
  useEffect(() => {
    if (ring) onRingSeen?.(ring.id);
  }, [ring, onRingSeen]);

  // Progress timer
  useEffect(() => {
    if (!item || paused) return;
    const duration = Math.max(2, item.duration_seconds || 6) * 1000;
    const started = Date.now();
    const interval = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - started) / duration) * 100);
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(interval);
        goNext();
      }
    }, 50);
    return () => window.clearInterval(interval);
  }, [item, paused, goNext]);

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) video.pause();
    else video.play().catch(() => {});
  }, [paused, item]);

  if (!ring || !item) return null;

  return createPortal(
    <div className="dark fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <button
        onClick={onClose}
        aria-label="Fermer les stories"
        className="absolute right-4 top-4 z-20 rounded-full bg-muted/60 p-2 text-foreground hover:bg-muted"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        onClick={goPrev}
        aria-label="Story précédente"
        className="absolute left-2 z-20 hidden rounded-full bg-muted/60 p-3 text-foreground hover:bg-muted md:block"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={goNext}
        aria-label="Story suivante"
        className="absolute right-2 z-20 hidden rounded-full bg-muted/60 p-3 text-foreground hover:bg-muted md:block"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="relative h-full w-full max-w-[440px] overflow-hidden md:h-[92vh] md:rounded-xl">
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
        <div className="absolute left-0 right-0 top-5 z-20 flex items-center gap-3 px-4 pt-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-primary">
            {ring.cover_url ? (
              <img src={ring.cover_url} alt={ring.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-muted" />
            )}
          </div>
          <span className="truncate text-sm font-semibold text-foreground">{ring.title}</span>
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Reprendre' : 'Mettre en pause'}
            className="ml-auto rounded-full bg-muted/60 p-2 text-foreground hover:bg-muted"
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>

        {/* Media */}
        <div className="h-full w-full bg-card">
          {item.media_type === 'video' ? (
            <video
              ref={videoRef}
              src={item.media_url}
              className="h-full w-full object-contain"
              autoPlay
              playsInline
              controls={false}
              onEnded={goNext}
            />
          ) : (
            <img src={item.media_url} alt={item.caption ?? ring.title} className="h-full w-full object-contain" />
          )}
        </div>

        {/* Tap zones */}
        <button
          className="absolute inset-y-0 left-0 z-10 w-1/3"
          aria-label="Précédent"
          onClick={goPrev}
        />
        <button
          className="absolute inset-y-0 right-0 z-10 w-1/3"
          aria-label="Suivant"
          onClick={goNext}
        />

        {/* Footer */}
        {(item.caption || item.link_url) && (
          <div className="absolute bottom-0 left-0 right-0 z-20 space-y-3 bg-gradient-to-t from-background to-transparent p-4 pt-10">
            {item.caption && <p className="text-sm text-foreground">{item.caption}</p>}
            {item.link_url && (
              <a
                href={item.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2',
                  'text-sm font-medium text-primary-foreground hover:opacity-90',
                )}
              >
                {item.link_label || 'En savoir plus'}
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

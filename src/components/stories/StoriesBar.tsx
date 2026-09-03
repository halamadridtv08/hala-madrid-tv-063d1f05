import { useEffect, useState } from 'react';
import { useStories, useStoryDisplaySettings } from '@/hooks/useStories';
import { StoryViewer } from './StoryViewer';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Film } from 'lucide-react';
import { prefetchMedia, prefetchWhenIdle } from '@/lib/mediaPrefetch';

const SEEN_KEY = 'hmtv-seen-stories';

function loadSeen(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}');
  } catch {
    return {};
  }
}

const BAR_BG: Record<string, string> = {
  card: 'bg-card border-b border-border',
  muted: 'bg-muted/40 border-b border-border',
  transparent: 'bg-transparent',
  gradient: 'bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-b border-border',
};

export function StoriesBar() {
  const { rings, isLoading } = useStories();
  const { settings } = useStoryDisplaySettings();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [seen, setSeen] = useState<Record<string, string>>({});

  useEffect(() => {
    setSeen(loadSeen());
  }, []);

  // Préchauffe le cache HTTP des premiers médias dès que le navigateur est disponible
  useEffect(() => {
    if (!rings.length) return;
    prefetchWhenIdle(() => {
      rings.slice(0, 6).forEach((ring) => {
        const first = ring.items[0];
        if (!first) return;
        prefetchMedia(first.media_url, first.media_type === 'video' ? 'video' : 'image', 'metadata');
      });
    });
  }, [rings]);

  const warmRing = (ringIndex: number) => {
    const ring = rings[ringIndex];
    if (!ring) return;
    ring.items.slice(0, 2).forEach((item, i) => {
      prefetchMedia(item.media_url, item.media_type === 'video' ? 'video' : 'image', i === 0 ? 'auto' : 'metadata');
    });
  };

  const markSeen = (ringId: string) => {
    setSeen((prev) => {
      const next = { ...prev, [ringId]: new Date().toISOString() };
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  if (isLoading || rings.length === 0) return null;

  const size = Math.min(96, Math.max(48, settings.ring_size || 64));

  return (
    <>
      <div className={cn(BAR_BG[settings.bar_background] ?? BAR_BG.card)}>
        <div className="madrid-container py-3">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-start gap-4 pb-2">
              {rings.map((ring, index) => {
                const isSeen = Boolean(seen[ring.id]);
                const ringClass = isSeen
                  ? 'bg-muted-foreground/30'
                  : settings.ring_style === 'solid'
                    ? 'bg-primary'
                    : settings.ring_style === 'minimal'
                      ? 'bg-border'
                      : ring.is_highlight
                        ? 'bg-gradient-to-tr from-secondary via-primary to-secondary'
                        : 'bg-gradient-to-tr from-primary via-secondary to-primary';
                const preview = ring.cover_url || ring.items[0]?.media_url;
                const previewIsVideo = !ring.cover_url && ring.items[0]?.media_type === 'video';
                return (
                  <button
                    key={ring.id}
                    onClick={() => setOpenIndex(index)}
                    onPointerEnter={() => warmRing(index)}
                    onTouchStart={() => warmRing(index)}
                    onFocus={() => warmRing(index)}
                    className="flex shrink-0 flex-col items-center gap-1.5 focus:outline-none"
                    style={{ width: size + 12 }}
                  >
                    <span
                      className={cn('rounded-full p-[2.5px] transition-transform hover:scale-105', ringClass)}
                    >
                      <span className="block rounded-full bg-card p-[2px]">
                        <span
                          className="block overflow-hidden rounded-full bg-muted"
                          style={{ width: size, height: size }}
                        >
                          {preview ? (
                            previewIsVideo ? (
                              <span className="flex h-full w-full items-center justify-center bg-muted" aria-label="Story vidéo">
                                <Film className="h-6 w-6 text-muted-foreground" />
                              </span>
                            ) : (
                              <img
                                src={preview}
                                alt={ring.title}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            )
                          ) : null}
                        </span>
                      </span>
                    </span>
                    {settings.show_titles && (
                      <span className="w-full truncate text-center text-[11px] font-medium text-foreground">
                        {ring.title}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="h-1.5" />
          </ScrollArea>
        </div>
      </div>

      {openIndex !== null && (
        <StoryViewer
          rings={rings}
          startRingIndex={openIndex}
          settings={settings}
          onClose={() => setOpenIndex(null)}
          onRingSeen={markSeen}
        />
      )}
    </>
  );
}

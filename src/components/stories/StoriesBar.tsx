import { useEffect, useState } from 'react';
import { useStories } from '@/hooks/useStories';
import { StoryViewer } from './StoryViewer';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const SEEN_KEY = 'hmtv-seen-stories';

function loadSeen(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}');
  } catch {
    return {};
  }
}

export function StoriesBar() {
  const { rings, isLoading } = useStories();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [seen, setSeen] = useState<Record<string, string>>({});

  useEffect(() => {
    setSeen(loadSeen());
  }, []);

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

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="madrid-container py-3">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-start gap-4 pb-2">
              {rings.map((ring, index) => {
                const isSeen = Boolean(seen[ring.id]);
                return (
                  <button
                    key={ring.id}
                    onClick={() => setOpenIndex(index)}
                    className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 focus:outline-none"
                  >
                    <span
                      className={cn(
                        'rounded-full p-[2.5px] transition-transform hover:scale-105',
                        isSeen
                          ? 'bg-muted-foreground/30'
                          : ring.is_highlight
                            ? 'bg-gradient-to-tr from-secondary via-primary to-secondary'
                            : 'bg-gradient-to-tr from-primary via-secondary to-primary',
                      )}
                    >
                      <span className="block rounded-full bg-card p-[2px]">
                        <span className="block h-16 w-16 overflow-hidden rounded-full bg-muted">
                          {ring.cover_url ? (
                            <img
                              src={ring.cover_url}
                              alt={ring.title}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : ring.items[0]?.media_type === 'image' ? (
                            <img
                              src={ring.items[0].media_url}
                              alt={ring.title}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </span>
                      </span>
                    </span>
                    <span className="w-full truncate text-center text-[11px] font-medium text-foreground">
                      {ring.title}
                    </span>
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
          onClose={() => setOpenIndex(null)}
          onRingSeen={markSeen}
        />
      )}
    </>
  );
}

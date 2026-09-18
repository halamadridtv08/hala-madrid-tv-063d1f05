import { useEffect, useState } from 'react';
import { useStories, useStoryDisplaySettings } from '@/hooks/useStories';
import { StoryViewer } from './StoryViewer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, Film } from 'lucide-react';
import { prefetchMedia, prefetchWhenIdle } from '@/lib/mediaPrefetch';
import { getNetworkProfile, imageQualityForProfile, optimizeImageUrl } from '@/lib/networkQuality';

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
  const { settings } = useStoryDisplaySettings();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [seen, setSeen] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setSeen(loadSeen());
  }, []);

  // Préchauffe le cache HTTP des premiers médias dès que le navigateur est disponible.
  // La profondeur et la qualité sont adaptées au réseau (mobile / connexion lente).
  useEffect(() => {
    if (!rings.length) return;
    const profile = getNetworkProfile();
    if (profile.saveData) return;
    const quality = imageQualityForProfile(profile);
    const depth = profile.isSlow ? 1 : profile.isSmallScreen ? 3 : 6;
    prefetchWhenIdle(() => {
      rings.slice(0, depth).forEach((ring) => {
        const first = ring.items[0];
        if (!first) return;
        if (first.media_type === 'video') {
          prefetchMedia(first.media_url, 'video', 'metadata');
        } else {
          prefetchMedia(optimizeImageUrl(first.media_url, quality) || first.media_url, 'image', 'auto');
        }
      });
    });
  }, [rings]);

  const warmRing = (ringIndex: number) => {
    const ring = rings[ringIndex];
    if (!ring) return;
    const profile = getNetworkProfile();
    const quality = imageQualityForProfile(profile);
    const items = profile.isSlow ? ring.items.slice(0, 1) : ring.items.slice(0, 2);
    items.forEach((item, i) => {
      if (item.media_type === 'video') {
        prefetchMedia(item.media_url, 'video', i === 0 && !profile.isSlow ? 'auto' : 'metadata');
      } else {
        prefetchMedia(optimizeImageUrl(item.media_url, quality) || item.media_url, 'image', 'auto');
      }
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

  if (isLoading || rings.length === 0 || !settings.show_floating_rail) return null;

  const size = Math.min(68, Math.max(48, settings.ring_size || 60));
  const orderedRings = rings
    .map((ring, originalIndex) => ({ ring, originalIndex }))
    .sort((a, b) => {
      if (a.ring.is_highlight !== b.ring.is_highlight) return a.ring.is_highlight ? 1 : -1;
      return a.ring.display_order - b.ring.display_order;
    });
  const visibleRings = isExpanded ? orderedRings : orderedRings.slice(0, 1);

  return (
    <>
      <aside className="absolute left-3 top-3 z-30" aria-label="Stories">
        <div className="flex max-h-[65vh] flex-col items-center gap-2 overflow-y-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visibleRings.map(({ ring, originalIndex }) => {
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
                  <Button
                    key={ring.id}
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Voir la story ${ring.title}`}
                    onClick={() => setOpenIndex(originalIndex)}
                    onPointerEnter={() => warmRing(originalIndex)}
                    onTouchStart={() => warmRing(originalIndex)}
                    onFocus={() => warmRing(originalIndex)}
                    className="h-auto w-auto shrink-0 rounded-full p-0 hover:bg-transparent"
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
                  </Button>
                );
              })}
          {orderedRings.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isExpanded ? 'Replier les stories' : 'Afficher toutes les stories'}
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((expanded) => !expanded)}
              className="h-6 w-6 shrink-0 rounded-full bg-transparent p-0 text-foreground drop-shadow-sm hover:bg-transparent hover:text-primary"
            >
              <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
            </Button>
          )}
        </div>
      </aside>

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

const prefetched = new Set<string>();
const holders = new Map<string, HTMLVideoElement | HTMLImageElement>();
const MAX_HOLDERS = 6;

function trim() {
  while (holders.size > MAX_HOLDERS) {
    const oldest = holders.keys().next().value as string | undefined;
    if (!oldest) break;
    const el = holders.get(oldest);
    if (el instanceof HTMLVideoElement) {
      el.removeAttribute('src');
      el.load();
    }
    holders.delete(oldest);
  }
}

/** Warms the HTTP cache for a story media URL so playback starts instantly on click. */
export function prefetchMedia(
  url: string | null | undefined,
  type: 'image' | 'video' = 'image',
  strategy: 'metadata' | 'auto' = 'auto',
) {
  if (!url || typeof window === 'undefined') return;
  const key = `${url}|${strategy}`;
  if (prefetched.has(key)) return;
  prefetched.add(key);

  try {
    if (type === 'video') {
      const video = document.createElement('video');
      video.preload = strategy;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';
      video.src = url;
      video.load();
      holders.set(key, video);
    } else {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      holders.set(key, img);
    }
    trim();
  } catch {
    prefetched.delete(key);
  }
}

/** Schedules prefetching when the browser is idle to avoid competing with the first paint. */
export function prefetchWhenIdle(fn: () => void, timeout = 2000) {
  if (typeof window === 'undefined') return;
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
  if (ric) ric(fn, { timeout });
  else window.setTimeout(fn, 300);
}

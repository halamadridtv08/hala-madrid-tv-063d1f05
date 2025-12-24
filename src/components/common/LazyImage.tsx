import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onClick?: () => void;
}

// Cache pour les images déjà chargées
const loadedImages = new Set<string>();

// Préchargement d'images en arrière-plan
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (loadedImages.has(src)) {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => {
      loadedImages.add(src);
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
};

// Précharger plusieurs images
export const preloadImages = (urls: string[], concurrency = 3): void => {
  const queue = [...urls];
  const loadNext = () => {
    if (queue.length === 0) return;
    const url = queue.shift()!;
    preloadImage(url).finally(loadNext);
  };
  // Charger en parallèle avec concurrence limitée
  for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
    loadNext();
  }
};

export const LazyImage = memo(({ 
  src, 
  alt, 
  className, 
  placeholderClassName,
  width,
  height,
  priority = false,
  sizes,
  onLoad,
  onClick
}: LazyImageProps) => {
  // Vérifier si l'image est déjà dans le cache
  const [isLoaded, setIsLoaded] = useState(() => loadedImages.has(src));
  const [isInView, setIsInView] = useState(priority || loadedImages.has(src));
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || loadedImages.has(src)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '300px', // Précharger 300px avant d'entrer dans le viewport
        threshold: 0
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, src]);

  const handleLoad = useCallback(() => {
    loadedImages.add(src);
    setIsLoaded(true);
    onLoad?.();
  }, [src, onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true); // Cacher le spinner même en cas d'erreur
  }, []);

  // Générer URL optimisée Supabase (désactivé car peut casser les URLs)
  const getOptimizedSrc = (originalSrc: string): string => {
    if (!originalSrc) return originalSrc;
    
    // Pour l'instant, retourner l'URL originale pour éviter les erreurs
    // L'optimisation Supabase nécessite une configuration spécifique
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(src);

  return (
    <div 
      ref={imgRef}
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{ width, height }}
      onClick={onClick}
    >
      {/* Placeholder avec blur */}
      {!isLoaded && !hasError && (
        <div 
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            placeholderClassName
          )}
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Image d'erreur avec meilleur contraste */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 dark:bg-muted/60">
          <span className="text-muted-foreground dark:text-muted-foreground/80 text-sm px-2 text-center">Image non disponible</span>
        </div>
      )}
      
      {/* Image réelle */}
      {isInView && !hasError && (
        <img
          src={optimizedSrc}
          sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-200',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  optimizeSupabaseImage,
  generateSrcSet,
  generateSizes,
  isSupabaseImage,
  type ImageSize,
} from '@/utils/imageOptimizer';
import { Skeleton } from './skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  alt: string;
  size?: ImageSize;
  className?: string;
  fallbackSrc?: string;
  showSkeleton?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  size = 'card',
  className,
  fallbackSrc = '/placeholder.svg',
  showSkeleton = true,
  loading = 'lazy',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Si l'image est Supabase, on l'optimise
  const shouldOptimize = isSupabaseImage(src);
  const optimizedSrc = shouldOptimize ? optimizeSupabaseImage(src, size) : src || fallbackSrc;
  const srcSet = shouldOptimize ? generateSrcSet(src) : undefined;
  const sizes = shouldOptimize ? generateSizes(size) : undefined;

  return (
    <div className={cn('relative', className)}>
      {isLoading && showSkeleton && (
        <Skeleton className="absolute inset-0" />
      )}
      <img
        src={hasError ? fallbackSrc : optimizedSrc}
        srcSet={!hasError && srcSet ? srcSet : undefined}
        sizes={!hasError && sizes ? sizes : undefined}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
    </div>
  );
}

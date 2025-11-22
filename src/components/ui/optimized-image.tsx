import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  optimizeSupabaseImage,
  generateSupabaseSrcSet,
  generateSizesAttribute,
  type ImageSize,
} from "@/utils/imageOptimizer";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  alt: string;
  size?: ImageSize;
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  size = "medium",
  fallbackSrc = "/placeholder.svg",
  className,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const optimizedSrc = optimizeSupabaseImage(src, size);
  const srcSet = generateSupabaseSrcSet(src, ["thumbnail", "card", "medium"]);
  const sizes = generateSizesAttribute(size);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={hasError ? fallbackSrc : optimizedSrc || fallbackSrc}
        srcSet={!hasError && srcSet ? srcSet : undefined}
        sizes={!hasError && srcSet ? sizes : undefined}
        alt={alt}
        loading="lazy"
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        {...props}
      />
    </div>
  );
}

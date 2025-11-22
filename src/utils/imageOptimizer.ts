/**
 * Supabase Image Optimization Utility
 * Réduit la consommation de bande passante de 80-90%
 */

const SUPABASE_STORAGE_URL = 'https://qjnppcfbywfazwolfppo.supabase.co/storage/v1';

export type ImageSize = 'thumbnail' | 'card' | 'medium' | 'full';

interface OptimizationConfig {
  width: number;
  quality: number;
}

const SIZE_CONFIGS: Record<ImageSize, OptimizationConfig> = {
  thumbnail: { width: 150, quality: 60 },
  card: { width: 600, quality: 70 },
  medium: { width: 1200, quality: 70 },
  full: { width: 1920, quality: 80 },
};

/**
 * Vérifie si l'URL est une image Supabase
 */
export function isSupabaseImage(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('qjnppcfbywfazwolfppo.supabase.co/storage/v1/object/public');
}

/**
 * Transforme une URL Supabase en URL optimisée
 */
export function optimizeSupabaseImage(
  url: string | null | undefined,
  size: ImageSize = 'card'
): string {
  if (!url || !isSupabaseImage(url)) return url || '';

  const config = SIZE_CONFIGS[size];
  
  // Remplace /object/public/ par /render/image/public/
  const optimizedUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  // Ajoute les paramètres d'optimisation
  const params = new URLSearchParams({
    width: config.width.toString(),
    quality: config.quality.toString(),
    format: 'webp',
  });

  return `${optimizedUrl}?${params.toString()}`;
}

/**
 * Génère un srcset responsive pour les images
 */
export function generateSrcSet(url: string | null | undefined): string {
  if (!url || !isSupabaseImage(url)) return '';

  const sizes: ImageSize[] = ['thumbnail', 'card', 'medium', 'full'];
  
  return sizes
    .map(size => {
      const config = SIZE_CONFIGS[size];
      const optimizedUrl = optimizeSupabaseImage(url, size);
      return `${optimizedUrl} ${config.width}w`;
    })
    .join(', ');
}

/**
 * Génère l'attribut sizes pour le responsive
 */
export function generateSizes(size: ImageSize = 'card'): string {
  const sizeMap: Record<ImageSize, string> = {
    thumbnail: '(max-width: 640px) 150px, 150px',
    card: '(max-width: 640px) 450px, (max-width: 1024px) 600px, 600px',
    medium: '(max-width: 640px) 450px, (max-width: 1024px) 800px, 1200px',
    full: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px',
  };

  return sizeMap[size];
}

/**
 * Optimise une URL d'image avec configuration personnalisée
 */
export function customOptimizeImage(
  url: string | null | undefined,
  width: number,
  quality: number = 70
): string {
  if (!url || !isSupabaseImage(url)) return url || '';

  const optimizedUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  const params = new URLSearchParams({
    width: width.toString(),
    quality: quality.toString(),
    format: 'webp',
  });

  return `${optimizedUrl}?${params.toString()}`;
}

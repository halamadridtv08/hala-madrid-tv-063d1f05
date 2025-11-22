const SUPABASE_URL = "https://qjnppcfbywfazwolfppo.supabase.co";
const SUPABASE_STORAGE_PATH = "/storage/v1/object/public/";
const SUPABASE_RENDER_PATH = "/storage/v1/render/image/public/";

export type ImageSize = "thumbnail" | "card" | "medium" | "full";

interface OptimizationConfig {
  width: number;
  quality: number;
}

const sizeConfig: Record<ImageSize, OptimizationConfig> = {
  thumbnail: { width: 150, quality: 60 },
  card: { width: 600, quality: 70 },
  medium: { width: 1200, quality: 70 },
  full: { width: 1920, quality: 80 },
};

/**
 * Optimise une URL d'image Supabase en ajoutant les paramètres de transformation
 * Si l'URL n'est pas Supabase, elle est retournée telle quelle
 */
export function optimizeSupabaseImage(
  imageUrl: string | null | undefined,
  size: ImageSize = "medium"
): string {
  if (!imageUrl) return "";
  
  // Si ce n'est pas une URL Supabase, retourner l'URL originale
  if (!imageUrl.includes(SUPABASE_URL) || !imageUrl.includes(SUPABASE_STORAGE_PATH)) {
    return imageUrl;
  }

  // Transformer le chemin /object/public/ en /render/image/public/
  const optimizedUrl = imageUrl.replace(SUPABASE_STORAGE_PATH, SUPABASE_RENDER_PATH);
  
  const config = sizeConfig[size];
  
  // Ajouter les paramètres d'optimisation
  return `${optimizedUrl}?width=${config.width}&quality=${config.quality}&format=webp`;
}

/**
 * Génère un srcset responsive pour une image Supabase
 */
export function generateSupabaseSrcSet(
  imageUrl: string | null | undefined,
  sizes: ImageSize[] = ["thumbnail", "card", "medium"]
): string {
  if (!imageUrl) return "";
  
  // Si ce n'est pas une URL Supabase, retourner une chaîne vide
  if (!imageUrl.includes(SUPABASE_URL) || !imageUrl.includes(SUPABASE_STORAGE_PATH)) {
    return "";
  }

  const baseUrl = imageUrl.replace(SUPABASE_STORAGE_PATH, SUPABASE_RENDER_PATH);
  
  return sizes
    .map((size) => {
      const config = sizeConfig[size];
      return `${baseUrl}?width=${config.width}&quality=${config.quality}&format=webp ${config.width}w`;
    })
    .join(", ");
}

/**
 * Génère l'attribut sizes pour le responsive
 */
export function generateSizesAttribute(size: ImageSize): string {
  switch (size) {
    case "thumbnail":
      return "(max-width: 640px) 100px, 150px";
    case "card":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px";
    case "medium":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px";
    case "full":
      return "100vw";
    default:
      return "100vw";
  }
}

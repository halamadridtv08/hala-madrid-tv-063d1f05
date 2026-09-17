export interface NetworkProfile {
  /** Connexion lente, mode économie de données, ou réseau 2G/3G. */
  isSlow: boolean;
  /** Écran de type téléphone. */
  isSmallScreen: boolean;
  saveData: boolean;
  effectiveType: string;
}

type Connection = { saveData?: boolean; effectiveType?: string; downlink?: number };

export function getNetworkProfile(): NetworkProfile {
  if (typeof window === 'undefined') {
    return { isSlow: false, isSmallScreen: false, saveData: false, effectiveType: '4g' };
  }
  const connection = (navigator as unknown as { connection?: Connection }).connection;
  const effectiveType = connection?.effectiveType ?? '4g';
  const saveData = Boolean(connection?.saveData);
  const slowType = ['slow-2g', '2g', '3g'].includes(effectiveType);
  const slowDownlink = typeof connection?.downlink === 'number' && connection.downlink > 0 && connection.downlink < 1.5;
  return {
    isSlow: saveData || slowType || slowDownlink,
    isSmallScreen: window.matchMedia('(max-width: 768px)').matches,
    saveData,
    effectiveType,
  };
}

/**
 * Réécrit une URL Supabase Storage vers l'API de rendu d'image pour servir
 * une version redimensionnée/compressée (utile sur connexions lentes).
 */
export function optimizeImageUrl(
  url: string | null | undefined,
  options: { width?: number; quality?: number } = {},
): string {
  if (!url) return '';
  if (!url.includes('/storage/v1/object/public/')) return url;
  const { width = 1080, quality = 70 } = options;
  const [base, existingQuery] = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/').split('?');
  const params = new URLSearchParams(existingQuery);
  params.set('width', String(Math.round(width)));
  params.set('quality', String(Math.max(20, Math.min(100, Math.round(quality)))));
  params.set('resize', 'contain');
  return `${base}?${params.toString()}`;
}

/** Réglages d'image adaptés au profil réseau courant. */
export function imageQualityForProfile(profile: NetworkProfile) {
  if (profile.isSlow) return { width: 720, quality: 45 };
  if (profile.isSmallScreen) return { width: 900, quality: 62 };
  return { width: 1400, quality: 78 };
}

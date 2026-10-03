// Réglages de cadrage d'une image (point focal en % et zoom), par appareil.
export interface FocalSettings {
  focal_mobile_x: number;
  focal_mobile_y: number;
  zoom_mobile: number;
  focal_desktop_x: number;
  focal_desktop_y: number;
  zoom_desktop: number;
}

export const DEFAULT_FOCAL: FocalSettings = {
  focal_mobile_x: 50,
  focal_mobile_y: 50,
  zoom_mobile: 1,
  focal_desktop_x: 50,
  focal_desktop_y: 50,
  zoom_desktop: 1,
};

/** Borne une valeur entre min et max. */
export const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

/** Convertit une position de pointeur en pourcentages (0–100) relatifs à l'élément. */
export const pointerToPercent = (clientX: number, clientY: number, rect: DOMRect) => ({
  x: Math.round(clamp(((clientX - rect.left) / rect.width) * 100)),
  y: Math.round(clamp(((clientY - rect.top) / rect.height) * 100)),
});

/** Extrait les réglages d'un objet quelconque (ex. ligne d'article), avec valeurs par défaut. */
export const pickFocal = (src: Partial<Record<keyof FocalSettings, unknown>> | null | undefined): FocalSettings => {
  const out = { ...DEFAULT_FOCAL };
  (Object.keys(DEFAULT_FOCAL) as (keyof FocalSettings)[]).forEach((k) => {
    const n = Number(src?.[k]);
    if (src?.[k] != null && Number.isFinite(n)) out[k] = n;
  });
  return out;
};

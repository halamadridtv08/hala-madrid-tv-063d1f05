import { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { FocalSettings, pickFocal } from "@/types/Focal";

interface FocalImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  focal?: Partial<FocalSettings> | null;
  /** Classes du conteneur (taille / ratio). */
  wrapperClassName?: string;
}

/**
 * Affiche une image recadrée selon son point focal et son zoom.
 * Variables CSS mobiles par défaut, surchargées pour desktop à partir de 768 px (md:).
 */
export const FocalImage = ({ focal, wrapperClassName, className, style, ...img }: FocalImageProps) => {
  const f = pickFocal(focal);
  const vars = {
    "--fx-m": `${f.focal_mobile_x}%`,
    "--fy-m": `${f.focal_mobile_y}%`,
    "--z-m": f.zoom_mobile,
    "--fx-d": `${f.focal_desktop_x}%`,
    "--fy-d": `${f.focal_desktop_y}%`,
    "--z-d": f.zoom_desktop,
  } as CSSProperties;

  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)} style={vars}>
      <img
        {...img}
        style={style}
        className={cn(
          "h-full w-full object-cover",
          "[--fx:var(--fx-m)] [--fy:var(--fy-m)] [--zoom:var(--z-m)]",
          "md:[--fx:var(--fx-d)] md:[--fy:var(--fy-d)] md:[--zoom:var(--z-d)]",
          "[object-position:var(--fx)_var(--fy)] [transform-origin:var(--fx)_var(--fy)] [transform:scale(var(--zoom))]",
          className,
        )}
      />
    </div>
  );
};

import { Suspense, lazy, useState } from "react";
import { Loader2 } from "lucide-react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface FooterSplineAnimationProps {
  url: string;
}

export function FooterSplineAnimation({ url }: FooterSplineAnimationProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!url) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <Loader2 className="h-8 w-8 animate-spin text-white/30" />
        </div>
      )}
      <Suspense fallback={null}>
        <Spline
          scene={url}
          onLoad={() => setIsLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </Suspense>
    </div>
  );
}

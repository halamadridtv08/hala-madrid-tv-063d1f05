import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface FooterSplineAnimationProps {
  url: string;
}

export function FooterSplineAnimation({ url }: FooterSplineAnimationProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Delay rendering to avoid blocking initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Validate and transform URL to embed format
  const getEmbedUrl = (inputUrl: string): string | null => {
    if (!inputUrl) return null;
    
    // If it's a scene.splinecode URL, convert to embed format
    if (inputUrl.includes("prod.spline.design") && inputUrl.includes("scene.splinecode")) {
      // Extract the scene ID and create embed URL
      const match = inputUrl.match(/prod\.spline\.design\/([^/]+)\/scene\.splinecode/);
      if (match && match[1]) {
        return `https://my.spline.design/${match[1]}/`;
      }
    }
    
    // If it's already an embed URL
    if (inputUrl.includes("my.spline.design")) {
      return inputUrl;
    }
    
    return null;
  };

  const embedUrl = getEmbedUrl(url);

  if (!embedUrl || hasError || !shouldRender) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <Loader2 className="h-8 w-8 animate-spin text-white/30" />
        </div>
      )}
      <iframe
        src={embedUrl}
        frameBorder="0"
        width="100%"
        height="100%"
        title="Spline 3D Animation"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
          pointerEvents: "none",
        }}
        allow="autoplay"
      />
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface FooterSplineAnimationProps {
  url: string;
}

export function FooterSplineAnimation({ url }: FooterSplineAnimationProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract URL from HTML snippet or use direct URL
  const extractSplineUrl = (input: string): string | null => {
    if (!input) return null;
    
    const trimmed = input.trim();
    
    // If it's already a direct URL
    if (trimmed.startsWith("https://prod.spline.design/") || trimmed.startsWith("https://my.spline.design/")) {
      return trimmed;
    }
    
    // Extract from <spline-viewer url="...">
    const match = trimmed.match(/url="([^"]+)"/);
    if (match?.[1]) {
      return match[1];
    }
    
    // Try to find any Spline URL
    const urlMatch = trimmed.match(/(https:\/\/(?:prod|my)\.spline\.design\/[^\s"<>]+)/);
    if (urlMatch?.[1]) {
      return urlMatch[1];
    }
    
    return null;
  };

  const splineUrl = extractSplineUrl(url);

  // Load the Spline viewer script dynamically
  useEffect(() => {
    if (!splineUrl) return;

    const existingScript = document.querySelector('script[src*="splinetool/viewer"]');
    
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@splinetool/viewer@1.12.28/build/spline-viewer.js";
    script.async = true;
    
    script.onload = () => {
      setScriptLoaded(true);
    };
    
    script.onerror = () => {
      console.warn("Failed to load Spline viewer script");
      setHasError(true);
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove script on cleanup as it might be used elsewhere
    };
  }, [splineUrl]);

  // Create the spline-viewer element when script is loaded
  useEffect(() => {
    if (!scriptLoaded || !splineUrl || !containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = "";

    // Create the spline-viewer custom element
    const viewer = document.createElement("spline-viewer");
    viewer.setAttribute("url", splineUrl);
    viewer.style.width = "100%";
    viewer.style.height = "100%";
    viewer.style.position = "absolute";
    viewer.style.top = "0";
    viewer.style.left = "0";
    viewer.style.pointerEvents = "none";

    // Listen for load event
    viewer.addEventListener("load", () => {
      setIsLoaded(true);
    });

    viewer.addEventListener("error", () => {
      setHasError(true);
    });

    containerRef.current.appendChild(viewer);

    // Fallback: mark as loaded after a timeout if no event fires
    const timeout = setTimeout(() => {
      setIsLoaded(true);
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [scriptLoaded, splineUrl]);

  if (!splineUrl || hasError) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <Loader2 className="h-8 w-8 animate-spin text-white/30" />
        </div>
      )}
      <div 
        ref={containerRef} 
        className="absolute inset-0"
        style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.3s ease" }}
      />
    </div>
  );
}

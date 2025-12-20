import { Suspense, lazy, useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface FooterSplineAnimationProps {
  url: string;
}

export function FooterSplineAnimation({ url }: FooterSplineAnimationProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!url || !containerRef.current) return;

    // Reset states when URL changes
    setIsLoaded(false);
    setHasError(false);

    // Use the native spline-viewer web component for better compatibility
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.12.27/build/spline-viewer.js';
    
    script.onload = () => {
      if (containerRef.current) {
        // Create the spline-viewer element
        const viewer = document.createElement('spline-viewer');
        viewer.setAttribute('url', url);
        viewer.style.width = '100%';
        viewer.style.height = '100%';
        viewer.style.position = 'absolute';
        viewer.style.top = '0';
        viewer.style.left = '0';
        
        // Clear previous content and add new viewer
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(viewer);
        
        setIsLoaded(true);
      }
    };

    script.onerror = () => {
      setHasError(true);
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [url]);

  if (!url || hasError) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <Loader2 className="h-8 w-8 animate-spin text-white/30" />
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '100%' }}
      />
    </div>
  );
}
import { Suspense, lazy, useState, useEffect, Component, ReactNode } from "react";
import { Loader2 } from "lucide-react";

const Spline = lazy(() => import("@splinetool/react-spline"));

// Error Boundary to catch Spline loading errors
class SplineErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("Spline animation failed to load:", error.message);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

interface FooterSplineAnimationProps {
  url: string;
}

export function FooterSplineAnimation({ url }: FooterSplineAnimationProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  // Check WebGL support on mount with a small delay to prevent hydration issues
  useEffect(() => {
    // Delay rendering to avoid blocking initial page load
    const timer = setTimeout(() => {
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) {
          setWebGLSupported(false);
        } else {
          setShouldRender(true);
        }
      } catch {
        setWebGLSupported(false);
      }
    }, 1000); // 1 second delay to let critical content load first

    return () => clearTimeout(timer);
  }, []);

  // Validate URL format
  const isValidUrl = url && (
    url.startsWith("https://prod.spline.design/") || 
    url.startsWith("https://my.spline.design/")
  );

  if (!isValidUrl || !webGLSupported || hasError || !shouldRender) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <Loader2 className="h-8 w-8 animate-spin text-white/30" />
        </div>
      )}
      <SplineErrorBoundary onError={() => setHasError(true)}>
        <Suspense fallback={null}>
          <Spline
            scene={url}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </Suspense>
      </SplineErrorBoundary>
    </div>
  );
}

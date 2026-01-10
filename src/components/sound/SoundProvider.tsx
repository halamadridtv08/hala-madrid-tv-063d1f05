import { useEffect, useRef, ReactNode } from "react";
import { useSiteSound } from "@/hooks/useSiteSound";

interface SoundProviderProps {
  children: ReactNode;
}

export const SoundProvider = ({ children }: SoundProviderProps) => {
  const { playWelcomeSound, preloadSounds, settings } = useSiteSound();
  const hasInteracted = useRef(false);
  const hasPreloaded = useRef(false);

  // Preload sounds when settings are available
  useEffect(() => {
    if (settings && !hasPreloaded.current) {
      preloadSounds();
      hasPreloaded.current = true;
    }
  }, [settings, preloadSounds]);

  // Play welcome sound on first user interaction
  useEffect(() => {
    if (!settings?.is_enabled || !settings?.welcome_sound_enabled) return;

    const handleFirstInteraction = async () => {
      if (hasInteracted.current) return;
      hasInteracted.current = true;

      // Small delay to ensure audio context is ready
      setTimeout(async () => {
        await playWelcomeSound();
      }, 100);

      // Remove listeners after first interaction
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [settings, playWelcomeSound]);

  return <>{children}</>;
};

import { useEffect, useRef, ReactNode } from "react";
import { useSiteSound } from "@/hooks/useSiteSound";

interface SoundProviderProps {
  children: ReactNode;
}

export const SoundProvider = ({ children }: SoundProviderProps) => {
  const { playWelcomeSound, preloadSounds, settings } = useSiteSound();
  const hasAttemptedAutoPlay = useRef(false);
  const hasPreloaded = useRef(false);
  const hasPlayedWithInteraction = useRef(false);

  // Preload sounds when settings are available
  useEffect(() => {
    if (settings && !hasPreloaded.current) {
      preloadSounds();
      hasPreloaded.current = true;
    }
  }, [settings, preloadSounds]);

  // Tenter de jouer le son automatiquement au chargement de la page
  useEffect(() => {
    if (!settings?.is_enabled || !settings?.welcome_sound_enabled) return;
    if (hasAttemptedAutoPlay.current) return;
    
    hasAttemptedAutoPlay.current = true;

    // Tenter la lecture automatique après un court délai
    const attemptAutoPlay = async () => {
      try {
        const played = await playWelcomeSound();
        if (played) {
          hasPlayedWithInteraction.current = true;
        }
      } catch (error) {
        // Autoplay bloqué - on essaiera avec l'interaction utilisateur
        console.log("Autoplay blocked, waiting for user interaction");
      }
    };

    // Attendre que la page soit complètement chargée
    if (document.readyState === "complete") {
      setTimeout(attemptAutoPlay, 300);
    } else {
      window.addEventListener("load", () => setTimeout(attemptAutoPlay, 300), { once: true });
    }
  }, [settings, playWelcomeSound]);

  // Fallback: jouer au premier clic si l'autoplay a échoué
  useEffect(() => {
    if (!settings?.is_enabled || !settings?.welcome_sound_enabled) return;

    const handleFirstInteraction = async () => {
      if (hasPlayedWithInteraction.current) return;
      hasPlayedWithInteraction.current = true;

      setTimeout(async () => {
        await playWelcomeSound();
      }, 100);

      // Remove listeners after first interaction
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [settings, playWelcomeSound]);

  return <>{children}</>;
};

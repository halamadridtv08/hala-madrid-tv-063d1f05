import { useCallback, useRef } from "react";
import { useSoundSettings } from "./useSoundSettings";

type SoundType = "welcome" | "login" | "logout";

const WELCOME_SOUND_PLAYED_KEY = "hala_madrid_welcome_sound_played";
const SESSION_KEY = "hala_madrid_sound_session";

export const useSiteSound = () => {
  const { data: settings } = useSoundSettings();
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Detect user language
  const getUserLanguage = useCallback((): "fr" | "en" => {
    if (!settings?.auto_language_detection) return "fr";
    
    const browserLang = navigator.language.toLowerCase();
    // French-speaking countries: fr, fr-FR, fr-CA, fr-BE, fr-CH, etc.
    if (browserLang.startsWith("fr")) return "fr";
    // Everything else defaults to English
    return "en";
  }, [settings?.auto_language_detection]);

  // Get the appropriate sound URL based on type and language
  const getSoundUrl = useCallback(
    (type: SoundType): string | null => {
      if (!settings) return null;

      const lang = getUserLanguage();

      switch (type) {
        case "welcome":
          return lang === "fr"
            ? settings.welcome_sound_url_fr
            : settings.welcome_sound_url_en;
        case "login":
          return lang === "fr"
            ? settings.login_sound_url_fr
            : settings.login_sound_url_en;
        case "logout":
          return lang === "fr"
            ? settings.logout_sound_url_fr
            : settings.logout_sound_url_en;
        default:
          return null;
      }
    },
    [settings, getUserLanguage]
  );

  // Check if a specific sound type is enabled
  const isSoundEnabled = useCallback(
    (type: SoundType): boolean => {
      if (!settings?.is_enabled) return false;

      switch (type) {
        case "welcome":
          return settings.welcome_sound_enabled;
        case "login":
          return settings.login_sound_enabled;
        case "logout":
          return settings.logout_sound_enabled;
        default:
          return false;
      }
    },
    [settings]
  );

  // Play a sound
  const playSound = useCallback(
    async (type: SoundType): Promise<void> => {
      if (!isSoundEnabled(type)) return;

      const url = getSoundUrl(type);
      if (!url) return;

      try {
        // Reuse or create audio element
        if (!audioRefs.current[type]) {
          audioRefs.current[type] = new Audio();
        }

        const audio = audioRefs.current[type];
        audio.src = url;
        audio.volume = settings?.volume ?? 0.5;

        await audio.play();
      } catch (error) {
        console.error(`Failed to play ${type} sound:`, error);
      }
    },
    [isSoundEnabled, getSoundUrl, settings?.volume]
  );

  // Play welcome sound (only once per session)
  const playWelcomeSound = useCallback(async (): Promise<boolean> => {
    // Check if already played this session
    const sessionId = sessionStorage.getItem(SESSION_KEY);
    const currentSession = Date.now().toString();
    
    if (!sessionId) {
      sessionStorage.setItem(SESSION_KEY, currentSession);
    }

    const hasPlayed = sessionStorage.getItem(WELCOME_SOUND_PLAYED_KEY);
    if (hasPlayed) return false;

    // Mark as played
    sessionStorage.setItem(WELCOME_SOUND_PLAYED_KEY, "true");

    await playSound("welcome");
    return true;
  }, [playSound]);

  // Play login sound
  const playLoginSound = useCallback(async (): Promise<void> => {
    await playSound("login");
  }, [playSound]);

  // Play logout sound
  const playLogoutSound = useCallback(async (): Promise<void> => {
    await playSound("logout");
  }, [playSound]);

  // Preload all sounds for faster playback
  const preloadSounds = useCallback(() => {
    const types: SoundType[] = ["welcome", "login", "logout"];

    types.forEach((type) => {
      const url = getSoundUrl(type);
      if (url && isSoundEnabled(type)) {
        const audio = new Audio();
        audio.preload = "auto";
        audio.src = url;
        audioRefs.current[type] = audio;
      }
    });
  }, [getSoundUrl, isSoundEnabled]);

  return {
    settings,
    getUserLanguage,
    playWelcomeSound,
    playLoginSound,
    playLogoutSound,
    preloadSounds,
    isSoundEnabled,
  };
};

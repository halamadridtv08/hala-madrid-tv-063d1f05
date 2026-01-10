import { toast } from "sonner";
import { Crown, LogIn, LogOut, UserPlus, ShieldCheck } from "lucide-react";

const TOAST_COOLDOWN_KEY = 'lastLoginToastTime';
const TOAST_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

const canShowLoginToast = (): boolean => {
  const lastShown = localStorage.getItem(TOAST_COOLDOWN_KEY);
  if (!lastShown) return true;
  
  const timeSinceLastToast = Date.now() - parseInt(lastShown, 10);
  return timeSinceLastToast >= TOAST_COOLDOWN_MS;
};

const markLoginToastShown = () => {
  localStorage.setItem(TOAST_COOLDOWN_KEY, Date.now().toString());
};

// Sound playback utilities
const getSoundSettings = async () => {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase
      .from("sound_settings")
      .select("*")
      .single();
    return data;
  } catch (error) {
    console.error("Error fetching sound settings:", error);
    return null;
  }
};

const getUserLanguageForSound = (): "fr" | "en" => {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("fr")) return "fr";
  return "en";
};

const playAuthSound = async (type: "login" | "logout") => {
  try {
    const settings = await getSoundSettings();
    if (!settings?.is_enabled) return;

    const isEnabled = type === "login" 
      ? settings.login_sound_enabled 
      : settings.logout_sound_enabled;
    
    if (!isEnabled) return;

    const lang = settings.auto_language_detection ? getUserLanguageForSound() : "fr";
    
    const soundUrl = type === "login"
      ? (lang === "fr" ? settings.login_sound_url_fr : settings.login_sound_url_en)
      : (lang === "fr" ? settings.logout_sound_url_fr : settings.logout_sound_url_en);

    if (!soundUrl) return;

    const audio = new Audio(soundUrl);
    audio.volume = settings.volume ?? 0.5;
    await audio.play();
  } catch (error) {
    console.error(`Error playing ${type} sound:`, error);
  }
};

export const showLoginSuccessToast = (displayName?: string) => {
  // Check cooldown to avoid showing toast too frequently (e.g., when switching tabs)
  if (!canShowLoginToast()) {
    return;
  }
  
  markLoginToastShown();

  // Play login sound
  playAuthSound("login");
  
  toast.custom(
    (t) => (
      <div className="w-full max-w-md bg-gradient-to-r from-green-500/10 via-background to-green-500/5 border border-green-500/20 rounded-xl p-4 shadow-2xl shadow-green-500/10 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-green-500/20 rounded-full">
            <LogIn className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-primary" />
              <p className="font-semibold text-foreground">¡Bienvenido!</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Connexion réussie. Hala Madrid y nada más!
            </p>
            {displayName && (
              <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                {displayName}
              </p>
            )}
          </div>
        </div>
      </div>
    ),
    {
      duration: 4000,
      position: "top-center",
    }
  );
};

export const showLogoutSuccessToast = () => {
  // Play logout sound
  playAuthSound("logout");

  toast.custom(
    (t) => (
      <div className="w-full max-w-md bg-gradient-to-r from-blue-500/10 via-background to-blue-500/5 border border-blue-500/20 rounded-xl p-4 shadow-2xl shadow-blue-500/10 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-blue-500/20 rounded-full">
            <LogOut className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <p className="font-semibold text-foreground">Déconnexion réussie</p>
            </div>
            <p className="text-sm text-muted-foreground">
              À très bientôt sur HALA MADRID TV! 👋
            </p>
          </div>
        </div>
      </div>
    ),
    {
      duration: 3000,
      position: "top-center",
    }
  );
};

export const showSignUpSuccessToast = (email?: string) => {
  toast.custom(
    (t) => (
      <div className="w-full max-w-md bg-gradient-to-r from-primary/10 via-background to-primary/5 border border-primary/20 rounded-xl p-4 shadow-2xl shadow-primary/10 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-primary/20 rounded-full">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-primary" />
              <p className="font-semibold text-foreground">Bienvenue dans la famille!</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Votre compte a été créé avec succès. ¡Hala Madrid!
            </p>
            {email && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                Vérifiez votre email: {email}
              </p>
            )}
          </div>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: "top-center",
    }
  );
};

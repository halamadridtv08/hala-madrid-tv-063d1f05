import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Eye, EyeOff, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TwoFactorVerification } from "@/components/auth/TwoFactorVerification";
import { useAuthHeroImage } from "@/hooks/useAuthHeroImage";
import { loginSchema, signUpSchema, isDisposableEmail } from "@/lib/validations/auth";
import { generateDeviceFingerprint } from "@/lib/auditLog";
import authHeroImage from "@/assets/auth-hero.jpg";
import logoImage from "/lovable-uploads/b475ad56-9770-4b40-a504-a1e193850dc8.png";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const { imageUrl: heroImageFromDb } = useAuthHeroImage();

  const heroImage = heroImageFromDb || authHeroImage;

  // Close modal when user logs in
  useEffect(() => {
    if (user && open) {
      onOpenChange(false);
    }
  }, [user, open, onOpenChange]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setEmail("");
      setPassword("");
      setError(null);
      setShowTwoFactor(false);
    }
  }, [open]);

  const isPasswordPwned = async (pwd: string): Promise<boolean> => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(pwd);
      const hashBuffer = await crypto.subtle.digest("SHA-1", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();

      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);

      const response = await fetch(
        `https://api.pwnedpasswords.com/range/${prefix}`
      );
      const text = await response.text();

      return text.split("\n").some((line) => line.startsWith(suffix));
    } catch (error) {
      console.error("Erreur vérification mot de passe:", error);
      return false;
    }
  };

  const checkAdminRequires2FA = async (userId: string): Promise<boolean> => {
    try {
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError) {
        console.error("Error checking admin role:", roleError);
        return false;
      }

      if (!roleData) return false;

      const { data: totpData, error: totpError } = await supabase
        .from("secure_totp_secrets")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (totpError) {
        console.error("Error checking 2FA status:", totpError);
        return false;
      }

      return !!totpData;
    } catch (error) {
      console.error("Error in 2FA check:", error);
      return false;
    }
  };

  const logLoginAttempt = async (email: string, success: boolean) => {
    try {
      const ip = await getClientIP();
      const fingerprint = generateDeviceFingerprint();
      await supabase.rpc("log_login_attempt", {
        p_email: email,
        p_success: success,
        p_ip_address: ip,
        p_user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error("Error logging login attempt:", error);
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch {
      return "unknown";
    }
  };

  const checkIfBlocked = async (): Promise<boolean> => {
    try {
      const ip = await getClientIP();
      const { data, error } = await supabase.rpc("check_login_blocked", {
        p_email: email,
        p_ip_address: ip,
      });

      if (error) {
        console.error("Error checking block status:", error);
        return false;
      }

      if (data && data.length > 0) {
        const blockInfo = data[0];
        setFailedAttempts(blockInfo.failed_attempts || 0);

        if (blockInfo.is_blocked) {
          setIsBlocked(true);
          setBlockedUntil(new Date(blockInfo.blocked_until));
          const remainingMinutes = Math.ceil(
            (new Date(blockInfo.blocked_until).getTime() - Date.now()) / 60000
          );
          setError(
            `🔒 Compte temporairement bloqué. Trop de tentatives échouées (${blockInfo.failed_attempts}/5). Réessayez dans ${remainingMinutes} minutes.`
          );
          return true;
        }
      }

      setIsBlocked(false);
      setBlockedUntil(null);
      return false;
    } catch (error) {
      console.error("Error in block check:", error);
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const blocked = await checkIfBlocked();
    if (blocked) {
      setLoading(false);
      return;
    }

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (error) {
        await logLoginAttempt(email, false);
        await checkIfBlocked();
        throw error;
      }

      if (data.user) {
        const requires2FA = await checkAdminRequires2FA(data.user.id);

        if (requires2FA) {
          await supabase.auth.signOut();
          setPendingEmail(email);
          setShowTwoFactor(true);
          await logLoginAttempt(email, true);
          return;
        }

        await logLoginAttempt(email, true);
        setIsBlocked(false);
        setBlockedUntil(null);
        setFailedAttempts(0);

        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Hala Madrid TV",
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      const attemptsRemaining = 5 - failedAttempts - 1;
      if (attemptsRemaining > 0 && attemptsRemaining <= 3) {
        setError(
          `${error.message || "Erreur lors de la connexion"} (${attemptsRemaining} tentative${attemptsRemaining > 1 ? "s" : ""} restante${attemptsRemaining > 1 ? "s" : ""})`
        );
      } else {
        setError(error.message || "Erreur lors de la connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validation = signUpSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const isDisposable = await isDisposableEmail(email);
      if (isDisposable) {
        setError(
          "⛔ Les adresses email temporaires ne sont pas autorisées. Veuillez utiliser une adresse email permanente."
        );
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Error checking disposable email:", err);
    }

    try {
      setCheckingPassword(true);
      const isPwned = await isPasswordPwned(password);
      setCheckingPassword(false);

      if (isPwned) {
        setError(
          "⚠️ Ce mot de passe a été trouvé dans des fuites de données. Veuillez en choisir un autre plus sécurisé."
        );
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre email pour confirmer votre compte",
      });
    } catch (error: any) {
      setError(error.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
      setCheckingPassword(false);
    }
  };

  const handleTwoFactorSuccess = () => {
    toast({
      title: "Authentification réussie",
      description: "Bienvenue sur Hala Madrid TV",
    });
    onOpenChange(false);
  };

  const handleTwoFactorCancel = () => {
    setShowTwoFactor(false);
    setPendingEmail("");
  };

  const signInWithSocial = async (provider: "google" | "twitter") => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message || `Erreur de connexion avec ${provider}`);
      setLoading(false);
    }
  };

  if (showTwoFactor) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogTitle className="sr-only">Vérification 2FA</DialogTitle>
          <div className="p-6">
            <TwoFactorVerification
              email={pendingEmail}
              onVerificationSuccess={handleTwoFactorSuccess}
              onCancel={handleTwoFactorCancel}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">Connexion</DialogTitle>
        <div className="grid md:grid-cols-2">
          {/* Left side - Hero Image */}
          <div className="relative hidden md:block h-full min-h-[500px]">
            <img
              src={heroImage}
              alt="Real Madrid Player"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001F54]/90 via-[#001F54]/50 to-transparent flex items-end p-8">
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-2">HALA MADRID</h2>
                <p className="text-lg opacity-90">
                  Vivez la passion du Real Madrid
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="p-6 md:p-8 relative bg-background">
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6 text-center">
              <img
                src={logoImage}
                alt="Hala Madrid TV"
                className="w-16 h-16 mx-auto mb-3"
              />
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {isLogin ? "Bienvenue" : "Rejoignez-nous"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin
                  ? "Accédez à votre compte Hala Madrid TV"
                  : "Rejoignez la communauté Hala Madrid TV"}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <form
              onSubmit={isLogin ? handleLogin : handleSignUp}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="modal-email"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="modal-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-password"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    id="modal-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[#001F54] hover:bg-[#002D72] text-white font-semibold"
                disabled={loading || checkingPassword}
              >
                {checkingPassword
                  ? "Vérification..."
                  : loading
                    ? "Chargement..."
                    : isLogin
                      ? "Se connecter"
                      : "S'inscrire"}
              </Button>
            </form>

            <div className="mt-5">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-background text-muted-foreground">
                    OU CONTINUER AVEC
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signInWithSocial("google")}
                  disabled={loading}
                  className="h-10"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Gmail
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signInWithSocial("twitter")}
                  disabled={loading}
                  className="h-10"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X
                </Button>
              </div>
            </div>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-sm text-primary hover:underline font-medium"
              >
                {isLogin
                  ? "Pas encore de compte ? S'inscrire"
                  : "Déjà un compte ? Se connecter"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

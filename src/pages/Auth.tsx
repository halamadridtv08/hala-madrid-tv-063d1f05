import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
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

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const { imageUrl: heroImageFromDb, isLoading: isLoadingHeroImage } = useAuthHeroImage();

  // Vérifier si un mot de passe est compromis via Have I Been Pwned API
  const isPasswordPwned = async (pwd: string): Promise<boolean> => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(pwd);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);
      
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();
      
      return text.split('\n').some(line => line.startsWith(suffix));
    } catch (error) {
      console.error('Erreur vérification mot de passe:', error);
      return false;
    }
  };
  
  // Use Supabase image if available, otherwise fallback to local image
  const heroImage = heroImageFromDb || authHeroImage;

  useEffect(() => {
    // Wait for auth to finish loading before showing page
    if (authLoading) return;
    
    if (user) {
      navigate("/", { replace: true });
      return;
    }

    const handleHashFragment = async () => {
      const hashFragment = window.location.hash;
      if (hashFragment && hashFragment.includes('access_token')) {
        navigate("/", { replace: true });
        return;
      }
    };

    handleHashFragment();
    setPageReady(true);
  }, [user, authLoading, navigate]);

  const checkAdminRequires2FA = async (userId: string): Promise<boolean> => {
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        console.error('Error checking admin role:', roleError);
        return false;
      }

      if (!roleData) return false;

      const { data: totpData, error: totpError } = await supabase
        .from('secure_totp_secrets')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (totpError) {
        console.error('Error checking 2FA status:', totpError);
        return false;
      }

      return !!totpData;
    } catch (error) {
      console.error('Error in 2FA check:', error);
      return false;
    }
  };

  const logLoginAttempt = async (email: string, success: boolean) => {
    try {
      const ip = await getClientIP();
      const fingerprint = generateDeviceFingerprint();
      await supabase.rpc('log_login_attempt', {
        p_email: email,
        p_success: success,
        p_ip_address: ip,
        p_user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const checkIfBlocked = async (): Promise<boolean> => {
    try {
      const ip = await getClientIP();
      const { data, error } = await supabase.rpc('check_login_blocked', {
        p_email: email,
        p_ip_address: ip
      });

      if (error) {
        console.error('Error checking block status:', error);
        return false;
      }

      if (data && data.length > 0) {
        const blockInfo = data[0];
        setFailedAttempts(blockInfo.failed_attempts || 0);
        
        if (blockInfo.is_blocked) {
          setIsBlocked(true);
          setBlockedUntil(new Date(blockInfo.blocked_until));
          const remainingMinutes = Math.ceil((new Date(blockInfo.blocked_until).getTime() - Date.now()) / 60000);
          setError(`🔒 Compte temporairement bloqué. Trop de tentatives échouées (${blockInfo.failed_attempts}/5). Réessayez dans ${remainingMinutes} minutes.`);
          return true;
        }
      }
      
      setIsBlocked(false);
      setBlockedUntil(null);
      return false;
    } catch (error) {
      console.error('Error in block check:', error);
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check if user is blocked before attempting login
    const blocked = await checkIfBlocked();
    if (blocked) {
      setLoading(false);
      return;
    }

    // Validate with Zod
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password
      });

      if (error) {
        await logLoginAttempt(email, false);
        // Check again if this attempt caused a block
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
        // Reset block state on successful login
        setIsBlocked(false);
        setBlockedUntil(null);
        setFailedAttempts(0);
        
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Hala Madrid TV",
        });
        navigate("/");
      }
    } catch (error: any) {
      const attemptsRemaining = 5 - failedAttempts - 1;
      if (attemptsRemaining > 0 && attemptsRemaining <= 3) {
        setError(`${error.message || "Erreur lors de la connexion"} (${attemptsRemaining} tentative${attemptsRemaining > 1 ? 's' : ''} restante${attemptsRemaining > 1 ? 's' : ''})`);
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

    // Validate with Zod (strict password requirements)
    const validation = signUpSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    // Vérifier si l'email est un domaine temporaire (async check contre Supabase)
    try {
      const isDisposable = await isDisposableEmail(email);
      if (isDisposable) {
        setError("⛔ Les adresses email temporaires ne sont pas autorisées. Veuillez utiliser une adresse email permanente.");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Error checking disposable email:', err);
    }

    try {
      // Vérifier si le mot de passe est compromis
      setCheckingPassword(true);
      const isPwned = await isPasswordPwned(password);
      setCheckingPassword(false);
      
      if (isPwned) {
        setError("⚠️ Ce mot de passe a été trouvé dans des fuites de données. Veuillez en choisir un autre plus sécurisé.");
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          emailRedirectTo: redirectUrl
        }
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
    navigate("/");
  };

  const handleTwoFactorCancel = () => {
    setShowTwoFactor(false);
    setPendingEmail("");
  };

  const signInWithSocial = async (provider: 'google' | 'twitter') => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message || `Erreur de connexion avec ${provider}`);
      setLoading(false);
    }
  };

  // Don't render anything while redirecting authenticated users
  if (authLoading || user) {
    return null;
  }

  if (showTwoFactor) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
          <div className="madrid-container max-w-md mx-auto">
            <TwoFactorVerification
              email={pendingEmail}
              onVerificationSuccess={handleTwoFactorSuccess}
              onCancel={handleTwoFactorCancel}
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-[#001F54] via-[#002D72] to-[#001F54]">
        <div className="w-full max-w-6xl">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Left side - Hero Image */}
              <div className="relative hidden md:block">
                <img 
                  src={heroImage} 
                  alt="Real Madrid Player" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001F54]/90 via-[#001F54]/50 to-transparent flex items-end p-12">
                  <div className="text-white">
                    <h2 className="text-4xl font-bold mb-4">HALA MADRID</h2>
                    <p className="text-xl opacity-90">Vivez la passion du Real Madrid</p>
                  </div>
                </div>
              </div>

              {/* Right side - Form */}
              <div className="p-8 md:p-12 relative">
                <button
                  onClick={() => navigate("/")}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="mb-8 text-center">
                  <img 
                    src={logoImage} 
                    alt="Hala Madrid TV" 
                    className="w-20 h-20 mx-auto mb-4"
                  />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {isLogin ? "Bienvenue" : "Rejoignez-nous"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isLogin ? "Accédez à votre compte Hala Madrid TV" : "Rejoignez la communauté Hala Madrid TV"}
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10 h-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[#001F54] hover:bg-[#002D72] text-white font-semibold text-lg"
                    disabled={loading || checkingPassword}
                  >
                    {checkingPassword ? "Vérification du mot de passe..." : loading ? "Chargement..." : (isLogin ? "Se connecter" : "S'inscrire")}
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">OU CONTINUER AVEC</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => signInWithSocial('google')}
                      disabled={loading}
                      className="h-12"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Gmail
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => signInWithSocial('twitter')}
                      disabled={loading}
                      className="h-12"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      X
                    </Button>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                    }}
                    className="text-[#001F54] dark:text-blue-400 hover:underline font-medium"
                  >
                    {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Auth;

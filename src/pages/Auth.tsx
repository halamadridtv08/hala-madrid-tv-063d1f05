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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
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
      return false; // En cas d'erreur, on autorise quand même
    }
  };
  
  // Use Supabase image if available, otherwise fallback to local image
  const heroImage = heroImageFromDb || authHeroImage;

  useEffect(() => {
    if (user) {
      navigate("/");
    }

    const handleHashFragment = async () => {
      const hashFragment = window.location.hash;
      if (hashFragment && hashFragment.includes('access_token')) {
        navigate("/");
      }
    };

    handleHashFragment();
  }, [user, navigate]);

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
        .from('user_totp_secrets')
        .select('is_verified')
        .eq('user_id', userId)
        .eq('is_verified', true)
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        await logLoginAttempt(email, false);
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
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Hala Madrid TV",
        });
        navigate("/");
      }
    } catch (error: any) {
      setError(error.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        email,
        password,
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


import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Twitter, Mail, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TwoFactorVerification } from "@/components/auth/TwoFactorVerification";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate("/");
    }

    // Check for hash fragment in URL which indicates OAuth return
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
      // Check if user is admin using the new user_roles table
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

      if (!roleData) return false; // Not an admin

      // If user is admin, check if 2FA is set up (all admins require 2FA)
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
      await supabase.from('login_attempts').insert({
        email,
        success,
        ip_address: ip,
        user_agent: navigator.userAgent
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
        // Check if admin requires 2FA
        const requires2FA = await checkAdminRequires2FA(data.user.id);
        
        if (requires2FA) {
          setPendingEmail(email);
          setShowTwoFactor(true);
          setLoading(false);
          return;
        }

        await logLoginAttempt(email, true);
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté."
        });
        
        navigate("/admin");
      }
    } catch (error: any) {
      setError(error.message || "Erreur de connexion");
    } finally {
      if (!showTwoFactor) {
        setLoading(false);
      }
    }
  };

  const handleTwoFactorSuccess = async () => {
    await logLoginAttempt(pendingEmail, true);
    setShowTwoFactor(false);
    setPendingEmail("");
    
    toast({
      title: "Connexion réussie",
      description: "Authentification à double facteur validée."
    });
    
    navigate("/admin");
  };

  const handleTwoFactorCancel = async () => {
    await supabase.auth.signOut();
    setShowTwoFactor(false);
    setPendingEmail("");
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) throw error;
      
      toast({
        title: "Inscription réussie",
        description: "Veuillez vérifier votre email pour confirmer votre compte."
      });
    } catch (error: any) {
      setError(error.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
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
      <main className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
        <div className="madrid-container max-w-md mx-auto">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Connexion sécurisée
                  </CardTitle>
                  <CardDescription>
                    Connectez-vous à votre compte pour gérer vos articles.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleLogin}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="email">Email</label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="password">Mot de passe</label>
                        <Input 
                          id="password" 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Connexion en cours..." : "Se connecter"}
                      </Button>
                      
                      <div className="relative mt-2">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">Ou continuer avec</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => signInWithSocial('google')}
                          disabled={loading}
                          className="flex items-center justify-center"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Gmail
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => signInWithSocial('twitter')}
                          disabled={loading}
                          className="flex items-center justify-center"
                        >
                          <Twitter className="mr-2 h-4 w-4" />
                          X
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Créer un compte</CardTitle>
                  <CardDescription>
                    Inscrivez-vous pour pouvoir publier des articles.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleSignUp}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="email">Email</label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="password">Mot de passe</label>
                        <Input 
                          id="password" 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Inscription en cours..." : "S'inscrire"}
                      </Button>
                      
                      <div className="relative mt-2">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">Ou s'inscrire avec</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => signInWithSocial('google')}
                          disabled={loading}
                          className="flex items-center justify-center"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Gmail
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => signInWithSocial('twitter')}
                          disabled={loading}
                          className="flex items-center justify-center"
                        >
                          <Twitter className="mr-2 h-4 w-4" />
                          X
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Auth;

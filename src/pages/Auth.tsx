
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Facebook, Twitter, Mail } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté."
      });
      
      navigate("/admin");
    } catch (error: any) {
      setError(error.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
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
          emailRedirectTo: window.location.origin
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

  const signInWithSocial = async (provider: 'google' | 'facebook' | 'twitter') => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message || `Erreur de connexion avec ${provider}`);
      setLoading(false);
    }
  };

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
                  <CardTitle>Connexion</CardTitle>
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
                      
                      <div className="grid grid-cols-3 gap-2">
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
                          onClick={() => signInWithSocial('facebook')}
                          disabled={loading}
                          className="flex items-center justify-center"
                        >
                          <Facebook className="mr-2 h-4 w-4" />
                          Facebook
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
                      
                      <div className="grid grid-cols-3 gap-2">
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
                          onClick={() => signInWithSocial('facebook')}
                          disabled={loading}
                          className="flex items-center justify-center"
                        >
                          <Facebook className="mr-2 h-4 w-4" />
                          Facebook
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

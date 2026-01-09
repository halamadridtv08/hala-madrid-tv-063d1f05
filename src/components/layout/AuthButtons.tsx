import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AuthButtons() {
  const { user, isAdmin, isModerator, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account'
          }
        },
      });

      if (error) {
        console.error("Google sign-in error:", error);
        toast.error("Erreur de connexion Google");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {isModerator && (
          <Button asChild variant="outline" size="sm" className="hidden md:flex">
            <Link to="/admin">Administration</Link>
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={async () => {
            await signOut();
          }}
          className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Déconnexion
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isLoading ? "Connexion..." : "Connexion"}
        </Button>
      </div>
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}

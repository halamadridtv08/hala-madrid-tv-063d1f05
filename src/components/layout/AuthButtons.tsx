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
          onClick={() => setShowAuthModal(true)}
        >
          Connexion
        </Button>
      </div>
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}

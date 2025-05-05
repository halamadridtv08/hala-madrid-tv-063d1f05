
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AuthButtons() {
  const { user, isAdmin, signOut } = useAuth();

  const signInWithSocial = async (provider: 'google' | 'twitter') => {
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {isAdmin && (
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
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link to="/auth">Connexion</Link>
      </Button>
      <div className="hidden md:flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900" 
          onClick={() => signInWithSocial('google')}
          title="Se connecter avec Gmail"
        >
          <Mail size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="p-1 h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900" 
          onClick={() => signInWithSocial('twitter')}
          title="Se connecter avec X (Twitter)"
        >
          <Twitter size={16} />
        </Button>
      </div>
    </div>
  );
}

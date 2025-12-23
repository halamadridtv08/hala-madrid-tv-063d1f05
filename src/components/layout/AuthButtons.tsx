import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

export function AuthButtons() {
  const { user, isAdmin, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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

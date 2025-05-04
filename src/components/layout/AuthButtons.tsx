
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function AuthButtons() {
  const { user, isAdmin, signOut } = useAuth();

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
        >
          Déconnexion
        </Button>
      </div>
    );
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link to="/auth">Connexion</Link>
    </Button>
  );
}

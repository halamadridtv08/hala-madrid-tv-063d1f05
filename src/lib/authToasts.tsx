import { toast } from "sonner";
import { Crown, LogIn, LogOut, UserPlus, ShieldCheck } from "lucide-react";

export const showLoginSuccessToast = (email?: string) => {
  toast.custom(
    (t) => (
      <div className="w-full max-w-md bg-gradient-to-r from-green-500/10 via-background to-green-500/5 border border-green-500/20 rounded-xl p-4 shadow-2xl shadow-green-500/10 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-green-500/20 rounded-full">
            <LogIn className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-primary" />
              <p className="font-semibold text-foreground">¡Bienvenido!</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Connexion réussie. Hala Madrid y nada más!
            </p>
            {email && (
              <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                {email}
              </p>
            )}
          </div>
        </div>
      </div>
    ),
    {
      duration: 4000,
      position: "top-center",
    }
  );
};

export const showLogoutSuccessToast = () => {
  toast.custom(
    (t) => (
      <div className="w-full max-w-md bg-gradient-to-r from-blue-500/10 via-background to-blue-500/5 border border-blue-500/20 rounded-xl p-4 shadow-2xl shadow-blue-500/10 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-blue-500/20 rounded-full">
            <LogOut className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <p className="font-semibold text-foreground">Déconnexion réussie</p>
            </div>
            <p className="text-sm text-muted-foreground">
              À bientôt sur HALA MADRID TV! 👋
            </p>
          </div>
        </div>
      </div>
    ),
    {
      duration: 3000,
      position: "top-center",
    }
  );
};

export const showSignUpSuccessToast = (email?: string) => {
  toast.custom(
    (t) => (
      <div className="w-full max-w-md bg-gradient-to-r from-primary/10 via-background to-primary/5 border border-primary/20 rounded-xl p-4 shadow-2xl shadow-primary/10 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-primary/20 rounded-full">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-primary" />
              <p className="font-semibold text-foreground">Bienvenue dans la famille!</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Votre compte a été créé avec succès. ¡Hala Madrid!
            </p>
            {email && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                Vérifiez votre email: {email}
              </p>
            )}
          </div>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: "top-center",
    }
  );
};

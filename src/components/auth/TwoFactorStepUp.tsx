import { TwoFactorVerification } from "@/components/auth/TwoFactorVerification";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface TwoFactorStepUpProps {
  onSuccess: () => void;
}

export const TwoFactorStepUp = ({ onSuccess }: TwoFactorStepUpProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          Votre session administrateur doit être confirmée par une vérification à double facteur.
        </p>
        <TwoFactorVerification
          email={user?.email ?? ""}
          onVerificationSuccess={onSuccess}
          onCancel={() => navigate("/", { replace: true })}
        />
      </div>
    </div>
  );
};

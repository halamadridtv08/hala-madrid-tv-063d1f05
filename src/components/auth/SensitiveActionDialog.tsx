import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SensitiveActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once the identity has been re-verified. */
  onConfirmed: () => void | Promise<void>;
  title?: string;
  description?: string;
}

const FALLBACK_PHRASE = "CONFIRMER";

/**
 * Re-verifies the admin identity before a sensitive action.
 * Important: this NEVER locks the admin out of the panel. If 2FA is not
 * enrolled or the verification service is unavailable, we fall back to an
 * explicit typed confirmation — only the sensitive action is gated.
 */
export const SensitiveActionDialog = ({
  open,
  onOpenChange,
  onConfirmed,
  title = "Confirmation de sécurité",
  description = "Cette action est sensible. Confirme ton identité pour continuer.",
}: SensitiveActionDialogProps) => {
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCode("");
      setPhrase("");
      setUseBackup(false);
      setFallback(false);
      setError(null);
    }
  }, [open]);

  const finish = async () => {
    onOpenChange(false);
    await onConfirmed();
  };

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setFallback(true);
        setError("Session introuvable — confirmation manuelle requise.");
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke("verify-2fa", {
        body: { code, type: useBackup ? "backup" : "totp" },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (fnError) {
        // Service indisponible : on ne bloque pas l'accès, on demande une confirmation explicite.
        setFallback(true);
        setError("Vérification 2FA indisponible — confirmation manuelle requise.");
        return;
      }

      if ((data as any)?.error === "2FA non configurée") {
        setFallback(true);
        setError("Aucune 2FA configurée sur ce compte — confirmation manuelle requise.");
        return;
      }

      if ((data as any)?.verified === true || (data as any)?.success === true) {
        await finish();
        return;
      }

      setError("Code invalide. Réessaie ou utilise un code de secours.");
    } catch {
      setFallback(true);
      setError("Vérification impossible — confirmation manuelle requise.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fallback ? (
          <div className="space-y-2">
            <Label htmlFor="sensitive-phrase">
              Saisis <span className="font-mono font-bold">{FALLBACK_PHRASE}</span> pour valider
            </Label>
            <Input
              id="sensitive-phrase"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder={FALLBACK_PHRASE}
              autoFocus
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="sensitive-code">
              {useBackup ? "Code de secours" : "Code à 6 chiffres (application d'authentification)"}
            </Label>
            <Input
              id="sensitive-code"
              value={code}
              inputMode={useBackup ? "text" : "numeric"}
              maxLength={useBackup ? 16 : 6}
              onChange={(e) =>
                setCode(useBackup ? e.target.value.trim() : e.target.value.replace(/\D/g, ""))
              }
              placeholder={useBackup ? "XXXXXX" : "000000"}
              autoFocus
            />
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={() => {
                setUseBackup((v) => !v);
                setCode("");
                setError(null);
              }}
            >
              {useBackup ? "Utiliser un code d'application" : "Utiliser un code de secours"}
            </button>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          {fallback ? (
            <Button className="w-full sm:w-auto" disabled={phrase.trim().toUpperCase() !== FALLBACK_PHRASE} onClick={finish}>
              Confirmer
            </Button>
          ) : (
            <Button
              className="w-full sm:w-auto"
              disabled={loading || (useBackup ? code.length < 6 : code.length !== 6)}
              onClick={handleVerify}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Vérifier
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SensitiveActionDialog;

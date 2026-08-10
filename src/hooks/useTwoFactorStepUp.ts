import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type StepUpState = "loading" | "ok" | "required";

/**
 * Vérifie si l'utilisateur a une 2FA enrôlée sans session 2FA vérifiée.
 * Dans ce cas, has_role(uid,'admin') renvoie false côté base et toutes les
 * requêtes admin échouent : on doit redemander le code TOTP.
 */
export const useTwoFactorStepUp = (enabled: boolean) => {
  const { user } = useAuth();
  const [state, setState] = useState<StepUpState>("loading");

  const check = useCallback(async () => {
    if (!enabled || !user) {
      setState("ok");
      return;
    }
    try {
      const [{ data: enrolled }, { data: verified }] = await Promise.all([
        supabase.rpc("has_2fa_enrolled", { _user_id: user.id }),
        supabase.rpc("has_verified_2fa", { _user_id: user.id }),
      ]);
      setState(enrolled && !verified ? "required" : "ok");
    } catch (error) {
      console.error("2FA step-up check failed", error);
      setState("ok");
    }
  }, [enabled, user]);

  useEffect(() => {
    setState("loading");
    check();
  }, [check]);

  return { state, recheck: check };
};

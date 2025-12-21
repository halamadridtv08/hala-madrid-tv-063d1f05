import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Session timeout provider component.
 * Automatically logs out users after 30 minutes of inactivity.
 * Shows a warning 5 minutes before timeout.
 */
export const SessionTimeoutProvider = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 5,
    onTimeout: () => {
      navigate("/auth", { replace: true });
    },
  });

  return null;
};

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
}

export const useSessionTimeout = ({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout,
}: UseSessionTimeoutOptions = {}) => {
  const { user, signOut } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const handleTimeout = useCallback(async () => {
    toast.warning("Session expirée", {
      description: "Vous avez été déconnecté pour inactivité.",
    });
    await signOut();
    onTimeout?.();
  }, [signOut, onTimeout]);

  const showWarning = useCallback(() => {
    toast.info("Session bientôt expirée", {
      description: `Votre session expirera dans ${warningMinutes} minutes d'inactivité.`,
      duration: 10000,
    });
  }, [warningMinutes]);

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    if (!user) return;

    // Set warning timer
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    warningRef.current = setTimeout(showWarning, warningTime);

    // Set timeout timer
    const timeoutTime = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(handleTimeout, timeoutTime);
  }, [user, timeoutMinutes, warningMinutes, handleTimeout, showWarning]);

  useEffect(() => {
    if (!user) {
      // Clear timers if user logs out
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      return;
    }

    // Activity events to track
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    // Throttled reset function to avoid excessive timer resets
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledReset = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
        resetTimers();
      }, 1000); // Throttle to once per second
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, throttledReset, { passive: true });
    });

    // Initial timer setup
    resetTimers();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledReset);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [user, resetTimers]);

  return {
    resetTimers,
    lastActivity: lastActivityRef.current,
  };
};

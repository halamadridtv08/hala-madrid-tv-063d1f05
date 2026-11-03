import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

export type TzMode = "local" | "madrid";
const KEY = "match_tz_mode";
const EVT = "match-tz-change";
export const MADRID_TZ = "Europe/Madrid";

const read = (): TzMode => {
  try { return localStorage.getItem(KEY) === "madrid" ? "madrid" : "local"; } catch { return "local"; }
};

export function useMatchTimezone() {
  const [mode, setModeState] = useState<TzMode>(read);
  useEffect(() => {
    const h = () => setModeState(read());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => { window.removeEventListener(EVT, h); window.removeEventListener("storage", h); };
  }, []);
  const setMode = (m: TzMode) => {
    try { localStorage.setItem(KEY, m); } catch { /* ignore */ }
    window.dispatchEvent(new Event(EVT));
  };
  const timeZone = mode === "madrid" ? MADRID_TZ : undefined;
  const formatTime = (d: string | Date) =>
    new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone });
  const formatDateTime = (d: string | Date, opts: Intl.DateTimeFormatOptions = {}) =>
    new Date(d).toLocaleString("fr-FR", { ...opts, timeZone });
  const label = mode === "madrid" ? "Heure de Madrid" : "Votre heure locale";
  return { mode, setMode, timeZone, formatTime, formatDateTime, label };
}

export function TimezoneToggle({ className = "" }: { className?: string }) {
  const { mode, setMode } = useMatchTimezone();
  return (
    <div className={`inline-flex items-center gap-1 rounded-full border border-border bg-muted p-0.5 text-xs ${className}`} role="group" aria-label="Fuseau horaire des matchs">
      <Globe className="h-3.5 w-3.5 mx-1 text-muted-foreground" aria-hidden />
      {(["local", "madrid"] as TzMode[]).map((m) => (
        <button
          key={m}
          type="button"
          aria-pressed={mode === m}
          onClick={() => setMode(m)}
          className={`rounded-full px-2.5 py-1 font-medium transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {m === "local" ? "Mon heure" : "Heure de Madrid"}
        </button>
      ))}
    </div>
  );
}

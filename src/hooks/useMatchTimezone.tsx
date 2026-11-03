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

/** Parts of a date as seen in a given timezone (undefined = browser local). */
export function zonedParts(d: string | Date, timeZone?: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).formatToParts(new Date(d));
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: g("year"), m: g("month"), d: g("day"), h: g("hour"), min: g("minute") };
}

/** Calendar-day Date (local midnight) matching the day in the chosen timezone. */
export function zonedDay(d: string | Date, timeZone?: string) {
  const p = zonedParts(d, timeZone);
  return new Date(p.y, p.m - 1, p.d);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO -> "YYYY-MM-DDTHH:mm" in the given timezone, for datetime-local inputs. */
export function toZonedInput(iso: string, timeZone?: string) {
  const p = zonedParts(iso, timeZone);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}T${pad(p.h)}:${pad(p.min)}`;
}

/** "YYYY-MM-DDTHH:mm" typed in the given timezone -> UTC ISO string. */
export function fromZonedInput(value: string, timeZone?: string) {
  if (!timeZone) return new Date(value).toISOString();
  const [date, time] = value.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const target = Date.UTC(y, m - 1, d, h, mi);
  let guess = target;
  for (let i = 0; i < 3; i++) {
    const p = zonedParts(new Date(guess), timeZone);
    guess += target - Date.UTC(p.y, p.m - 1, p.d, p.h, p.min);
  }
  return new Date(guess).toISOString();
}

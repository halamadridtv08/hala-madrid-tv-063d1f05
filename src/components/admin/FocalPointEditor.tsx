import { useRef, useState, KeyboardEvent, PointerEvent } from "react";
import { Monitor, Smartphone, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FocalSettings, DEFAULT_FOCAL, clamp, pointerToPercent } from "@/types/Focal";
import { cn } from "@/lib/utils";

type Device = "mobile" | "desktop";

// Positions rapides (x / y en %)
const PRESETS: { label: string; x: number; y: number }[] = [
  { label: "Centre", x: 50, y: 50 },
  { label: "Haut", x: 50, y: 0 },
  { label: "Bas", x: 50, y: 100 },
  { label: "Gauche", x: 0, y: 50 },
  { label: "Droite", x: 100, y: 50 },
  { label: "Haut-G", x: 0, y: 0 },
  { label: "Haut-D", x: 100, y: 0 },
  { label: "Bas-G", x: 0, y: 100 },
  { label: "Bas-D", x: 100, y: 100 },
];

const keys = (d: Device) =>
  d === "mobile"
    ? { x: "focal_mobile_x", y: "focal_mobile_y", z: "zoom_mobile" } as const
    : { x: "focal_desktop_x", y: "focal_desktop_y", z: "zoom_desktop" } as const;

interface Props {
  imageUrl: string;
  value: FocalSettings;
  onChange: (v: FocalSettings) => void;
  onSave?: (v: FocalSettings) => void;
  saving?: boolean;
}

/** Module « Cadrage de l'image » : point focal + zoom par appareil, sans modifier le fichier. */
export const FocalPointEditor = ({ imageUrl, value, onChange, onSave, saving }: Props) => {
  const [showTitleZone, setShowTitleZone] = useState(false);
  const [lastDevice, setLastDevice] = useState<Device>("mobile");

  const set = (d: Device, x: number, y: number, z?: number) => {
    const k = keys(d);
    onChange({ ...value, [k.x]: clamp(x), [k.y]: clamp(y), ...(z != null ? { [k.z]: clamp(z, 1, 3) } : {}) });
    setLastDevice(d);
  };

  const copyToOther = () => {
    const from = keys(lastDevice);
    const to = keys(lastDevice === "mobile" ? "desktop" : "mobile");
    onChange({ ...value, [to.x]: value[from.x], [to.y]: value[from.y], [to.z]: value[from.z] });
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-neutral-100 sm:p-6">
      <h3 className="mb-4 text-lg font-semibold">Cadrage de l'image</h3>
      <div className="grid gap-6 md:grid-cols-2">
        {(["mobile", "desktop"] as Device[]).map((d) => (
          <Preview
            key={d}
            device={d}
            imageUrl={imageUrl}
            x={value[keys(d).x]}
            y={value[keys(d).y]}
            zoom={value[keys(d).z]}
            showTitleZone={showTitleZone}
            onMove={(x, y) => set(d, x, y)}
            onZoom={(z) => set(d, value[keys(d).x], value[keys(d).y], z)}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={copyToOther} className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm hover:border-orange-500">
          <Copy className="h-4 w-4" /> Copier vers l'autre appareil ({lastDevice === "mobile" ? "Mobile → Desktop" : "Desktop → Mobile"})
        </button>
        <button type="button" onClick={() => onChange({ ...DEFAULT_FOCAL })} className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm hover:border-orange-500">
          <RotateCcw className="h-4 w-4" /> Réinitialiser
        </button>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="accent-orange-500" checked={showTitleZone} onChange={(e) => setShowTitleZone(e.target.checked)} />
          Afficher la zone de titre
        </label>
        {onSave && (
          <Button type="button" onClick={() => onSave(value)} disabled={saving} className="ml-auto rounded-lg bg-orange-500 text-black hover:bg-orange-400">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        )}
      </div>
    </div>
  );
};

interface PreviewProps {
  device: Device;
  imageUrl: string;
  x: number;
  y: number;
  zoom: number;
  showTitleZone: boolean;
  onMove: (x: number, y: number) => void;
  onZoom: (z: number) => void;
}

const Preview = ({ device, imageUrl, x, y, zoom, showTitleZone, onMove, onZoom }: PreviewProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const frame = useRef<number>();

  // Mise à jour limitée à une par image affichée pour rester fluide pendant le glisser
  const moveFromPointer = (e: PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const { clientX, clientY } = e;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const p = pointerToPercent(clientX, clientY, rect);
      onMove(p.x, p.y);
    });
  };

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 5 : 1;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
    };
    const m = map[e.key];
    if (!m) return;
    e.preventDefault();
    onMove(x + m[0], y + m[1]);
  };

  const Icon = device === "mobile" ? Smartphone : Monitor;
  const label = device === "mobile" ? "Mobile" : "Desktop";

  return (
    <div className="space-y-3">
      <div className={cn("mx-auto w-full", device === "mobile" ? "max-w-[280px]" : "")}>
        <div
          ref={ref}
          role="slider"
          tabIndex={0}
          aria-label={`Point focal ${label}`}
          aria-valuetext={`${x}% horizontal, ${y}% vertical`}
          onKeyDown={onKey}
          onPointerDown={(e) => {
            dragging.current = true;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            moveFromPointer(e);
          }}
          onPointerMove={(e) => dragging.current && moveFromPointer(e)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          className={cn(
            "relative w-full cursor-crosshair touch-none select-none overflow-hidden rounded-xl border border-neutral-800 outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
            device === "mobile" ? "aspect-[4/5]" : "aspect-video",
          )}
        >
          <img
            src={imageUrl}
            alt=""
            draggable={false}
            className="pointer-events-none h-full w-full object-cover"
            style={{ objectPosition: `${x}% ${y}%`, transformOrigin: `${x}% ${y}%`, transform: `scale(${zoom})` }}
          />
          {showTitleZone && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 border-t border-dashed border-white/50 bg-black/50">
              <span className="absolute left-3 top-2 text-[10px] uppercase tracking-wide text-white/80">Zone de titre</span>
            </div>
          )}
          <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs">
            <Icon className="h-3 w-3" /> {label}
          </span>
          {/* Réticule */}
          <div className="pointer-events-none absolute inset-y-0 w-px bg-white/70" style={{ left: `${x}%` }} />
          <div className="pointer-events-none absolute inset-x-0 h-px bg-white/70" style={{ top: `${y}%` }} />
          <div
            className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-orange-500/80 shadow-lg"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-neutral-300">Point focal : {x}% {y}%</p>
      <label className="flex items-center gap-3 text-sm">
        <span>Zoom</span>
        <input
          type="range" min={1} max={3} step={0.05} value={zoom}
          onChange={(e) => onZoom(Number(e.target.value))}
          className="flex-1 accent-orange-500"
          aria-label={`Zoom ${label}`}
        />
        <span className="w-12 text-right tabular-nums">{zoom.toFixed(2)}x</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((p) => {
          const active = p.x === x && p.y === y;
          return (
            <button
              key={p.label}
              type="button"
              aria-label={`Position ${p.label} (${label})`}
              aria-pressed={active}
              onClick={() => onMove(p.x, p.y)}
              className={cn(
                "rounded-lg border px-2 py-1.5 text-xs transition-colors",
                active ? "border-orange-500 bg-orange-500 text-black" : "border-neutral-700 bg-black hover:border-orange-500",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

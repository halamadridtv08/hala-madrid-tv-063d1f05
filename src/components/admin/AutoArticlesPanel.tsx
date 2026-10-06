import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bot, Loader2, Send, Trash2, RefreshCw } from "lucide-react";

type Settings = {
  scraping_enabled: boolean;
  publish_mode: "draft" | "interval" | "fixed_times";
  interval_minutes: number;
  fixed_times: string[];
  source_urls: string[];
  max_articles_per_run: number;
  last_scrape_at: string | null;
  last_publish_at: string | null;
  paused_reason: string | null;
};
type Draft = { id: string; title: string; image_url: string | null; category: string; source_url: string | null; published_at: string };

const fmt = (d: string | null) => (d ? new Date(d).toLocaleString("fr-FR") : "jamais");

export const AutoArticlesPanel = ({ onChanged }: { onChanged?: () => void }) => {
  const [s, setS] = useState<Settings | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [sources, setSources] = useState("");
  const [times, setTimes] = useState("");

  const load = async () => {
    const { data } = await supabase.from("auto_article_settings" as any).select("*").eq("id", 1).single();
    if (data) {
      const d = data as unknown as Settings;
      setS(d);
      setSources(d.source_urls.join("\n"));
      setTimes(d.fixed_times.join(", "));
    }
    const { data: dr } = await (supabase as any)
      .from("articles")
      .select("id, title, image_url, category, source_url, published_at")
      .eq("auto_generated", true)
      .eq("is_published", false)
      .order("published_at", { ascending: true });
    setDrafts((dr as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async (patch: Partial<Settings>) => {
    const { error } = await supabase.from("auto_article_settings" as any).update({ ...patch, updated_at: new Date().toISOString() } as any).eq("id", 1);
    if (error) return toast.error("Enregistrement impossible");
    setS((p) => (p ? { ...p, ...patch } : p));
    toast.success("Réglage enregistré");
  };

  const call = async (action: string) => {
    setBusy(action);
    const { data, error } = await supabase.functions.invoke("auto-articles", { body: { action } });
    setBusy(null);
    if (error || !data?.success) return toast.error(data?.error || error?.message || "Échec");
    if (action === "scrape") {
      const r = data.scrape ?? {};
      if (r.skipped) toast.info("Une récupération est déjà en cours");
      else toast.success(`${r.created ?? 0} article(s) créé(s) en brouillon · ${r.skipped ?? 0} hors sujet · ${r.failed ?? 0} échec(s)`);
      if (r.errors?.length) toast.warning(r.errors.join(" · "));
    } else if (action === "publish_next") {
      data.published ? toast.success(`Publié : ${data.published.title}`) : toast.info(data.reason || "Rien à publier");
    }
    load(); onChanged?.();
  };

  const publishOne = async (id: string) => {
    const { error } = await supabase.from("articles").update({ is_published: true, published_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error("Publication impossible");
    toast.success("Article publié"); load(); onChanged?.();
  };
  const remove = async (id: string) => {
    if (!confirm("Supprimer ce brouillon ?")) return;
    await supabase.from("articles").delete().eq("id", id);
    load(); onChanged?.();
  };

  if (!s) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> Articles automatiques (IA)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {s.paused_reason && (
          <div className="rounded-md border border-destructive p-3 text-sm flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
            <span>En pause : {s.paused_reason}</span>
            <Button size="sm" variant="outline" onClick={() => save({ paused_reason: null })}>Reprendre</Button>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Récupération automatique (toutes les heures)</Label>
            <p className="text-xs text-muted-foreground">Dernière : {fmt(s.last_scrape_at)}</p>
          </div>
          <Switch checked={s.scraping_enabled} onCheckedChange={(v) => save({ scraping_enabled: v })} />
        </div>

        <div className="space-y-2">
          <Label>Publication</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {([
              ["draft", "Brouillon (je valide)"],
              ["interval", "Étalée (intervalle)"],
              ["fixed_times", "Heures fixes"],
            ] as const).map(([v, l]) => (
              <Button key={v} variant={s.publish_mode === v ? "default" : "outline"} onClick={() => save({ publish_mode: v })}>{l}</Button>
            ))}
          </div>
          {s.publish_mode === "interval" && (
            <div className="flex flex-wrap gap-2 items-center">
              {[90, 120, 150, 180].map((m) => (
                <Button key={m} size="sm" variant={s.interval_minutes === m ? "default" : "outline"} onClick={() => save({ interval_minutes: m })}>
                  {Math.floor(m / 60)}h{m % 60 ? String(m % 60).padStart(2, "0") : ""}
                </Button>
              ))}
              <Input type="number" min={15} max={1440} className="w-28" defaultValue={s.interval_minutes}
                onBlur={(e) => { const n = Number(e.target.value); if (n >= 15 && n <= 1440) save({ interval_minutes: n }); }} />
              <span className="text-xs text-muted-foreground">minutes</span>
            </div>
          )}
          {s.publish_mode === "fixed_times" && (
            <div className="flex gap-2">
              <Input value={times} onChange={(e) => setTimes(e.target.value)} placeholder="10:00, 14:00, 18:00, 21:00" />
              <Button onClick={() => {
                const arr = times.split(/[,\s]+/).filter((t) => /^\d{1,2}:\d{2}$/.test(t));
                if (!arr.length) return toast.error("Format attendu : 10:00, 14:00");
                save({ fixed_times: arr });
              }}>OK</Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Dernière publication auto : {fmt(s.last_publish_at)} · heure de Dakar</p>
        </div>

        <div className="space-y-2">
          <Label>Sites sources (un par ligne)</Label>
          <textarea className="w-full min-h-[70px] rounded-md border bg-background p-2 text-sm" value={sources} onChange={(e) => setSources(e.target.value)} />
          <div className="flex flex-wrap gap-2 items-center">
            <Button size="sm" variant="outline" onClick={() => save({ source_urls: sources.split("\n").map((x) => x.trim()).filter((x) => /^https?:\/\//.test(x)) })}>Enregistrer les sources</Button>
            <Label className="text-xs">Articles max par récupération</Label>
            <Input type="number" min={1} max={10} className="w-20" defaultValue={s.max_articles_per_run}
              onBlur={(e) => { const n = Number(e.target.value); if (n >= 1 && n <= 10) save({ max_articles_per_run: n }); }} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => call("scrape")} disabled={!!busy}>
            {busy === "scrape" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Récupérer et reformuler maintenant
          </Button>
          <Button variant="outline" onClick={() => call("publish_next")} disabled={!!busy || !drafts.length}>
            <Send className="h-4 w-4 mr-2" /> Publier le prochain
          </Button>
        </div>

        <div className="space-y-2">
          <Label>File d'attente ({drafts.length} brouillon{drafts.length > 1 ? "s" : ""})</Label>
          {!drafts.length && <p className="text-sm text-muted-foreground">Aucun brouillon automatique en attente.</p>}
          {drafts.map((d, i) => (
            <div key={d.id} className="flex items-center gap-3 rounded-md border p-2">
              <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
              {d.image_url && <img src={d.image_url} alt="" className="h-12 w-16 object-cover rounded" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{d.title}</p>
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary">{d.category}</Badge>
                  {d.source_url && <a href={d.source_url} target="_blank" rel="noreferrer" className="text-xs underline text-muted-foreground truncate">source</a>}
                </div>
              </div>
              <Button size="sm" onClick={() => publishOne(d.id)}>Publier</Button>
              <Button size="icon" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Pour relire ou modifier un brouillon, ouvrez-le dans la liste des articles ci-dessous.</p>
        </div>
      </CardContent>
    </Card>
  );
};

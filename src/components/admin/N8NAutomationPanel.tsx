import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Settings, Zap, FileText, Newspaper, Trophy, User, 
  Copy, Loader2, CheckCircle, XCircle, Clock, RefreshCw,
  Send, Database, Bell, TestTube
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const invokeN8nProxy = async (body: Record<string, unknown>) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) throw new Error("Session expirée. Veuillez vous reconnecter.");

  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/n8n-webhook-proxy`;
  const res = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
};

interface N8NConfig {
  id: string;
  webhook_url: string;
  webhook_secret: string;
  is_enabled: boolean;
  last_sync: string | null;
}

interface WebhookLog {
  id: string;
  action: string;
  status: string;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

const CONTENT_TYPES = [
  { value: "article", label: "Article", icon: FileText },
  { value: "flash_news", label: "Flash News", icon: Newspaper },
  { value: "match_summary", label: "Résumé de match", icon: Trophy },
  { value: "player_description", label: "Description joueur", icon: User },
];

const QUICK_ACTIONS = [
  { action: "sync_data", label: "Synchroniser données", icon: Database, description: "Sync stats et résultats" },
  { action: "send_notification", label: "Envoyer notification", icon: Bell, description: "Notification push/Telegram" },
  { action: "generate_newsletter", label: "Générer newsletter", icon: Send, description: "Newsletter hebdo" },
];

export function N8NAutomationPanel() {
  const [config, setConfig] = useState<N8NConfig | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  
  // Form states
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  
  // Content generator states
  const [contentType, setContentType] = useState("article");
  const [contentContext, setContentContext] = useState("");
  const [contentTone, setContentTone] = useState("professional");
  const [contentLang, setContentLang] = useState("fr");

  useEffect(() => {
    fetchConfig();
    fetchLogs();
  }, []);

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from("n8n_config")
      .select("*")
      .limit(1)
      .single();

    if (!error && data) {
      const typedData = data as unknown as N8NConfig;
      setConfig(typedData);
      setWebhookUrl(typedData.webhook_url);
      setWebhookSecret(typedData.webhook_secret);
      setIsEnabled(typedData.is_enabled);
    }
    setLoading(false);
  };

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("n8n_webhook_logs")
      .select("id, action, status, error_message, duration_ms, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) setLogs(data as unknown as WebhookLog[]);
  };

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("n8n_config")
      .update({
        webhook_url: webhookUrl,
        webhook_secret: webhookSecret,
        is_enabled: isEnabled,
      })
      .eq("id", config.id);

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Configuration sauvegardée");
      fetchConfig();
    }
    setSaving(false);
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const data = await invokeN8nProxy({ action: "ping", payload: { test: true } });
      if (data?.success) {
        toast.success("Connexion n8n réussie !");
      } else {
        toast.error(data?.error || "Échec de la connexion");
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur de connexion");
    }
    setTesting(false);
    fetchLogs();
  };

  const generateContent = async () => {
    if (!contentContext.trim()) {
      toast.error("Ajoutez un contexte ou des instructions");
      return;
    }
    setGenerating(true);
    setGeneratedContent("");

    try {
      const data = await invokeN8nProxy({
        action: "generate_content",
        payload: {
          type: contentType,
          context: contentContext,
          tone: contentTone,
          language: contentLang,
        },
      });
      if (data?.success && data?.data) {
        const text = typeof data.data === "string" ? data.data : data.data.text || data.data.content || JSON.stringify(data.data);
        setGeneratedContent(text);
        toast.success("Contenu généré !");
      } else {
        toast.error(data?.error || "Échec de la génération");
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    }
    setGenerating(false);
    fetchLogs();
  };

  const triggerAction = async (action: string) => {
    try {
      const data = await invokeN8nProxy({ action, payload: {} });
      if (data?.success) {
        toast.success(`Action "${action}" exécutée`);
      } else {
        toast.error(data?.error || "Échec");
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    }
    fetchLogs();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("Copié dans le presse-papiers");
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Automatisation n8n
          </h2>
          <p className="text-muted-foreground">Connectez votre instance n8n locale pour automatiser le contenu, les données et les notifications.</p>
        </div>
        <Badge variant={isEnabled ? "default" : "secondary"}>
          {isEnabled ? "Actif" : "Inactif"}
        </Badge>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config"><Settings className="h-4 w-4 mr-1" />Configuration</TabsTrigger>
          <TabsTrigger value="content"><FileText className="h-4 w-4 mr-1" />Générateur</TabsTrigger>
          <TabsTrigger value="actions"><Zap className="h-4 w-4 mr-1" />Actions</TabsTrigger>
          <TabsTrigger value="logs"><Clock className="h-4 w-4 mr-1" />Historique</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connexion n8n</CardTitle>
              <CardDescription>
                Configurez l'URL de votre webhook n8n. Utilisez ngrok ou Cloudflare Tunnel pour exposer votre instance locale.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL du Webhook n8n</Label>
                <Input
                  placeholder="https://votre-url-ngrok.ngrok-free.app/webhook/xxx"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Ex: ngrok http 5678 → copiez l'URL publique + le chemin du webhook n8n
                </p>
              </div>

              <div className="space-y-2">
                <Label>Secret partagé (optionnel)</Label>
                <Input
                  type="password"
                  placeholder="Un secret pour authentifier les appels"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
                <Label>Activer l'intégration n8n</Label>
              </div>

              {config?.last_sync && (
                <p className="text-sm text-muted-foreground">
                  Dernière sync : {format(new Date(config.last_sync), "dd MMM yyyy HH:mm", { locale: fr })}
                </p>
              )}

              <div className="flex gap-2">
                <Button onClick={saveConfig} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Sauvegarder
                </Button>
                <Button variant="outline" onClick={testConnection} disabled={testing || !isEnabled}>
                  {testing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <TestTube className="h-4 w-4 mr-1" />}
                  Tester la connexion
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guide rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><strong>1.</strong> Installez n8n : <code className="bg-muted px-1.5 py-0.5 rounded text-xs">npx n8n</code> ou via Docker</p>
              <p><strong>2.</strong> Créez un workflow avec un noeud <strong>Webhook</strong> en entrée</p>
              <p><strong>3.</strong> Exposez votre PC : <code className="bg-muted px-1.5 py-0.5 rounded text-xs">ngrok http 5678</code></p>
              <p><strong>4.</strong> Collez l'URL ngrok + le chemin webhook ci-dessus</p>
              <p><strong>5.</strong> Testez la connexion et c'est parti !</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Generator Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Générateur de contenu IA</CardTitle>
              <CardDescription>
                Envoyez une requête à votre workflow n8n pour générer du contenu via un modèle IA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type de contenu</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ton</Label>
                  <Select value={contentTone} onValueChange={setContentTone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professionnel</SelectItem>
                      <SelectItem value="enthusiastic">Enthousiaste</SelectItem>
                      <SelectItem value="analytical">Analytique</SelectItem>
                      <SelectItem value="casual">Décontracté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select value={contentLang} onValueChange={setContentLang}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contexte / Instructions</Label>
                <Textarea
                  placeholder="Ex: Écris un article sur la victoire 3-1 du Real Madrid contre Barcelone en Liga. Vinicius a marqué un doublé..."
                  value={contentContext}
                  onChange={(e) => setContentContext(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={generateContent} disabled={generating || !isEnabled}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
                Générer via n8n
              </Button>

              {generatedContent && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Résultat</Label>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-1" /> Copier
                    </Button>
                  </div>
                  <div className="bg-muted rounded-lg p-4 max-h-96 overflow-auto whitespace-pre-wrap text-sm">
                    {generatedContent}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {QUICK_ACTIONS.map((qa) => {
              const Icon = qa.icon;
              return (
                <Card key={qa.action} className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{qa.label}</p>
                        <p className="text-xs text-muted-foreground">{qa.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => triggerAction(qa.action)}
                      disabled={!isEnabled}
                    >
                      <Send className="h-4 w-4 mr-1" /> Exécuter
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            Configurez les workflows correspondants dans n8n avec un noeud Webhook en entrée pour chaque action.
          </p>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Historique des appels</CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchLogs}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucun appel webhook enregistré</p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {log.status === "success" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{log.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(log.created_at), "dd MMM HH:mm:ss", { locale: fr })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.duration_ms && (
                            <Badge variant="outline" className="text-xs">{log.duration_ms}ms</Badge>
                          )}
                          <Badge variant={log.status === "success" ? "default" : "destructive"}>
                            {log.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Globe, Search, Share2, FileText, Image, Loader2, Save, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SEOSettings {
  site_title: string;
  site_description: string;
  site_keywords: string;
  og_image: string;
  twitter_handle: string;
  google_analytics_id: string;
  google_search_console_id: string;
  robots_txt_content: string;
  sitemap_enabled: boolean;
  auto_meta_generation: boolean;
}

const defaultSettings: SEOSettings = {
  site_title: "HALA MADRID TV",
  site_description: "Le site officiel des fans du Real Madrid - Actualités, vidéos, matchs et plus encore",
  site_keywords: "Real Madrid, football, La Liga, Champions League, actualités",
  og_image: "",
  twitter_handle: "@halamadridtv",
  google_analytics_id: "",
  google_search_console_id: "",
  robots_txt_content: "User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml",
  sitemap_enabled: true,
  auto_meta_generation: true,
};

export function SEOManager() {
  const [settings, setSettings] = useState<SEOSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('setting_key', [
          'seo_site_title',
          'seo_site_description', 
          'seo_site_keywords',
          'seo_og_image',
          'seo_twitter_handle',
          'seo_google_analytics_id',
          'seo_google_search_console_id',
          'seo_robots_txt_content',
          'seo_sitemap_enabled',
          'seo_auto_meta_generation'
        ]);

      if (error) throw error;

      if (data && data.length > 0) {
        const settingsMap: Record<string, string> = {};
        data.forEach(item => {
          const key = item.setting_key.replace('seo_', '');
          settingsMap[key] = item.setting_value;
        });

        setSettings({
          site_title: settingsMap.site_title || defaultSettings.site_title,
          site_description: settingsMap.site_description || defaultSettings.site_description,
          site_keywords: settingsMap.site_keywords || defaultSettings.site_keywords,
          og_image: settingsMap.og_image || defaultSettings.og_image,
          twitter_handle: settingsMap.twitter_handle || defaultSettings.twitter_handle,
          google_analytics_id: settingsMap.google_analytics_id || defaultSettings.google_analytics_id,
          google_search_console_id: settingsMap.google_search_console_id || defaultSettings.google_search_console_id,
          robots_txt_content: settingsMap.robots_txt_content || defaultSettings.robots_txt_content,
          sitemap_enabled: settingsMap.sitemap_enabled === 'true',
          auto_meta_generation: settingsMap.auto_meta_generation !== 'false',
        });
      }
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { setting_key: 'seo_site_title', setting_value: settings.site_title },
        { setting_key: 'seo_site_description', setting_value: settings.site_description },
        { setting_key: 'seo_site_keywords', setting_value: settings.site_keywords },
        { setting_key: 'seo_og_image', setting_value: settings.og_image },
        { setting_key: 'seo_twitter_handle', setting_value: settings.twitter_handle },
        { setting_key: 'seo_google_analytics_id', setting_value: settings.google_analytics_id },
        { setting_key: 'seo_google_search_console_id', setting_value: settings.google_search_console_id },
        { setting_key: 'seo_robots_txt_content', setting_value: settings.robots_txt_content },
        { setting_key: 'seo_sitemap_enabled', setting_value: settings.sitemap_enabled.toString() },
        { setting_key: 'seo_auto_meta_generation', setting_value: settings.auto_meta_generation.toString() },
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ 
            setting_key: setting.setting_key, 
            setting_value: setting.setting_value,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'setting_key' 
          });

        if (error) throw error;
      }

      toast({
        title: "Paramètres SEO sauvegardés",
        description: "Les modifications ont été enregistrées avec succès",
      });
    } catch (error: any) {
      console.error('Error saving SEO settings:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres SEO",
      });
    } finally {
      setSaving(false);
    }
  };

  const regenerateSitemap = async () => {
    setRegenerating(true);
    try {
      // Call the sitemap edge function to regenerate
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://qjnppcfbywfazwolfppo.supabase.co'}/functions/v1/sitemap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Sitemap régénéré",
          description: "Le sitemap a été mis à jour avec succès",
        });
      } else {
        throw new Error('Failed to regenerate sitemap');
      }
    } catch (error) {
      console.error('Error regenerating sitemap:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de régénérer le sitemap",
      });
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuration SEO</h2>
          <p className="text-muted-foreground">Optimisez le référencement de votre site</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Sauvegarder
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="social">Réseaux Sociaux</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="technical">Technique</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Informations Générales
              </CardTitle>
              <CardDescription>
                Ces informations apparaîtront dans les résultats de recherche
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site_title">Titre du site</Label>
                <Input
                  id="site_title"
                  value={settings.site_title}
                  onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                  placeholder="HALA MADRID TV"
                />
                <p className="text-xs text-muted-foreground">
                  {settings.site_title.length}/60 caractères recommandés
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_description">Description du site</Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description}
                  onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                  placeholder="Description de votre site..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {settings.site_description.length}/160 caractères recommandés
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_keywords">Mots-clés</Label>
                <Input
                  id="site_keywords"
                  value={settings.site_keywords}
                  onChange={(e) => setSettings({ ...settings, site_keywords: e.target.value })}
                  placeholder="Real Madrid, football, La Liga..."
                />
                <p className="text-xs text-muted-foreground">
                  Séparez les mots-clés par des virgules
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Génération automatique des méta</Label>
                  <p className="text-sm text-muted-foreground">
                    Générer automatiquement les balises méta pour les articles
                  </p>
                </div>
                <Switch
                  checked={settings.auto_meta_generation}
                  onCheckedChange={(checked) => setSettings({ ...settings, auto_meta_generation: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Aperçu Google
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
                <div className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer">
                  {settings.site_title || "Titre du site"}
                </div>
                <div className="text-green-700 dark:text-green-500 text-sm">
                  halamadridtv.com
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {settings.site_description || "Description du site..."}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Open Graph & Twitter
              </CardTitle>
              <CardDescription>
                Configurez l'apparence des partages sur les réseaux sociaux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="og_image">Image de partage (Open Graph)</Label>
                <Input
                  id="og_image"
                  value={settings.og_image}
                  onChange={(e) => setSettings({ ...settings, og_image: e.target.value })}
                  placeholder="https://example.com/og-image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Taille recommandée : 1200x630 pixels
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter_handle">Compte Twitter</Label>
                <Input
                  id="twitter_handle"
                  value={settings.twitter_handle}
                  onChange={(e) => setSettings({ ...settings, twitter_handle: e.target.value })}
                  placeholder="@halamadridtv"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Google Analytics & Search Console
              </CardTitle>
              <CardDescription>
                Connectez vos outils de suivi et d'analyse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google_analytics_id">ID Google Analytics</Label>
                <Input
                  id="google_analytics_id"
                  value={settings.google_analytics_id}
                  onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_search_console_id">ID Google Search Console</Label>
                <Input
                  id="google_search_console_id"
                  value={settings.google_search_console_id}
                  onChange={(e) => setSettings({ ...settings, google_search_console_id: e.target.value })}
                  placeholder="Clé de vérification"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Robots.txt
              </CardTitle>
              <CardDescription>
                Contrôlez l'accès des robots d'indexation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={settings.robots_txt_content}
                onChange={(e) => setSettings({ ...settings, robots_txt_content: e.target.value })}
                rows={6}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Sitemap
              </CardTitle>
              <CardDescription>
                Gérez le sitemap XML de votre site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sitemap activé</Label>
                  <p className="text-sm text-muted-foreground">
                    Générer automatiquement un sitemap XML
                  </p>
                </div>
                <Switch
                  checked={settings.sitemap_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, sitemap_enabled: checked })}
                />
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={regenerateSitemap}
                  disabled={regenerating || !settings.sitemap_enabled}
                >
                  {regenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Régénérer le sitemap
                </Button>
                <Badge variant="outline">
                  /sitemap.xml
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SEOManager;

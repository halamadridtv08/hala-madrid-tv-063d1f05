import { useState } from 'react';
import { useIntegrations, Integration } from '@/hooks/useIntegrations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CreditCard,
  BarChart3,
  Bot,
  Brain,
  Sparkles,
  Mail,
  Send,
  MailCheck,
  Bell,
  MessageSquare,
  ShoppingBag,
  Shield,
  DollarSign,
  Languages,
  ChevronRight,
  ExternalLink,
  Search,
  Loader2,
  MousePointer2,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  CreditCard,
  BarChart3,
  Bot,
  Brain,
  Sparkles,
  Mail,
  Send,
  MailCheck,
  Bell,
  MessageSquare,
  ShoppingBag,
  Shield,
  DollarSign,
  Languages,
  MousePointer2,
  Facebook,
  Twitter,
  Instagram
};

const categoryLabels: Record<string, string> = {
  payment: 'Paiement',
  analytics: 'Analytics',
  ai: 'Intelligence Artificielle',
  email: 'Email',
  notifications: 'Notifications',
  social: 'Réseaux Sociaux',
  ecommerce: 'E-commerce',
  other: 'Autres'
};

const categoryColors: Record<string, string> = {
  payment: 'bg-emerald-500/10 text-emerald-500',
  analytics: 'bg-blue-500/10 text-blue-500',
  ai: 'bg-purple-500/10 text-purple-500',
  email: 'bg-orange-500/10 text-orange-500',
  notifications: 'bg-yellow-500/10 text-yellow-500',
  social: 'bg-pink-500/10 text-pink-500',
  ecommerce: 'bg-teal-500/10 text-teal-500',
  other: 'bg-gray-500/10 text-gray-500'
};

const IntegrationsManager = () => {
  const { integrations, loading, toggleIntegration, updateConfig } = useIntegrations();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const categories = ['all', ...new Set(integrations.map(i => i.category))];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || integration.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedIntegrations = filteredIntegrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const handleOpenConfig = (integration: Integration) => {
    setSelectedIntegration(integration);
    const configObj = (typeof integration.config === 'object' && integration.config !== null && !Array.isArray(integration.config)) 
      ? integration.config as Record<string, string>
      : {};
    setConfigValues(configObj);
  };

  const handleSaveConfig = async () => {
    if (!selectedIntegration) return;
    
    setSaving(true);
    await updateConfig(selectedIntegration.id, configValues as unknown as import('@/integrations/supabase/types').Json);
    setSaving(false);
    setSelectedIntegration(null);
  };

  const handleToggle = async (integration: Integration) => {
    const newEnabledState = !integration.is_enabled;
    const success = await toggleIntegration(integration.id, newEnabledState);
    if (success && selectedIntegration?.id === integration.id) {
      setSelectedIntegration({
        ...selectedIntegration,
        is_enabled: newEnabledState
      });
    }
  };

  const getConfigFields = (key: string): { name: string; label: string; type: string; placeholder: string }[] => {
    const configTemplates: Record<string, { name: string; label: string; type: string; placeholder: string }[]> = {
      stripe: [
        { name: 'publishable_key', label: 'Clé publique', type: 'text', placeholder: 'pk_live_...' },
        { name: 'secret_key', label: 'Clé secrète', type: 'password', placeholder: 'sk_live_...' },
        { name: 'webhook_secret', label: 'Secret webhook', type: 'password', placeholder: 'whsec_...' }
      ],
      google_analytics: [
        { name: 'measurement_id', label: 'ID de mesure', type: 'text', placeholder: 'G-XXXXXXXXXX' }
      ],
      facebook_pixel: [
        { name: 'pixel_id', label: 'ID du Pixel', type: 'text', placeholder: '123456789012345' }
      ],
      openai: [
        { name: 'api_key', label: 'Clé API', type: 'password', placeholder: 'sk-...' }
      ],
      anthropic: [
        { name: 'api_key', label: 'Clé API', type: 'password', placeholder: 'sk-ant-...' }
      ],
      google_gemini: [
        { name: 'api_key', label: 'Clé API', type: 'password', placeholder: 'AIza...' }
      ],
      resend: [
        { name: 'api_key', label: 'Clé API', type: 'password', placeholder: 're_...' },
        { name: 'from_email', label: 'Email expéditeur', type: 'email', placeholder: 'noreply@votredomaine.com' }
      ],
      mailchimp: [
        { name: 'api_key', label: 'Clé API', type: 'password', placeholder: 'xxxxxxxx-us1' },
        { name: 'audience_id', label: 'ID de l\'audience', type: 'text', placeholder: 'a1b2c3d4e5' }
      ],
      onesignal: [
        { name: 'app_id', label: 'App ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
        { name: 'rest_api_key', label: 'Clé REST API', type: 'password', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }
      ],
      twilio: [
        { name: 'account_sid', label: 'Account SID', type: 'text', placeholder: 'ACxxxxxxxxx' },
        { name: 'auth_token', label: 'Auth Token', type: 'password', placeholder: 'xxxxxxxxx' },
        { name: 'phone_number', label: 'Numéro de téléphone', type: 'text', placeholder: '+33612345678' }
      ],
      twitter_api: [
        { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'xxxxxxx' },
        { name: 'api_secret', label: 'API Secret', type: 'password', placeholder: 'xxxxxxx' },
        { name: 'bearer_token', label: 'Bearer Token', type: 'password', placeholder: 'AAAA...' }
      ],
      hotjar: [
        { name: 'site_id', label: 'Site ID', type: 'text', placeholder: '1234567' }
      ],
      shopify: [
        { name: 'store_domain', label: 'Domaine de la boutique', type: 'text', placeholder: 'votre-boutique.myshopify.com' },
        { name: 'access_token', label: 'Token d\'accès', type: 'password', placeholder: 'shpat_...' }
      ],
      cloudflare: [
        { name: 'zone_id', label: 'Zone ID', type: 'text', placeholder: 'xxxxxxxxx' },
        { name: 'api_token', label: 'API Token', type: 'password', placeholder: 'xxxxxxxxx' }
      ],
      google_adsense: [
        { name: 'publisher_id', label: 'ID éditeur', type: 'text', placeholder: 'pub-1234567890' },
        { name: 'ad_slot', label: 'Emplacement publicitaire', type: 'text', placeholder: '1234567890' }
      ],
      deepl: [
        { name: 'api_key', label: 'Clé API', type: 'password', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx' }
      ]
    };
    
    return configTemplates[key] || [{ name: 'api_key', label: 'Clé API', type: 'password', placeholder: 'Votre clé API' }];
  };

  const IconComponent = ({ iconName }: { iconName: string }) => {
    const Icon = iconMap[iconName] || Bot;
    return <Icon className="h-6 w-6" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intégrations</h2>
          <p className="text-muted-foreground">Gérez vos services externes et API</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Tout</TabsTrigger>
          {categories.filter(c => c !== 'all').map(category => (
            <TabsTrigger key={category} value={category}>
              {categoryLabels[category] || category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {Object.entries(groupedIntegrations).map(([category, items]) => (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className={`px-2 py-1 rounded-md text-sm ${categoryColors[category]}`}>
                  {categoryLabels[category] || category}
                </span>
                <span className="text-muted-foreground text-sm">({items.length})</span>
              </h3>
              <div className="grid gap-3">
                {items.map((integration) => (
                  <Card
                    key={integration.id}
                    className="hover:bg-accent/50 transition-colors cursor-pointer group"
                    onClick={() => handleOpenConfig(integration)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${categoryColors[integration.category]}`}>
                          <IconComponent iconName={integration.icon} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate">{integration.name}</h4>
                            {integration.is_enabled && (
                              <Badge variant="default" className="bg-green-500 text-white text-xs">
                                Actif
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {integration.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedIntegration && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${categoryColors[selectedIntegration.category]}`}>
                    <IconComponent iconName={selectedIntegration.icon} />
                  </div>
                  <div>
                    <DialogTitle>{selectedIntegration.name}</DialogTitle>
                    <DialogDescription>{selectedIntegration.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Activer l'intégration</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedIntegration.is_enabled ? 'L\'intégration est active' : 'L\'intégration est désactivée'}
                    </p>
                  </div>
                  <Switch
                    checked={selectedIntegration.is_enabled}
                    onCheckedChange={() => handleToggle(selectedIntegration)}
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Configuration</Label>
                  {getConfigFields(selectedIntegration.integration_key).map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={configValues[field.name] || ''}
                        onChange={(e) => setConfigValues(prev => ({
                          ...prev,
                          [field.name]: e.target.value
                        }))}
                      />
                    </div>
                  ))}
                </div>

                {selectedIntegration.documentation_url && (
                  <a
                    href={selectedIntegration.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Voir la documentation
                  </a>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveConfig} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Sauvegarder
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationsManager;

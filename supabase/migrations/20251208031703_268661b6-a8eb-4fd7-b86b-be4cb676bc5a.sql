-- Create integrations table for managing external service integrations
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  documentation_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only for management
CREATE POLICY "Admins can manage integrations"
ON public.integrations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone authenticated can view integrations (for checking if features are enabled)
CREATE POLICY "Authenticated users can view integrations"
ON public.integrations
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_integrations_updated_at
BEFORE UPDATE ON public.integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Pre-fill with available integrations
INSERT INTO public.integrations (integration_key, name, description, category, icon, documentation_url) VALUES
-- Payment
('stripe', 'Stripe', 'Paiements en ligne sécurisés, abonnements et facturations', 'payment', 'CreditCard', 'https://stripe.com/docs'),

-- Analytics
('google_analytics', 'Google Analytics 4', 'Analyse du trafic web et comportement utilisateurs', 'analytics', 'BarChart3', 'https://analytics.google.com'),
('facebook_pixel', 'Facebook Pixel', 'Suivi des conversions et remarketing Facebook/Meta', 'analytics', 'Facebook', 'https://www.facebook.com/business/help/952192354843755'),
('hotjar', 'Hotjar', 'Heatmaps, enregistrements de sessions et feedback utilisateurs', 'analytics', 'MousePointer2', 'https://www.hotjar.com/'),

-- AI
('openai', 'OpenAI', 'GPT-4, DALL-E, génération de texte et images', 'ai', 'Bot', 'https://platform.openai.com/docs'),
('anthropic', 'Anthropic Claude', 'Assistant IA avancé pour analyse et rédaction', 'ai', 'Brain', 'https://docs.anthropic.com'),
('google_gemini', 'Google Gemini', 'IA multimodale de Google', 'ai', 'Sparkles', 'https://ai.google.dev/docs'),

-- Email
('resend', 'Resend', 'Emails transactionnels modernes et fiables', 'email', 'Mail', 'https://resend.com/docs'),
('mailchimp', 'Mailchimp', 'Newsletters et campagnes email marketing', 'email', 'Send', 'https://mailchimp.com/developer/'),
('brevo', 'Brevo (Sendinblue)', 'Marketing automation et emails transactionnels', 'email', 'MailCheck', 'https://developers.brevo.com/'),

-- Notifications
('onesignal', 'OneSignal', 'Push notifications web et mobile', 'notifications', 'Bell', 'https://documentation.onesignal.com/'),
('twilio', 'Twilio', 'SMS, WhatsApp et communications programmables', 'notifications', 'MessageSquare', 'https://www.twilio.com/docs'),

-- Social
('twitter_api', 'Twitter/X API', 'Intégration tweets et publications automatiques', 'social', 'Twitter', 'https://developer.twitter.com/'),
('instagram_api', 'Instagram API', 'Affichage de feed et stories Instagram', 'social', 'Instagram', 'https://developers.facebook.com/docs/instagram-api/'),

-- E-commerce
('shopify', 'Shopify', 'Boutique e-commerce intégrée', 'ecommerce', 'ShoppingBag', 'https://shopify.dev/docs'),

-- Other
('cloudflare', 'Cloudflare', 'CDN, sécurité et optimisation des performances', 'other', 'Shield', 'https://developers.cloudflare.com/'),
('google_adsense', 'Google AdSense', 'Monétisation par publicités contextuelles', 'other', 'DollarSign', 'https://support.google.com/adsense'),
('deepl', 'DeepL', 'Traduction automatique de haute qualité', 'other', 'Languages', 'https://www.deepl.com/docs-api');
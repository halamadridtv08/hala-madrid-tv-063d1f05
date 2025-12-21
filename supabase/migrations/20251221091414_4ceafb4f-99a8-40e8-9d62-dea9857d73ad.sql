-- Table pour les domaines email bloqués (emails temporaires/jetables)
CREATE TABLE IF NOT EXISTS public.blocked_email_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  reason TEXT DEFAULT 'Email temporaire',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.blocked_email_domains ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour validation frontend
CREATE POLICY "Domains are publicly readable" ON public.blocked_email_domains
  FOR SELECT USING (true);

-- Écriture admin uniquement
CREATE POLICY "Only admins can modify domains" ON public.blocked_email_domains
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Insérer les domaines d'emails temporaires courants
INSERT INTO public.blocked_email_domains (domain, reason) VALUES
  ('10minutemail.com', 'Email temporaire 10 minutes'),
  ('guerrillamail.com', 'Guerrilla Mail temporaire'),
  ('guerrillamail.net', 'Guerrilla Mail temporaire'),
  ('guerrillamail.org', 'Guerrilla Mail temporaire'),
  ('tempmail.com', 'TempMail temporaire'),
  ('temp-mail.org', 'Temp-Mail temporaire'),
  ('temp-mail.io', 'Temp-Mail temporaire'),
  ('mailinator.com', 'Mailinator temporaire'),
  ('throwaway.email', 'Throwaway Email'),
  ('fakeinbox.com', 'Fake Inbox'),
  ('trashmail.com', 'Trash Mail'),
  ('trashmail.net', 'Trash Mail'),
  ('mailnesia.com', 'Mailnesia temporaire'),
  ('mohmal.com', 'Mohmal temporaire'),
  ('getnada.com', 'GetNada temporaire'),
  ('nada.email', 'Nada Email'),
  ('dispostable.com', 'Dispostable temporaire'),
  ('tempinbox.com', 'TempInbox temporaire'),
  ('sharklasers.com', 'SharkLasers temporaire'),
  ('spam4.me', 'Spam4Me temporaire'),
  ('yopmail.com', 'YopMail temporaire'),
  ('yopmail.fr', 'YopMail temporaire'),
  ('maildrop.cc', 'MailDrop temporaire'),
  ('mintemail.com', 'MintEmail temporaire'),
  ('dropmail.me', 'DropMail temporaire'),
  ('harakirimail.com', 'HarakiriMail temporaire'),
  ('mytemp.email', 'MyTemp temporaire'),
  ('inboxkitten.com', 'InboxKitten temporaire'),
  ('emailondeck.com', 'EmailOnDeck temporaire'),
  ('33mail.com', '33Mail temporaire'),
  ('emailfake.com', 'EmailFake temporaire'),
  ('crazymailing.com', 'CrazyMailing temporaire'),
  ('tempr.email', 'Tempr temporaire'),
  ('throwawaymail.com', 'Throwaway temporaire'),
  ('spamgourmet.com', 'SpamGourmet temporaire'),
  ('mailcatch.com', 'MailCatch temporaire'),
  ('bugmenot.com', 'BugMeNot temporaire'),
  ('discard.email', 'Discard Email'),
  ('spambox.us', 'SpamBox temporaire'),
  ('safetymail.info', 'SafetyMail temporaire')
ON CONFLICT (domain) DO NOTHING;

-- Fonction pour vérifier si un email utilise un domaine bloqué
CREATE OR REPLACE FUNCTION public.is_email_domain_blocked(p_email TEXT)
RETURNS TABLE(is_blocked BOOLEAN, domain TEXT, reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_domain TEXT;
BEGIN
  -- Extraire le domaine de l'email
  v_domain := LOWER(SPLIT_PART(p_email, '@', 2));
  
  RETURN QUERY
  SELECT 
    EXISTS(
      SELECT 1 FROM blocked_email_domains 
      WHERE blocked_email_domains.domain = v_domain 
      AND is_active = true
    ) AS is_blocked,
    v_domain AS domain,
    COALESCE(
      (SELECT blocked_email_domains.reason FROM blocked_email_domains 
       WHERE blocked_email_domains.domain = v_domain AND is_active = true),
      NULL
    ) AS reason;
END;
$$;

-- Créer le bucket pour les photos de joueurs adverses
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'opposing-players', 
  'opposing-players', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Politique de lecture publique pour le bucket
CREATE POLICY "Opposing players photos are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'opposing-players');

-- Politique d'écriture admin pour le bucket
CREATE POLICY "Only admins can upload opposing player photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'opposing-players' AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Politique de mise à jour admin
CREATE POLICY "Only admins can update opposing player photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'opposing-players' AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Politique de suppression admin
CREATE POLICY "Only admins can delete opposing player photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'opposing-players' AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Ajouter colonne photo_url à opposing_players si elle n'existe pas
ALTER TABLE public.opposing_players 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Trigger pour updated_at
CREATE OR REPLACE TRIGGER update_blocked_email_domains_updated_at
  BEFORE UPDATE ON public.blocked_email_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
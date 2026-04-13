
-- Create n8n_config table
CREATE TABLE public.n8n_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_url TEXT NOT NULL DEFAULT '',
  webhook_secret TEXT NOT NULL DEFAULT '',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.n8n_config ENABLE ROW LEVEL SECURITY;

-- Only admins can view
CREATE POLICY "Admins can view n8n config"
ON public.n8n_config
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert
CREATE POLICY "Admins can insert n8n config"
ON public.n8n_config
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update n8n config"
ON public.n8n_config
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete n8n config"
ON public.n8n_config
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_n8n_config_updated_at
BEFORE UPDATE ON public.n8n_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default config row
INSERT INTO public.n8n_config (webhook_url, webhook_secret, is_enabled)
VALUES ('', '', false);

-- Create n8n_webhook_logs table for history
CREATE TABLE public.n8n_webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.n8n_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view n8n logs"
ON public.n8n_webhook_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert n8n logs"
ON public.n8n_webhook_logs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

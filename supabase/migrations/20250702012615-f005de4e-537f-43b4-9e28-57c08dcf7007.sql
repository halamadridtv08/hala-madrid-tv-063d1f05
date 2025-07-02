-- Activer les mises à jour temps réel pour la table matches
ALTER TABLE matches REPLICA IDENTITY FULL;

-- Configuration de la publication temps réel pour Supabase
-- (Cette commande peut échouer si la publication existe déjà, c'est normal)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Ajouter la table matches à la publication temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Créer un tâche cron pour synchroniser automatiquement les matchs toutes les heures
-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Programmer la synchronisation automatique toutes les heures
SELECT cron.schedule(
  'sync-matches-hourly',
  '0 * * * *', -- Chaque heure à la minute 0
  $$
  SELECT
    net.http_post(
        url:='https://qjnppcfbywfazwolfppo.supabase.co/functions/v1/sync-matches',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbnBwY2ZieXdmYXp3b2xmcHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNDA0MzksImV4cCI6MjA2MTcxNjQzOX0.1dPuqM42ASnYsfdBs4d2bLRgHxJQzmCSEW2dIUbcJOI"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);
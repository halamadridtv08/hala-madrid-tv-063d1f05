

# Plan : Intégration n8n Local via Webhooks

## Contexte
Tu veux utiliser n8n installé localement sur ton PC pour automatiser la génération de contenu, la synchronisation de données et les notifications. La connexion se fera via des webhooks (n8n expose un webhook, ton site l'appelle).

## Prérequis important
Comme n8n tourne sur ton PC (localhost), ton site Lovable (hébergé en ligne) ne peut pas appeler `localhost` directement. Tu devras utiliser un **tunnel** comme :
- **ngrok** (gratuit) : `ngrok http 5678` → te donne une URL publique
- **Cloudflare Tunnel** (gratuit) : alternative plus stable

## Ce qui sera créé

### 1. Edge Function `n8n-webhook-proxy`
Une edge function qui sert de pont entre ton admin et n8n :
- Reçoit les requêtes depuis l'admin (type de contenu, contexte, action)
- Transmet à l'URL webhook n8n configurée
- Retourne la réponse de n8n (texte généré, confirmation de sync, etc.)
- Authentification via un secret partagé `N8N_WEBHOOK_SECRET`

### 2. Table `n8n_config` (Supabase)
Stocke l'URL du webhook n8n et les paramètres :
- `webhook_url` : l'URL publique de ton n8n (ngrok/cloudflare)
- `webhook_secret` : secret partagé pour sécuriser les appels
- `is_enabled` : activer/désactiver
- `last_sync` : dernière synchronisation réussie

### 3. Composant Admin `N8NAutomationPanel.tsx`
Un nouvel onglet "Automatisation n8n" dans l'admin avec :
- **Configuration** : champ pour l'URL webhook n8n, test de connexion
- **Générateur de contenu** : sélecteur de type (article, flash news, résumé match), champ contexte, bouton "Générer via n8n", aperçu du résultat avec bouton copier
- **Actions rapides** : boutons pour déclencher manuellement les workflows n8n (sync données, envoyer notification, etc.)
- **Historique** : log des derniers appels webhook avec statut

### 4. Intégration Sidebar Admin
Ajout d'un onglet "n8n" avec icône dans la sidebar, accessible aux admins/modérateurs.

## Workflow côté n8n (ce que tu configureras toi-même)
```text
[Webhook Trigger] → [OpenAI/Gemini Node] → [Respond to Webhook]
[Webhook Trigger] → [Supabase Node] → [Respond to Webhook]  
[Webhook Trigger] → [Telegram/Discord Node] → [Respond to Webhook]
```

Tu créeras tes workflows dans n8n avec un noeud "Webhook" en entrée. Ton site appellera ces webhooks via l'edge function.

## Secrets nécessaires
- `N8N_WEBHOOK_SECRET` : un secret que tu définis dans n8n et dans Supabase pour authentifier les appels

## Fichiers à créer/modifier
- `supabase/functions/n8n-webhook-proxy/index.ts` (nouveau)
- `src/components/admin/N8NAutomationPanel.tsx` (nouveau)
- `src/components/layout/AdminSidebar.tsx` (ajout onglet)
- `src/pages/Admin.tsx` (ajout routing)
- Migration SQL pour table `n8n_config`


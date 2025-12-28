# Configuration des CRON Jobs - HalaMadrid TV

## Vue d'ensemble

Ce document explique comment configurer les tâches automatisées (CRON jobs) pour le site HalaMadrid TV en utilisant un service gratuit comme [cron-job.org](https://cron-job.org).

## Prérequis

1. Un compte sur [cron-job.org](https://cron-job.org) (gratuit)
2. Le `CRON_SECRET` configuré dans Supabase (déjà fait)
3. L'URL du projet Supabase : `https://qjnppcfbywfazwolfppo.supabase.co`

## Jobs à configurer

### 1. 📰 Publication des articles programmés

**Fréquence :** Toutes les 5 minutes  
**URL :** `https://qjnppcfbywfazwolfppo.supabase.co/functions/v1/publish-scheduled-articles`  
**Méthode :** POST  
**Headers :**
```
x-cron-secret: [VOTRE_CRON_SECRET]
Content-Type: application/json
```

### 2. ⚡ Publication des flash news programmés

**Fréquence :** Toutes les 5 minutes  
**URL :** `https://qjnppcfbywfazwolfppo.supabase.co/functions/v1/publish-scheduled-flash-news`  
**Méthode :** POST  
**Headers :**
```
x-cron-secret: [VOTRE_CRON_SECRET]
Content-Type: application/json
```

### 3. ⚽ Notifications avant les matchs (24h avant)

**Fréquence :** Une fois par jour à 10h00  
**URL :** `https://qjnppcfbywfazwolfppo.supabase.co/functions/v1/match-notifications`  
**Méthode :** POST  
**Headers :**
```
x-cron-secret: [VOTRE_CRON_SECRET]
Content-Type: application/json
```
**Body :**
```json
{
  "hours_before": 24
}
```

### 4. ⚽ Notifications avant les matchs (3h avant)

**Fréquence :** Toutes les heures  
**URL :** `https://qjnppcfbywfazwolfppo.supabase.co/functions/v1/match-notifications`  
**Méthode :** POST  
**Headers :**
```
x-cron-secret: [VOTRE_CRON_SECRET]
Content-Type: application/json
```
**Body :**
```json
{
  "hours_before": 3
}
```

### 5. 📊 Synchronisation des classements La Liga

**Fréquence :** Toutes les 6 heures (ou après chaque journée)  
**URL :** `https://qjnppcfbywfazwolfppo.supabase.co/functions/v1/sync-laliga-standings`  
**Méthode :** POST  
**Headers :**
```
x-cron-secret: [VOTRE_CRON_SECRET]
Content-Type: application/json
```

### 6. 🔄 Synchronisation des matchs

**Fréquence :** Toutes les 12 heures  
**URL :** `https://qjnppcfbywfazwolfppo.supabase.co/functions/v1/sync-matches`  
**Méthode :** POST  
**Headers :**
```
x-cron-secret: [VOTRE_CRON_SECRET]
Content-Type: application/json
```

### 7. 🗃️ Archivage des anciens articles

**Fréquence :** Une fois par semaine (dimanche à 3h00)  
**URL :** `https://qjnppcfbywfazwolfppo.supabase.co/functions/v1/archive-old-articles`  
**Méthode :** POST  
**Headers :**
```
x-cron-secret: [VOTRE_CRON_SECRET]
Content-Type: application/json
```
**Body :**
```json
{
  "days_old": 365,
  "delete": false
}
```

---

## Configuration sur cron-job.org

### Étape 1 : Créer un compte

1. Allez sur [cron-job.org](https://cron-job.org)
2. Créez un compte gratuit
3. Vérifiez votre email

### Étape 2 : Créer un job

1. Cliquez sur "Cronjobs" > "Create cronjob"
2. Remplissez les champs :
   - **Title** : Nom descriptif (ex: "Publish Scheduled Articles")
   - **URL** : L'URL de l'edge function
   - **Schedule** : Choisissez la fréquence

### Étape 3 : Configuration avancée

1. Cliquez sur "Advanced"
2. **Request Method** : POST
3. **Request Headers** :
   ```
   x-cron-secret: [VOTRE_CRON_SECRET]
   Content-Type: application/json
   ```
4. **Request Body** : (si nécessaire) Le JSON correspondant

### Étape 4 : Notifications (optionnel)

Configurez les notifications par email pour être alerté en cas d'échec.

---

## Expressions CRON

| Expression | Signification |
|------------|---------------|
| `*/5 * * * *` | Toutes les 5 minutes |
| `0 * * * *` | Toutes les heures |
| `0 */6 * * *` | Toutes les 6 heures |
| `0 */12 * * *` | Toutes les 12 heures |
| `0 10 * * *` | Tous les jours à 10h00 |
| `0 3 * * 0` | Chaque dimanche à 3h00 |

---

## Tableau récapitulatif

| Job | Fréquence | Expression CRON |
|-----|-----------|-----------------|
| Articles programmés | 5 min | `*/5 * * * *` |
| Flash News programmés | 5 min | `*/5 * * * *` |
| Notifs match 24h | Quotidien 10h | `0 10 * * *` |
| Notifs match 3h | Horaire | `0 * * * *` |
| Standings La Liga | 6h | `0 */6 * * *` |
| Sync matchs | 12h | `0 */12 * * *` |
| Archivage articles | Hebdo | `0 3 * * 0` |

---

## Dépannage

### Le job échoue avec erreur 401

- Vérifiez que le header `x-cron-secret` est correct
- Vérifiez que le secret dans Supabase correspond

### Le job échoue avec erreur 500

- Consultez les logs dans Supabase Dashboard > Edge Functions > Logs
- Vérifiez les configurations des intégrations (OneSignal, Football API)

### Les notifications ne sont pas envoyées

- Vérifiez que OneSignal est activé dans les intégrations
- Vérifiez que `app_id` et `api_key` sont configurés

---

## Alternative : pg_cron (Supabase Pro)

Si vous avez un plan Supabase Pro, vous pouvez utiliser `pg_cron` directement dans PostgreSQL :

```sql
-- Activer les extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Publication des articles programmés (toutes les 5 minutes)
SELECT cron.schedule(
  'publish-articles',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://qjnppcfbywfazwolfppo.supabase.co/functions/v1/publish-scheduled-articles',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "VOTRE_SECRET"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Liste des jobs actifs
SELECT * FROM cron.job;

-- Supprimer un job
SELECT cron.unschedule('publish-articles');
```

---

## Sécurité

⚠️ **Important** : Ne partagez jamais votre `CRON_SECRET`. Il permet d'exécuter les edge functions sans authentification utilisateur.

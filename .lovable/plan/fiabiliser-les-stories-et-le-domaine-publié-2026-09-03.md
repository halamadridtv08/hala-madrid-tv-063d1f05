# Fiabiliser les stories et le domaine publié

## Objectif
Rendre les stories identiques et fiables sur l’aperçu Lovable et le domaine personnalisé, avec audio actif par défaut, plein écran persistant, reprise multi-appareils et diagnostic visible dans l’admin.

## Mise en œuvre

### 1. Publication et cache du domaine personnalisé
- Confirmer et afficher dans l’admin que `hala-madrid-tv.com` est servi par Vercel tandis que `hala-madrid-tv.lovable.app` est servi par Lovable, avec leurs versions d’assets actuellement différentes.
- Durcir la stratégie PWA : ne jamais conserver une ancienne page HTML ou un ancien bundle après publication, activer immédiatement le nouveau service worker et proposer une actualisation contrôlée lorsqu’une nouvelle version est détectée.
- Ajouter des en-têtes Vercel sans cache pour le document HTML et les fichiers du service worker, tout en gardant les assets versionnés en cache long.
- Publier la version Lovable à jour. Le diagnostic admin indiquera explicitement si le domaine Vercel n’a pas encore déployé le même build afin d’éviter de confondre un problème applicatif avec un déploiement GitHub/Vercel en retard.

### 2. Diagnostic automatique des stories
- Ajouter une table sécurisée de diagnostics média et une fonction serveur limitée aux événements autorisés.
- Enregistrer les erreurs utiles : chargement vidéo/poster, CORS ou réseau probable, lecture automatique bloquée, métadonnées invalides, échec de reprise et épuisement des tentatives.
- Ajouter un onglet « Diagnostic » dans la gestion des stories avec état du domaine, version d’asset, URL média, origine, type d’erreur, nombre de tentatives, date et bouton d’actualisation.
- Ne jamais enregistrer de jeton, cookie, donnée d’authentification ou contenu sensible.

### 3. Audio et plein écran
- Initialiser les vidéos avec le son activé.
- Si le navigateur interdit la lecture automatique avec son, poursuivre de façon compatible et afficher un contrôle clair « Activer le son » ; enregistrer ce blocage dans le diagnostic.
- Stabiliser le plein écran sur le conteneur de la visionneuse afin qu’un changement manuel ou automatique de contenu ne le ferme pas.
- Prévoir le mode plein écran visuel comme solution de repli sur iOS ou quand l’API Fullscreen est indisponible/refusée.

### 4. Reprise multi-appareils fiable
- Faire de la position serveur la référence pour les utilisateurs connectés, avec horodatage pour départager la position locale et distante.
- Sauvegarder immédiatement avant chaque changement de contenu/story et attendre cette écriture sur les navigations explicites quand nécessaire.
- Sérialiser les mises à jour pour empêcher une ancienne écriture asynchrone d’écraser une position plus récente.
- Restaurer précisément l’élément et le temps vidéo après chargement des métadonnées, avec repli local hors connexion.

### 5. Chargement média robuste
- Remplacer les deux relances fixes par plusieurs tentatives avec délai progressif et cache-busting.
- Conserver le poster visible pendant la préparation et après un échec, puis reprendre à la dernière seconde connue après rechargement.
- Différencier les erreurs réseau, décodage, source absente et blocage navigateur dans le message utilisateur et le journal admin.

## Validation
- Vérifier les migrations/RLS, les types TypeScript et les parcours story image/vidéo.
- Tester audio, navigation, plein écran, retry et reprise dans Chromium desktop et mobile.
- Comparer les URLs d’assets et les en-têtes entre Lovable et le domaine personnalisé après publication.

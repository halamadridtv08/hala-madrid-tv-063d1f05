# Stories flottantes, notifications et commentaires

## Résultat attendu
- La barre de match reste toujours la première sous la navigation.
- La grande barre de stories disparaît au profit du rail flottant **Vertical floating stories** sur l’image principale.
- Le cercle principal ouvre les stories 24 h; la flèche déploie verticalement les stories à la une.
- L’admin peut afficher ou masquer ce rail et régler son apparence.
- Les stories 24 h expirent réellement 24 heures après leur publication, sans prolongation lors d’un ajout.
- Les nouvelles activités font apparaître immédiatement un badge dans l’admin et déclenchent le son après activation audio du navigateur.
- Chaque article affiche son nombre de commentaires et ses commentaires masqués dans l’admin.
- Les commentaires propres sont publiés immédiatement; les mots interdits les masquent automatiquement, avec révision possible depuis l’admin.

## Mise en œuvre
1. **Stories**
   - Recomposer l’accueil pour afficher la barre de match avant le contenu principal.
   - Transformer le composant actuel en rail flottant compact, accessible et adapté aux petits écrans.
   - Étendre les réglages admin avec un interrupteur d’affichage du rail.
   - Corriger la logique pour que l’échéance initiale ne soit jamais repoussée par l’ajout d’un média; filtrer aussi les éléments arrivés à expiration.

2. **Notifications**
   - Activer la diffusion en temps réel de `admin_notifications`.
   - Consolider la liste et la cloche sur une source commune pour que badge, lecture et suppression restent synchronisés.
   - Garder le badge visible tant que la notification n’est pas lue et prévoir un retour visuel si le navigateur bloque le son.

3. **Commentaires d’articles**
   - Ajouter une liste de mots bloqués administrable.
   - Publier immédiatement les commentaires sans mot bloqué.
   - Masquer automatiquement, sans supprimer, les commentaires contenant un mot bloqué.
   - Remplacer « Approuver » par « Masquer/Afficher » et « Lever le signalement ».
   - Ajouter les compteurs de commentaires sur les lignes d’articles.

4. **Vérification**
   - Tester l’expiration, les règles d’accès et la création des notifications.
   - Vérifier visuellement l’accueil et l’administration sur ordinateur et mobile.
   - Exécuter les contrôles complets du projet.

## Direction visuelle verrouillée
- Palette : blanc, bleu Real `#0A2472`, or `#F4B400`, anthracite `#111827`, via les couleurs du thème.
- Typographie : **Bebas Neue** pour les titres et **Barlow** pour le texte.
- Composition : rail compact vertical, cercle 24 h dominant, flèche séparée, highlights secondaires.
- Animation : ouverture courte en cascade, anneau non vu discret, avec respect de la réduction des animations.

## Détails techniques
- Une évolution sécurisée de la base ajoutera les réglages du rail, les mots bloqués et l’état de filtrage des commentaires.
- Les commentaires publics continueront de passer par la fonction sécurisée existante et la vue sans adresse e-mail.
- Les règles d’accès resteront réservées aux administrateurs/modérateurs pour la modération et publiques uniquement pour les contenus autorisés.

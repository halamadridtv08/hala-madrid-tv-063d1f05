# Centre de match enrichi et Analytics mobile

## Objectif
Rendre la saisie d’événements de match plus rapide et complète, puis rendre toute la page Analytics exploitable sans débordement depuis un téléphone.

## Centre de match
- Ajouter **Coup franc** aux types de but, avec son libellé distinct dans la timeline publique et le formulaire complet.
- Conserver son comportement de but normal : mise à jour du score, statistiques du buteur et du passeur, journal et annulation.
- Étendre les actions express avec deux familles compactes :
  - moments de jeu : **Occasion**, **Corner**, **Faute**, **Blessure** ;
  - arbitrage : **VAR**, **Penalty manqué**, **Deuxième jaune**.
- Adapter le formulaire selon l’action : choix de l’équipe, joueur facultatif ou requis selon le cas, nom libre pour l’adversaire et description courte lorsque nécessaire.
- Publier ces actions dans la timeline sans modifier le score, sauf les véritables buts ; le deuxième jaune mettra à jour les cartons du joueur et restera annulable depuis le journal.
- Réorganiser les sélecteurs d’actions pour qu’ils restent lisibles et rapides sur ordinateur comme sur téléphone.

## Analytics sur téléphone
- Supprimer le débordement horizontal global observé sur la capture.
- Transformer l’en-tête en commandes empilées et accessibles : période, actualisation et export restent utilisables sans être coupés.
- Rendre les cinq onglets balayables horizontalement avec une largeur adaptée au contenu.
- Passer les indicateurs à une colonne sur les téléphones étroits, puis deux colonnes lorsque l’espace le permet.
- Donner aux graphiques une hauteur, des marges et des libellés adaptés au mobile ; condenser les sept jours et stabiliser les cartes circulaires.
- Rendre les tableaux lisibles sans élargir la page : priorité aux colonnes essentielles sur mobile, détails conservés sur écran large.
- Garder la carte horaire scrollable dans son propre cadre avec une indication visuelle, sans faire défiler toute la page horizontalement.
- Ajuster les cartes de géographie, appareils, navigateurs, temps réel et entrées/sorties pour les petits écrans.

## Vérification
- Vérifier le typage du projet.
- Tester le centre de match et les cinq vues Analytics à largeur téléphone, tablette et ordinateur.
- Contrôler spécifiquement l’absence de débordement horizontal et la visibilité de tous les boutons principaux.

## Détails techniques
- Aucun changement de base de données n’est nécessaire : les événements utilisent le champ texte existant `entry_type`.
- Les types seront alignés entre la saisie admin et l’affichage public afin d’éviter les libellés bruts ou incohérents.
- Les captures fournies servent uniquement de référence pour reproduire et corriger les problèmes d’ergonomie.

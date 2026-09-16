# Repositionner les stories sous la barre de match

## Résultat attendu
- Afficher les cercles de stories immédiatement sous la barre de match, sans chevauchement.
- Garder les stories au début de la page, mais pas fixées à l’écran : elles disparaissent normalement quand le visiteur fait défiler la page.
- Conserver l’affichage sans fond, le premier cercle prioritaire et la petite flèche qui déploie les autres stories.

## Mise en œuvre
1. Retirer le positionnement fixe du rail de stories.
2. L’insérer dans un conteneur placé juste après la barre de match et avant le contenu principal.
3. Préserver l’ouverture du lecteur, le suivi des stories vues et le préchargement existants.
4. Vérifier sur ordinateur et mobile que la barre et les stories ne se chevauchent pas, puis que les stories quittent bien l’écran au défilement.

## Détails techniques
- Le changement reste limité à la présentation de la page d’accueil et du rail de stories.
- Aucune modification des données, de l’expiration ou de l’administration des stories.

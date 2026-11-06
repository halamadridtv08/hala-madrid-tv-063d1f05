# Roadmap

## Terminé
- [x] Bouton admin pour arrêter/reprendre la synchro Flashscore (interrupteur dans le panneau Import, testé : zéro appel Apify quand arrêté)
- [x] Bascule automatique entre deux comptes Apify (code en place : compte principal puis compte de secours en cas de crédits épuisés)
- [x] FotMob : import des effectifs des équipes ADVERSes (jamais le Real Madrid) + classement LaLiga depuis le panneau admin
- [x] Page Stats : classement, matchs en direct et résultats lus depuis la base du site (ne dépend plus du compte API-Football suspendu)

## En attente
- [ ] Clé API du second compte Apify à enregistrer (APIFY_API_KEY_BACKUP) — demandée à l'utilisateur
- [ ] L'admin doit cliquer une fois « Mettre à jour le classement » (onglet Classement) pour remplir le classement LaLiga
- [ ] Notes joueurs / Shotmap FotMob sur les pages de match (à faire plus tard)

## Contraintes validées par l'utilisateur
- Effectif Real Madrid : gestion manuelle uniquement, ne jamais importer/écraser via FotMob
- Flashscore : pouvoir l'arrêter depuis l'admin (consomme trop de crédits)
- Deux comptes Apify : bascule automatique possible

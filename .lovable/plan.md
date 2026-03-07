

## Corrections de responsivité — Gestion des Matchs (Admin)

D'après les captures d'écran et le code, voici les problèmes de dépassement sur mobile et les corrections à appliquer :

---

### Problèmes identifiés

1. **MatchJsonImporter** — Le titre "Importateur JSON de Match" et sa description débordent (visible sur la capture). Les boutons "Valider et Prévisualiser" + "Confirmer l'import" sont en ligne et dépassent l'écran.

2. **MatchTable** — Les boutons d'action (Sync API, Nouveau match) dans le header et les boutons par match (calendrier, éditer, supprimer) sont trop serrés. Le titre du match peut déborder.

3. **MatchImportHistory** — Les boutons "Annuler" + corbeille sont en ligne avec le titre du match, ce qui fonctionne mais pourrait être plus compact.

4. **MatchImportPreview** — La grille `grid-cols-2` pour les infos du match peut être trop serrée sur très petit écran.

---

### Corrections prévues

**Fichier 1 — `MatchJsonImporter.tsx`** :
- Titre et description : ajouter `break-words` et réduire la taille du titre sur mobile (`text-base sm:text-lg`)
- Boutons d'action (ligne 1038) : passer de `flex gap-2` à `flex flex-col sm:flex-row gap-2` pour empiler sur mobile
- Textarea : réduire `rows={15}` à `rows={8}` sur mobile ou utiliser une classe responsive
- Exemple JSON `<pre>` : ajouter `max-w-full overflow-x-auto text-[10px] sm:text-xs`

**Fichier 2 — `MatchTable.tsx`** :
- Déjà partiellement responsive (classes `sm:` présentes). Vérifier que le conteneur du score et des badges ne déborde pas avec `min-w-0` et `truncate` sur les noms d'équipe longs.

**Fichier 3 — `MatchImportPreview.tsx`** :
- Grille infos match : passer de `grid-cols-2` à `grid-cols-1 sm:grid-cols-2`
- Titre : réduire la taille sur mobile

**Fichier 4 — `MatchImportHistory.tsx`** :
- Layout de chaque entrée : empiler titre et boutons sur mobile avec `flex flex-col sm:flex-row`
- Boutons : réduire la taille sur mobile (`h-8 text-xs`)

Ces corrections sont purement CSS/Tailwind, sans changement de logique.


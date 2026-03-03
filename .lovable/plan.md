

## Audit des fonctionnalités et de la responsivité mobile de l'admin

Après analyse approfondie du code, voici les problèmes identifiés et les améliorations proposées, organisés par priorité.

---

### 1. Sections admin non responsives sur mobile

**MatchControlCenter** (1078 lignes) - Le composant le plus problématique :
- Utilise `grid grid-cols-1 lg:grid-cols-3` mais le panneau du minuteur et le formulaire d'entrée live blog sont très denses et débordent sur petit écran
- Les boutons "Coup d'envoi", "Mi-temps" etc. dans la grille `grid-cols-2` sont trop serrés sur mobile
- Le formulaire d'entrée utilise `grid grid-cols-2 md:grid-cols-4` qui compresse les selects sur mobile

**PlayerStatsManager** (708 lignes) :
- La grille des stats existantes utilise `grid grid-cols-4` sans breakpoint mobile → texte tronqué/illisible sur téléphone
- Le dialog d'édition utilise `grid grid-cols-2 md:grid-cols-3` mais avec 12 champs c'est très dense

**RichTextEditor** (407 lignes) :
- La barre d'outils avec ~15 boutons en `flex-wrap` fonctionne mais est confuse sur mobile, pas de regroupement logique
- Le code toolbar est dupliqué deux fois (lignes 251-295 et 321-365)

**MatchForm** :
- Le `<select>` natif (ligne 245-255) n'utilise pas le composant Radix `Select`, ce qui casse la cohérence visuelle et le thème dark mode
- Les boutons d'action `flex space-x-2` ne s'empilent pas sur mobile

**ArticleForm** :
- Les boutons "Upload" + input URL en `flex gap-3` débordent sur petit écran

### 2. Fonctionnalités qui ne marchent pas bien

**RichTextEditor** - Problème majeur :
- Utilise `document.execCommand()` qui est **déprécié** dans tous les navigateurs modernes
- Les prompts JavaScript natifs (`prompt()`, `alert()`) pour les liens/embeds sont une mauvaise UX, surtout sur mobile
- Le code de la toolbar est entièrement dupliqué (2x ~45 lignes identiques)

**MatchForm - Select natif** :
- Le champ "Statut" utilise un `<select>` HTML natif au lieu du composant Radix `Select`, ce qui ne respecte pas le dark mode

### 3. Plan d'amélioration recommandé

Je recommande de procéder par étapes, en commençant par les corrections les plus impactantes :

**Étape 1 - Responsivité des composants critiques :**
- `PlayerStatsManager` : passer la grille des stats de `grid-cols-4` à `grid-cols-2 sm:grid-cols-4`, et les labels existants en mode carte sur mobile
- `MatchControlCenter` : adapter le layout en colonnes empilées sur mobile, agrandir les zones tactiles des boutons
- `ArticleForm` : empiler les boutons Upload/Input sur mobile avec `flex-col sm:flex-row`
- `MatchForm` : remplacer le `<select>` natif par le composant Radix `Select`, empiler les boutons d'action sur mobile

**Étape 2 - Nettoyage du RichTextEditor :**
- Supprimer la duplication du code toolbar (factoriser en un sous-composant)
- Remplacer les `prompt()`/`alert()` par des modales Radix pour une meilleure UX mobile
- Note : `document.execCommand` est difficile à remplacer sans une réécriture majeure, mais il fonctionne encore

**Étape 3 - Améliorations générales :**
- Vérifier que tous les `DialogContent` admin ont `max-h-[90vh] overflow-y-auto` pour éviter le scroll impossible sur mobile
- S'assurer que les `TabsList` avec beaucoup d'onglets utilisent `overflow-x-auto` sur mobile

### Détails techniques

Les corrections cibleront principalement des changements CSS/Tailwind (breakpoints responsifs) et quelques refactorisations mineures de composants. Aucune modification de logique métier ou de base de données n'est nécessaire.

Fichiers à modifier :
- `src/components/admin/PlayerStatsManager.tsx` - grilles responsives
- `src/components/admin/MatchControlCenter.tsx` - layout mobile
- `src/components/admin/MatchForm.tsx` - remplacer select natif + responsivité
- `src/components/admin/ArticleForm.tsx` - empiler upload sur mobile
- `src/components/admin/RichTextEditor.tsx` - factoriser toolbar, modales


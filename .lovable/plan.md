
# Plan : Affichage correct des 2e cartons jaunes (Double Jaune → Rouge)

## Contexte du problème
Quand un joueur reçoit un 2e carton jaune dans un match (ce qui entraîne une expulsion), le système enregistre correctement le type `second_yellow` dans la base de données, mais les composants d'affichage ne le traitent pas correctement. L'icône attendue doit être un carton jaune partiellement visible derrière un carton rouge, comme montré dans l'image de référence.

## Fichiers à modifier

### 1. LiveBlogManager.tsx (Lignes 214-215)
**Problème** : Le `second_yellow` génère un `entry_type: 'red_card'` sans distinction visuelle.

**Solution** : Créer un nouveau `entry_type: 'second_yellow_card'` pour différencier ce cas.

```typescript
entry_type: data.card_type === 'yellow' ? 'yellow_card' : 
            data.card_type === 'second_yellow' ? 'second_yellow_card' : 'red_card',
title: data.card_type === 'yellow' ? 'CARTON JAUNE' : 
       data.card_type === 'second_yellow' ? 'DOUBLE JAUNE - EXPULSION' : 'CARTON ROUGE',
```

### 2. TacticalFormation.tsx
**Problème** : L'icône des cartons ne prend pas en compte le type `second_yellow`.

**Solution** : Ajouter un rendu conditionnel pour afficher l'icône "jaune + rouge" :

```tsx
// Dans PlayerEventIcons et PlayerOnPitch (environ lignes 248-258 et 405-410)
{cards.map((card, idx) => (
  <div key={`card-${idx}`} className="flex items-center gap-0.5">
    {card.card_type === 'second_yellow' || card.entry_type === 'second_yellow_card' ? (
      // Icône double jaune = rouge (jaune derrière, rouge devant)
      <div className="relative w-3 h-4">
        <div className="absolute w-2.5 h-3.5 rounded-sm shadow-md bg-yellow-400 left-0 top-0" />
        <div className="absolute w-2.5 h-3.5 rounded-sm shadow-md bg-red-600 left-1 top-0.5" />
      </div>
    ) : (
      <div className={`w-2.5 h-3.5 rounded-sm shadow-md ${
        card.entry_type === 'red_card' ? 'bg-red-600' : 'bg-yellow-400'
      }`} />
    )}
    {card.minute && (
      <span className="text-[8px] text-white font-bold bg-black/60 px-0.5 rounded">
        {card.minute}'
      </span>
    )}
  </div>
))}
```

### 3. MatchEvents.tsx 
**Problème** : Le composant `CardEvent` (ligne 404-438) affiche un simple carton sans distinction pour le 2e jaune.

**Solution** : Modifier le rendu du carton visuel :

```tsx
// Dans CardEvent (environ ligne 429-431)
{/* Carton visuel */}
{card.card_type === 'second_yellow' || card.type === 'second_yellow' ? (
  // Double jaune = rouge
  <div className="relative w-7 h-9">
    <div className="absolute w-6 h-8 rounded-sm shadow-md bg-yellow-400 left-0 top-0" />
    <div className="absolute w-6 h-8 rounded-sm shadow-md bg-red-600 left-1 top-1" />
  </div>
) : (
  <div className={`w-6 h-8 rounded-sm shadow-md ${isRed ? 'bg-red-600' : 'bg-yellow-400'}`} />
)}
```

### 4. LiveBlog.tsx (Composant public)
**Problème** : La fonction `getEntryIcon` ne gère pas le type `second_yellow_card`.

**Solution** : Ajouter le cas pour le double jaune :

```tsx
const getEntryIcon = (entryType: string, cardType?: string) => {
  if (entryType === 'second_yellow_card' || cardType === 'second_yellow') {
    // Icône double jaune = expulsion
    return (
      <div className="relative w-5 h-6">
        <div className="absolute w-4 h-5 rounded-sm bg-yellow-400 left-0 top-0" />
        <div className="absolute w-4 h-5 rounded-sm bg-red-600 left-1 top-0.5" />
      </div>
    );
  }
  // ... reste du switch
};
```

### 5. QuickActionBar.tsx
**Problème** : Il n'y a pas de bouton d'action rapide pour le 2e jaune.

**Solution** : Ajouter une action rapide dédiée :

```tsx
{ type: 'second_yellow', label: '2e Jaune', icon: Square, color: 'bg-orange-500 hover:bg-orange-600 text-white' },
```

## Résumé des changements

| Fichier | Modification |
|---------|-------------|
| `LiveBlogManager.tsx` | Créer `entry_type: 'second_yellow_card'` distinct |
| `TacticalFormation.tsx` | Afficher icône jaune+rouge pour `second_yellow` |
| `MatchEvents.tsx` | Afficher icône jaune+rouge pour `second_yellow` |
| `LiveBlog.tsx` | Ajouter icône dans `getEntryIcon()` |
| `QuickActionBar.tsx` | Ajouter bouton d'action rapide "2e Jaune" |

## Compatibilité
Les données existantes avec `card_type: 'second_yellow'` seront correctement affichées car la logique vérifie à la fois `entry_type` et `card_type`.

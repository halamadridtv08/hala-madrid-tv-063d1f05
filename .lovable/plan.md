
# Plan : Affichage des événements joueurs sur les compositions tactiques

## Problème identifié
Les icônes d'événements (buts, passes décisives, remplacements, cartons, homme du match) ne s'affichent pas sur les joueurs dans la section "Composition" car :

1. Le composant `TacticalFormation.tsx` cherche les événements dans `live_blog_entries` qui n'ont pas de `player_id` renseigné
2. Les vraies données d'événements sont stockées dans `match_details` du match (goals, substitutions, events.yellow_cards, etc.) avec des **noms de joueurs** (ex: `k_mbappe`, `a_schjelderup`)
3. La correspondance doit se faire **par nom de joueur** plutôt que par ID

## Solution proposée
Modifier `TacticalFormation.tsx` pour :
1. Extraire les événements depuis `matchData.match_details` au lieu de `live_blog_entries`
2. Utiliser le `playerNameMatcher` existant pour faire correspondre les noms de joueurs du JSON aux joueurs de la formation
3. Ajouter l'icône "Homme du Match" (étoile) basée sur la meilleure note parmi tous les joueurs

## Icônes à afficher selon l'image de référence

| Événement | Icône | Couleur |
|-----------|-------|---------|
| But | Ballon de foot | Blanc/noir |
| Passe décisive | Chaussure de foot | Vert |
| Remplacement (sortie) | Flèche rouge vers le bas | Rouge |
| Remplacement (entrée) | Flèche verte vers le haut | Vert |
| Carton jaune | Rectangle jaune | Jaune |
| Carton rouge | Rectangle rouge | Rouge |
| 2e jaune (expulsion) | Jaune + Rouge superposés | Jaune/Rouge |
| Homme du Match | Étoile | Bleu/Or |

## Modifications techniques

### Fichier : `src/components/matches/TacticalFormation.tsx`

**1. Ajouter l'extraction des événements depuis match_details**
```typescript
// Extraire les événements du match depuis matchData
const getMatchDetailsEvents = () => {
  const details = matchData?.match_details || matchData?.rawData?.match_details;
  if (!details) return { goals: [], substitutions: [], yellowCards: [], redCards: [], secondYellowCards: [] };
  
  return {
    goals: details.goals || details.raw?.goals || [],
    substitutions: details.substitutions || details.raw?.substitutions || [],
    yellowCards: details.events?.yellow_cards || details.raw?.events?.yellow_cards || [],
    redCards: details.events?.red_cards || details.raw?.events?.red_cards || [],
    secondYellowCards: details.events?.second_yellow_cards || details.raw?.events?.second_yellow_cards || []
  };
};
```

**2. Fonction de matching par nom de joueur**
```typescript
const normalizePlayerName = (name: string): string => {
  return name.toLowerCase()
    .replace(/_/g, ' ')
    .replace(/[áàâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/['-]/g, ' ')
    .trim();
};

const playerNameMatches = (eventPlayerName: string, formationPlayerName: string): boolean => {
  const normalized1 = normalizePlayerName(eventPlayerName);
  const normalized2 = normalizePlayerName(formationPlayerName);
  
  if (normalized1 === normalized2) return true;
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return true;
  
  // Vérifier le nom de famille
  const lastName1 = normalized1.split(' ').pop() || '';
  const lastName2 = normalized2.split(' ').pop() || '';
  return lastName1.length > 2 && lastName2.length > 2 && lastName1 === lastName2;
};
```

**3. Nouvelles fonctions pour trouver les événements d'un joueur**
```typescript
const getPlayerGoalsFromDetails = (playerName: string, team: string) => {
  const { goals } = getMatchDetailsEvents();
  return goals.filter(g => 
    playerNameMatches(g.scorer, playerName) && 
    (team === 'real_madrid' ? g.team === 'real_madrid' : g.team !== 'real_madrid')
  );
};

const getPlayerAssistsFromDetails = (playerName: string, team: string) => {
  const { goals } = getMatchDetailsEvents();
  return goals.filter(g => 
    g.assist && playerNameMatches(g.assist, playerName) &&
    (team === 'real_madrid' ? g.team === 'real_madrid' : g.team !== 'real_madrid')
  );
};

const getPlayerSubstitutionFromDetails = (playerName: string, team: string) => {
  const { substitutions } = getMatchDetailsEvents();
  return substitutions.find(s => 
    (playerNameMatches(s.out, playerName) || playerNameMatches(s.in, playerName)) &&
    (team === 'real_madrid' ? s.team === 'real_madrid' : s.team !== 'real_madrid')
  );
};

const getPlayerCardsFromDetails = (playerName: string, team: string) => {
  const { yellowCards, redCards, secondYellowCards } = getMatchDetailsEvents();
  const cards = [];
  
  yellowCards.filter(c => 
    playerNameMatches(c.player, playerName) &&
    (team === 'real_madrid' ? c.team === 'real_madrid' : c.team !== 'real_madrid')
  ).forEach(c => cards.push({ ...c, type: 'yellow' }));
  
  redCards.filter(c => 
    playerNameMatches(c.player, playerName) &&
    (team === 'real_madrid' ? c.team === 'real_madrid' : c.team !== 'real_madrid')
  ).forEach(c => cards.push({ ...c, type: 'red' }));
  
  secondYellowCards.filter(c => 
    playerNameMatches(c.player, playerName) &&
    (team === 'real_madrid' ? c.team === 'real_madrid' : c.team !== 'real_madrid')
  ).forEach(c => cards.push({ ...c, type: 'second_yellow' }));
  
  return cards;
};
```

**4. Fonction pour déterminer l'homme du match**
```typescript
const getManOfTheMatch = () => {
  let bestPlayer = null;
  let bestRating = 0;
  
  Object.values(formations).forEach(formation => {
    formation.players.forEach(player => {
      if (player.player_rating > bestRating) {
        bestRating = player.player_rating;
        bestPlayer = player;
      }
    });
  });
  
  return bestRating >= 8 ? bestPlayer : null; // Seulement si note >= 8
};
```

**5. Mise à jour du composant PlayerOnPitch pour utiliser les nouvelles fonctions**
- Remplacer les appels à `getPlayerGoals(player.player_id)` par `getPlayerGoalsFromDetails(player.player_name, isOpposing ? 'opposing' : 'real_madrid')`
- Idem pour assists, cards, substitutions
- Ajouter l'icône "Homme du Match" (étoile bleue/or)

**6. Nouvelles icônes SVG**
- **Chaussure de foot** pour les passes décisives (au lieu du cercle vert avec "A")
- **Étoile** pour l'homme du match

## Résumé des fichiers à modifier

| Fichier | Description |
|---------|-------------|
| `src/components/matches/TacticalFormation.tsx` | Logique de matching par nom + affichage des icônes depuis match_details |

## Comportement attendu après modification
- Les buteurs auront un ballon avec la minute à côté de leur photo
- Les passeurs décisifs auront une chaussure verte avec la minute
- Les joueurs remplacés auront une flèche rouge avec la minute de sortie
- Les joueurs entrés en jeu (remplaçants) auront une flèche verte avec la minute d'entrée
- Les joueurs avec cartons auront l'icône carton correspondante
- Le joueur avec la meilleure note (≥8) aura une étoile "Homme du Match"

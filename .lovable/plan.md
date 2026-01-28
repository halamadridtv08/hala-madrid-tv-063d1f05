
# Format JSON Mis à Jour pour les Événements de Match

## Résumé du problème
Le format JSON actuel ne supporte pas correctement les **2e cartons jaunes** (Double Jaune → Rouge). Quand un joueur reçoit 2 cartons jaunes, cela doit être affiché avec l'icône spéciale (jaune derrière + rouge devant).

## Format JSON Recommandé

Voici le format JSON complet et mis à jour que vous devez utiliser. La clé **`second_yellow_cards`** a été ajoutée dans `events` :

```json
{
  "score": {
    "benfica": 4,
    "real_madrid": 2
  },
  "possession": {
    "benfica": "36%",
    "real_madrid": "64%"
  },
  "cards": {
    "yellow": {
      "benfica": 2,
      "real_madrid": 5
    },
    "red": {
      "benfica": 0,
      "real_madrid": 2
    }
  },
  "goals": [
    {
      "minute": 30,
      "team": "real_madrid",
      "scorer": "k_mbappe"
    },
    {
      "minute": 36,
      "team": "benfica",
      "scorer": "a_schjelderup"
    },
    {
      "minute": "45+5",
      "team": "benfica",
      "scorer": "v_pavlidis",
      "assist": "a_schjelderup"
    },
    {
      "minute": 54,
      "team": "benfica",
      "scorer": "a_schjelderup"
    },
    {
      "minute": 58,
      "team": "real_madrid",
      "scorer": "k_mbappe",
      "assist": "arda_guler"
    },
    {
      "minute": "90+8",
      "team": "benfica",
      "scorer": "a_tubin"
    }
  ],
  "statistics": {
    "offsides": { "benfica": 1, "real_madrid": 0 },
    "corners": { "benfica": 6, "real_madrid": 5 },
    "shots": {
      "total": { "benfica": 22, "real_madrid": 16 },
      "on_target": { "benfica": 12, "real_madrid": 6 },
      "off_target": { "benfica": 3, "real_madrid": 5 },
      "blocked": { "benfica": 7, "real_madrid": 5 }
    },
    "goalkeeper_saves": { "benfica": 4, "real_madrid": 7 },
    "tackles": { "benfica": 23, "real_madrid": 15 },
    "passes": {
      "benfica": { "total": 296, "completed": 228, "accuracy": "77%" },
      "real_madrid": { "total": 513, "completed": 454, "accuracy": "89%" }
    },
    "fouls": { "benfica": 11, "real_madrid": 15 }
  },
  "substitutions": [
    { "minute": 55, "team": "real_madrid", "out": "e_camavinga", "in": "a_tchouameni" },
    { "minute": 55, "team": "real_madrid", "out": "rodrygo", "in": "f_mastantuono" },
    { "minute": 78, "team": "real_madrid", "out": "david_alaba", "in": "dean_huijsen" },
    { "minute": 79, "team": "real_madrid", "out": "jorge_cestero", "in": "a_carreras" },
    { "minute": 79, "team": "real_madrid", "out": "brahim_diaz", "in": "arda_guler" },
    { "minute": 83, "team": "benfica", "out": "e_barenechea", "in": "g_silva" },
    { "minute": 87, "team": "benfica", "out": "joao_rego", "in": "g_prestiani" }
  ],
  "events": {
    "yellow_cards": [
      { "minute": 3, "team": "real_madrid", "player": "a_tchouameni" },
      { "minute": 10, "team": "benfica", "player": "l_barreiro" },
      { "minute": "45+4", "team": "real_madrid", "player": "raul_asencio" },
      { "minute": 62, "team": "real_madrid", "player": "dean_huijsen" },
      { "minute": 66, "team": "real_madrid", "player": "a_carreras" },
      { "minute": 85, "team": "benfica", "player": "samuel_dahl" }
    ],
    "second_yellow_cards": [
      { "minute": "90+2", "team": "real_madrid", "player": "raul_asencio" },
      { "minute": "90+7", "team": "real_madrid", "player": "rodrygo" }
    ],
    "red_cards": []
  }
}
```

## Modifications Clés

| Section | Avant | Après |
|---------|-------|-------|
| `events.yellow_cards` | Contenait tous les cartons jaunes y compris les 2e | Contient **uniquement** les 1ers cartons jaunes |
| `events.second_yellow_cards` | N'existait pas | **Nouveau** - Contient les 2e cartons jaunes qui mènent à l'expulsion |
| `events.red_cards` | - | Réservé aux cartons rouges directs (pas suite à 2 jaunes) |

## Règles Importantes

1. **Premier carton jaune** → `events.yellow_cards`
2. **Deuxième carton jaune (= expulsion)** → `events.second_yellow_cards`
3. **Carton rouge direct** → `events.red_cards`
4. Un joueur avec 2e jaune ne doit **PAS** avoir son 2e carton dans `yellow_cards`

## Mise à jour du code nécessaire

Pour que ce nouveau format fonctionne, il faut modifier le parsing dans `MatchEvents.tsx` et `MatchJsonImporter.tsx` pour :
1. Lire `events.second_yellow_cards` 
2. Les afficher avec le type `second_yellow`

Voulez-vous que j'implémente ces modifications dans le code ?

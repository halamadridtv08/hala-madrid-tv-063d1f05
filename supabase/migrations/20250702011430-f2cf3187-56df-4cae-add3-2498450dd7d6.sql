
-- Ajouter des colonnes pour gérer l'ordre d'affichage des joueurs
ALTER TABLE players 
ADD COLUMN display_order INTEGER DEFAULT 0,
ADD COLUMN position_group_order INTEGER DEFAULT 0;

-- Créer un index pour optimiser les requêtes d'ordre
CREATE INDEX idx_players_display_order ON players(position_group_order, display_order);

-- Initialiser d'abord les groupes de position
UPDATE players 
SET position_group_order = CASE 
  WHEN position ILIKE '%gardien%' OR position ILIKE '%goalkeeper%' THEN 1
  WHEN position ILIKE '%défenseur%' OR position ILIKE '%defenseur%' OR position ILIKE '%arrière%' OR position ILIKE '%latéral%' OR position ILIKE '%lateral%' OR position ILIKE '%central%' OR position ILIKE '%defender%' THEN 2
  WHEN position ILIKE '%milieu%' OR position ILIKE '%midfielder%' OR position ILIKE '%centre%' OR position ILIKE '%médian%' OR position ILIKE '%median%' THEN 3
  WHEN position ILIKE '%attaquant%' OR position ILIKE '%ailier%' OR position ILIKE '%avant%' OR position ILIKE '%striker%' OR position ILIKE '%forward%' OR position ILIKE '%winger%' THEN 4
  ELSE 5
END;

-- Ensuite, initialiser l'ordre d'affichage avec une requête CTE
WITH player_order AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY position_group_order ORDER BY name) as new_display_order
  FROM players
)
UPDATE players 
SET display_order = player_order.new_display_order
FROM player_order 
WHERE players.id = player_order.id;

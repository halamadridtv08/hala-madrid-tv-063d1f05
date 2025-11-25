-- Table pour sauvegarder les templates de formation personnalisés
CREATE TABLE IF NOT EXISTS formation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  formation TEXT NOT NULL,
  description TEXT,
  positions JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS policies
ALTER TABLE formation_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view formation templates"
  ON formation_templates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage formation templates"
  ON formation_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_formation_templates_formation ON formation_templates(formation);
CREATE INDEX IF NOT EXISTS idx_formation_templates_is_default ON formation_templates(is_default);

-- Insérer les templates par défaut
INSERT INTO formation_templates (name, formation, description, positions, is_default) VALUES
('4-3-3 Classique', '4-3-3', 'Formation équilibrée avec 3 attaquants', '[
  {"position": "GK", "x": 50, "y": 90},
  {"position": "LB", "x": 20, "y": 75},
  {"position": "CB", "x": 40, "y": 75},
  {"position": "CB", "x": 60, "y": 75},
  {"position": "RB", "x": 80, "y": 75},
  {"position": "CM", "x": 35, "y": 55},
  {"position": "CM", "x": 50, "y": 50},
  {"position": "CM", "x": 65, "y": 55},
  {"position": "LW", "x": 25, "y": 25},
  {"position": "ST", "x": 50, "y": 20},
  {"position": "RW", "x": 75, "y": 25}
]'::jsonb, true),

('4-4-2 Classique', '4-4-2', 'Formation défensive avec 2 attaquants', '[
  {"position": "GK", "x": 50, "y": 90},
  {"position": "LB", "x": 20, "y": 75},
  {"position": "CB", "x": 40, "y": 75},
  {"position": "CB", "x": 60, "y": 75},
  {"position": "RB", "x": 80, "y": 75},
  {"position": "LM", "x": 20, "y": 50},
  {"position": "CM", "x": 40, "y": 50},
  {"position": "CM", "x": 60, "y": 50},
  {"position": "RM", "x": 80, "y": 50},
  {"position": "ST", "x": 40, "y": 20},
  {"position": "ST", "x": 60, "y": 20}
]'::jsonb, true),

('4-2-3-1', '4-2-3-1', 'Formation offensive avec un attaquant de pointe', '[
  {"position": "GK", "x": 50, "y": 90},
  {"position": "LB", "x": 20, "y": 75},
  {"position": "CB", "x": 40, "y": 75},
  {"position": "CB", "x": 60, "y": 75},
  {"position": "RB", "x": 80, "y": 75},
  {"position": "CDM", "x": 40, "y": 60},
  {"position": "CDM", "x": 60, "y": 60},
  {"position": "LM", "x": 25, "y": 40},
  {"position": "CAM", "x": 50, "y": 35},
  {"position": "RM", "x": 75, "y": 40},
  {"position": "ST", "x": 50, "y": 15}
]'::jsonb, true),

('3-5-2', '3-5-2', 'Formation avec 3 défenseurs centraux', '[
  {"position": "GK", "x": 50, "y": 90},
  {"position": "CB", "x": 30, "y": 75},
  {"position": "CB", "x": 50, "y": 75},
  {"position": "CB", "x": 70, "y": 75},
  {"position": "LWB", "x": 15, "y": 55},
  {"position": "CM", "x": 35, "y": 50},
  {"position": "CM", "x": 50, "y": 45},
  {"position": "CM", "x": 65, "y": 50},
  {"position": "RWB", "x": 85, "y": 55},
  {"position": "ST", "x": 40, "y": 20},
  {"position": "ST", "x": 60, "y": 20}
]'::jsonb, true),

('3-4-3', '3-4-3', 'Formation offensive avec 3 attaquants', '[
  {"position": "GK", "x": 50, "y": 90},
  {"position": "CB", "x": 30, "y": 75},
  {"position": "CB", "x": 50, "y": 75},
  {"position": "CB", "x": 70, "y": 75},
  {"position": "LM", "x": 20, "y": 55},
  {"position": "CM", "x": 40, "y": 50},
  {"position": "CM", "x": 60, "y": 50},
  {"position": "RM", "x": 80, "y": 55},
  {"position": "LW", "x": 25, "y": 25},
  {"position": "ST", "x": 50, "y": 20},
  {"position": "RW", "x": 75, "y": 25}
]'::jsonb, true),

('4-1-4-1', '4-1-4-1', 'Formation avec un milieu défensif et un attaquant', '[
  {"position": "GK", "x": 50, "y": 90},
  {"position": "LB", "x": 20, "y": 75},
  {"position": "CB", "x": 40, "y": 75},
  {"position": "CB", "x": 60, "y": 75},
  {"position": "RB", "x": 80, "y": 75},
  {"position": "CDM", "x": 50, "y": 60},
  {"position": "LM", "x": 20, "y": 45},
  {"position": "CM", "x": 40, "y": 40},
  {"position": "CM", "x": 60, "y": 40},
  {"position": "RM", "x": 80, "y": 45},
  {"position": "ST", "x": 50, "y": 15}
]'::jsonb, true),

('5-3-2', '5-3-2', 'Formation ultra-défensive', '[
  {"position": "GK", "x": 50, "y": 90},
  {"position": "LWB", "x": 15, "y": 75},
  {"position": "CB", "x": 30, "y": 75},
  {"position": "CB", "x": 50, "y": 75},
  {"position": "CB", "x": 70, "y": 75},
  {"position": "RWB", "x": 85, "y": 75},
  {"position": "CM", "x": 35, "y": 50},
  {"position": "CM", "x": 50, "y": 45},
  {"position": "CM", "x": 65, "y": 50},
  {"position": "ST", "x": 40, "y": 20},
  {"position": "ST", "x": 60, "y": 20}
]'::jsonb, true),

('4-3-2-1', '4-3-2-1', 'Formation en sapin de Noël', '[
  {"position": "GK", "x": 50, "y": 90},
  {"position": "LB", "x": 20, "y": 75},
  {"position": "CB", "x": 40, "y": 75},
  {"position": "CB", "x": 60, "y": 75},
  {"position": "RB", "x": 80, "y": 75},
  {"position": "CDM", "x": 50, "y": 60},
  {"position": "CM", "x": 35, "y": 50},
  {"position": "CM", "x": 65, "y": 50},
  {"position": "CAM", "x": 35, "y": 30},
  {"position": "CAM", "x": 65, "y": 30},
  {"position": "ST", "x": 50, "y": 15}
]'::jsonb, true),

('5-4-1', '5-4-1', 'Formation défensive avec un seul attaquant', '[
  {"position": "GK", "x": 50, "y": 90},
  {"position": "LWB", "x": 15, "y": 75},
  {"position": "CB", "x": 30, "y": 75},
  {"position": "CB", "x": 50, "y": 75},
  {"position": "CB", "x": 70, "y": 75},
  {"position": "RWB", "x": 85, "y": 75},
  {"position": "LM", "x": 25, "y": 50},
  {"position": "CM", "x": 40, "y": 50},
  {"position": "CM", "x": 60, "y": 50},
  {"position": "RM", "x": 75, "y": 50},
  {"position": "ST", "x": 50, "y": 15}
]'::jsonb, true),

('3-4-2-1', '3-4-2-1', 'Formation offensive avec 3 défenseurs', '[
  {"position": "GK", "x": 50, "y": 90},
  {"position": "CB", "x": 30, "y": 75},
  {"position": "CB", "x": 50, "y": 75},
  {"position": "CB", "x": 70, "y": 75},
  {"position": "LM", "x": 20, "y": 55},
  {"position": "CM", "x": 40, "y": 50},
  {"position": "CM", "x": 60, "y": 50},
  {"position": "RM", "x": 80, "y": 55},
  {"position": "CAM", "x": 35, "y": 30},
  {"position": "CAM", "x": 65, "y": 30},
  {"position": "ST", "x": 50, "y": 15}
]'::jsonb, true),

('4-1-2-1-2', '4-1-2-1-2', 'Formation en diamant', '[
  {"position": "GK", "x": 50, "y": 90},
  {"position": "LB", "x": 20, "y": 75},
  {"position": "CB", "x": 40, "y": 75},
  {"position": "CB", "x": 60, "y": 75},
  {"position": "RB", "x": 80, "y": 75},
  {"position": "CDM", "x": 50, "y": 60},
  {"position": "CM", "x": 35, "y": 45},
  {"position": "CM", "x": 65, "y": 45},
  {"position": "CAM", "x": 50, "y": 30},
  {"position": "ST", "x": 40, "y": 15},
  {"position": "ST", "x": 60, "y": 15}
]'::jsonb, true);
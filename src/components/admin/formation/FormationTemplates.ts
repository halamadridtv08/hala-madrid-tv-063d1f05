export interface FormationTemplate {
  name: string;
  formation: string;
  positions: {
    position: string;
    x: number;
    y: number;
  }[];
}

export const FORMATION_TEMPLATES: FormationTemplate[] = [
  {
    name: "4-3-3",
    formation: "4-3-3",
    positions: [
      // Gardien
      { position: "GK", x: 50, y: 90 },
      // Défense
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      // Milieu
      { position: "CM", x: 35, y: 55 },
      { position: "CM", x: 50, y: 50 },
      { position: "CM", x: 65, y: 55 },
      // Attaque
      { position: "LW", x: 25, y: 25 },
      { position: "ST", x: 50, y: 20 },
      { position: "RW", x: 75, y: 25 },
    ]
  },
  {
    name: "4-4-2",
    formation: "4-4-2",
    positions: [
      // Gardien
      { position: "GK", x: 50, y: 90 },
      // Défense
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      // Milieu
      { position: "LM", x: 20, y: 50 },
      { position: "CM", x: 40, y: 50 },
      { position: "CM", x: 60, y: 50 },
      { position: "RM", x: 80, y: 50 },
      // Attaque
      { position: "ST", x: 40, y: 20 },
      { position: "ST", x: 60, y: 20 },
    ]
  },
  {
    name: "3-5-2",
    formation: "3-5-2",
    positions: [
      // Gardien
      { position: "GK", x: 50, y: 90 },
      // Défense
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      // Milieu
      { position: "LWB", x: 15, y: 55 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 50, y: 45 },
      { position: "CM", x: 65, y: 50 },
      { position: "RWB", x: 85, y: 55 },
      // Attaque
      { position: "ST", x: 40, y: 20 },
      { position: "ST", x: 60, y: 20 },
    ]
  },
  {
    name: "4-2-3-1",
    formation: "4-2-3-1",
    positions: [
      // Gardien
      { position: "GK", x: 50, y: 90 },
      // Défense
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      // Milieu défensif
      { position: "CDM", x: 40, y: 60 },
      { position: "CDM", x: 60, y: 60 },
      // Milieu offensif
      { position: "LM", x: 25, y: 40 },
      { position: "CAM", x: 50, y: 35 },
      { position: "RM", x: 75, y: 40 },
      // Attaque
      { position: "ST", x: 50, y: 15 },
    ]
  },
  {
    name: "3-4-3",
    formation: "3-4-3",
    positions: [
      // Gardien
      { position: "GK", x: 50, y: 90 },
      // Défense
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      // Milieu
      { position: "LM", x: 20, y: 55 },
      { position: "CM", x: 40, y: 50 },
      { position: "CM", x: 60, y: 50 },
      { position: "RM", x: 80, y: 55 },
      // Attaque
      { position: "LW", x: 25, y: 25 },
      { position: "ST", x: 50, y: 20 },
      { position: "RW", x: 75, y: 25 },
    ]
  },
];

// Fonction pour snapper sur une grille magnétique
export const snapToGrid = (x: number, y: number, gridSize: number = 5): { x: number; y: number } => {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
};

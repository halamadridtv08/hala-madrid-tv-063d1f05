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
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "CM", x: 35, y: 55 },
      { position: "CM", x: 50, y: 50 },
      { position: "CM", x: 65, y: 55 },
      { position: "LW", x: 25, y: 25 },
      { position: "ST", x: 50, y: 20 },
      { position: "RW", x: 75, y: 25 },
    ]
  },
  {
    name: "4-4-2",
    formation: "4-4-2",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "LM", x: 20, y: 50 },
      { position: "CM", x: 40, y: 50 },
      { position: "CM", x: 60, y: 50 },
      { position: "RM", x: 80, y: 50 },
      { position: "ST", x: 40, y: 20 },
      { position: "ST", x: 60, y: 20 },
    ]
  },
  {
    name: "3-5-2",
    formation: "3-5-2",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "LWB", x: 15, y: 55 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 50, y: 45 },
      { position: "CM", x: 65, y: 50 },
      { position: "RWB", x: 85, y: 55 },
      { position: "ST", x: 40, y: 20 },
      { position: "ST", x: 60, y: 20 },
    ]
  },
  {
    name: "4-2-3-1",
    formation: "4-2-3-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "CDM", x: 40, y: 60 },
      { position: "CDM", x: 60, y: 60 },
      { position: "LM", x: 25, y: 40 },
      { position: "CAM", x: 50, y: 35 },
      { position: "RM", x: 75, y: 40 },
      { position: "ST", x: 50, y: 15 },
    ]
  },
  {
    name: "3-4-3",
    formation: "3-4-3",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "LM", x: 20, y: 55 },
      { position: "CM", x: 40, y: 50 },
      { position: "CM", x: 60, y: 50 },
      { position: "RM", x: 80, y: 55 },
      { position: "LW", x: 25, y: 25 },
      { position: "ST", x: 50, y: 20 },
      { position: "RW", x: 75, y: 25 },
    ]
  },
  {
    name: "4-1-4-1",
    formation: "4-1-4-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "CDM", x: 50, y: 60 },
      { position: "LM", x: 20, y: 45 },
      { position: "CM", x: 40, y: 40 },
      { position: "CM", x: 60, y: 40 },
      { position: "RM", x: 80, y: 45 },
      { position: "ST", x: 50, y: 15 },
    ]
  },
  {
    name: "5-3-2",
    formation: "5-3-2",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LWB", x: 15, y: 75 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "RWB", x: 85, y: 75 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 50, y: 45 },
      { position: "CM", x: 65, y: 50 },
      { position: "ST", x: 40, y: 20 },
      { position: "ST", x: 60, y: 20 },
    ]
  },
  {
    name: "4-3-2-1",
    formation: "4-3-2-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "CDM", x: 50, y: 60 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 65, y: 50 },
      { position: "CAM", x: 35, y: 30 },
      { position: "CAM", x: 65, y: 30 },
      { position: "ST", x: 50, y: 15 },
    ]
  },
  {
    name: "5-4-1",
    formation: "5-4-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LWB", x: 15, y: 75 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "RWB", x: 85, y: 75 },
      { position: "LM", x: 25, y: 50 },
      { position: "CM", x: 40, y: 50 },
      { position: "CM", x: 60, y: 50 },
      { position: "RM", x: 75, y: 50 },
      { position: "ST", x: 50, y: 15 },
    ]
  },
  {
    name: "3-4-2-1",
    formation: "3-4-2-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "LM", x: 20, y: 55 },
      { position: "CM", x: 40, y: 50 },
      { position: "CM", x: 60, y: 50 },
      { position: "RM", x: 80, y: 55 },
      { position: "CAM", x: 35, y: 30 },
      { position: "CAM", x: 65, y: 30 },
      { position: "ST", x: 50, y: 15 },
    ]
  },
  {
    name: "4-1-2-1-2",
    formation: "4-1-2-1-2",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "CDM", x: 50, y: 60 },
      { position: "CM", x: 35, y: 45 },
      { position: "CM", x: 65, y: 45 },
      { position: "CAM", x: 50, y: 30 },
      { position: "ST", x: 40, y: 15 },
      { position: "ST", x: 60, y: 15 },
    ]
  },
  {
    name: "4-5-1",
    formation: "4-5-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "LM", x: 20, y: 50 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 50, y: 50 },
      { position: "CM", x: 65, y: 50 },
      { position: "RM", x: 80, y: 50 },
      { position: "ST", x: 50, y: 15 },
    ]
  },
  {
    name: "3-2-4-1",
    formation: "3-2-4-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "CDM", x: 40, y: 60 },
      { position: "CDM", x: 60, y: 60 },
      { position: "LM", x: 15, y: 40 },
      { position: "CM", x: 40, y: 40 },
      { position: "CM", x: 60, y: 40 },
      { position: "RM", x: 85, y: 40 },
      { position: "ST", x: 50, y: 15 },
    ]
  },
  {
    name: "3-3-4",
    formation: "3-3-4",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "CM", x: 30, y: 50 },
      { position: "CM", x: 50, y: 50 },
      { position: "CM", x: 70, y: 50 },
      { position: "LW", x: 15, y: 25 },
      { position: "ST", x: 40, y: 20 },
      { position: "ST", x: 60, y: 20 },
      { position: "RW", x: 85, y: 25 },
    ]
  },
  {
    name: "3-3-3",
    formation: "3-3-3",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "CB", x: 25, y: 70 },
      { position: "CB", x: 50, y: 70 },
      { position: "CB", x: 75, y: 70 },
      { position: "CM", x: 25, y: 45 },
      { position: "CM", x: 50, y: 45 },
      { position: "CM", x: 75, y: 45 },
      { position: "LW", x: 25, y: 20 },
      { position: "ST", x: 50, y: 20 },
      { position: "RW", x: 75, y: 20 },
    ]
  },
  {
    name: "5-3-1",
    formation: "5-3-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LWB", x: 10, y: 75 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "RWB", x: 90, y: 75 },
      { position: "CM", x: 30, y: 50 },
      { position: "CM", x: 50, y: 50 },
      { position: "CM", x: 70, y: 50 },
      { position: "ST", x: 50, y: 20 },
    ]
  },
  {
    name: "3-4-1-2",
    formation: "3-4-1-2",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "LM", x: 15, y: 50 },
      { position: "CM", x: 40, y: 55 },
      { position: "CM", x: 60, y: 55 },
      { position: "RM", x: 85, y: 50 },
      { position: "CAM", x: 50, y: 35 },
      { position: "ST", x: 35, y: 20 },
      { position: "ST", x: 65, y: 20 },
    ]
  },
  {
    name: "4-3-1-2",
    formation: "4-3-1-2",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "CM", x: 30, y: 55 },
      { position: "CM", x: 50, y: 55 },
      { position: "CM", x: 70, y: 55 },
      { position: "CAM", x: 50, y: 35 },
      { position: "ST", x: 35, y: 20 },
      { position: "ST", x: 65, y: 20 },
    ]
  },
  {
    name: "5-2-3",
    formation: "5-2-3",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LWB", x: 10, y: 75 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "RWB", x: 90, y: 75 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 65, y: 50 },
      { position: "LW", x: 25, y: 25 },
      { position: "ST", x: 50, y: 20 },
      { position: "RW", x: 75, y: 25 },
    ]
  },
  {
    name: "5-2-2-1",
    formation: "5-2-2-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LWB", x: 10, y: 75 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "RWB", x: 90, y: 75 },
      { position: "CM", x: 35, y: 55 },
      { position: "CM", x: 65, y: 55 },
      { position: "CAM", x: 30, y: 35 },
      { position: "CAM", x: 70, y: 35 },
      { position: "ST", x: 50, y: 18 },
    ]
  },
  {
    name: "4-2-1-3",
    formation: "4-2-1-3",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "CDM", x: 35, y: 55 },
      { position: "CDM", x: 65, y: 55 },
      { position: "CAM", x: 50, y: 40 },
      { position: "LW", x: 25, y: 22 },
      { position: "ST", x: 50, y: 18 },
      { position: "RW", x: 75, y: 22 },
    ]
  },
  {
    name: "4-1-2-3",
    formation: "4-1-2-3",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "CDM", x: 50, y: 60 },
      { position: "CM", x: 35, y: 45 },
      { position: "CM", x: 65, y: 45 },
      { position: "LW", x: 25, y: 22 },
      { position: "ST", x: 50, y: 18 },
      { position: "RW", x: 75, y: 22 },
    ]
  },
  {
    name: "3-1-4-2",
    formation: "3-1-4-2",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "CDM", x: 50, y: 60 },
      { position: "LM", x: 15, y: 45 },
      { position: "CM", x: 40, y: 45 },
      { position: "CM", x: 60, y: 45 },
      { position: "RM", x: 85, y: 45 },
      { position: "ST", x: 35, y: 20 },
      { position: "ST", x: 65, y: 20 },
    ]
  },
  {
    name: "4-4-1-1",
    formation: "4-4-1-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "LM", x: 20, y: 50 },
      { position: "CM", x: 40, y: 50 },
      { position: "CM", x: 60, y: 50 },
      { position: "RM", x: 80, y: 50 },
      { position: "CAM", x: 50, y: 32 },
      { position: "ST", x: 50, y: 18 },
    ]
  },
  {
    name: "4-2-2-2",
    formation: "4-2-2-2",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "CDM", x: 35, y: 55 },
      { position: "CDM", x: 65, y: 55 },
      { position: "CAM", x: 35, y: 35 },
      { position: "CAM", x: 65, y: 35 },
      { position: "ST", x: 35, y: 18 },
      { position: "ST", x: 65, y: 18 },
    ]
  },
  {
    name: "3-3-3-1",
    formation: "3-3-3-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "CB", x: 30, y: 72 },
      { position: "CB", x: 50, y: 72 },
      { position: "CB", x: 70, y: 72 },
      { position: "CM", x: 30, y: 52 },
      { position: "CM", x: 50, y: 52 },
      { position: "CM", x: 70, y: 52 },
      { position: "LW", x: 25, y: 32 },
      { position: "CAM", x: 50, y: 32 },
      { position: "RW", x: 75, y: 32 },
      { position: "ST", x: 50, y: 15 },
    ]
  },
  {
    name: "5-3-1-1",
    formation: "5-3-1-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LWB", x: 10, y: 75 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "RWB", x: 90, y: 75 },
      { position: "CM", x: 30, y: 50 },
      { position: "CM", x: 50, y: 50 },
      { position: "CM", x: 70, y: 50 },
      { position: "CAM", x: 50, y: 32 },
      { position: "ST", x: 50, y: 18 },
    ]
  },
  {
    name: "3-3-2-2",
    formation: "3-3-2-2",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "CM", x: 30, y: 55 },
      { position: "CM", x: 50, y: 55 },
      { position: "CM", x: 70, y: 55 },
      { position: "CAM", x: 35, y: 35 },
      { position: "CAM", x: 65, y: 35 },
      { position: "ST", x: 35, y: 18 },
      { position: "ST", x: 65, y: 18 },
    ]
  },
  {
    name: "3-5-1-1",
    formation: "3-5-1-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "CB", x: 30, y: 75 },
      { position: "CB", x: 50, y: 75 },
      { position: "CB", x: 70, y: 75 },
      { position: "LM", x: 15, y: 50 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 50, y: 50 },
      { position: "CM", x: 65, y: 50 },
      { position: "RM", x: 85, y: 50 },
      { position: "CAM", x: 50, y: 30 },
      { position: "ST", x: 50, y: 15 },
    ]
  },
  {
    name: "4-1-2-2-1",
    formation: "4-1-2-2-1",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "CDM", x: 50, y: 60 },
      { position: "CM", x: 35, y: 48 },
      { position: "CM", x: 65, y: 48 },
      { position: "CAM", x: 35, y: 32 },
      { position: "CAM", x: 65, y: 32 },
      { position: "ST", x: 50, y: 15 },
    ]
  },
  {
    name: "4-2-4",
    formation: "4-2-4",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "LB", x: 20, y: 75 },
      { position: "CB", x: 40, y: 75 },
      { position: "CB", x: 60, y: 75 },
      { position: "RB", x: 80, y: 75 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 65, y: 50 },
      { position: "LW", x: 15, y: 25 },
      { position: "ST", x: 40, y: 20 },
      { position: "ST", x: 60, y: 20 },
      { position: "RW", x: 85, y: 25 },
    ]
  },
  {
    name: "2-3-2-3",
    formation: "2-3-2-3",
    positions: [
      { position: "GK", x: 50, y: 90 },
      { position: "CB", x: 35, y: 75 },
      { position: "CB", x: 65, y: 75 },
      { position: "CM", x: 25, y: 55 },
      { position: "CM", x: 50, y: 55 },
      { position: "CM", x: 75, y: 55 },
      { position: "CAM", x: 35, y: 38 },
      { position: "CAM", x: 65, y: 38 },
      { position: "LW", x: 25, y: 20 },
      { position: "ST", x: 50, y: 15 },
      { position: "RW", x: 75, y: 20 },
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

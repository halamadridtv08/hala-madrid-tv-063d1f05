export interface FormationPosition {
  x: number; // Position X en pourcentage (0-100)
  y: number; // Position Y en pourcentage (0-100)
}

export interface FormationPlayerData {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number;
  imageUrl?: string;
  rating: number;
  isStarter: boolean;
}

export interface FormationLayout {
  name: string;
  positions: FormationPosition[];
  description: string;
}

export const FORMATIONS: Record<string, FormationLayout> = {
  "4-3-3": {
    name: "4-3-3",
    description: "Formation classique offensive",
    positions: [
      // Gardien
      { x: 50, y: 90 },
      // Défenseurs
      { x: 20, y: 75 },
      { x: 40, y: 75 },
      { x: 60, y: 75 },
      { x: 80, y: 75 },
      // Milieux
      { x: 30, y: 50 },
      { x: 50, y: 50 },
      { x: 70, y: 50 },
      // Attaquants
      { x: 25, y: 25 },
      { x: 50, y: 20 },
      { x: 75, y: 25 }
    ]
  },
  "4-4-2": {
    name: "4-4-2",
    description: "Formation équilibrée classique",
    positions: [
      // Gardien
      { x: 50, y: 90 },
      // Défenseurs
      { x: 20, y: 75 },
      { x: 40, y: 75 },
      { x: 60, y: 75 },
      { x: 80, y: 75 },
      // Milieux
      { x: 20, y: 50 },
      { x: 40, y: 50 },
      { x: 60, y: 50 },
      { x: 80, y: 50 },
      // Attaquants
      { x: 40, y: 25 },
      { x: 60, y: 25 }
    ]
  },
  "4-2-3-1": {
    name: "4-2-3-1",
    description: "Formation moderne avec milieu offensif",
    positions: [
      // Gardien
      { x: 50, y: 90 },
      // Défenseurs
      { x: 20, y: 75 },
      { x: 40, y: 75 },
      { x: 60, y: 75 },
      { x: 80, y: 75 },
      // Milieux défensifs
      { x: 35, y: 60 },
      { x: 65, y: 60 },
      // Milieux offensifs
      { x: 25, y: 40 },
      { x: 50, y: 35 },
      { x: 75, y: 40 },
      // Attaquant
      { x: 50, y: 20 }
    ]
  },
  "3-5-2": {
    name: "3-5-2",
    description: "Formation avec 3 défenseurs centraux",
    positions: [
      // Gardien
      { x: 50, y: 90 },
      // Défenseurs
      { x: 30, y: 75 },
      { x: 50, y: 75 },
      { x: 70, y: 75 },
      // Milieux
      { x: 15, y: 50 },
      { x: 35, y: 55 },
      { x: 50, y: 50 },
      { x: 65, y: 55 },
      { x: 85, y: 50 },
      // Attaquants
      { x: 40, y: 25 },
      { x: 60, y: 25 }
    ]
  },
  "3-4-3": {
    name: "3-4-3",
    description: "Formation très offensive",
    positions: [
      // Gardien
      { x: 50, y: 90 },
      // Défenseurs
      { x: 30, y: 75 },
      { x: 50, y: 75 },
      { x: 70, y: 75 },
      // Milieux
      { x: 25, y: 50 },
      { x: 45, y: 50 },
      { x: 55, y: 50 },
      { x: 75, y: 50 },
      // Attaquants
      { x: 25, y: 25 },
      { x: 50, y: 20 },
      { x: 75, y: 25 }
    ]
  },
  "4-1-4-1": {
    name: "4-1-4-1",
    description: "Formation défensive avec sentinelle",
    positions: [
      // Gardien
      { x: 50, y: 90 },
      // Défenseurs
      { x: 20, y: 75 },
      { x: 40, y: 75 },
      { x: 60, y: 75 },
      { x: 80, y: 75 },
      // Milieu défensif
      { x: 50, y: 60 },
      // Milieux
      { x: 20, y: 45 },
      { x: 40, y: 45 },
      { x: 60, y: 45 },
      { x: 80, y: 45 },
      // Attaquant
      { x: 50, y: 20 }
    ]
  },
  "5-3-2": {
    name: "5-3-2",
    description: "Formation très défensive",
    positions: [
      // Gardien
      { x: 50, y: 90 },
      // Défenseurs
      { x: 15, y: 75 },
      { x: 32, y: 75 },
      { x: 50, y: 75 },
      { x: 68, y: 75 },
      { x: 85, y: 75 },
      // Milieux
      { x: 30, y: 50 },
      { x: 50, y: 50 },
      { x: 70, y: 50 },
      // Attaquants
      { x: 40, y: 25 },
      { x: 60, y: 25 }
    ]
  },
  "4-5-1": {
    name: "4-5-1",
    description: "Formation défensive avec un seul attaquant",
    positions: [
      // Gardien
      { x: 50, y: 90 },
      // Défenseurs
      { x: 20, y: 75 },
      { x: 40, y: 75 },
      { x: 60, y: 75 },
      { x: 80, y: 75 },
      // Milieux
      { x: 20, y: 50 },
      { x: 35, y: 50 },
      { x: 50, y: 50 },
      { x: 65, y: 50 },
      { x: 80, y: 50 },
      // Attaquant
      { x: 50, y: 20 }
    ]
  },
  "3-2-4-1": {
    name: "3-2-4-1",
    description: "Formation avec ailiers hauts",
    positions: [
      // Gardien
      { x: 50, y: 90 },
      // Défenseurs
      { x: 30, y: 75 },
      { x: 50, y: 75 },
      { x: 70, y: 75 },
      // Milieux défensifs
      { x: 40, y: 60 },
      { x: 60, y: 60 },
      // Milieux offensifs
      { x: 15, y: 40 },
      { x: 40, y: 40 },
      { x: 60, y: 40 },
      { x: 85, y: 40 },
      // Attaquant
      { x: 50, y: 20 }
    ]
  },
  "3-4-2-1": {
    name: "3-4-2-1",
    description: "Formation moderne avec deux meneurs",
    positions: [
      // Gardien
      { x: 50, y: 90 },
      // Défenseurs
      { x: 30, y: 75 },
      { x: 50, y: 75 },
      { x: 70, y: 75 },
      // Milieux
      { x: 20, y: 50 },
      { x: 40, y: 50 },
      { x: 60, y: 50 },
      { x: 80, y: 50 },
      // Milieux offensifs
      { x: 40, y: 30 },
      { x: 60, y: 30 },
      // Attaquant
      { x: 50, y: 15 }
    ]
  }
};

export const DEFAULT_PLAYERS: FormationPlayerData[] = [
  { id: "1", name: "Courtois", position: "GK", jerseyNumber: 1, rating: 8.5, isStarter: true },
  { id: "2", name: "Carvajal", position: "RB", jerseyNumber: 2, rating: 8.2, isStarter: true },
  { id: "3", name: "Militão", position: "CB", jerseyNumber: 3, rating: 8.0, isStarter: true },
  { id: "4", name: "Alaba", position: "CB", jerseyNumber: 4, rating: 8.1, isStarter: true },
  { id: "5", name: "Mendy", position: "LB", jerseyNumber: 23, rating: 7.8, isStarter: true },
  { id: "6", name: "Tchouaméni", position: "CDM", jerseyNumber: 18, rating: 8.0, isStarter: true },
  { id: "7", name: "Kroos", position: "CM", jerseyNumber: 8, rating: 8.5, isStarter: true },
  { id: "8", name: "Modrić", position: "CM", jerseyNumber: 10, rating: 8.3, isStarter: true },
  { id: "9", name: "Bellingham", position: "CAM", jerseyNumber: 5, rating: 8.4, isStarter: true },
  { id: "10", name: "Vinícius Jr.", position: "LW", jerseyNumber: 7, rating: 8.6, isStarter: true },
  { id: "11", name: "Mbappé", position: "ST", jerseyNumber: 9, rating: 9.0, isStarter: true }
];
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
      { x: 50, y: 90 },
      { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 },
      { x: 20, y: 50 }, { x: 40, y: 50 }, { x: 60, y: 50 }, { x: 80, y: 50 },
      { x: 40, y: 30 }, { x: 60, y: 30 },
      { x: 50, y: 15 }
    ]
  },
  "5-4-1": {
    name: "5-4-1",
    description: "Formation ultra défensive",
    positions: [
      { x: 50, y: 90 },
      { x: 10, y: 75 }, { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 }, { x: 90, y: 75 },
      { x: 20, y: 50 }, { x: 40, y: 50 }, { x: 60, y: 50 }, { x: 80, y: 50 },
      { x: 50, y: 20 }
    ]
  },
  "3-3-4": {
    name: "3-3-4",
    description: "Formation très offensive avec 4 attaquants",
    positions: [
      { x: 50, y: 90 },
      { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 },
      { x: 30, y: 50 }, { x: 50, y: 50 }, { x: 70, y: 50 },
      { x: 15, y: 25 }, { x: 40, y: 20 }, { x: 60, y: 20 }, { x: 85, y: 25 }
    ]
  },
  "3-3-3": {
    name: "3-3-3",
    description: "Formation équilibrée à 9 joueurs (youth)",
    positions: [
      { x: 50, y: 90 },
      { x: 25, y: 70 }, { x: 50, y: 70 }, { x: 75, y: 70 },
      { x: 25, y: 45 }, { x: 50, y: 45 }, { x: 75, y: 45 },
      { x: 25, y: 20 }, { x: 50, y: 20 }, { x: 75, y: 20 }
    ]
  },
  "5-3-1": {
    name: "5-3-1",
    description: "Formation défensive avec un attaquant",
    positions: [
      { x: 50, y: 90 },
      { x: 10, y: 75 }, { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 }, { x: 90, y: 75 },
      { x: 30, y: 50 }, { x: 50, y: 50 }, { x: 70, y: 50 },
      { x: 50, y: 20 }
    ]
  },
  "4-3-2-1": {
    name: "4-3-2-1",
    description: "Formation en arbre de Noël",
    positions: [
      { x: 50, y: 90 },
      { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 },
      { x: 30, y: 55 }, { x: 50, y: 55 }, { x: 70, y: 55 },
      { x: 35, y: 35 }, { x: 65, y: 35 },
      { x: 50, y: 18 }
    ]
  },
  "4-1-2-1-2": {
    name: "4-1-2-1-2",
    description: "Formation en diamant étroit",
    positions: [
      { x: 50, y: 90 },
      { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 },
      { x: 50, y: 60 },
      { x: 30, y: 45 }, { x: 70, y: 45 },
      { x: 50, y: 35 },
      { x: 35, y: 20 }, { x: 65, y: 20 }
    ]
  },
  "3-4-1-2": {
    name: "3-4-1-2",
    description: "Formation avec meneur de jeu",
    positions: [
      { x: 50, y: 90 },
      { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 },
      { x: 15, y: 50 }, { x: 40, y: 55 }, { x: 60, y: 55 }, { x: 85, y: 50 },
      { x: 50, y: 35 },
      { x: 35, y: 20 }, { x: 65, y: 20 }
    ]
  },
  "4-3-1-2": {
    name: "4-3-1-2",
    description: "Formation avec trequartista",
    positions: [
      { x: 50, y: 90 },
      { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 },
      { x: 30, y: 55 }, { x: 50, y: 55 }, { x: 70, y: 55 },
      { x: 50, y: 35 },
      { x: 35, y: 20 }, { x: 65, y: 20 }
    ]
  },
  "5-2-3": {
    name: "5-2-3",
    description: "Formation avec 3 attaquants et 5 défenseurs",
    positions: [
      { x: 50, y: 90 },
      { x: 10, y: 75 }, { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 }, { x: 90, y: 75 },
      { x: 35, y: 50 }, { x: 65, y: 50 },
      { x: 25, y: 25 }, { x: 50, y: 20 }, { x: 75, y: 25 }
    ]
  },
  "5-2-2-1": {
    name: "5-2-2-1",
    description: "Formation défensive avec support offensif",
    positions: [
      { x: 50, y: 90 },
      { x: 10, y: 75 }, { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 }, { x: 90, y: 75 },
      { x: 35, y: 55 }, { x: 65, y: 55 },
      { x: 30, y: 35 }, { x: 70, y: 35 },
      { x: 50, y: 18 }
    ]
  },
  "4-2-1-3": {
    name: "4-2-1-3",
    description: "Formation offensive avec meneur",
    positions: [
      { x: 50, y: 90 },
      { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 },
      { x: 35, y: 55 }, { x: 65, y: 55 },
      { x: 50, y: 40 },
      { x: 25, y: 22 }, { x: 50, y: 18 }, { x: 75, y: 22 }
    ]
  },
  "4-1-2-3": {
    name: "4-1-2-3",
    description: "Formation offensive avec sentinelle",
    positions: [
      { x: 50, y: 90 },
      { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 },
      { x: 50, y: 60 },
      { x: 35, y: 45 }, { x: 65, y: 45 },
      { x: 25, y: 22 }, { x: 50, y: 18 }, { x: 75, y: 22 }
    ]
  },
  "3-1-4-2": {
    name: "3-1-4-2",
    description: "Formation avec libéro devant la défense",
    positions: [
      { x: 50, y: 90 },
      { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 },
      { x: 50, y: 60 },
      { x: 15, y: 45 }, { x: 40, y: 45 }, { x: 60, y: 45 }, { x: 85, y: 45 },
      { x: 35, y: 20 }, { x: 65, y: 20 }
    ]
  },
  "4-4-1-1": {
    name: "4-4-1-1",
    description: "Formation avec second attaquant en retrait",
    positions: [
      { x: 50, y: 90 },
      { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 },
      { x: 20, y: 50 }, { x: 40, y: 50 }, { x: 60, y: 50 }, { x: 80, y: 50 },
      { x: 50, y: 32 },
      { x: 50, y: 18 }
    ]
  },
  "4-2-2-2": {
    name: "4-2-2-2",
    description: "Formation carrée en losange",
    positions: [
      { x: 50, y: 90 },
      { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 },
      { x: 35, y: 55 }, { x: 65, y: 55 },
      { x: 35, y: 35 }, { x: 65, y: 35 },
      { x: 35, y: 18 }, { x: 65, y: 18 }
    ]
  },
  "3-3-3-1": {
    name: "3-3-3-1",
    description: "Formation pyramidale",
    positions: [
      { x: 50, y: 90 },
      { x: 30, y: 72 }, { x: 50, y: 72 }, { x: 70, y: 72 },
      { x: 30, y: 52 }, { x: 50, y: 52 }, { x: 70, y: 52 },
      { x: 25, y: 32 }, { x: 50, y: 32 }, { x: 75, y: 32 },
      { x: 50, y: 15 }
    ]
  },
  "5-3-1-1": {
    name: "5-3-1-1",
    description: "Formation défensive avec support",
    positions: [
      { x: 50, y: 90 },
      { x: 10, y: 75 }, { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 }, { x: 90, y: 75 },
      { x: 30, y: 50 }, { x: 50, y: 50 }, { x: 70, y: 50 },
      { x: 50, y: 32 },
      { x: 50, y: 18 }
    ]
  },
  "3-3-2-2": {
    name: "3-3-2-2",
    description: "Formation avec deux paires offensives",
    positions: [
      { x: 50, y: 90 },
      { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 },
      { x: 30, y: 55 }, { x: 50, y: 55 }, { x: 70, y: 55 },
      { x: 35, y: 35 }, { x: 65, y: 35 },
      { x: 35, y: 18 }, { x: 65, y: 18 }
    ]
  },
  "3-5-1-1": {
    name: "3-5-1-1",
    description: "Formation avec milieu dense",
    positions: [
      { x: 50, y: 90 },
      { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 },
      { x: 15, y: 50 }, { x: 35, y: 50 }, { x: 50, y: 50 }, { x: 65, y: 50 }, { x: 85, y: 50 },
      { x: 50, y: 30 },
      { x: 50, y: 15 }
    ]
  },
  "4-1-2-2-1": {
    name: "4-1-2-2-1",
    description: "Formation complexe avec 5 lignes",
    positions: [
      { x: 50, y: 90 },
      { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 },
      { x: 50, y: 60 },
      { x: 35, y: 48 }, { x: 65, y: 48 },
      { x: 35, y: 32 }, { x: 65, y: 32 },
      { x: 50, y: 15 }
    ]
  },
  "4-2-4": {
    name: "4-2-4",
    description: "Formation offensive classique",
    positions: [
      { x: 50, y: 90 },
      { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 },
      { x: 35, y: 50 }, { x: 65, y: 50 },
      { x: 15, y: 25 }, { x: 40, y: 20 }, { x: 60, y: 20 }, { x: 85, y: 25 }
    ]
  },
  "2-3-2-3": {
    name: "2-3-2-3",
    description: "Formation ultra offensive rare",
    positions: [
      { x: 50, y: 90 },
      { x: 35, y: 75 }, { x: 65, y: 75 },
      { x: 25, y: 55 }, { x: 50, y: 55 }, { x: 75, y: 55 },
      { x: 35, y: 38 }, { x: 65, y: 38 },
      { x: 25, y: 20 }, { x: 50, y: 15 }, { x: 75, y: 20 }
    ]
  }
};

// Supprimé DEFAULT_PLAYERS car on utilise maintenant les vrais joueurs de la base de données
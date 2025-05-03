
export interface PlayerMatch {
  date: string;
  competition: string;
  opponent: string;
  minutes: string;
  cleanSheet?: boolean;
  goals?: number;
  assists?: number;
}

export interface PlayerCompetitionStats {
  competition: string;
  matches: number;
  cleanSheets?: number;
  goalsScored?: number;
  goalsConceded?: number;
  assists?: number;
}

export interface PlayerData {
  id: number;
  name: string;
  number: number;
  position: string;
  secondaryPosition?: string;
  nationality: string;
  birthDate: string;
  height: string;
  weight: string;
  bio: string;
  image?: string;
  stats: {
    matches: number;
    goals?: number;
    assists?: number;
    cleanSheets?: number;
    goalsConceded?: number;
    minutesPlayed: number;
  };
  competitionStats: PlayerCompetitionStats[];
  recentMatches: PlayerMatch[];
}

const playersData: Record<string, PlayerData> = {
  "1": {
    id: 1,
    name: "Thibaut Courtois",
    number: 1,
    position: "Gardien de but",
    nationality: "Belgique",
    birthDate: "1992-05-11",
    height: "2,00 m",
    weight: "96 kg",
    bio: "Formé au KRC Genk, Courtois s'est imposé à l'Atlético Madrid (2011–2014) avant de rejoindre le Real Madrid en 2018. Réputé pour ses arrêts réflexes, son jeu aérien et son calme.",
    image: "https://static.independent.co.uk/2024/01/30/11/AFP_34A2227.jpg",
    stats: {
      matches: 44,
      cleanSheets: 20,
      goalsConceded: 48,
      minutesPlayed: 3960
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 27,
        cleanSheets: 11,
        goalsConceded: 30
      },
      {
        competition: "Ligue des Champions",
        matches: 12,
        cleanSheets: 6,
        goalsConceded: 14
      },
      {
        competition: "Supercoupes",
        matches: 4,
        cleanSheets: 3,
        goalsConceded: 1
      },
      {
        competition: "Coupe du Roi",
        matches: 1,
        cleanSheets: 0,
        goalsConceded: 3
      }
    ],
    recentMatches: [
      {
        date: "2025-01-19",
        competition: "Liga",
        opponent: "Las Palmas",
        minutes: "90",
        cleanSheet: true
      },
      {
        date: "2025-01-22",
        competition: "Ligue des Champions",
        opponent: "Salzburg",
        minutes: "90",
        cleanSheet: false
      },
      {
        date: "2025-01-29",
        competition: "Supercoupe",
        opponent: "Brest",
        minutes: "90",
        cleanSheet: true
      }
    ]
  },
  "2": {
    id: 2,
    name: "Andriy Lunin",
    number: 13,
    position: "Gardien de but",
    nationality: "Ukraine",
    birthDate: "1999-02-11",
    height: "1,91 m",
    weight: "80 kg",
    bio: "Formé à Dnipro et Zorya Luhansk, doublure de Courtois depuis 2018. Champion du monde U20 en 2019 (Golden Glove). Reconnu pour ses relances au pied et son agilité.",
    image: "https://media.gettyimages.com/id/1483978860/photo/real-madrid-cf-v-rb-leipzig-uefa-champions-league-2022-23.jpg?s=2048x2048&w=gi&k=20&c=b0XDFT0itB8c9qKMqKznjHt5yIqWlL8PHQ0YOWHVjPU=",
    stats: {
      matches: 35,
      cleanSheets: 0,
      goalsConceded: 0,
      minutesPlayed: 3150
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 25,
        cleanSheets: 8,
        goalsConceded: 25
      },
      {
        competition: "Ligue des Champions",
        matches: 6,
        cleanSheets: 2,
        goalsConceded: 8
      },
      {
        competition: "Coupe du Roi",
        matches: 2,
        cleanSheets: 1,
        goalsConceded: 2
      },
      {
        competition: "Supercoupes/Autres",
        matches: 2,
        cleanSheets: 0,
        goalsConceded: 3
      }
    ],
    recentMatches: [
      {
        date: "2025-03-23",
        competition: "Liga",
        opponent: "Villarreal",
        minutes: "90",
        cleanSheet: false
      },
      {
        date: "2025-03-09",
        competition: "Ligue des Champions",
        opponent: "Leipzig",
        minutes: "90",
        cleanSheet: true
      },
      {
        date: "2025-03-02",
        competition: "Supercoupe",
        opponent: "Atlético",
        minutes: "90",
        cleanSheet: false
      }
    ]
  },
  "3": {
    id: 3,
    name: "Fran González",
    number: 26,
    position: "Gardien de but",
    nationality: "Espagne",
    birthDate: "2005-06-24",
    height: "1,99 m",
    weight: "72 kg",
    bio: "Produit du Castilla, intégré au groupe première équipe en 2024. Espoir du centre de formation, solide sur sa ligne et bon dans les sorties.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=F",
    stats: {
      matches: 3,
      cleanSheets: 1,
      goalsConceded: 4,
      minutesPlayed: 270
    },
    competitionStats: [
      {
        competition: "Copa del Rey",
        matches: 2,
        cleanSheets: 1,
        goalsConceded: 2
      },
      {
        competition: "Tours préliminaires C1",
        matches: 1,
        cleanSheets: 0,
        goalsConceded: 2
      }
    ],
    recentMatches: [
      {
        date: "2025-01-08",
        competition: "Copa del Rey",
        opponent: "Getafe",
        minutes: "90",
        cleanSheet: true
      },
      {
        date: "2025-01-15",
        competition: "C1 préliminaire",
        opponent: "Braga",
        minutes: "90",
        cleanSheet: false
      }
    ]
  },
  "4": {
    id: 4,
    name: "Sergio Mestre",
    number: 34,
    position: "Gardien de but",
    nationality: "Espagne",
    birthDate: "2005-02-13",
    height: "1,93 m",
    weight: "80 kg",
    bio: "Formé à la cantera du Real Madrid C, promu en 2024. Jeune gardien agile, en apprentissage en semi-pro.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=S",
    stats: {
      matches: 0,
      cleanSheets: 0,
      goalsConceded: 0,
      minutesPlayed: 0
    },
    competitionStats: [],
    recentMatches: []
  },
  "5": {
    id: 5,
    name: "Dani Carvajal",
    number: 2,
    position: "Défenseur latéral droite",
    nationality: "Espagne",
    birthDate: "1992-01-11",
    height: "1,73 m",
    weight: "73 kg",
    bio: "Formé au Real Madrid, Dani Carvajal est un pilier de la défense depuis son retour au club en 2013 après une saison au Bayer Leverkusen. Connu pour sa combativité et ses montées offensives, il est un leader sur le terrain.",
    image: "https://media.gettyimages.com/id/1257318147/photo/real-madrid-v-fc-barcelona-la-liga-santander.jpg?s=2048x2048&w=gi&k=20&c=79nTCILxIifMBJj7UTAMyfkBm-BiRK7ATrwO0V5qUa8=",
    stats: {
      matches: 30,
      goals: 2,
      assists: 5,
      minutesPlayed: 2520
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 20,
        goalsScored: 1,
        assists: 3
      },
      {
        competition: "Ligue des Champions",
        matches: 8,
        goalsScored: 1,
        assists: 2
      },
      {
        competition: "Coupe du Roi",
        matches: 2,
        goalsScored: 0,
        assists: 0
      }
    ],
    recentMatches: [
      {
        date: "2025-04-20",
        competition: "Liga",
        opponent: "FC Barcelone",
        minutes: "90"
      },
      {
        date: "2025-04-27",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90"
      }
    ]
  },
  "6": {
    id: 6,
    name: "Éder Militão",
    number: 3,
    position: "Défenseur central",
    nationality: "Brésil",
    birthDate: "1998-01-18",
    height: "1,86 m",
    weight: "78 kg",
    bio: "Arrivé en 2019 en provenance du FC Porto, Éder Militão s'est imposé comme un défenseur central rapide et solide dans les duels. Sa lecture du jeu et sa capacité à anticiper les actions adverses sont ses principales qualités.",
    image: "https://media.gettyimages.com/id/1491003090/photo/real-madrid-cf-v-rcd-mallorca-laliga-ea-sports.jpg?s=2048x2048&w=gi&k=20&c=vBPNhbGmuPF9bUdGBwLxq0FeIs47GxOSuR3fzNKwfoE=",
    stats: {
      matches: 25,
      goals: 1,
      assists: 1,
      minutesPlayed: 2175
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 18,
        goalsScored: 1,
        assists: 0
      },
      {
        competition: "Ligue des Champions",
        matches: 5,
        goalsScored: 0,
        assists: 1
      },
      {
        competition: "Coupe du Roi",
        matches: 2,
        goalsScored: 0,
        assists: 0
      }
    ],
    recentMatches: [
      {
        date: "2025-04-20",
        competition: "Liga",
        opponent: "FC Barcelone",
        minutes: "90"
      },
      {
        date: "2025-04-27",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90"
      }
    ]
  },
  // Ajoutez les autres joueurs ici de la même façon
  "26": {
    id: 26,
    name: "Kylian Mbappé",
    number: 9,
    position: "Attaquant",
    secondaryPosition: "Ailier gauche",
    nationality: "France",
    birthDate: "1998-12-20",
    height: "1,78 m",
    weight: "73 kg",
    bio: "Arrivé au Real Madrid en juillet 2024 en provenance du Paris Saint-Germain, Kylian Mbappé est considéré comme l'un des meilleurs attaquants du monde. Sa vitesse, sa technique et son sens du but en font un atout majeur pour l'équipe madrilène.",
    image: "https://media.gettyimages.com/id/1809515629/photo/real-madrid-cf-unveil-new-signing-kylian-mbappe-at-estadio-santiago-bernabeu-on-july-16-2024.jpg?s=2048x2048&w=gi&k=20&c=YecqQkxXHhuhfLrqKDsz-lIj-fPlMNZZnt-EvIr1L40=",
    stats: {
      matches: 48,
      goals: 29,
      assists: 8,
      minutesPlayed: 4320
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 33,
        goalsScored: 20,
        assists: 5
      },
      {
        competition: "Ligue des Champions",
        matches: 12,
        goalsScored: 7,
        assists: 2
      },
      {
        competition: "Coupe du Roi",
        matches: 3,
        goalsScored: 2,
        assists: 1
      }
    ],
    recentMatches: [
      {
        date: "2025-04-22",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90",
        goals: 1
      },
      {
        date: "2025-04-26",
        competition: "Copa del Rey",
        opponent: "FC Barcelone",
        minutes: "90",
        goals: 2
      }
    ]
  },
  // Ajoutez les autres joueurs ici
};

export default playersData;

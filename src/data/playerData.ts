
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
      cleanSheets: 11,
      goalsConceded: 38,
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
  "7": {
    id: 7,
    name: "David Alaba",
    number: 4,
    position: "Défenseur central",
    nationality: "Autriche",
    birthDate: "1992-06-24",
    height: "1,80 m", 
    weight: "78 kg",
    bio: "Ancien joueur polyvalent du Bayern Munich, David Alaba a rejoint le Real Madrid en 2021. Il est reconnu pour sa capacité à jouer à plusieurs postes défensifs et pour sa qualité de relance.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=A",
    stats: {
      matches: 20,
      goals: 1,
      assists: 2,
      minutesPlayed: 1800
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 14,
        goalsScored: 1,
        assists: 1
      },
      {
        competition: "Ligue des Champions",
        matches: 5,
        goalsScored: 0,
        assists: 1
      },
      {
        competition: "Coupe du Roi",
        matches: 1,
        goalsScored: 0,
        assists: 0
      }
    ],
    recentMatches: [
      {
        date: "2025-04-15",
        competition: "Liga",
        opponent: "Getafe",
        minutes: "90"
      },
      {
        date: "2025-04-22",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90"
      }
    ]
  },
  "8": {
    id: 8,
    name: "Lucas Vázquez",
    number: 17,
    position: "Défenseur latéral droite",
    secondaryPosition: "Ailier droit",
    nationality: "Espagne",
    birthDate: "1991-07-01",
    height: "1,73 m",
    weight: "70 kg",
    bio: "Formé au Real Madrid, Lucas Vázquez est un joueur polyvalent capable d'évoluer en tant qu'ailier ou latéral droit. Il est apprécié pour son engagement et sa régularité.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=L",
    stats: {
      matches: 28,
      goals: 2,
      assists: 4,
      minutesPlayed: 2240
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
        matches: 5,
        goalsScored: 1,
        assists: 1
      },
      {
        competition: "Coupe du Roi",
        matches: 3,
        goalsScored: 0,
        assists: 0
      }
    ],
    recentMatches: [
      {
        date: "2025-04-18",
        competition: "Liga",
        opponent: "Real Sociedad",
        minutes: "90"
      },
      {
        date: "2025-04-25",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90"
      }
    ]
  },
  "9": {
    id: 9,
    name: "Jesús Vallejo",
    number: 18,
    position: "Défenseur central",
    nationality: "Espagne",
    birthDate: "1997-01-05",
    height: "1,84 m",
    weight: "75 kg",
    bio: "Jesús Vallejo est un défenseur central formé à Saragosse. Après plusieurs prêts, il est revenu au Real Madrid pour apporter de la profondeur à l'effectif défensif.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=V",
    stats: {
      matches: 10,
      goals: 0,
      assists: 0,
      minutesPlayed: 900
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 4,
        goalsScored: 0,
        assists: 0
      },
      {
        competition: "Copa del Rey",
        matches: 6,
        goalsScored: 0,
        assists: 0
      }
    ],
    recentMatches: [
      {
        date: "2025-04-10",
        competition: "Copa del Rey",
        opponent: "Levante",
        minutes: "90"
      },
      {
        date: "2025-04-17",
        competition: "Liga",
        opponent: "Espanyol",
        minutes: "90"
      }
    ]
  },
  "10": {
    id: 10,
    name: "Fran García",
    number: 20,
    position: "Défenseur latéral gauche",
    nationality: "Espagne",
    birthDate: "1999-08-14",
    height: "1,69 m",
    weight: "69 kg",
    bio: "Formé au Real Madrid, Fran García a fait ses preuves au Rayo Vallecano avant de revenir au club en 2023. Il est connu pour sa vitesse et sa capacité à soutenir l'attaque.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=F",
    stats: {
      matches: 25,
      goals: 1,
      assists: 3,
      minutesPlayed: 2000
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 18,
        goalsScored: 1,
        assists: 2
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
        date: "2025-04-12",
        competition: "Liga",
        opponent: "Sevilla",
        minutes: "90"
      },
      {
        date: "2025-04-19",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90"
      }
    ]
  },
  "11": {
    id: 11,
    name: "Antonio Rüdiger",
    number: 22,
    position: "Défenseur central",
    nationality: "Allemagne",
    birthDate: "1993-03-03",
    height: "1,90 m",
    weight: "85 kg",
    bio: "Ancien joueur de Chelsea, Antonio Rüdiger a rejoint le Real Madrid en 2022. Il est reconnu pour sa puissance physique et son leadership en défense.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=R",
    stats: {
      matches: 30,
      goals: 2,
      assists: 1,
      minutesPlayed: 2700
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 22,
        goalsScored: 1,
        assists: 0
      },
      {
        competition: "Ligue des Champions",
        matches: 7,
        goalsScored: 1,
        assists: 1
      },
      {
        competition: "Coupe du Roi",
        matches: 1,
        goalsScored: 0,
        assists: 0
      }
    ],
    recentMatches: [
      {
        date: "2025-04-14",
        competition: "Liga",
        opponent: "Atlético Madrid",
        minutes: "90"
      },
      {
        date: "2025-04-21",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90"
      }
    ]
  },
  "12": {
    id: 12,
    name: "Ferland Mendy",
    number: 23,
    position: "Défenseur latéral gauche",
    nationality: "France",
    birthDate: "1995-06-08",
    height: "1,80 m",
    weight: "73 kg",
    bio: "Arrivé au Real Madrid en 2019 en provenance de l'Olympique Lyonnais, Ferland Mendy s'est imposé comme un latéral gauche solide, alliant vitesse et rigueur défensive. Malgré des blessures récurrentes, il reste un élément clé de la défense madrilène.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=M",
    stats: {
      matches: 31,
      goals: 0,
      assists: 2,
      minutesPlayed: 2239
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 22,
        goalsScored: 0,
        assists: 1
      },
      {
        competition: "Ligue des Champions",
        matches: 8,
        goalsScored: 0,
        assists: 1
      },
      {
        competition: "Coupe du Roi",
        matches: 1,
        goalsScored: 0,
        assists: 0
      }
    ],
    recentMatches: [
      {
        date: "2025-02-19",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90"
      },
      {
        date: "2025-03-04",
        competition: "Ligue des Champions",
        opponent: "Atlético de Madrid",
        minutes: "90"
      }
    ]
  },
  "13": {
    id: 13,
    name: "Jacobo Ramón",
    number: 31,
    position: "Défenseur central",
    nationality: "Espagne",
    birthDate: "2005-01-06",
    height: "1,96 m",
    weight: "80 kg",
    bio: "Pilier de la défense de Castilla, fort dans le duel aérien et la relance courte. Intégré au groupe pro pour l'entraînement depuis 2024.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=J",
    stats: {
      matches: 0,
      goals: 0,
      assists: 0,
      minutesPlayed: 0
    },
    competitionStats: [],
    recentMatches: []
  },
  "14": {
    id: 14,
    name: "Diego Aguado",
    number: 43,
    position: "Défenseur central",
    nationality: "Espagne",
    birthDate: "2007-02-07",
    height: "1,80 m",
    weight: "75 kg",
    bio: "Jeune défenseur central formé à La Fábrica, Diego Aguado est reconnu pour sa maturité tactique et son calme sous pression. Il a récemment été intégré au groupe professionnel en raison des blessures dans l'effectif principal.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=D",
    stats: {
      matches: 0,
      goals: 0,
      assists: 0,
      minutesPlayed: 0
    },
    competitionStats: [],
    recentMatches: []
  },
  "15": {
    id: 15,
    name: "Lorenzo Aguado",
    number: 39,
    position: "Défenseur latéral droite",
    nationality: "Espagne",
    birthDate: "2003-01-01",
    height: "1,78 m",
    weight: "72 kg",
    bio: "Lorenzo Aguado est un latéral droit offensif issu de la cantera madrilène. Sa polyvalence et sa capacité à soutenir l'attaque ont attiré l'attention du staff technique, surtout en période de blessures dans l'équipe première.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=L",
    stats: {
      matches: 0,
      goals: 0,
      assists: 0,
      minutesPlayed: 0
    },
    competitionStats: [],
    recentMatches: []
  },
  "16": {
    id: 16,
    name: "Raúl Asencio",
    number: 35,
    position: "Défenseur central",
    nationality: "Espagne",
    birthDate: "2002-01-01",
    height: "1,85 m",
    weight: "80 kg",
    bio: "Raúl Asencio est un jeune défenseur central qui a fait ses preuves en Copa del Rey cette saison, jouant l'intégralité des six matchs de la compétition. Sa performance solide face à des adversaires de haut niveau a renforcé sa position dans l'effectif.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=R",
    stats: {
      matches: 6,
      goals: 0,
      assists: 0,
      minutesPlayed: 570
    },
    competitionStats: [
      {
        competition: "Copa del Rey",
        matches: 6,
        goalsScored: 0,
        assists: 0
      }
    ],
    recentMatches: [
      {
        date: "2025-04-26",
        competition: "Copa del Rey",
        opponent: "FC Barcelone",
        minutes: "90"
      },
      {
        date: "2025-04-10",
        competition: "Copa del Rey",
        opponent: "Atlético Madrid",
        minutes: "90"
      }
    ]
  },
  "17": {
    id: 17,
    name: "Jude Bellingham",
    number: 5,
    position: "Milieu de terrain",
    nationality: "Angleterre",
    birthDate: "2003-06-29",
    height: "1,86 m",
    weight: "75 kg",
    bio: "Recruté en 2023 en provenance du Borussia Dortmund, Jude Bellingham s'est rapidement imposé comme un élément central du milieu madrilène. Son intelligence de jeu, sa capacité à se projeter vers l'avant et son impact défensif en font un joueur complet.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=B",
    stats: {
      matches: 47,
      goals: 13,
      assists: 12,
      minutesPlayed: 4000
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 32,
        goalsScored: 9,
        assists: 8
      },
      {
        competition: "Ligue des Champions",
        matches: 12,
        goalsScored: 3,
        assists: 4
      },
      {
        competition: "Coupe du Roi",
        matches: 3,
        goalsScored: 1,
        assists: 0
      }
    ],
    recentMatches: [
      {
        date: "2024-12-04",
        competition: "Liga",
        opponent: "Athletic Bilbao",
        minutes: "90",
        goals: 0,
        assists: 1
      },
      {
        date: "2024-12-07",
        competition: "Liga",
        opponent: "Girona FC",
        minutes: "61",
        goals: 1,
        assists: 0
      }
    ]
  },
  "18": {
    id: 18,
    name: "Eduardo Camavinga",
    number: 6,
    position: "Milieu de terrain",
    secondaryPosition: "Défenseur latéral gauche",
    nationality: "France",
    birthDate: "2002-11-10",
    height: "1,82 m",
    weight: "68 kg",
    bio: "Arrivé en 2021 en provenance du Stade Rennais, Eduardo Camavinga est un milieu défensif polyvalent, capable d'évoluer également en tant que latéral gauche. Sa capacité à récupérer le ballon et à relancer proprement en fait un atout précieux.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=C",
    stats: {
      matches: 35,
      goals: 2,
      assists: 0,
      minutesPlayed: 2080
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 24,
        goalsScored: 1,
        assists: 0
      },
      {
        competition: "Ligue des Champions",
        matches: 8,
        goalsScored: 1,
        assists: 0
      },
      {
        competition: "Coupe du Roi",
        matches: 3,
        goalsScored: 0,
        assists: 0
      }
    ],
    recentMatches: [
      {
        date: "2025-04-22",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90"
      },
      {
        date: "2025-04-26",
        competition: "Copa del Rey",
        opponent: "FC Barcelone",
        minutes: "90"
      }
    ]
  },
  "19": {
    id: 19,
    name: "Federico Valverde",
    number: 8,
    position: "Milieu de terrain",
    secondaryPosition: "Défenseur latéral droite",
    nationality: "Uruguay",
    birthDate: "1998-07-22",
    height: "1,82 m",
    weight: "73 kg",
    bio: "Formé au Real Madrid, Federico Valverde est un milieu de terrain polyvalent, capable d'évoluer également en tant que latéral droit. Son endurance, sa capacité à se projeter et sa vision du jeu en font un élément clé de l'effectif.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=V",
    stats: {
      matches: 40,
      goals: 3,
      assists: 4,
      minutesPlayed: 3500
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 28,
        goalsScored: 2,
        assists: 3
      },
      {
        competition: "Ligue des Champions",
        matches: 10,
        goalsScored: 1,
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
        date: "2025-02-11",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90"
      },
      {
        date: "2025-02-19",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90"
      }
    ]
  },
  "20": {
    id: 20,
    name: "Luka Modrić",
    number: 10,
    position: "Milieu de terrain",
    nationality: "Croatie",
    birthDate: "1985-09-09",
    height: "1,72 m",
    weight: "66 kg",
    bio: "Véritable légende du club, Luka Modrić évolue au Real Madrid depuis 2012. Lauréat du Ballon d'Or en 2018, il est reconnu pour sa vision du jeu, sa qualité de passe et son intelligence tactique.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=M",
    stats: {
      matches: 30,
      goals: 2,
      assists: 3,
      minutesPlayed: 2400
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 20,
        goalsScored: 1,
        assists: 2
      },
      {
        competition: "Ligue des Champions",
        matches: 8,
        goalsScored: 1,
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
        date: "2025-04-14",
        competition: "Liga",
        opponent: "Atlético Madrid",
        minutes: "90"
      },
      {
        date: "2025-04-21",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90"
      }
    ]
  },
  "21": {
    id: 21,
    name: "Aurélien Tchouaméni",
    number: 14,
    position: "Milieu défensif",
    secondaryPosition: "Défenseur central",
    nationality: "France",
    birthDate: "2000-01-27",
    height: "1,87 m",
    weight: "81 kg",
    bio: "Arrivé en 2022 en provenance de l'AS Monaco, Aurélien Tchouaméni s'est imposé comme un pilier du milieu de terrain madrilène. Sa capacité à récupérer le ballon et à relancer proprement en fait un joueur clé pour l'équilibre de l'équipe.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=T",
    stats: {
      matches: 38,
      goals: 2,
      assists: 1,
      minutesPlayed: 3300
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 26,
        goalsScored: 1,
        assists: 0
      },
      {
        competition: "Ligue des Champions",
        matches: 10,
        goalsScored: 1,
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
        date: "2025-04-26",
        competition: "Copa del Rey",
        opponent: "FC Barcelone",
        minutes: "90"
      },
      {
        date: "2025-04-22",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90"
      }
    ]
  },
  "22": {
    id: 22,
    name: "Arda Güler",
    number: 15,
    position: "Milieu offensif",
    secondaryPosition: "Ailier droit",
    nationality: "Turquie",
    birthDate: "2005-02-25",
    height: "1,76 m",
    weight: "70 kg",
    bio: "Jeune prodige turc, Arda Güler a rejoint le Real Madrid en 2023 en provenance de Fenerbahçe. Doté d'une excellente vision du jeu et d'une technique raffinée, il est considéré comme l'un des talents les plus prometteurs de sa génération.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=G",
    stats: {
      matches: 20,
      goals: 4,
      assists: 3,
      minutesPlayed: 950
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 14,
        goalsScored: 2,
        assists: 2
      },
      {
        competition: "Ligue des Champions",
        matches: 4,
        goalsScored: 1,
        assists: 1
      },
      {
        competition: "Coupe du Roi",
        matches: 2,
        goalsScored: 1,
        assists: 0
      }
    ],
    recentMatches: [
      {
        date: "2025-04-19",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "45",
        goals: 0,
        assists: 1
      },
      {
        date: "2025-04-14",
        competition: "Liga",
        opponent: "Atlético Madrid",
        minutes: "30",
        goals: 0,
        assists: 0
      }
    ]
  },
  "23": {
    id: 23,
    name: "Dani Ceballos",
    number: 19,
    position: "Milieu de terrain",
    nationality: "Espagne",
    birthDate: "1996-08-07",
    height: "1,79 m",
    weight: "70 kg",
    bio: "Formé au Real Betis, Dani Ceballos a rejoint le Real Madrid en 2017. Après un prêt à Arsenal, il est revenu au club pour apporter sa créativité et sa maîtrise du ballon au milieu de terrain.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=C",
    stats: {
      matches: 25,
      goals: 1,
      assists: 2,
      minutesPlayed: 1500
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 18,
        goalsScored: 1,
        assists: 1
      },
      {
        competition: "Ligue des Champions",
        matches: 3,
        goalsScored: 0,
        assists: 0
      },
      {
        competition: "Coupe du Roi",
        matches: 4,
        goalsScored: 0,
        assists: 1
      }
    ],
    recentMatches: [
      {
        date: "2025-04-10",
        competition: "Copa del Rey",
        opponent: "Levante",
        minutes: "90"
      },
      {
        date: "2025-04-17",
        competition: "Liga",
        opponent: "Espanyol",
        minutes: "90"
      }
    ]
  },
  "24": {
    id: 24,
    name: "Chema Andrés",
    number: 36,
    position: "Milieu de terrain",
    nationality: "Espagne",
    birthDate: "2005-03-12",
    height: "1,80 m",
    weight: "72 kg",
    bio: "Produit de La Fábrica, Chema Andrés est un jeune milieu de terrain prometteur. Comparé à des joueurs comme Rodri ou Busquets, il a déjà fait ses débuts en Copa del Rey et en Liga, montrant une grande maturité pour son âge.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=C",
    stats: {
      matches: 8,
      goals: 0,
      assists: 1,
      minutesPlayed: 720
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 4,
        goalsScored: 0,
        assists: 0
      },
      {
        competition: "Copa del Rey",
        matches: 4,
        goalsScored: 0,
        assists: 1
      }
    ],
    recentMatches: [
      {
        date: "2025-04-10",
        competition: "Copa del Rey",
        opponent: "Levante",
        minutes: "90"
      },
      {
        date: "2025-04-17",
        competition: "Liga",
        opponent: "Espanyol",
        minutes: "90"
      }
    ]
  },
  "25": {
    id: 25,
    name: "Vinícius Júnior",
    number: 7,
    position: "Ailier gauche",
    secondaryPosition: "Attaquant",
    nationality: "Brésil",
    birthDate: "2000-07-12",
    height: "1,76 m",
    weight: "73 kg",
    bio: "Recruté en 2018 en provenance de Flamengo, Vinícius Júnior est devenu l'un des joueurs les plus explosifs du Real Madrid. Sa vitesse, son dribble et sa capacité à marquer des buts décisifs en font un atout majeur pour l'équipe.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=V",
    stats: {
      matches: 45,
      goals: 21,
      assists: 10,
      minutesPlayed: 3800
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 30,
        goalsScored: 14,
        assists: 7
      },
      {
        competition: "Ligue des Champions",
        matches: 12,
        goalsScored: 6,
        assists: 2
      },
      {
        competition: "Coupe du Roi",
        matches: 3,
        goalsScored: 1,
        assists: 1
      }
    ],
    recentMatches: [
      {
        date: "2025-04-22",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90",
        goals: 1,
        assists: 1
      },
      {
        date: "2025-04-26",
        competition: "Copa del Rey",
        opponent: "FC Barcelone",
        minutes: "90",
        goals: 0,
        assists: 0
      }
    ]
  },
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
  "27": {
    id: 27,
    name: "Rodrygo Goes",
    number: 11,
    position: "Ailier droit",
    secondaryPosition: "Ailier gauche",
    nationality: "Brésil",
    birthDate: "2001-01-09",
    height: "1,74 m",
    weight: "64 kg",
    bio: "Recruté en 2019 en provenance de Santos FC, Rodrygo s'est imposé comme un joueur polyvalent capable d'évoluer sur les deux ailes. Sa vitesse, sa technique et sa capacité à marquer des buts importants en font un élément clé de l'attaque madrilène.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=R",
    stats: {
      matches: 45,
      goals: 17,
      assists: 9,
      minutesPlayed: 3700
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 32,
        goalsScored: 12,
        assists: 6
      },
      {
        competition: "Ligue des Champions",
        matches: 10,
        goalsScored: 4,
        assists: 2
      },
      {
        competition: "Coupe du Roi",
        matches: 3,
        goalsScored: 1,
        assists: 1
      }
    ],
    recentMatches: [
      {
        date: "2025-04-22",
        competition: "Ligue des Champions",
        opponent: "Manchester City",
        minutes: "90",
        goals: 0,
        assists: 0
      },
      {
        date: "2025-04-26",
        competition: "Copa del Rey",
        opponent: "FC Barcelone",
        minutes: "90",
        goals: 1,
        assists: 0
      }
    ]
  },
  "28": {
    id: 28,
    name: "Endrick",
    number: 16,
    position: "Attaquant",
    nationality: "Brésil",
    birthDate: "2006-07-21",
    height: "1,73 m",
    weight: "65 kg",
    bio: "Jeune prodige brésilien, Endrick a rejoint le Real Madrid en juillet 2024 en provenance de Palmeiras. À seulement 18 ans, il est considéré comme l'un des talents les plus prometteurs du football mondial.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=E",
    stats: {
      matches: 20,
      goals: 5,
      assists: 2,
      minutesPlayed: 800
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 12,
        goalsScored: 2,
        assists: 1
      },
      {
        competition: "Ligue des Champions",
        matches: 4,
        goalsScored: 1,
        assists: 0
      },
      {
        competition: "Coupe du Roi",
        matches: 4,
        goalsScored: 2,
        assists: 1
      }
    ],
    recentMatches: [
      {
        date: "2025-04-10",
        competition: "Copa del Rey",
        opponent: "Levante",
        minutes: "90",
        goals: 1,
        assists: 0
      },
      {
        date: "2025-04-17",
        competition: "Liga",
        opponent: "Espanyol",
        minutes: "90",
        goals: 0,
        assists: 1
      }
    ]
  },
  "29": {
    id: 29,
    name: "Brahim Díaz",
    number: 21,
    position: "Ailier droit",
    secondaryPosition: "Milieu de terrain",
    nationality: "Espagne/Maroc",
    birthDate: "1999-08-03",
    height: "1,71 m",
    weight: "68 kg",
    bio: "Formé à Manchester City, Brahim Díaz a rejoint le Real Madrid en 2019. Après un prêt réussi à l'AC Milan, il est revenu au club madrilène pour apporter sa créativité et sa technique au milieu de terrain.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=B",
    stats: {
      matches: 30,
      goals: 6,
      assists: 5,
      minutesPlayed: 1800
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 22,
        goalsScored: 4,
        assists: 3
      },
      {
        competition: "Ligue des Champions",
        matches: 5,
        goalsScored: 1,
        assists: 1
      },
      {
        competition: "Coupe du Roi",
        matches: 3,
        goalsScored: 1,
        assists: 1
      }
    ],
    recentMatches: [
      {
        date: "2025-04-10",
        competition: "Copa del Rey",
        opponent: "Levante",
        minutes: "90",
        goals: 0,
        assists: 1
      },
      {
        date: "2025-04-17",
        competition: "Liga",
        opponent: "Espanyol",
        minutes: "90",
        goals: 1,
        assists: 0
      }
    ]
  },
  "30": {
    id: 30,
    name: "Gonzalo García",
    number: 30,
    position: "Attaquant",
    nationality: "Espagne",
    birthDate: "2005-02-12",
    height: "1,80 m",
    weight: "72 kg",
    bio: "Produit de La Fábrica, Gonzalo García est un jeune attaquant prometteur. Il a fait ses débuts en équipe première lors de la saison 2024/25, marquant un but décisif en Copa del Rey.",
    image: "https://placehold.co/300x400/1a365d/ffffff/?text=G",
    stats: {
      matches: 10,
      goals: 2,
      assists: 1,
      minutesPlayed: 450
    },
    competitionStats: [
      {
        competition: "Liga",
        matches: 5,
        goalsScored: 0,
        assists: 0
      },
      {
        competition: "Copa del Rey",
        matches: 5,
        goalsScored: 2,
        assists: 1
      }
    ],
    recentMatches: [
      {
        date: "2025-04-10",
        competition: "Copa del Rey",
        opponent: "Levante",
        minutes: "90",
        goals: 1,
        assists: 0
      },
      {
        date: "2025-04-17",
        competition: "Liga",
        opponent: "Espanyol",
        minutes: "90",
        goals: 0,
        assists: 0
      }
    ]
  }
};

export default playersData;

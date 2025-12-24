import { useState, useEffect, useCallback } from "react";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "engagement" | "prediction" | "knowledge" | "loyalty";
  condition: {
    type: string;
    threshold: number;
  };
  unlockedAt?: string;
}

export const AVAILABLE_BADGES: Badge[] = [
  // Engagement badges
  {
    id: "first_reaction",
    name: "Premier Fan",
    description: "Réagir à votre premier article",
    icon: "⚽",
    category: "engagement",
    condition: { type: "reactions", threshold: 1 },
  },
  {
    id: "reactor",
    name: "Fan Expressif",
    description: "Réagir à 10 articles",
    icon: "🔥",
    category: "engagement",
    condition: { type: "reactions", threshold: 10 },
  },
  {
    id: "super_reactor",
    name: "Ultra Fan",
    description: "Réagir à 50 articles",
    icon: "💪",
    category: "engagement",
    condition: { type: "reactions", threshold: 50 },
  },
  {
    id: "first_comment",
    name: "Commentateur Rookie",
    description: "Poster votre premier commentaire",
    icon: "💬",
    category: "engagement",
    condition: { type: "comments", threshold: 1 },
  },
  {
    id: "commenter",
    name: "Commentateur Actif",
    description: "Poster 10 commentaires",
    icon: "📝",
    category: "engagement",
    condition: { type: "comments", threshold: 10 },
  },
  
  // Prediction badges
  {
    id: "first_prediction",
    name: "Apprenti Pronostiqueur",
    description: "Faire votre premier pronostic",
    icon: "🎯",
    category: "prediction",
    condition: { type: "predictions", threshold: 1 },
  },
  {
    id: "oracle",
    name: "Oracle du Bernabéu",
    description: "Faire 20 pronostics",
    icon: "🔮",
    category: "prediction",
    condition: { type: "predictions", threshold: 20 },
  },
  {
    id: "perfect_score",
    name: "Score Parfait",
    description: "Deviner le score exact d'un match",
    icon: "⭐",
    category: "prediction",
    condition: { type: "perfect_predictions", threshold: 1 },
  },
  {
    id: "streak_3",
    name: "Série Gagnante",
    description: "3 pronostics corrects consécutifs",
    icon: "🎰",
    category: "prediction",
    condition: { type: "prediction_streak", threshold: 3 },
  },
  
  // Knowledge badges
  {
    id: "quiz_first",
    name: "Étudiant Madridista",
    description: "Compléter votre premier quiz",
    icon: "📚",
    category: "knowledge",
    condition: { type: "quizzes", threshold: 1 },
  },
  {
    id: "quiz_master",
    name: "Maître du Quiz",
    description: "Compléter 10 quiz",
    icon: "🎓",
    category: "knowledge",
    condition: { type: "quizzes", threshold: 10 },
  },
  {
    id: "comparator_user",
    name: "Analyste",
    description: "Utiliser le comparateur de joueurs",
    icon: "📊",
    category: "knowledge",
    condition: { type: "comparisons", threshold: 1 },
  },
  
  // Loyalty badges
  {
    id: "visit_streak_7",
    name: "Fan Fidèle",
    description: "Visiter le site 7 jours consécutifs",
    icon: "📅",
    category: "loyalty",
    condition: { type: "visit_streak", threshold: 7 },
  },
  {
    id: "visit_streak_30",
    name: "Madridista Dévoué",
    description: "Visiter le site 30 jours consécutifs",
    icon: "👑",
    category: "loyalty",
    condition: { type: "visit_streak", threshold: 30 },
  },
  {
    id: "dream_team_creator",
    name: "Créateur de Dream Team",
    description: "Créer votre Dream Team",
    icon: "⚔️",
    category: "loyalty",
    condition: { type: "dream_teams", threshold: 1 },
  },
];

interface UserStats {
  reactions: number;
  comments: number;
  predictions: number;
  perfect_predictions: number;
  prediction_streak: number;
  quizzes: number;
  comparisons: number;
  visit_streak: number;
  dream_teams: number;
  lastVisit: string;
}

const DEFAULT_STATS: UserStats = {
  reactions: 0,
  comments: 0,
  predictions: 0,
  perfect_predictions: 0,
  prediction_streak: 0,
  quizzes: 0,
  comparisons: 0,
  visit_streak: 0,
  dream_teams: 0,
  lastVisit: "",
};

export const useBadges = () => {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  // Load from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem("user_badge_stats");
    const savedBadges = localStorage.getItem("user_badges");
    
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    if (savedBadges) {
      setUnlockedBadges(JSON.parse(savedBadges));
    }
    
    // Track daily visits
    trackVisit();
  }, []);

  const trackVisit = () => {
    const today = new Date().toDateString();
    const savedStats = localStorage.getItem("user_badge_stats");
    const currentStats: UserStats = savedStats ? JSON.parse(savedStats) : DEFAULT_STATS;
    
    if (currentStats.lastVisit !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isConsecutive = currentStats.lastVisit === yesterday.toDateString();
      const newStreak = isConsecutive ? currentStats.visit_streak + 1 : 1;
      
      const newStats = {
        ...currentStats,
        visit_streak: newStreak,
        lastVisit: today,
      };
      
      setStats(newStats);
      localStorage.setItem("user_badge_stats", JSON.stringify(newStats));
      checkBadges(newStats);
    }
  };

  const checkBadges = useCallback((currentStats: UserStats) => {
    const savedBadges = localStorage.getItem("user_badges");
    const currentBadges: Badge[] = savedBadges ? JSON.parse(savedBadges) : [];
    const unlockedIds = new Set(currentBadges.map(b => b.id));
    
    for (const badge of AVAILABLE_BADGES) {
      if (unlockedIds.has(badge.id)) continue;
      
      const statValue = currentStats[badge.condition.type as keyof UserStats] as number;
      if (statValue >= badge.condition.threshold) {
        const unlockedBadge = {
          ...badge,
          unlockedAt: new Date().toISOString(),
        };
        
        currentBadges.push(unlockedBadge);
        unlockedIds.add(badge.id);
        
        setNewBadge(unlockedBadge);
        setTimeout(() => setNewBadge(null), 5000);
      }
    }
    
    setUnlockedBadges(currentBadges);
    localStorage.setItem("user_badges", JSON.stringify(currentBadges));
  }, []);

  const incrementStat = useCallback((statType: keyof UserStats, amount: number = 1) => {
    setStats(prev => {
      const newStats = {
        ...prev,
        [statType]: (prev[statType] as number) + amount,
      };
      
      localStorage.setItem("user_badge_stats", JSON.stringify(newStats));
      checkBadges(newStats);
      
      return newStats;
    });
  }, [checkBadges]);

  const getProgress = useCallback((badge: Badge): number => {
    const statValue = stats[badge.condition.type as keyof UserStats] as number || 0;
    return Math.min(100, (statValue / badge.condition.threshold) * 100);
  }, [stats]);

  return {
    stats,
    unlockedBadges,
    newBadge,
    incrementStat,
    getProgress,
    availableBadges: AVAILABLE_BADGES,
  };
};

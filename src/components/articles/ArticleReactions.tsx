import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Reaction {
  emoji: string;
  label: string;
  count: number;
}

interface ArticleReactionsProps {
  articleId: string;
  className?: string;
}

const defaultReactions: Omit<Reaction, "count">[] = [
  { emoji: "⚽", label: "Golazo" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "💪", label: "Hala Madrid" },
  { emoji: "😍", label: "Love" },
  { emoji: "👏", label: "Bravo" },
  { emoji: "😮", label: "Wow" },
];

export const ArticleReactions = ({ articleId, className }: ArticleReactionsProps) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null);

  // Load reactions from localStorage
  useEffect(() => {
    const storageKey = `article_reactions_${articleId}`;
    const userReactionKey = `user_reaction_${articleId}`;
    
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setReactions(JSON.parse(stored));
    } else {
      // Initialize with random counts for demo
      setReactions(
        defaultReactions.map((r) => ({
          ...r,
          count: Math.floor(Math.random() * 50) + 1,
        }))
      );
    }
    
    const savedUserReaction = localStorage.getItem(userReactionKey);
    if (savedUserReaction) {
      setUserReaction(savedUserReaction);
    }
  }, [articleId]);

  const handleReaction = (emoji: string) => {
    const storageKey = `article_reactions_${articleId}`;
    const userReactionKey = `user_reaction_${articleId}`;
    
    setAnimatingEmoji(emoji);
    setTimeout(() => setAnimatingEmoji(null), 600);
    
    setReactions((prev) => {
      const newReactions = prev.map((r) => {
        if (r.emoji === emoji) {
          // If user already selected this emoji, remove their reaction
          if (userReaction === emoji) {
            return { ...r, count: Math.max(0, r.count - 1) };
          }
          // Otherwise add their reaction
          return { ...r, count: r.count + 1 };
        }
        // If user is changing their reaction, decrement the old one
        if (userReaction && r.emoji === userReaction) {
          return { ...r, count: Math.max(0, r.count - 1) };
        }
        return r;
      });
      
      localStorage.setItem(storageKey, JSON.stringify(newReactions));
      return newReactions;
    });
    
    if (userReaction === emoji) {
      setUserReaction(null);
      localStorage.removeItem(userReactionKey);
    } else {
      setUserReaction(emoji);
      localStorage.setItem(userReactionKey, emoji);
    }
  };

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className={cn("py-6", className)}>
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground font-medium">
          Qu'avez-vous pensé de cet article ?
        </p>
        
        <div className="flex flex-wrap justify-center gap-2">
          {reactions.map((reaction) => (
            <motion.button
              key={reaction.emoji}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleReaction(reaction.emoji)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-200",
                "bg-muted/50 hover:bg-muted border border-border/50",
                userReaction === reaction.emoji && "bg-primary/10 border-primary ring-2 ring-primary/20"
              )}
            >
              <AnimatePresence>
                {animatingEmoji === reaction.emoji && (
                  <motion.span
                    initial={{ scale: 1, y: 0, opacity: 1 }}
                    animate={{ scale: 1.5, y: -30, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute text-2xl"
                  >
                    {reaction.emoji}
                  </motion.span>
                )}
              </AnimatePresence>
              
              <span className="text-2xl">{reaction.emoji}</span>
              <span className="text-xs font-medium text-muted-foreground">
                {reaction.count}
              </span>
            </motion.button>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground">
          {totalReactions} réaction{totalReactions !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
};

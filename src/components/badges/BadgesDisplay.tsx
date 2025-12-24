import { motion, AnimatePresence } from "framer-motion";
import { useBadges, AVAILABLE_BADGES, Badge } from "@/hooks/useBadges";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
  progress: number;
}

const BadgeCard = ({ badge, isUnlocked, progress }: BadgeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300",
        isUnlocked
          ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30"
          : "bg-muted/30 border-border/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "text-3xl p-2 rounded-lg",
            isUnlocked ? "bg-primary/20" : "bg-muted grayscale"
          )}
        >
          {badge.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn(
              "font-semibold truncate",
              !isUnlocked && "text-muted-foreground"
            )}>
              {badge.name}
            </h4>
            {isUnlocked && (
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {badge.description}
          </p>
          
          {!isUnlocked && (
            <div className="mt-2">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(progress)}% complété
              </p>
            </div>
          )}
          
          {isUnlocked && badge.unlockedAt && (
            <p className="text-xs text-primary mt-2">
              Débloqué le {new Date(badge.unlockedAt).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
        
        {!isUnlocked && (
          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </div>
    </motion.div>
  );
};

export const BadgesDisplay = () => {
  const { unlockedBadges, getProgress } = useBadges();
  const unlockedIds = new Set(unlockedBadges.map(b => b.id));
  
  const categories = [
    { id: "all", label: "Tous" },
    { id: "engagement", label: "Engagement" },
    { id: "prediction", label: "Pronostics" },
    { id: "knowledge", label: "Connaissance" },
    { id: "loyalty", label: "Fidélité" },
  ];

  const getBadgesByCategory = (category: string) => {
    const badges = category === "all" 
      ? AVAILABLE_BADGES 
      : AVAILABLE_BADGES.filter(b => b.category === category);
    
    return badges.sort((a, b) => {
      const aUnlocked = unlockedIds.has(a.id);
      const bUnlocked = unlockedIds.has(b.id);
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      return 0;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Mes Badges
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {unlockedBadges.length}/{AVAILABLE_BADGES.length} débloqués
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-5 mb-6">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs sm:text-sm">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid gap-4 sm:grid-cols-2">
                {getBadgesByCategory(cat.id).map(badge => {
                  const unlockedBadge = unlockedBadges.find(b => b.id === badge.id);
                  return (
                    <BadgeCard
                      key={badge.id}
                      badge={unlockedBadge || badge}
                      isUnlocked={!!unlockedBadge}
                      progress={getProgress(badge)}
                    />
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Toast notification for new badge
export const BadgeUnlockToast = () => {
  const { newBadge } = useBadges();
  
  return (
    <AnimatePresence>
      {newBadge && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed bottom-24 right-4 z-50 max-w-sm"
        >
          <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 shadow-lg">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="text-4xl animate-bounce">{newBadge.icon}</div>
              <div>
                <p className="text-xs text-primary font-medium uppercase tracking-wider">
                  Nouveau Badge Débloqué !
                </p>
                <h4 className="font-bold">{newBadge.name}</h4>
                <p className="text-sm text-muted-foreground">{newBadge.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

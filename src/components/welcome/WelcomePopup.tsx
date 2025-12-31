import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Star, Trophy, Newspaper, Timer, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWelcomePopupSettings } from "@/hooks/useWelcomePopupSettings";

// Icon mapping for dynamic icons
const ICON_MAP: Record<string, string> = {
  'Trophy': '🏆',
  'Newspaper': '📰',
  'Timer': '⚽',
  'Users': '👥',
  'Star': '⭐',
  'Crown': '👑',
  'Sparkles': '✨',
};

export const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, loading } = useWelcomePopupSettings();

  useEffect(() => {
    if (loading || !settings?.is_enabled) return;
    
    const hasSeenWelcome = localStorage.getItem("hala-madrid-welcome-seen");
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, settings.delay_ms || 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, settings]);

  const handleClose = () => {
    localStorage.setItem("hala-madrid-welcome-seen", "true");
    setIsOpen(false);
  };

  // Don't render if settings are not loaded or popup is disabled
  if (loading || !settings?.is_enabled) {
    return null;
  }

  const features = settings.features || [
    { icon: '⚽', label: 'Matchs' },
    { icon: '📰', label: 'Actualités' },
    { icon: '🏆', label: 'Trophées' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-0 bg-gradient-to-br from-background via-background to-primary/10 overflow-hidden p-0">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              
              <div className="relative p-6 text-center">
                {/* Crown icon with animation */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex justify-center mb-4"
                >
                  <div className="relative">
                    <Crown className="h-16 w-16 text-primary" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Sparkles className="h-6 w-6 text-primary/50 absolute -top-2 -right-2" />
                      <Star className="h-4 w-4 text-primary/40 absolute -bottom-1 -left-3" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-2xl font-bold text-foreground mb-2"
                  dangerouslySetInnerHTML={{ 
                    __html: settings.title.replace(
                      /HALA MADRID TV/g, 
                      '<span class="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">HALA MADRID TV</span>'
                    ) 
                  }}
                />

                {/* Subtitle */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-muted-foreground mb-6"
                >
                  {settings.subtitle}
                </motion.p>

                {/* Features */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="grid grid-cols-3 gap-2 mb-6"
                >
                  {features.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="text-2xl mb-1">{ICON_MAP[item.icon] || item.icon}</span>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Button
                    onClick={handleClose}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-6 text-lg shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                  >
                    <Crown className="mr-2 h-5 w-5" />
                    {settings.button_text}
                  </Button>
                </motion.div>

                {/* Footer text */}
                {settings.footer_text && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-xs text-muted-foreground mt-4"
                  >
                    {settings.footer_text}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

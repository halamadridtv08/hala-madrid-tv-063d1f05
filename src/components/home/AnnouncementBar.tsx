import { useAnnouncementBar } from "@/hooks/useAnnouncementBar";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export function AnnouncementBar() {
  const { announcement, loading } = useAnnouncementBar();

  // Don't render anything during loading to prevent flash
  if (loading) return null;
  
  // Don't render if no active announcement
  if (!announcement) return null;

  const isExternal = announcement.cta_link?.startsWith('http');

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="w-full py-2.5 px-4 flex items-center justify-center gap-3 text-sm"
        style={{
          background: announcement.background_color || 'linear-gradient(to right, hsl(240, 10%, 10%), hsl(280, 30%, 15%))',
          color: announcement.text_color || '#ffffff'
        }}
      >
        {announcement.emoji && (
          <span className="text-base">{announcement.emoji}</span>
        )}
        <span className="font-medium">{announcement.message}</span>
        
        {announcement.cta_text?.trim() && announcement.cta_link?.trim() && (
          isExternal ? (
            <a
              href={announcement.cta_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium border border-white/20"
            >
              {announcement.cta_text}
              <ArrowRight className="w-3 h-3" />
            </a>
          ) : (
            <Link
              to={announcement.cta_link}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium border border-white/20"
            >
              {announcement.cta_text}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )
        )}
      </motion.div>
    </AnimatePresence>
  );
}

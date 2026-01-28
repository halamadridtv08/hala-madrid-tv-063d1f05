import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio, Goal, AlertTriangle, Clock, MessageSquare, Zap } from 'lucide-react';
import { useLiveBlog, LiveBlogEntry } from '@/hooks/useLiveBlog';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { fr, es, enUS } from 'date-fns/locale';

interface LiveBlogProps {
  matchId: string;
  isLive?: boolean;
}

const getEntryIcon = (entryType: string, cardType?: string) => {
  // Gérer le double jaune (2e carton jaune = expulsion)
  if (entryType === 'second_yellow_card' || cardType === 'second_yellow') {
    return (
      <div className="relative w-5 h-6">
        <div className="absolute w-4 h-5 rounded-sm bg-yellow-400 left-0 top-0" />
        <div className="absolute w-4 h-5 rounded-sm bg-red-600 left-1 top-0.5" />
      </div>
    );
  }
  
  switch (entryType) {
    case 'goal':
      return <Goal className="w-5 h-5 text-green-500" />;
    case 'yellow_card':
    case 'card':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'red_card':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'substitution':
      return <Zap className="w-5 h-5 text-blue-500" />;
    case 'important':
      return <Radio className="w-5 h-5 text-red-500 animate-pulse" />;
    default:
      return <MessageSquare className="w-5 h-5 text-muted-foreground" />;
  }
};

const getEntryBadgeColor = (entryType: string) => {
  switch (entryType) {
    case 'goal':
      return 'bg-green-500/20 text-green-600 border-green-500/30';
    case 'card':
      return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    case 'substitution':
      return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    case 'important':
      return 'bg-red-500/20 text-red-600 border-red-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const LiveBlog = ({ matchId, isLive = false }: LiveBlogProps) => {
  const { entries, loading } = useLiveBlog(matchId);
  const { language, t } = useLanguage();

  const getLocale = () => {
    switch (language) {
      case 'es': return es;
      case 'en': return enUS;
      default: return fr;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0 && !isLive) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2">
          {isLive && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
          <Radio className="w-5 h-5" />
          Live Blog
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {entries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 text-center text-muted-foreground"
              >
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('liveBlog.waitingForUpdates')}</p>
              </motion.div>
            ) : (
              entries.map((entry, index) => (
                <LiveBlogEntryCard 
                  key={entry.id} 
                  entry={entry} 
                  index={index}
                  locale={getLocale()}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

interface LiveBlogEntryCardProps {
  entry: LiveBlogEntry;
  index: number;
  locale: typeof fr;
}

const LiveBlogEntryCard = ({ entry, index, locale }: LiveBlogEntryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`border-b last:border-b-0 p-4 ${
        entry.is_important ? 'bg-primary/5' : ''
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {getEntryIcon(entry.entry_type, entry.card_type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {entry.minute !== null && (
              <Badge variant="outline" className="font-mono">
                {entry.minute}'
              </Badge>
            )}
            <Badge className={getEntryBadgeColor(entry.entry_type)}>
              {entry.entry_type}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              {format(new Date(entry.created_at), 'HH:mm', { locale })}
            </span>
          </div>
          {entry.title && (
            <h4 className="font-semibold text-foreground mb-1">{entry.title}</h4>
          )}
          <p className="text-sm text-muted-foreground">{entry.content}</p>
          {entry.image_url && (
            <img 
              src={entry.image_url} 
              alt={entry.title || 'Live blog image'}
              className="mt-2 rounded-lg max-h-48 w-auto object-cover"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

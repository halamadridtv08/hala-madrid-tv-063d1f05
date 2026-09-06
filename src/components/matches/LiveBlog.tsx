import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio, Clock } from 'lucide-react';
import { useLiveBlog } from '@/hooks/useLiveBlog';
import { useLiveBlogReactions } from '@/hooks/useLiveBlogSocial';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { LiveBlogEntryCard, LiveBlogPlayer } from '@/components/liveblog/LiveBlogEntryCard';
import { LiveBlogComments } from '@/components/liveblog/LiveBlogComments';

interface LiveBlogProps {
  matchId: string;
  isLive?: boolean;
}

export const LiveBlog = ({ matchId, isLive = false }: LiveBlogProps) => {
  const { entries, loading } = useLiveBlog(matchId);
  const { t } = useLanguage();
  const { counts: reactionCounts, mine: myReactions, toggleReaction } = useLiveBlogReactions(matchId);
  const [players, setPlayers] = useState<Record<string, LiveBlogPlayer>>({});
  const [teams, setTeams] = useState<{
    ownSide: 'home' | 'away';
    ownLogo?: string | null;
    opponentLogo?: string | null;
  }>({ ownSide: 'home' });

  useEffect(() => {
    const load = async () => {
      const [{ data: squad }, { data: opponents }, { data: match }] = await Promise.all([
        supabase.from('players').select('id, name, jersey_number, position, image_url'),
        supabase.from('opposing_players').select('id, name, jersey_number, position'),
        supabase
          .from('matches')
          .select('home_team, home_team_logo, away_team_logo')
          .eq('id', matchId)
          .maybeSingle(),
      ]);

      const map: Record<string, LiveBlogPlayer> = {};
      (squad || []).forEach((p: any) => {
        map[p.id] = {
          id: p.id,
          name: p.name,
          jersey_number: p.jersey_number,
          position: p.position,
          image_url: p.image_url,
        };
      });
      (opponents || []).forEach((p: any) => {
        map[p.id] = {
          id: p.id,
          name: p.name,
          jersey_number: p.jersey_number,
          position: p.position,
          image_url: null,
        };
      });
      setPlayers(map);

      if (match) {
        const ownSide: 'home' | 'away' = /real madrid/i.test(match.home_team || '') ? 'home' : 'away';
        setTeams({
          ownSide,
          ownLogo: ownSide === 'home' ? match.home_team_logo : match.away_team_logo,
          opponentLogo: ownSide === 'home' ? match.away_team_logo : match.home_team_logo,
        });
      }
    };

    if (matchId) load();
  }, [matchId]);

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
    <div>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="flex items-center gap-2">
            {isLive && (
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
            )}
            <Radio className="h-5 w-5" />
            Live Blog
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {entries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 text-center text-muted-foreground"
                >
                  <Clock className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p>{t('liveBlog.waitingForUpdates')}</p>
                </motion.div>
              ) : (
                entries.map((entry, index) => (
                  <LiveBlogEntryCard
                    key={entry.id}
                    entry={entry}
                    index={index}
                    players={players}
                    ownSide={teams.ownSide}
                    ownTeamLogo={teams.ownLogo}
                    opponentLogo={teams.opponentLogo}
                    reactionCounts={reactionCounts[entry.id] || {}}
                    myReactions={myReactions[entry.id] || []}
                    onToggleReaction={(emoji) => toggleReaction(entry.id, emoji)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <LiveBlogComments matchId={matchId} />
    </div>
  );
};

import { motion } from 'framer-motion';
import { ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EntryReactions } from './EntryReactions';
import type { LiveBlogEntry } from '@/hooks/useLiveBlog';

export interface LiveBlogPlayer {
  id: string;
  name: string;
  jersey_number?: number | null;
  position?: string | null;
  image_url?: string | null;
}

interface LiveBlogEntryCardProps {
  entry: LiveBlogEntry;
  index?: number;
  players: Record<string, LiveBlogPlayer>;
  ownTeamLogo?: string | null;
  opponentLogo?: string | null;
  ownSide?: 'home' | 'away';
  reactionCounts: Record<string, number>;
  myReactions: string[];
  onToggleReaction: (emoji: string) => void;
}

const ENTRY_LABELS: Record<string, string> = {
  goal: 'But !',
  own_goal: 'But contre son camp',
  penalty_goal: 'But sur penalty',
  penalty_missed: 'Pénalty manqué',
  yellow_card: 'Carton jaune',
  second_yellow_card: 'Second carton jaune',
  red_card: 'Carton rouge',
  card: 'Carton',
  substitution: 'Remplacement',
  var: 'VAR',
  injury: 'Blessure',
  important: 'Moment fort',
  chance: 'Occasion',
  corner: 'Corner',
  foul: 'Faute',
  kickoff: "Coup d'envoi",
  halftime: 'Mi-temps',
  fulltime: 'Fin du match',
  quote: 'Citation',
};

const isGoal = (type: string) => ['goal', 'penalty_goal', 'own_goal'].includes(type);

const CardIcon = ({ type }: { type: string }) => {
  if (type === 'second_yellow_card') {
    return (
      <span className="relative inline-block h-5 w-4 align-middle">
        <span className="absolute left-0 top-0 h-4 w-3 rounded-[2px] bg-yellow-400" />
        <span className="absolute left-1 top-1 h-4 w-3 rounded-[2px] bg-red-600" />
      </span>
    );
  }
  if (type === 'yellow_card') return <span className="inline-block h-4 w-3 rounded-[2px] bg-yellow-400" />;
  if (type === 'red_card') return <span className="inline-block h-4 w-3 rounded-[2px] bg-red-600" />;
  return null;
};

const PlayerRow = ({
  player,
  teamLogo,
  badge,
}: {
  player: LiveBlogPlayer;
  teamLogo?: string | null;
  badge?: 'in' | 'out' | null;
}) => (
  <div className="flex items-center gap-3">
    <div className="relative flex-shrink-0">
      {player.image_url ? (
        <img
          src={player.image_url}
          alt={player.name}
          loading="lazy"
          className="h-11 w-11 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-sm font-bold">
          {player.jersey_number ?? player.name.charAt(0)}
        </div>
      )}
      {badge === 'in' && (
        <ArrowRightCircle className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background text-green-500" />
      )}
      {badge === 'out' && (
        <ArrowLeftCircle className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background text-red-500" />
      )}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold text-foreground">
        {player.jersey_number != null && (
          <span className="mr-1 font-normal text-muted-foreground">{player.jersey_number}</span>
        )}
        {player.name}
      </p>
      {player.position && (
        <p className="truncate text-sm text-muted-foreground">{player.position}</p>
      )}
    </div>
    {teamLogo && <img src={teamLogo} alt="" className="h-6 w-6 flex-shrink-0 object-contain" />}
  </div>
);

export const LiveBlogEntryCard = ({
  entry,
  index = 0,
  players,
  ownTeamLogo,
  opponentLogo,
  ownSide = 'home',
  reactionCounts,
  myReactions,
  onToggleReaction,
}: LiveBlogEntryCardProps) => {
  const label = ENTRY_LABELS[entry.entry_type];
  const goal = isGoal(entry.entry_type);
  const teamLogo =
    entry.team_side === null || entry.team_side === undefined
      ? null
      : entry.team_side === ownSide
        ? ownTeamLogo
        : opponentLogo;

  const mainPlayer = entry.player_id ? players[entry.player_id] : null;
  const outPlayer = entry.substituted_player_id ? players[entry.substituted_player_id] : null;
  const assistPlayer = entry.assist_player_id ? players[entry.assist_player_id] : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className={cn(
        'rounded-2xl border border-border/60 bg-card p-4 shadow-sm md:p-5',
        goal && 'border-green-600/40 bg-gradient-to-b from-green-900/25 to-card',
        entry.is_important && !goal && 'border-primary/40'
      )}
    >
      {/* Header : minute + libellé */}
      <div className="mb-3 flex items-center gap-3">
        {entry.minute !== null && entry.minute !== undefined && (
          <span
            className={cn(
              'rounded-full px-3 py-1 text-sm font-bold tabular-nums',
              goal ? 'bg-green-600 text-white' : 'bg-muted text-foreground'
            )}
          >
            {entry.minute}'
          </span>
        )}
        {label && (
          <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground">
            <CardIcon type={entry.entry_type} />
            {entry.title || label}
          </h3>
        )}
        {!label && entry.title && (
          <h3 className="text-lg font-extrabold tracking-tight text-foreground">{entry.title}</h3>
        )}
      </div>

      {/* Bloc joueur(s) */}
      {(mainPlayer || outPlayer) && (
        <div className="mb-3 space-y-2 rounded-xl bg-muted/40 p-3">
          {mainPlayer && (
            <PlayerRow
              player={mainPlayer}
              teamLogo={teamLogo}
              badge={entry.entry_type === 'substitution' ? 'in' : null}
            />
          )}
          {outPlayer && (
            <>
              <div className="h-px bg-border/60" />
              <PlayerRow player={outPlayer} teamLogo={null} badge="out" />
            </>
          )}
          {assistPlayer && (
            <p className="pl-1 text-sm text-muted-foreground">
              Passe décisive : <span className="font-medium text-foreground">{assistPlayer.name}</span>
            </p>
          )}
        </div>
      )}

      {/* Texte */}
      {entry.content && (
        <p className="text-[15px] leading-relaxed text-foreground/90">{entry.content}</p>
      )}

      {entry.card_reason && (
        <p className="mt-2 text-sm italic text-muted-foreground">{entry.card_reason}</p>
      )}

      {entry.image_url && (
        <img
          src={entry.image_url}
          alt={entry.title || 'Illustration'}
          loading="lazy"
          className="mt-3 w-full rounded-xl object-cover"
        />
      )}

      <EntryReactions counts={reactionCounts} mine={myReactions} onToggle={onToggleReaction} />
    </motion.article>
  );
};

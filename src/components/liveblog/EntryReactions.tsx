import { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { REACTION_EMOJIS } from '@/hooks/useLiveBlogSocial';

interface EntryReactionsProps {
  counts: Record<string, number>;
  mine: string[];
  onToggle: (emoji: string) => void;
  className?: string;
}

export const EntryReactions = ({ counts, mine, onToggle, className }: EntryReactionsProps) => {
  const [open, setOpen] = useState(false);

  const visible = REACTION_EMOJIS.filter((emoji) => (counts[emoji] || 0) > 0);

  return (
    <div className={cn('flex flex-wrap items-center gap-2 pt-3', className)}>
      {visible.map((emoji) => {
        const active = mine.includes(emoji);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onToggle(emoji)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all',
              'bg-muted/60 hover:bg-muted active:scale-95',
              active && 'bg-primary/15 ring-1 ring-primary/40 text-primary'
            )}
            aria-pressed={active}
            aria-label={`Réagir avec ${emoji}`}
          >
            <span className="text-base leading-none">{emoji}</span>
            <span className="tabular-nums">{counts[emoji]}</span>
          </button>
        );
      })}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center justify-center rounded-full bg-muted/60 p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Ajouter une réaction"
          >
            <SmilePlus className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onToggle(emoji);
                  setOpen(false);
                }}
                className={cn(
                  'rounded-lg p-2 text-xl transition-transform hover:scale-125',
                  mine.includes(emoji) && 'bg-primary/15'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

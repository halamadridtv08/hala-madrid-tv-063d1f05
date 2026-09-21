import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Zap, Undo2, Check, ChevronsUpDown, Info, AlertTriangle, History,
  CircleDot, Square, ArrowLeftRight, X, Loader2, Crosshair, Flag,
  ShieldAlert, Activity, Stethoscope, MonitorCheck, CircleOff,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { NewLiveBlogEntry } from '@/hooks/useLiveBlog';
import type { Match } from '@/types/Match';

export interface RosterPlayer {
  id: string;
  name: string;
  jersey_number: number | null;
  side: 'own' | 'opponent';
  position?: string | null;
}

type ActionKind =
  | 'goal'
  | 'card'
  | 'substitution'
  | 'chance'
  | 'corner'
  | 'foul'
  | 'injury'
  | 'var'
  | 'penalty_missed'
  | 'second_yellow';

interface StatDelta {
  playerId: string;
  field: 'goals' | 'assists' | 'yellow_cards' | 'red_cards';
  amount: number;
}

export interface JournalAction {
  id: string;
  kind: ActionKind;
  label: string;
  detail: string;
  minute: number | null;
  at: Date;
  author: string;
  entryId: string | null;
  scoreField: 'home_score' | 'away_score' | null;
  statDeltas: StatDelta[];
  undone: boolean;
}

interface QuickActionsPanelProps {
  match: Match | undefined;
  ownPlayers: { id: string; name: string; jersey_number: number | null; position?: string | null }[];
  playersLoading: boolean;
  currentMinute: string | number;
  periodLabel: string;
  getNumericMinute: () => number;
  addEntry: (entry: NewLiveBlogEntry) => Promise<{ id: string }>;
  deleteEntry: (id: string) => Promise<void>;
  userId?: string | null;
  userLabel: string;
  onScoreChange: (home: number, away: number) => void;
}

const jersey = (p: RosterPlayer) => (p.jersey_number ? `#${p.jersey_number} ` : '');
const label = (p?: RosterPlayer | null) =>
  p ? (p.jersey_number ? `${p.name} (#${p.jersey_number})` : p.name) : '';

/* ---------------- Player picker (keyboard-first) ---------------- */
const PlayerPicker = ({
  players,
  value,
  onChange,
  placeholder,
  disabled,
  allowClear = true,
  autoOpenRef,
}: {
  players: RosterPlayer[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  allowClear?: boolean;
  autoOpenRef?: React.MutableRefObject<(() => void) | null>;
}) => {
  const [open, setOpen] = useState(false);
  const selected = players.find((p) => p.id === value) || null;

  useEffect(() => {
    if (autoOpenRef) autoOpenRef.current = () => setOpen(true);
  }, [autoOpenRef]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn('h-9 w-full justify-between font-normal', !selected && 'text-muted-foreground')}
        >
          <span className="truncate">{selected ? label(selected) : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover z-50" align="start">
        <Command>
          <CommandInput placeholder="Tapez un nom ou un numéro..." />
          <CommandList>
            <CommandEmpty>Joueur introuvable — vérifiez l'effectif ou l'équipe adverse.</CommandEmpty>
            {allowClear && (
              <CommandGroup>
                <CommandItem
                  value="__clear__"
                  onSelect={() => {
                    onChange('');
                    setOpen(false);
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> Aucun
                </CommandItem>
              </CommandGroup>
            )}
            {(['own', 'opponent'] as const).map((side) => {
              const list = players.filter((p) => p.side === side);
              if (!list.length) return null;
              return (
                <CommandGroup key={side} heading={side === 'own' ? 'Effectif' : 'Équipe adverse'}>
                  {list.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={`${p.name} ${p.jersey_number ?? ''}`}
                      onSelect={() => {
                        onChange(p.id);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', value === p.id ? 'opacity-100' : 'opacity-0')} />
                      <span className="font-mono text-xs text-muted-foreground mr-2">{jersey(p) || '—'}</span>
                      {p.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

/* ---------------- Main panel ---------------- */
export const QuickActionsPanel = ({
  match,
  ownPlayers,
  playersLoading,
  currentMinute,
  periodLabel,
  getNumericMinute,
  addEntry,
  deleteEntry,
  userId,
  userLabel,
  onScoreChange,
}: QuickActionsPanelProps) => {
  const { toast } = useToast();
  const [opponents, setOpponents] = useState<RosterPlayer[]>([]);
  const [opponentsLoading, setOpponentsLoading] = useState(false);
  const [kind, setKind] = useState<ActionKind>('goal');
  const [side, setSide] = useState<'home' | 'away'>('home');
  const [scorerId, setScorerId] = useState('');
  const [assistId, setAssistId] = useState('');
  const [freeName, setFreeName] = useState('');
  const [goalType, setGoalType] = useState<'normal' | 'penalty' | 'free_kick' | 'header' | 'own_goal'>('normal');
  const [cardType, setCardType] = useState<'yellow' | 'red'>('yellow');
  const [subOutId, setSubOutId] = useState('');
  const [subInId, setSubInId] = useState('');
  const [eventNote, setEventNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [journal, setJournal] = useState<JournalAction[]>([]);
  const [undoing, setUndoing] = useState<string | null>(null);
  const openScorerRef = useRef<(() => void) | null>(null);

  const ownSide: 'home' | 'away' =
    match?.away_team?.toLowerCase().includes('real madrid') ? 'away' : 'home';

  useEffect(() => {
    setSide(ownSide);
  }, [ownSide, match?.id]);

  // Load opposing players from the team directory
  useEffect(() => {
    const teamId = match?.opposing_team_id;
    if (!teamId) {
      setOpponents([]);
      return;
    }
    let cancelled = false;
    setOpponentsLoading(true);
    supabase
      .from('opposing_players')
      .select('id, name, jersey_number, position')
      .eq('team_id', teamId)
      .order('jersey_number', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        setOpponents(
          (data || []).map((p) => ({
            id: p.id,
            name: p.name,
            jersey_number: p.jersey_number,
            position: p.position,
            side: 'opponent' as const,
          }))
        );
        setOpponentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [match?.opposing_team_id]);

  const roster: RosterPlayer[] = useMemo(
    () => [
      ...ownPlayers.map((p) => ({ ...p, side: 'own' as const })),
      ...opponents,
    ],
    [ownPlayers, opponents]
  );

  const sideRoster = useMemo(
    () => roster.filter((p) => (side === ownSide ? p.side === 'own' : p.side === 'opponent')),
    [roster, side, ownSide]
  );

  const find = useCallback((id: string) => roster.find((p) => p.id === id) || null, [roster]);
  const isOwnSide = side === ownSide;
  const teamName = (s: 'home' | 'away') => (s === 'home' ? match?.home_team : match?.away_team) || '';

  const noOpponentRoster = !isOwnSide && opponents.length === 0;

  /* -------- guidance / status message -------- */
  const guidance = useMemo(() => {
    if (!match) return { tone: 'info' as const, text: 'Sélectionnez un match pour activer les actions express.' };
    if (kind === 'goal') {
      if (isOwnSide && !scorerId && !freeName.trim())
        return {
          tone: 'warn' as const,
          text: `But de ${teamName(side)} : sélectionnez le buteur ou saisissez un nom libre (ex. CSC adverse).`,
        };
      if (!isOwnSide && !scorerId && !freeName.trim())
        return {
          tone: 'warn' as const,
          text: noOpponentRoster
            ? "Joueur introuvable : aucun effectif adverse enregistré — saisissez le nom libre (ignore possible)."
            : 'Choisissez le buteur adverse ou saisissez un nom libre (ignore possible).',
        };
      return { tone: 'ok' as const, text: 'Prêt : Entrée pour valider, Échap pour annuler la saisie.' };
    }
    if (kind === 'card' || kind === 'second_yellow') {
      if (!scorerId && !freeName.trim())
        return { tone: 'warn' as const, text: `${kind === 'second_yellow' ? 'Deuxième jaune' : 'Carton'} : sélectionnez le joueur ou saisissez un nom libre.` };
      return { tone: 'ok' as const, text: 'Prêt : Entrée pour valider la décision.' };
    }
    if (kind === 'substitution' && (!subOutId || !subInId))
      return { tone: 'warn' as const, text: 'Remplacement : sélectionnez le sortant puis l’entrant.' };
    if (kind === 'penalty_missed' && !scorerId && !freeName.trim())
      return { tone: 'warn' as const, text: 'Penalty manqué : sélectionnez le tireur ou saisissez son nom.' };
    return { tone: 'ok' as const, text: 'Prêt : Entrée pour publier cet événement.' };
  }, [match, kind, isOwnSide, scorerId, freeName, subOutId, subInId, side, noOpponentRoster]);

  const resetForm = () => {
    setScorerId('');
    setAssistId('');
    setFreeName('');
    setSubInId('');
    setSubOutId('');
    setEventNote('');
    setGoalType('normal');
  };

  const bumpStat = async (playerId: string, field: StatDelta['field'], amount: number) => {
    if (!playerId || !match) return;
    const { data: existing } = await supabase
      .from('player_stats')
      .select('id, goals, assists, yellow_cards, red_cards')
      .eq('player_id', playerId)
      .eq('match_id', match.id)
      .maybeSingle();
    if (existing) {
      const next = Math.max(0, (((existing as unknown as Record<string, number>)[field] as number) || 0) + amount);
      await supabase.from('player_stats').update({ [field]: next } as never).eq('id', existing.id);
    } else if (amount > 0) {
      await supabase
        .from('player_stats')
        .insert({ player_id: playerId, match_id: match.id, [field]: amount } as never);
    }
  };

  const pushJournal = (a: Omit<JournalAction, 'id' | 'at' | 'author' | 'undone'>) =>
    setJournal((prev) => [
      { ...a, id: crypto.randomUUID(), at: new Date(), author: userLabel, undone: false },
      ...prev,
    ].slice(0, 40));

  /* -------- submit -------- */
  const submit = async () => {
    if (!match || submitting) return;
    if (guidance.tone === 'warn') {
      toast({ title: 'Action incomplète', description: guidance.text, variant: 'destructive' });
      return;
    }
    const minute = getNumericMinute();
    setSubmitting(true);
    try {
      if (kind === 'goal') {
        const scorer = find(scorerId);
        const assist = find(assistId);
        const name = scorer ? label(scorer) : freeName.trim();
        const newHome = side === 'home' ? (match.home_score || 0) + 1 : match.home_score || 0;
        const newAway = side === 'away' ? (match.away_score || 0) + 1 : match.away_score || 0;
        const scoreField = side === 'home' ? 'home_score' : 'away_score';

        await supabase
          .from('matches')
          .update({ [scoreField]: side === 'home' ? newHome : newAway } as never)
          .eq('id', match.id);
        onScoreChange(newHome, newAway);

        const extras = goalType === 'penalty' ? ' • Penalty' : goalType === 'free_kick' ? ' • Coup franc' : goalType === 'own_goal' ? ' • CSC' : goalType === 'header' ? ' • Tête' : '';
        const entry = await addEntry({
          match_id: match.id,
          minute,
          entry_type: goalType === 'penalty' ? 'penalty_goal' : goalType === 'free_kick' ? 'free_kick_goal' : goalType === 'own_goal' ? 'own_goal' : 'goal',
          title: `⚽ BUT! ${name || teamName(side)} (${teamName(side)})${extras}`,
          content: [
            name ? `${name} trouve la faille pour ${teamName(side)}!` : `${teamName(side)} marque!`,
            assist ? `Passe décisive : ${label(assist)}.` : '',
            `Score : ${match.home_team} ${newHome} - ${newAway} ${match.away_team}`,
          ].filter(Boolean).join(' '),
          is_important: true,
          author_id: userId || null,
          player_id: scorer?.side === 'own' ? scorer.id : null,
          assist_player_id: assist?.side === 'own' ? assist.id : null,
          team_side: side,
        });

        const deltas: StatDelta[] = [];
        if (scorer?.side === 'own' && goalType !== 'own_goal') {
          await bumpStat(scorer.id, 'goals', 1);
          deltas.push({ playerId: scorer.id, field: 'goals', amount: 1 });
        }
        if (assist?.side === 'own') {
          await bumpStat(assist.id, 'assists', 1);
          deltas.push({ playerId: assist.id, field: 'assists', amount: 1 });
        }

        pushJournal({
          kind: 'goal',
          label: `But ${teamName(side)}`,
          detail: `${name || 'Buteur inconnu'}${assist ? ` • passe de ${label(assist)}` : ''} — ${newHome}-${newAway}`,
          minute,
          entryId: entry.id,
          scoreField,
          statDeltas: deltas,
        });
        toast({ title: `Action appliquée — But ${teamName(side)} (${newHome}-${newAway})`, description: name || undefined });
      } else if (kind === 'card' || kind === 'second_yellow') {
        const player = find(scorerId);
        const name = player ? label(player) : freeName.trim();
        const secondYellow = kind === 'second_yellow';
        const entry = await addEntry({
          match_id: match.id,
          minute,
          entry_type: secondYellow ? 'second_yellow_card' : cardType === 'yellow' ? 'yellow_card' : 'red_card',
          title: `${secondYellow ? '🟨🟥 Deuxième carton jaune' : cardType === 'yellow' ? '🟨 Carton jaune' : '🟥 Carton rouge'} — ${name}`,
          content: secondYellow
            ? `${name} reçoit un deuxième carton jaune et est expulsé (${teamName(side)}).`
            : cardType === 'yellow'
            ? `${name} reçoit un carton jaune (${teamName(side)}).`
            : `${name} est expulsé! Carton rouge (${teamName(side)}).`,
          is_important: secondYellow || cardType === 'red',
          author_id: userId || null,
          player_id: player?.side === 'own' ? player.id : null,
          card_type: secondYellow ? 'second_yellow' : cardType,
          team_side: side,
        });
        const deltas: StatDelta[] = [];
        if (player?.side === 'own') {
          if (secondYellow) {
            await bumpStat(player.id, 'yellow_cards', 1);
            await bumpStat(player.id, 'red_cards', 1);
            deltas.push(
              { playerId: player.id, field: 'yellow_cards', amount: 1 },
              { playerId: player.id, field: 'red_cards', amount: 1 }
            );
          } else {
            const field = cardType === 'yellow' ? 'yellow_cards' : 'red_cards';
            await bumpStat(player.id, field, 1);
            deltas.push({ playerId: player.id, field, amount: 1 });
          }
        }
        pushJournal({
          kind,
          label: secondYellow ? 'Deuxième jaune' : cardType === 'yellow' ? 'Carton jaune' : 'Carton rouge',
          detail: `${name} — ${teamName(side)}`,
          minute,
          entryId: entry.id,
          scoreField: null,
          statDeltas: deltas,
        });
        toast({ title: 'Action appliquée — carton enregistré', description: name });
      } else if (kind === 'substitution') {
        const out = find(subOutId);
        const inn = find(subInId);
        const entry = await addEntry({
          match_id: match.id,
          minute,
          entry_type: 'substitution',
          title: `🔄 Changement — ${label(inn)}`,
          content: `${label(inn)} remplace ${label(out)} (${teamName(side)}).`,
          is_important: false,
          author_id: userId || null,
          player_id: inn?.side === 'own' ? inn.id : null,
          substituted_player_id: out?.side === 'own' ? out.id : null,
          team_side: side,
        });
        pushJournal({
          kind: 'substitution',
          label: 'Remplacement',
          detail: `${label(inn)} ↔ ${label(out)} — ${teamName(side)}`,
          minute,
          entryId: entry.id,
          scoreField: null,
          statDeltas: [],
        });
        toast({ title: 'Action appliquée — changement publié', description: `${label(inn)} ↔ ${label(out)}` });
      } else {
        const player = find(scorerId);
        const name = player ? label(player) : freeName.trim();
        const eventConfig = {
          chance: { type: 'chance', title: '🎯 Occasion', fallback: 'Une occasion dangereuse se présente.' },
          corner: { type: 'corner', title: '🚩 Corner', fallback: 'Corner obtenu.' },
          foul: { type: 'foul', title: '🛡️ Faute', fallback: 'Une faute est signalée.' },
          injury: { type: 'injury', title: '🏥 Blessure', fallback: 'Le jeu est interrompu pour une blessure.' },
          var: { type: 'var', title: '📺 Intervention VAR', fallback: 'La VAR examine la situation.' },
          penalty_missed: { type: 'penalty_missed', title: '⛔ Penalty manqué', fallback: 'Le penalty est manqué.' },
        }[kind];
        if (!eventConfig) return;
        const detail = [name, teamName(side)].filter(Boolean).join(' — ');
        const entry = await addEntry({
          match_id: match.id,
          minute,
          entry_type: eventConfig.type,
          title: `${eventConfig.title}${name ? ` — ${name}` : ''}`,
          content: eventNote.trim() || `${eventConfig.fallback}${detail ? ` ${detail}.` : ''}`,
          is_important: kind === 'chance' || kind === 'var' || kind === 'penalty_missed' || kind === 'injury',
          author_id: userId || null,
          player_id: player?.side === 'own' ? player.id : null,
          team_side: side,
        });
        pushJournal({
          kind,
          label: eventConfig.title.replace(/^\S+\s/, ''),
          detail: detail || eventNote.trim() || teamName(side),
          minute,
          entryId: entry.id,
          scoreField: null,
          statDeltas: [],
        });
        toast({ title: `Action appliquée — ${eventConfig.title.replace(/^\S+\s/, '')}` });
      }
      resetForm();
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: "L'action n'a pas pu être enregistrée", variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  /* -------- undo -------- */
  const undo = async (action: JournalAction) => {
    if (!match || action.undone) return;
    setUndoing(action.id);
    try {
      if (action.entryId) await deleteEntry(action.entryId);
      if (action.scoreField) {
        const current = action.scoreField === 'home_score' ? match.home_score || 0 : match.away_score || 0;
        const next = Math.max(0, current - 1);
        await supabase.from('matches').update({ [action.scoreField]: next } as never).eq('id', match.id);
        onScoreChange(
          action.scoreField === 'home_score' ? next : match.home_score || 0,
          action.scoreField === 'away_score' ? next : match.away_score || 0
        );
      }
      for (const d of action.statDeltas) await bumpStat(d.playerId, d.field, -d.amount);
      setJournal((prev) => prev.map((a) => (a.id === action.id ? { ...a, undone: true } : a)));
      toast({ title: 'Action annulée', description: `${action.label} — ${action.detail}` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: "Annulation impossible", variant: 'destructive' });
    } finally {
      setUndoing(null);
    }
  };

  // Correction: re-load the action into the composer then undo it
  const correct = (action: JournalAction) => {
    setKind(action.kind);
    void undo(action);
    toast({ title: 'Mode correction', description: 'Action retirée — ressaisissez les bons joueurs puis validez.' });
  };

  /* -------- keyboard shortcuts -------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target && ['INPUT', 'TEXTAREA'].includes(target.tagName);
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !typing)) {
        if (!match) return;
        e.preventDefault();
        void submit();
      } else if (e.key === 'Escape' && !typing) {
        resetForm();
      } else if (!typing && !e.metaKey && !e.ctrlKey) {
        if (e.key.toLowerCase() === 'g') setKind('goal');
        if (e.key.toLowerCase() === 'c') setKind('card');
        if (e.key.toLowerCase() === 'r') setKind('substitution');
        if (e.key.toLowerCase() === 'b') openScorerRef.current?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const kinds: { value: ActionKind; label: string; icon: typeof CircleDot; hint: string }[] = [
    { value: 'goal', label: 'But', icon: CircleDot, hint: 'G' },
    { value: 'card', label: 'Carton', icon: Square, hint: 'C' },
    { value: 'substitution', label: 'Remplacement', icon: ArrowLeftRight, hint: 'R' },
    { value: 'chance', label: 'Occasion', icon: Crosshair, hint: '' },
    { value: 'corner', label: 'Corner', icon: Flag, hint: '' },
    { value: 'foul', label: 'Faute', icon: ShieldAlert, hint: '' },
    { value: 'injury', label: 'Blessure', icon: Stethoscope, hint: '' },
    { value: 'var', label: 'VAR', icon: MonitorCheck, hint: '' },
    { value: 'penalty_missed', label: 'Penalty raté', icon: CircleOff, hint: '' },
    { value: 'second_yellow', label: '2e jaune', icon: Square, hint: '' },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4 text-primary" />
            Action express
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[11px]">{currentMinute}' • {periodLabel}</Badge>
            <Badge variant="secondary" className="text-[10px]">G / C / R • B • Entrée • Échap</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* Composer */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {kinds.map((k) => {
                const Icon = k.icon;
                return (
                  <Button
                    key={k.value}
                    type="button"
                    variant={kind === k.value ? 'default' : 'outline'}
                    onClick={() => setKind(k.value)}
                    className="min-w-0 justify-center gap-1.5 px-2"
                    size="sm"
                  >
                    <Icon className="w-4 h-4" />
                    {k.label}
                    {k.hint && <span className="text-[10px] opacity-60">{k.hint}</span>}
                  </Button>
                );
              })}
            </div>

            {/* Team switch */}
            <div className="grid grid-cols-2 gap-2">
              {(['home', 'away'] as const).map((s) => (
                <Button
                  key={s}
                  type="button"
                  size="sm"
                  variant={side === s ? 'secondary' : 'ghost'}
                  className={cn('border', side === s ? 'border-primary' : 'border-border')}
                  onClick={() => {
                    setSide(s);
                    resetForm();
                  }}
                >
                  <span className="truncate">{teamName(s) || (s === 'home' ? 'Domicile' : 'Extérieur')}</span>
                </Button>
              ))}
            </div>

            {playersLoading || opponentsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : (
              <>
                {kind === 'goal' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Buteur ({teamName(side)})</Label>
                      <PlayerPicker
                        players={sideRoster}
                        value={scorerId}
                        onChange={setScorerId}
                        placeholder="Qui a marqué ? (B)"
                        autoOpenRef={openScorerRef}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Passe décisive (optionnel)</Label>
                      <PlayerPicker
                        players={sideRoster.filter((p) => p.id !== scorerId)}
                        value={assistId}
                        onChange={setAssistId}
                        placeholder="Passeur"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
                      {([
                        { value: 'normal', label: 'Normal' },
                        { value: 'penalty', label: 'Penalty' },
                        { value: 'free_kick', label: 'Coup franc' },
                        { value: 'header', label: 'Tête' },
                        { value: 'own_goal', label: 'CSC' },
                      ] as const).map((o) => (
                        <Button
                          key={o.value}
                          type="button"
                          size="sm"
                          variant={goalType === o.value ? 'default' : 'outline'}
                          className="text-[11px] px-1"
                          onClick={() => setGoalType(o.value)}
                        >
                          {o.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {(kind === 'card' || kind === 'second_yellow') && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Joueur averti ({teamName(side)})</Label>
                      <PlayerPicker
                        players={sideRoster}
                        value={scorerId}
                        onChange={setScorerId}
                        placeholder="Sélectionnez le joueur (B)"
                        autoOpenRef={openScorerRef}
                      />
                    </div>
                    {kind === 'card' && <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={cardType === 'yellow' ? 'default' : 'outline'}
                        onClick={() => setCardType('yellow')}
                      >
                        🟨 Jaune
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={cardType === 'red' ? 'default' : 'outline'}
                        onClick={() => setCardType('red')}
                      >
                        🟥 Rouge
                      </Button>
                    </div>}
                  </div>
                )}

                {kind === 'substitution' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sortant ({teamName(side)})</Label>
                      <PlayerPicker players={sideRoster} value={subOutId} onChange={setSubOutId} placeholder="Joueur sortant" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Entrant</Label>
                      <PlayerPicker
                        players={sideRoster.filter((p) => p.id !== subOutId)}
                        value={subInId}
                        onChange={setSubInId}
                        placeholder="Joueur entrant"
                      />
                    </div>
                  </div>
                )}

                {kind !== 'substitution' && (
                  <Input
                    placeholder={
                      isOwnSide ? 'Nom libre (si joueur hors effectif)' : 'Nom libre (joueur adverse non enregistré)'
                    }
                    value={freeName}
                    onChange={(e) => setFreeName(e.target.value)}
                    className="h-9"
                    disabled={!!scorerId}
                  />
                )}

                {['chance', 'corner', 'foul', 'injury', 'var', 'penalty_missed'].includes(kind) && (
                  <Input
                    placeholder="Précision courte (optionnelle)"
                    value={eventNote}
                    onChange={(e) => setEventNote(e.target.value)}
                    className="h-9"
                  />
                )}
              </>
            )}

            {/* Status / guidance */}
            <div
              className={cn(
                'flex items-start gap-2 rounded-md border p-2.5 text-xs',
                guidance.tone === 'warn'
                  ? 'border-destructive/40 bg-destructive/10 text-destructive'
                  : guidance.tone === 'ok'
                  ? 'border-primary/40 bg-primary/10 text-foreground'
                  : 'border-border bg-muted text-muted-foreground'
              )}
            >
              {guidance.tone === 'warn' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-px" />
              ) : (
                <Info className="w-4 h-4 shrink-0 mt-px" />
              )}
              <span>{guidance.text}</span>
            </div>

            {noOpponentRoster && (
              <p className="text-[11px] text-muted-foreground">
                Astuce : ajoutez les joueurs de cette équipe dans « Équipes Adverses » pour les retrouver ici automatiquement.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="flex-1" onClick={submit} disabled={submitting || !match}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Valider l'action
              </Button>
              <Button variant="outline" onClick={resetForm} disabled={submitting} className="sm:w-auto">
                <X className="w-4 h-4 mr-1" />
                Effacer
              </Button>
            </div>
          </div>

          {/* Journal */}
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <History className="w-4 h-4" />
                Journal des actions
              </div>
              <Badge variant="outline" className="text-[10px]">{journal.filter((a) => !a.undone).length} actives</Badge>
            </div>
            <Separator />
            <ScrollArea className="h-[320px] pr-2">
              {journal.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  Aucune action enregistrée pour cette session. Chaque but, carton et changement apparaîtra ici avec son auteur et son heure.
                </p>
              ) : (
                <div className="space-y-2">
                  {journal.map((a) => (
                    <div
                      key={a.id}
                      className={cn(
                        'rounded-md border bg-card p-2.5 text-xs space-y-1',
                        a.undone && 'opacity-50 line-through'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">
                          {a.minute !== null ? `${a.minute}' ` : ''}{a.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(a.at, 'HH:mm:ss', { locale: fr })}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{a.detail}</p>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-muted-foreground">par {a.author}</span>
                        {!a.undone && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => correct(a)}>
                              Corriger
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-[11px]"
                              disabled={undoing === a.id}
                              onClick={() => undo(a)}
                            >
                              {undoing === a.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <><Undo2 className="w-3 h-3 mr-1" />Annuler</>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

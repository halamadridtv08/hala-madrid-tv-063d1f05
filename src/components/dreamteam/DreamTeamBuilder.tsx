import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Euro, Share2, Trophy, X, Search, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number | null;
  image_url: string | null;
  market_value: number;
}

interface SelectedPlayer extends Player {
  slot: string;
}

const BUDGET = 500; // Million euros
const FORMATION_SLOTS: Record<string, string[]> = {
  '4-3-3': ['GK', 'LB', 'CB1', 'CB2', 'RB', 'CM1', 'CM2', 'CM3', 'LW', 'ST', 'RW'],
  '4-4-2': ['GK', 'LB', 'CB1', 'CB2', 'RB', 'LM', 'CM1', 'CM2', 'RM', 'ST1', 'ST2'],
  '3-5-2': ['GK', 'CB1', 'CB2', 'CB3', 'LM', 'CM1', 'CM2', 'CM3', 'RM', 'ST1', 'ST2'],
};

export const DreamTeamBuilder = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [formation, setFormation] = useState('4-3-3');
  const [teamName, setTeamName] = useState('Mon XI de rêve');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('id, name, position, jersey_number, image_url, market_value')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching players:', error);
    } else {
      setPlayers(data || []);
    }
    setLoading(false);
  };

  const budgetUsed = selectedPlayers.reduce((sum, p) => sum + (p.market_value || 50), 0);
  const budgetRemaining = BUDGET - budgetUsed;

  const selectPlayer = (player: Player, slot: string) => {
    if (budgetRemaining < player.market_value) {
      toast({
        title: t('dreamTeam.budgetExceeded'),
        description: t('dreamTeam.budgetExceededDesc'),
        variant: 'destructive',
      });
      return;
    }

    const existingIndex = selectedPlayers.findIndex((p) => p.slot === slot);
    if (existingIndex !== -1) {
      const updated = [...selectedPlayers];
      updated[existingIndex] = { ...player, slot };
      setSelectedPlayers(updated);
    } else {
      setSelectedPlayers([...selectedPlayers, { ...player, slot }]);
    }
    setActiveSlot(null);
  };

  const removePlayer = (slot: string) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p.slot !== slot));
  };

  const saveTeam = async () => {
    try {
      const shareToken = crypto.randomUUID().slice(0, 8);
      
      const { error } = await supabase.from('dream_teams').insert({
        team_name: teamName,
        formation,
        players: selectedPlayers as any,
        total_budget_used: budgetUsed,
        share_token: shareToken,
      } as any);

      if (error) throw error;

      toast({
        title: t('dreamTeam.saved'),
        description: t('dreamTeam.savedDesc'),
      });

      // Copy share link
      const shareUrl = `${window.location.origin}/dream-team/${shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: t('dreamTeam.linkCopied'),
        description: shareUrl,
      });
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: t('dreamTeam.saveError'),
        variant: 'destructive',
      });
    }
  };

  const filteredPlayers = players.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedPlayers.some((sp) => sp.id === p.id)
  );

  const slots = FORMATION_SLOTS[formation] || FORMATION_SLOTS['4-3-3'];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Team Builder */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary" />
                {t('dreamTeam.title')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  <Euro className="w-4 h-4 mr-1" />
                  {budgetRemaining}M / {BUDGET}M
                </Badge>
              </div>
            </div>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Nom de votre équipe"
              className="max-w-xs"
            />
          </CardHeader>
          <CardContent>
            <Tabs value={formation} onValueChange={setFormation}>
              <TabsList>
                <TabsTrigger value="4-3-3">4-3-3</TabsTrigger>
                <TabsTrigger value="4-4-2">4-4-2</TabsTrigger>
                <TabsTrigger value="3-5-2">3-5-2</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-6">
              {slots.map((slot) => {
                const player = selectedPlayers.find((p) => p.slot === slot);
                return (
                  <motion.div
                    key={slot}
                    className={`relative p-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                      activeSlot === slot
                        ? 'border-primary bg-primary/10'
                        : player
                        ? 'border-secondary bg-secondary/10'
                        : 'border-muted-foreground/30 hover:border-primary/50'
                    }`}
                    onClick={() => setActiveSlot(activeSlot === slot ? null : slot)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {player ? (
                      <div className="text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePlayer(slot);
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="w-10 h-10 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                          {player.jersey_number || '?'}
                        </div>
                        <p className="text-xs font-medium mt-1 truncate">{player.name.split(' ').pop()}</p>
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          €{player.market_value}M
                        </Badge>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-10 h-10 mx-auto rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{slot}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={saveTeam}
                disabled={selectedPlayers.length < 11}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {t('dreamTeam.saveAndShare')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Selection */}
      <div>
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-lg">{t('dreamTeam.selectPlayers')}</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('dreamTeam.searchPlayer')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <AnimatePresence mode="popLayout">
                {filteredPlayers.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-3 p-3 border-b hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => activeSlot && selectPlayer(player, activeSlot)}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {player.jersey_number || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{player.position}</p>
                    </div>
                    <Badge variant="outline">€{player.market_value || 50}M</Badge>
                    {activeSlot && (
                      <Button size="sm" variant="ghost">
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

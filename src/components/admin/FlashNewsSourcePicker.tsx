import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlashNewsSource } from '@/types/FlashNewsSource';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Check, Users } from 'lucide-react';

interface FlashNewsSourcePickerProps {
  onSelect: (source: FlashNewsSource) => void;
  selectedSourceId?: string;
}

export const FlashNewsSourcePicker = ({ onSelect, selectedSourceId }: FlashNewsSourcePickerProps) => {
  const [sources, setSources] = useState<FlashNewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const { data, error } = await supabase
        .from('flash_news_sources')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSources(data || []);
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (source: FlashNewsSource) => {
    onSelect(source);
    setOpen(false);
  };

  const selectedSource = sources.find(s => s.id === selectedSourceId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <Users className="w-4 h-4 mr-2" />
          {selectedSource ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={selectedSource.avatar_url || undefined} />
                <AvatarFallback>{selectedSource.name[0]}</AvatarFallback>
              </Avatar>
              <span>{selectedSource.name}</span>
            </div>
          ) : (
            'Sélectionner une source'
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sélectionner une source</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {loading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : sources.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Aucune source disponible
            </div>
          ) : (
            sources.map((source) => (
              <Card
                key={source.id}
                className={`p-4 cursor-pointer hover:bg-accent transition-colors relative ${
                  selectedSourceId === source.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelect(source)}
              >
                {selectedSourceId === source.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div className="flex flex-col items-center gap-2 text-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={source.avatar_url || undefined} />
                    <AvatarFallback className="text-lg">{source.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">{source.name}</div>
                    <div className="text-xs text-muted-foreground">{source.handle}</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

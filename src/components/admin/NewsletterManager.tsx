import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Users, Trash2, Download, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  subscription_type: string;
  is_active: boolean;
  is_confirmed: boolean;
  subscribed_at: string;
}

export const NewsletterManager = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscribers:', error);
    } else {
      setSubscribers(data || []);
    }
    setLoading(false);
  };

  const toggleSubscriber = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } else {
      fetchSubscribers();
      toast({ title: isActive ? 'Abonné désactivé' : 'Abonné réactivé' });
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm('Supprimer cet abonné ?')) return;

    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } else {
      fetchSubscribers();
      toast({ title: 'Abonné supprimé' });
    }
  };

  const exportCSV = () => {
    const headers = ['Email', 'Nom', 'Type', 'Actif', 'Date inscription'];
    const rows = subscribers.map((s) => [
      s.email,
      s.name || '',
      s.subscription_type,
      s.is_active ? 'Oui' : 'Non',
      format(new Date(s.subscribed_at), 'dd/MM/yyyy'),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter_subscribers_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const dailySubscribers = subscribers.filter((s) => s.subscription_type === 'daily' && s.is_active);
  const weeklySubscribers = subscribers.filter((s) => s.subscription_type === 'weekly' && s.is_active);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{subscribers.filter((s) => s.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Abonnés actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{dailySubscribers.length}</p>
                <p className="text-sm text-muted-foreground">Newsletter quotidienne</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{weeklySubscribers.length}</p>
                <p className="text-sm text-muted-foreground">Newsletter hebdo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Send className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{subscribers.filter((s) => s.is_confirmed).length}</p>
                <p className="text-sm text-muted-foreground">Confirmés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Abonnés Newsletter</CardTitle>
          <Button onClick={exportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Tous ({subscribers.length})</TabsTrigger>
              <TabsTrigger value="daily">Quotidien ({dailySubscribers.length})</TabsTrigger>
              <TabsTrigger value="weekly">Hebdo ({weeklySubscribers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <SubscribersTable
                subscribers={subscribers}
                onToggle={toggleSubscriber}
                onDelete={deleteSubscriber}
              />
            </TabsContent>
            <TabsContent value="daily" className="mt-4">
              <SubscribersTable
                subscribers={dailySubscribers}
                onToggle={toggleSubscriber}
                onDelete={deleteSubscriber}
              />
            </TabsContent>
            <TabsContent value="weekly" className="mt-4">
              <SubscribersTable
                subscribers={weeklySubscribers}
                onToggle={toggleSubscriber}
                onDelete={deleteSubscriber}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface SubscribersTableProps {
  subscribers: Subscriber[];
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

const SubscribersTable = ({ subscribers, onToggle, onDelete }: SubscribersTableProps) => {
  if (subscribers.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Aucun abonné</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscribers.map((subscriber) => (
          <TableRow key={subscriber.id}>
            <TableCell className="font-medium">{subscriber.email}</TableCell>
            <TableCell>{subscriber.name || '-'}</TableCell>
            <TableCell>
              <Badge variant={subscriber.subscription_type === 'daily' ? 'default' : 'secondary'}>
                {subscriber.subscription_type === 'daily' ? 'Quotidien' : 'Hebdo'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={subscriber.is_active ? 'default' : 'outline'}>
                {subscriber.is_active ? 'Actif' : 'Inactif'}
              </Badge>
            </TableCell>
            <TableCell>
              {format(new Date(subscriber.subscribed_at), 'dd/MM/yyyy', { locale: fr })}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggle(subscriber.id, subscriber.is_active)}
                >
                  {subscriber.is_active ? 'Désactiver' : 'Activer'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(subscriber.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

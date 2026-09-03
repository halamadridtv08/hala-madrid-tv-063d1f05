import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, Eye, Users, CheckCircle2, Timer, FileDown, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

const db = supabase as any;

interface StoryStat {
  ring_id: string;
  title: string;
  is_highlight: boolean;
  views: number;
  unique_viewers: number;
  completions: number;
  avg_duration_ms: number;
  total_duration_ms: number;
}

const formatDuration = (ms: number) => {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
};

export function StoriesAnalyticsPanel() {
  const { toast } = useToast();
  const [stats, setStats] = useState<StoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState('30');
  const [type, setType] = useState('all');

  const load = async () => {
    setLoading(true);
    const { data, error } = await db.rpc('get_story_stats', { p_days: Number(days) });
    setLoading(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    setStats((data ?? []) as StoryStat[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const filteredStats = stats.filter((stat) => type === 'all' || (type === 'highlight' ? stat.is_highlight : !stat.is_highlight));

  const totals = filteredStats.reduce(
    (acc, s) => ({
      views: acc.views + Number(s.views),
      unique: acc.unique + Number(s.unique_viewers),
      completions: acc.completions + Number(s.completions),
      time: acc.time + Number(s.total_duration_ms),
    }),
    { views: 0, unique: 0, completions: 0, time: 0 },
  );

  const cards = [
    { label: 'Vues totales', value: totals.views, icon: Eye },
    { label: 'Visiteurs uniques', value: totals.unique, icon: Users },
    {
      label: 'Taux de complétion',
      value: totals.views ? `${Math.round((totals.completions / totals.views) * 100)}%` : '0%',
      icon: CheckCircle2,
    },
    { label: 'Temps total', value: formatDuration(totals.time), icon: Timer },
  ];

  const rows = filteredStats.map((stat) => [
    stat.title,
    stat.is_highlight ? 'À la une' : '24 h',
    Number(stat.views),
    Number(stat.unique_viewers),
    Number(stat.completions),
    Number(stat.views) ? `${Math.round((Number(stat.completions) / Number(stat.views)) * 100)}%` : '0%',
    formatDuration(Number(stat.avg_duration_ms)),
  ]);

  const exportCsv = () => {
    const header = ['Story', 'Type', 'Vues', 'Uniques', 'Complétions', 'Taux', 'Temps moyen'];
    const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((row) => row.map(escape).join(';')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    link.download = `stories-${days}j-${type}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text(`Statistiques des stories — ${days} jours`, 14, 16);
    autoTable(doc, {
      startY: 23,
      head: [['Story', 'Type', 'Vues', 'Uniques', 'Complétions', 'Taux', 'Temps moyen']],
      body: rows,
    });
    doc.save(`stories-${days}j-${type}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Statistiques des stories</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">24 heures</SelectItem>
              <SelectItem value="7">7 jours</SelectItem>
              <SelectItem value="30">30 jours</SelectItem>
              <SelectItem value="90">90 jours</SelectItem>
              <SelectItem value="365">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="daily">Stories 24 h</SelectItem>
              <SelectItem value="highlight">À la une</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!filteredStats.length}>
            <FileDown className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPdf} disabled={!filteredStats.length}>
            <FileText className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="icon" onClick={load} aria-label="Actualiser">
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredStats.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune donnée sur cette période.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Story</th>
                <th className="p-3">Vues</th>
                <th className="p-3">Uniques</th>
                <th className="p-3">Complétions</th>
                <th className="p-3">Taux</th>
                <th className="p-3">Temps moyen</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((s) => (
                <tr key={s.ring_id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.title}</span>
                      <Badge variant={s.is_highlight ? 'default' : 'secondary'}>
                        {s.is_highlight ? 'À la une' : '24 h'}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-3">{s.views}</td>
                  <td className="p-3">{s.unique_viewers}</td>
                  <td className="p-3">{s.completions}</td>
                  <td className="p-3">
                    {Number(s.views) ? `${Math.round((Number(s.completions) / Number(s.views)) * 100)}%` : '—'}
                  </td>
                  <td className="p-3">{formatDuration(Number(s.avg_duration_ms))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

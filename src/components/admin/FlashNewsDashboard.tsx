import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Calendar, AlertCircle } from "lucide-react";

interface FlashNewsStats {
  pending: number;
  approvedToday: number;
  scheduled: number;
  total: number;
}

export const FlashNewsDashboard = () => {
  const [stats, setStats] = useState<FlashNewsStats>({
    pending: 0,
    approvedToday: 0,
    scheduled: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Total count
      const { count: totalCount } = await supabase
        .from('flash_news')
        .select('*', { count: 'exact', head: true });

      // Pending count
      const { count: pendingCount } = await supabase
        .from('flash_news')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Approved today count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: approvedTodayCount } = await supabase
        .from('flash_news')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('approved_at', today.toISOString());

      // Scheduled count (future scheduled items)
      const { count: scheduledCount } = await supabase
        .from('flash_news')
        .select('*', { count: 'exact', head: true })
        .not('scheduled_at', 'is', null)
        .gte('scheduled_at', new Date().toISOString())
        .eq('status', 'approved');

      setStats({
        total: totalCount || 0,
        pending: pendingCount || 0,
        approvedToday: approvedTodayCount || 0,
        scheduled: scheduledCount || 0,
      });
    } catch (error) {
      console.error('Error fetching flash news stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En attente</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
          <p className="text-xs text-muted-foreground">
            À approuver par un admin
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approuvées aujourd'hui</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.approvedToday}</div>
          <p className="text-xs text-muted-foreground">
            Depuis minuit
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Programmées</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.scheduled}</div>
          <p className="text-xs text-muted-foreground">
            Publication automatique à venir
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Toutes les infos flash
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

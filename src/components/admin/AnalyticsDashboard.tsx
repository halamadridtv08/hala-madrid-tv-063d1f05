import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Users, 
  FileText, 
  MousePointerClick,
  RefreshCw,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, subHours, startOfDay, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

// Import analytics components
import AnalyticsStatCard from './analytics/AnalyticsStatCard';
import GeographyMap from './analytics/GeographyMap';
import TrafficSourcesChart from './analytics/TrafficSourcesChart';
import VisitorActivityChart from './analytics/VisitorActivityChart';
import TopContentTable from './analytics/TopContentTable';
import DeviceBrowserStats from './analytics/DeviceBrowserStats';
import RealTimeVisitors from './analytics/RealTimeVisitors';
import WeeklyActivityChart from './analytics/WeeklyActivityChart';

interface AnalyticsData {
  totalPageViews: number;
  previousPageViews: number;
  uniqueVisitors: number;
  previousVisitors: number;
  totalClicks: number;
  previousClicks: number;
  avgSessionDuration: number;
  previousSessionDuration: number;
  bounceRate: number;
  topArticles: Array<{ id: string; title: string; category: string; view_count: number }>;
  pageViewsByDay: Array<{ date: string; views: number; visitors: number; sessions: number }>;
  weeklyActivity: Array<{ day: string; shortDay: string; views: number; isToday?: boolean }>;
  deviceStats: Array<{ name: string; value: number; percentage: number }>;
  browserStats: Array<{ name: string; value: number; percentage: number }>;
  countryStats: Array<{ country: string; code: string; visitors: number; percentage: number }>;
  trafficSources: Array<{ name: string; value: number; percentage: number }>;
  recentVisits: Array<{ page_path: string; created_at: string; device_type: string }>;
  activeVisitors: number;
}

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<AnalyticsData>({
    totalPageViews: 0,
    previousPageViews: 0,
    uniqueVisitors: 0,
    previousVisitors: 0,
    totalClicks: 0,
    previousClicks: 0,
    avgSessionDuration: 0,
    previousSessionDuration: 0,
    bounceRate: 0,
    topArticles: [],
    pageViewsByDay: [],
    weeklyActivity: [],
    deviceStats: [],
    browserStats: [],
    countryStats: [],
    trafficSources: [],
    recentVisits: [],
    activeVisitors: 0,
  });

  const getPeriodDates = () => {
    const now = new Date();
    let periodStart: Date;
    let previousStart: Date;
    let previousEnd: Date;

    switch (period) {
      case '24h':
        periodStart = subHours(now, 24);
        previousStart = subHours(now, 48);
        previousEnd = subHours(now, 24);
        break;
      case '7d':
        periodStart = subDays(now, 7);
        previousStart = subDays(now, 14);
        previousEnd = subDays(now, 7);
        break;
      case '30d':
        periodStart = subDays(now, 30);
        previousStart = subDays(now, 60);
        previousEnd = subDays(now, 30);
        break;
      case '90d':
        periodStart = subDays(now, 90);
        previousStart = subDays(now, 180);
        previousEnd = subDays(now, 90);
        break;
      default:
        periodStart = subDays(now, 7);
        previousStart = subDays(now, 14);
        previousEnd = subDays(now, 7);
    }

    return { periodStart, previousStart, previousEnd, now };
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    if (!loading) setRefreshing(true);
    const { periodStart, previousStart, previousEnd, now } = getPeriodDates();

    try {
      // Fetch current period page views
      const { data: currentViews, error: currentError } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', periodStart.toISOString());

      if (currentError) throw currentError;

      // Fetch previous period page views for comparison
      const { data: previousViews } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', previousStart.toISOString())
        .lt('created_at', previousEnd.toISOString());

      const pageViews = currentViews || [];
      const prevPageViews = previousViews || [];

      // Calculate metrics
      const totalPageViews = pageViews.length;
      const previousPageViews = prevPageViews.length;
      const uniqueVisitors = new Set(pageViews.map(pv => pv.visitor_id)).size;
      const previousVisitors = new Set(prevPageViews.map(pv => pv.visitor_id)).size;
      
      // Sessions count
      const currentSessions = new Set(pageViews.map(pv => pv.session_id)).size;
      const previousSessions = new Set(prevPageViews.map(pv => pv.session_id)).size;

      // Bounce rate (sessions with only 1 page view)
      const sessionPageCounts: Record<string, number> = {};
      pageViews.forEach(pv => {
        if (pv.session_id) {
          sessionPageCounts[pv.session_id] = (sessionPageCounts[pv.session_id] || 0) + 1;
        }
      });
      const singlePageSessions = Object.values(sessionPageCounts).filter(count => count === 1).length;
      const bounceRate = currentSessions > 0 ? (singlePageSessions / currentSessions) * 100 : 0;

      // Device stats with percentages
      const deviceCounts: Record<string, number> = {};
      pageViews.forEach(pv => {
        const device = pv.device_type || 'desktop';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });
      const deviceStats = Object.entries(deviceCounts).map(([name, value]) => ({
        name,
        value,
        percentage: totalPageViews > 0 ? (value / totalPageViews) * 100 : 0,
      }));

      // Browser stats with percentages
      const browserCounts: Record<string, number> = {};
      pageViews.forEach(pv => {
        const browser = pv.browser || 'Autre';
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });
      const browserStats = Object.entries(browserCounts)
        .map(([name, value]) => ({
          name,
          value,
          percentage: totalPageViews > 0 ? (value / totalPageViews) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Country stats
      const countryCounts: Record<string, number> = {};
      pageViews.forEach(pv => {
        const country = pv.country || 'unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      });
      
      const countryMapping: Record<string, { name: string; code: string }> = {
        'FR': { name: 'France', code: 'FR' },
        'ES': { name: 'Espagne', code: 'ES' },
        'US': { name: 'États-Unis', code: 'US' },
        'GB': { name: 'Royaume-Uni', code: 'GB' },
        'DE': { name: 'Allemagne', code: 'DE' },
        'IT': { name: 'Italie', code: 'IT' },
        'PT': { name: 'Portugal', code: 'PT' },
        'BE': { name: 'Belgique', code: 'BE' },
        'unknown': { name: 'Inconnu', code: 'unknown' },
      };

      const countryStats = Object.entries(countryCounts)
        .map(([code, visitors]) => ({
          country: countryMapping[code]?.name || code,
          code: countryMapping[code]?.code || code,
          visitors,
          percentage: uniqueVisitors > 0 ? (visitors / uniqueVisitors) * 100 : 0,
        }))
        .sort((a, b) => b.visitors - a.visitors);

      // Traffic sources from referrer
      const referrerCounts: Record<string, number> = {};
      pageViews.forEach(pv => {
        let source = 'Direct';
        if (pv.referrer) {
          if (pv.referrer.includes('google')) source = 'Organic';
          else if (pv.referrer.includes('twitter') || pv.referrer.includes('facebook') || pv.referrer.includes('instagram')) source = 'Social';
          else source = 'Referral';
        }
        referrerCounts[source] = (referrerCounts[source] || 0) + 1;
      });
      const trafficSources = Object.entries(referrerCounts)
        .map(([name, value]) => ({
          name,
          value,
          percentage: totalPageViews > 0 ? (value / totalPageViews) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);

      // Page views by day
      const viewsByDay: Record<string, { views: number; visitors: Set<string>; sessions: Set<string> }> = {};
      pageViews.forEach(pv => {
        const day = format(new Date(pv.created_at), 'yyyy-MM-dd');
        if (!viewsByDay[day]) {
          viewsByDay[day] = { views: 0, visitors: new Set(), sessions: new Set() };
        }
        viewsByDay[day].views++;
        viewsByDay[day].visitors.add(pv.visitor_id);
        if (pv.session_id) viewsByDay[day].sessions.add(pv.session_id);
      });
      const pageViewsByDay = Object.entries(viewsByDay)
        .map(([date, data]) => ({
          date: format(new Date(date), 'dd MMM', { locale: fr }),
          views: data.views,
          visitors: data.visitors.size,
          sessions: data.sessions.size,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Weekly activity (last 7 days)
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
        const day = addDays(weekStart, i);
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayViews = viewsByDay[dayStr]?.views || 0;
        const isToday = format(new Date(), 'yyyy-MM-dd') === dayStr;
        return {
          day: format(day, 'EEEE', { locale: fr }),
          shortDay: format(day, 'EEE', { locale: fr }),
          views: dayViews,
          isToday,
        };
      });

      // Recent visits
      const recentVisits = pageViews
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 15)
        .map(pv => ({
          page_path: pv.page_path,
          created_at: pv.created_at,
          device_type: pv.device_type || 'desktop',
        }));

      // Active visitors (last 5 minutes)
      const fiveMinutesAgo = subHours(new Date(), 0.083);
      const activeVisitors = new Set(
        pageViews
          .filter(pv => new Date(pv.created_at) >= fiveMinutesAgo)
          .map(pv => pv.visitor_id)
      ).size;

      // Top articles
      const { data: articlesData } = await supabase
        .from('articles')
        .select('id, title, category, view_count')
        .eq('is_published', true)
        .order('view_count', { ascending: false, nullsFirst: false })
        .limit(10);

      setData({
        totalPageViews,
        previousPageViews,
        uniqueVisitors,
        previousVisitors,
        totalClicks: currentSessions,
        previousClicks: previousSessions,
        avgSessionDuration: 0,
        previousSessionDuration: 0,
        bounceRate,
        topArticles: articlesData || [],
        pageViewsByDay,
        weeklyActivity,
        deviceStats,
        browserStats,
        countryStats,
        trafficSources,
        recentVisits,
        activeVisitors,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const handleExport = () => {
    toast.success('Export des données en cours...');
    // TODO: Implement CSV export
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics
          </h2>
          <p className="text-muted-foreground">Vue d'ensemble des performances du site</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-muted/50">
            <Calendar className="h-3 w-3 mr-1" />
            {period === '24h' && 'Dernières 24h'}
            {period === '7d' && '7 derniers jours'}
            {period === '30d' && '30 derniers jours'}
            {period === '90d' && '90 derniers jours'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAnalytics}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="realtime">Temps réel</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsStatCard
              title="Pages Vues"
              value={data.totalPageViews}
              icon={<Eye className="h-5 w-5" />}
              trend={calculateTrend(data.totalPageViews, data.previousPageViews)}
              previousValue={data.previousPageViews}
              iconBgColor="bg-blue-500/10"
              iconColor="text-blue-500"
            />
            <AnalyticsStatCard
              title="Visiteurs Uniques"
              value={data.uniqueVisitors}
              icon={<Users className="h-5 w-5" />}
              trend={calculateTrend(data.uniqueVisitors, data.previousVisitors)}
              previousValue={data.previousVisitors}
              iconBgColor="bg-emerald-500/10"
              iconColor="text-emerald-500"
            />
            <AnalyticsStatCard
              title="Sessions"
              value={data.totalClicks}
              icon={<MousePointerClick className="h-5 w-5" />}
              trend={calculateTrend(data.totalClicks, data.previousClicks)}
              previousValue={data.previousClicks}
              iconBgColor="bg-amber-500/10"
              iconColor="text-amber-500"
            />
            <AnalyticsStatCard
              title="Taux de Rebond"
              value={`${data.bounceRate.toFixed(1)}%`}
              icon={<FileText className="h-5 w-5" />}
              iconBgColor="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <VisitorActivityChart
                data={data.pageViewsByDay}
                period={period}
                onPeriodChange={setPeriod}
              />
            </div>
            <WeeklyActivityChart data={data.weeklyActivity} />
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrafficSourcesChart data={data.trafficSources} />
            <GeographyMap data={data.countryStats} totalVisitors={data.uniqueVisitors} />
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsStatCard
              title="Visiteurs Uniques"
              value={data.uniqueVisitors}
              icon={<Users className="h-5 w-5" />}
              trend={calculateTrend(data.uniqueVisitors, data.previousVisitors)}
              previousValue={data.previousVisitors}
              iconBgColor="bg-emerald-500/10"
              iconColor="text-emerald-500"
            />
            <AnalyticsStatCard
              title="Sessions"
              value={data.totalClicks}
              icon={<MousePointerClick className="h-5 w-5" />}
              trend={calculateTrend(data.totalClicks, data.previousClicks)}
              iconBgColor="bg-amber-500/10"
              iconColor="text-amber-500"
            />
            <AnalyticsStatCard
              title="Taux de Rebond"
              value={`${data.bounceRate.toFixed(1)}%`}
              icon={<FileText className="h-5 w-5" />}
              iconBgColor="bg-purple-500/10"
              iconColor="text-purple-500"
            />
            <AnalyticsStatCard
              title="Visiteurs Actifs"
              value={data.activeVisitors}
              icon={<Eye className="h-5 w-5" />}
              iconBgColor="bg-red-500/10"
              iconColor="text-red-500"
            />
          </div>

          <DeviceBrowserStats 
            deviceStats={data.deviceStats} 
            browserStats={data.browserStats} 
          />

          <GeographyMap data={data.countryStats} totalVisitors={data.uniqueVisitors} />
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsStatCard
              title="Pages Vues"
              value={data.totalPageViews}
              icon={<Eye className="h-5 w-5" />}
              trend={calculateTrend(data.totalPageViews, data.previousPageViews)}
              iconBgColor="bg-blue-500/10"
              iconColor="text-blue-500"
            />
            <AnalyticsStatCard
              title="Articles Publiés"
              value={data.topArticles.length}
              icon={<FileText className="h-5 w-5" />}
              iconBgColor="bg-emerald-500/10"
              iconColor="text-emerald-500"
            />
            <AnalyticsStatCard
              title="Vues Moyennes"
              value={data.topArticles.length > 0 
                ? Math.round(data.topArticles.reduce((sum, a) => sum + (a.view_count || 0), 0) / data.topArticles.length)
                : 0}
              icon={<BarChart3 className="h-5 w-5" />}
              iconBgColor="bg-amber-500/10"
              iconColor="text-amber-500"
            />
            <AnalyticsStatCard
              title="Meilleur Article"
              value={data.topArticles[0]?.view_count || 0}
              icon={<Eye className="h-5 w-5" />}
              iconBgColor="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>

          <TopContentTable articles={data.topArticles} />
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <VisitorActivityChart
                data={data.pageViewsByDay}
                period={period}
                onPeriodChange={setPeriod}
              />
            </div>
            <RealTimeVisitors 
              activeVisitors={data.activeVisitors} 
              recentVisits={data.recentVisits}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeeklyActivityChart data={data.weeklyActivity} />
            <TrafficSourcesChart data={data.trafficSources} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;

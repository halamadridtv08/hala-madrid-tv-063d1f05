import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Eye, 
  Users, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Clock,
  Calendar as CalendarIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, subHours, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AnalyticsData {
  totalPageViews: number;
  uniqueVisitors: number;
  todayPageViews: number;
  todayUniqueVisitors: number;
  avgPagesPerSession: number;
  topArticles: Array<{ id: string; title: string; view_count: number }>;
  pageViewsByDay: Array<{ date: string; views: number; visitors: number }>;
  deviceStats: Array<{ name: string; value: number }>;
  browserStats: Array<{ name: string; value: number }>;
  topPages: Array<{ path: string; views: number }>;
  recentActivity: Array<{ page_path: string; created_at: string; device_type: string }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444'];

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [data, setData] = useState<AnalyticsData>({
    totalPageViews: 0,
    uniqueVisitors: 0,
    todayPageViews: 0,
    todayUniqueVisitors: 0,
    avgPagesPerSession: 0,
    topArticles: [],
    pageViewsByDay: [],
    deviceStats: [],
    browserStats: [],
    topPages: [],
    recentActivity: [],
  });

  const getPeriodDate = () => {
    switch (period) {
      case '24h': return subHours(new Date(), 24);
      case '7d': return subDays(new Date(), 7);
      case '30d': return subDays(new Date(), 30);
      case '90d': return subDays(new Date(), 90);
      default: return subDays(new Date(), 7);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const periodStart = getPeriodDate();
    const today = startOfDay(new Date());

    try {
      // Fetch total page views for period
      const { data: pageViewsData, error: pvError } = await supabase
        .from('page_views')
        .select('id, visitor_id, page_path, created_at, device_type, browser, session_id')
        .gte('created_at', periodStart.toISOString());

      if (pvError) throw pvError;

      const pageViews = pageViewsData || [];
      const totalPageViews = pageViews.length;
      const uniqueVisitors = new Set(pageViews.map(pv => pv.visitor_id)).size;

      // Today's stats
      const todayViews = pageViews.filter(pv => new Date(pv.created_at) >= today);
      const todayPageViews = todayViews.length;
      const todayUniqueVisitors = new Set(todayViews.map(pv => pv.visitor_id)).size;

      // Average pages per session
      const sessions = new Set(pageViews.map(pv => pv.session_id)).size;
      const avgPagesPerSession = sessions > 0 ? Math.round((totalPageViews / sessions) * 10) / 10 : 0;

      // Device stats
      const deviceCounts: Record<string, number> = {};
      pageViews.forEach(pv => {
        const device = pv.device_type || 'unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });
      const deviceStats = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

      // Browser stats
      const browserCounts: Record<string, number> = {};
      pageViews.forEach(pv => {
        const browser = pv.browser || 'Other';
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });
      const browserStats = Object.entries(browserCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Top pages
      const pageCounts: Record<string, number> = {};
      pageViews.forEach(pv => {
        pageCounts[pv.page_path] = (pageCounts[pv.page_path] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Page views by day
      const viewsByDay: Record<string, { views: number; visitors: Set<string> }> = {};
      pageViews.forEach(pv => {
        const day = format(new Date(pv.created_at), 'yyyy-MM-dd');
        if (!viewsByDay[day]) {
          viewsByDay[day] = { views: 0, visitors: new Set() };
        }
        viewsByDay[day].views++;
        viewsByDay[day].visitors.add(pv.visitor_id);
      });
      const pageViewsByDay = Object.entries(viewsByDay)
        .map(([date, data]) => ({
          date: format(new Date(date), 'dd MMM', { locale: fr }),
          views: data.views,
          visitors: data.visitors.size,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Recent activity
      const recentActivity = pageViews
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(pv => ({
          page_path: pv.page_path,
          created_at: pv.created_at,
          device_type: pv.device_type || 'desktop',
        }));

      // Top articles by view_count
      const { data: articlesData } = await supabase
        .from('articles')
        .select('id, title, view_count')
        .eq('is_published', true)
        .order('view_count', { ascending: false, nullsFirst: false })
        .limit(10);

      setData({
        totalPageViews,
        uniqueVisitors,
        todayPageViews,
        todayUniqueVisitors,
        avgPagesPerSession,
        topArticles: articlesData || [],
        pageViewsByDay,
        deviceStats,
        browserStats,
        topPages,
        recentActivity,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Dernières 24h</SelectItem>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
            <SelectItem value="90d">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pages Vues
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{data.todayPageViews} aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Visiteurs Uniques
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{data.todayUniqueVisitors} aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pages / Session
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgPagesPerSession}</div>
            <p className="text-xs text-muted-foreground">
              Moyenne par visite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Articles Populaires
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.topArticles.length}</div>
            <p className="text-xs text-muted-foreground">
              Articles avec des vues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Évolution des Visites
            </CardTitle>
            <CardDescription>Pages vues et visiteurs par jour</CardDescription>
          </CardHeader>
          <CardContent>
            {data.pageViewsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.pageViewsByDay}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                    name="Pages vues"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="hsl(var(--secondary))" 
                    fillOpacity={1} 
                    fill="url(#colorVisitors)" 
                    name="Visiteurs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Appareils
            </CardTitle>
            <CardDescription>Répartition par type d'appareil</CardDescription>
          </CardHeader>
          <CardContent>
            {data.deviceStats.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.deviceStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.deviceStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {data.deviceStats.map((stat, index) => (
                    <div key={stat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(stat.name)}
                        <span className="capitalize text-sm">{stat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{stat.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Articles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Articles Les Plus Lus
            </CardTitle>
            <CardDescription>Top 10 des articles par nombre de vues</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topArticles.length > 0 ? (
              <div className="space-y-3">
                {data.topArticles.map((article, index) => (
                  <div 
                    key={article.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Badge variant={index < 3 ? "default" : "secondary"} className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{article.title}</p>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span className="text-sm font-medium">{article.view_count?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Aucun article disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Browser Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Navigateurs
            </CardTitle>
            <CardDescription>Top navigateurs utilisés</CardDescription>
          </CardHeader>
          <CardContent>
            {data.browserStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.browserStats} layout="vertical">
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    width={70}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Pages & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pages Les Plus Visitées
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topPages.length > 0 ? (
              <div className="space-y-2">
                {data.topPages.slice(0, 8).map((page, index) => (
                  <div key={page.path} className="flex items-center justify-between py-1.5">
                    <span className="text-sm truncate max-w-[70%]" title={page.path}>
                      {page.path === '/' ? 'Accueil' : page.path}
                    </span>
                    <Badge variant="outline">{page.views}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length > 0 ? (
              <div className="space-y-2">
                {data.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 py-1.5">
                    {getDeviceIcon(activity.device_type)}
                    <span className="text-sm truncate flex-1" title={activity.page_path}>
                      {activity.page_path === '/' ? 'Accueil' : activity.page_path}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(activity.created_at), 'HH:mm', { locale: fr })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Aucune activité récente
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

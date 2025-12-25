import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RecentVisit {
  page_path: string;
  page_title?: string;
  created_at: string;
  device_type: string;
}

interface RealTimeVisitorsProps {
  activeVisitors: number;
  recentVisits: RecentVisit[];
}

const RealTimeVisitors = ({ activeVisitors, recentVisits }: RealTimeVisitorsProps) => {
  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    return `Il y a ${Math.floor(seconds / 86400)}j`;
  };

  const getPageName = (path: string) => {
    if (path === '/') return 'Accueil';
    const segments = path.split('/').filter(Boolean);
    if (segments[0] === 'articles') return 'Article';
    if (segments[0] === 'players') return 'Joueur';
    if (segments[0] === 'matches') return 'Match';
    return segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            Temps Réel
          </CardTitle>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
            En direct
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Visitors Counter */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <Users className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-3xl font-bold">{activeVisitors}</p>
            <p className="text-sm text-muted-foreground">Visiteurs actifs maintenant</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Activité Récente
          </h4>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {recentVisits.length > 0 ? (
              recentVisits.slice(0, 8).map((visit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Eye className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{getPageName(visit.page_path)}</p>
                    <p className="text-xs text-muted-foreground truncate">{visit.page_path}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs capitalize">
                      {visit.device_type || 'desktop'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{getTimeAgo(visit.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeVisitors;

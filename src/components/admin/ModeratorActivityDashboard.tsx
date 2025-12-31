import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  FileText, 
  MessageSquare, 
  Zap, 
  RefreshCw, 
  Eye,
  Users,
  TrendingUp,
  Clock
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ModeratorStats {
  moderator_id: string;
  moderator_email: string;
  total_actions: number;
  articles_published: number;
  flash_news_published: number;
  comments_moderated: number;
  last_action_at: string | null;
}

interface ModeratorAction {
  id: string;
  moderator_id: string;
  moderator_email: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  entity_title: string | null;
  details: unknown;
  created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  article_published: { 
    label: "Article publié", 
    icon: <FileText className="h-4 w-4" />, 
    color: "bg-blue-500" 
  },
  flash_news_published: { 
    label: "Flash news publié", 
    icon: <Zap className="h-4 w-4" />, 
    color: "bg-yellow-500" 
  },
  comment_approved: { 
    label: "Commentaire approuvé", 
    icon: <MessageSquare className="h-4 w-4" />, 
    color: "bg-green-500" 
  },
  comment_rejected: { 
    label: "Commentaire rejeté", 
    icon: <MessageSquare className="h-4 w-4" />, 
    color: "bg-red-500" 
  },
  player_updated: { 
    label: "Joueur mis à jour", 
    icon: <Users className="h-4 w-4" />, 
    color: "bg-purple-500" 
  },
  match_updated: { 
    label: "Match mis à jour", 
    icon: <Activity className="h-4 w-4" />, 
    color: "bg-orange-500" 
  },
};

export const ModeratorActivityDashboard = () => {
  const [stats, setStats] = useState<ModeratorStats[]>([]);
  const [actions, setActions] = useState<ModeratorAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [daysFilter, setDaysFilter] = useState("7");
  const [selectedModerator, setSelectedModerator] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [daysFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const { data: statsData, error: statsError } = await supabase.rpc(
        'get_moderator_activity_stats',
        { p_days: parseInt(daysFilter) }
      );

      if (statsError) throw statsError;
      setStats(statsData || []);

      // Fetch recent actions
      const { data: actionsData, error: actionsError } = await supabase.rpc(
        'get_recent_moderator_actions',
        { 
          p_limit: 100,
          p_moderator_id: selectedModerator === "all" ? null : selectedModerator
        }
      );

      if (actionsError) throw actionsError;
      setActions(actionsData || []);
    } catch (error: any) {
      console.error('Error fetching moderator data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des modérateurs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast({
      title: "Données actualisées",
      description: "Les statistiques ont été mises à jour.",
    });
  };

  const getActionInfo = (actionType: string) => {
    return ACTION_LABELS[actionType] || { 
      label: actionType, 
      icon: <Activity className="h-4 w-4" />, 
      color: "bg-gray-500" 
    };
  };

  const totalActions = stats.reduce((sum, s) => sum + s.total_actions, 0);
  const totalArticles = stats.reduce((sum, s) => sum + s.articles_published, 0);
  const totalFlashNews = stats.reduce((sum, s) => sum + s.flash_news_published, 0);
  const totalComments = stats.reduce((sum, s) => sum + s.comments_moderated, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Chargement des données...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Supervision des Modérateurs
          </h2>
          <p className="text-muted-foreground">
            Suivez l'activité et les actions des modérateurs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={daysFilter} onValueChange={setDaysFilter}>
            <SelectTrigger className="w-[180px]">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Dernières 24h</SelectItem>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actions totales</p>
                <p className="text-3xl font-bold">{totalActions}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Articles publiés</p>
                <p className="text-3xl font-bold">{totalArticles}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flash news</p>
                <p className="text-3xl font-bold">{totalFlashNews}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commentaires modérés</p>
                <p className="text-3xl font-bold">{totalComments}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activité récente
          </TabsTrigger>
          <TabsTrigger value="moderators" className="gap-2">
            <Users className="h-4 w-4" />
            Par modérateur
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Actions récentes</CardTitle>
                <Select value={selectedModerator} onValueChange={setSelectedModerator}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Filtrer par modérateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les modérateurs</SelectItem>
                    {stats.map((s) => (
                      <SelectItem key={s.moderator_id} value={s.moderator_id}>
                        {s.moderator_email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {actions.length > 0 ? (
                <div className="space-y-3">
                  {actions.slice(0, 20).map((action) => {
                    const info = getActionInfo(action.action_type);
                    return (
                      <div 
                        key={action.id}
                        className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-2 rounded-full ${info.color} text-white`}>
                          {info.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{action.moderator_email}</span>
                            <Badge variant="outline" className="text-xs">
                              {info.label}
                            </Badge>
                          </div>
                          {action.entity_title && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {action.entity_title}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(action.created_at), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune activité récente
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques par modérateur</CardTitle>
              <CardDescription>
                Résumé de l'activité de chaque modérateur sur les {daysFilter} derniers jours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.length > 0 ? (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modérateur</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Articles</TableHead>
                        <TableHead className="text-center">Flash News</TableHead>
                        <TableHead className="text-center">Commentaires</TableHead>
                        <TableHead>Dernière action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.map((stat) => (
                        <TableRow key={stat.moderator_id}>
                          <TableCell className="font-medium">
                            {stat.moderator_email}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{stat.total_actions}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-500/10">
                              {stat.articles_published}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-yellow-500/10">
                              {stat.flash_news_published}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-green-500/10">
                              {stat.comments_moderated}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {stat.last_action_at 
                              ? formatDistanceToNow(new Date(stat.last_action_at), { 
                                  addSuffix: true, 
                                  locale: fr 
                                })
                              : "—"
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun modérateur actif sur cette période
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModeratorActivityDashboard;

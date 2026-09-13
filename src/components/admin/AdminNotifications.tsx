import { useAdminNotifications } from "@/hooks/useAdminNotificationCenter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, MessageCircle, BarChart3, HelpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  entity_id: string | null;
  entity_type: string | null;
  is_read: boolean;
  created_at: string;
}

export const AdminNotifications = () => {
  const { notifications, loading, markAsRead, markAllAsRead, remove: deleteNotification } = useAdminNotifications();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4" />;
      case 'poll_vote':
        return <BarChart3 className="h-4 w-4" />;
      case 'quiz_completion':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'comment':
        return <Badge variant="default">Commentaire</Badge>;
      case 'poll_vote':
        return <Badge variant="secondary">Sondage</Badge>;
      case 'quiz_completion':
        return <Badge variant="outline">Quiz</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucune notification
          </p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg flex items-start gap-4 transition-colors ${
                notification.is_read ? 'bg-background' : 'bg-muted/50 border-primary/20'
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {getTypeIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getTypeBadge(notification.type)}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </div>
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNotification(notification.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

import { Bell, BellOff, Check, Trash2, MessageCircle, BarChart3, Flag, Volume2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAdminNotifications } from '@/hooks/useAdminNotificationCenter';
import { cn } from '@/lib/utils';

const iconFor = (type: string) => {
  switch (type) {
    case 'comment':
    case 'live_blog_comment':
      return <MessageCircle className="h-4 w-4 text-primary" />;
    case 'poll_vote':
      return <BarChart3 className="h-4 w-4 text-primary" />;
    case 'comment_report':
      return <Flag className="h-4 w-4 text-destructive" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

interface AdminNotificationBellProps {
  onOpenNotifications?: () => void;
}

export const AdminNotificationBell = ({ onOpenNotifications }: AdminNotificationBellProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, remove, soundEnabled, toggleSound } =
    useAdminNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className={cn('h-5 w-5', unreadCount > 0 && 'text-primary')} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 h-5 w-5 animate-ping rounded-full bg-destructive/40" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleSound}
              title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-8" onClick={markAllAsRead}>
                <Check className="mr-1 h-3.5 w-3.5" /> Tout lu
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucune notification</p>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn('flex gap-3 p-3', !n.is_read && 'bg-muted/50')}
                  onMouseEnter={() => !n.is_read && markAsRead(n.id)}
                >
                  <div className="mt-0.5">{iconFor(n.type)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{n.title}</p>
                      {!n.is_read && <Badge variant="destructive" className="h-4 px-1 text-[10px]">Nouveau</Badge>}
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => remove(n.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {onOpenNotifications && (
          <div className="border-t p-2">
            <Button variant="ghost" size="sm" className="w-full" onClick={onOpenNotifications}>
              Voir toutes les notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

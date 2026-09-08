import { Bell, Check, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import { cn } from '@/lib/utils';

export const UserNotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useUserNotifications();

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Mes notifications">
          <Bell className={cn('h-5 w-5', unreadCount > 0 && 'text-primary')} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Mes notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-8" onClick={markAllAsRead}>
              <Check className="mr-1 h-3.5 w-3.5" /> Tout lu
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucune notification</p>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className={cn(
                    'flex w-full gap-3 p-3 text-left transition hover:bg-muted/60',
                    !n.is_read && 'bg-muted/40'
                  )}
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.link) navigate(n.link);
                  }}
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    {n.message && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

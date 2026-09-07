import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { playNotificationChime } from '@/lib/notificationSound';

export interface UserNotification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

/** Notifications personnelles (réponses à un commentaire, etc.) pour l'utilisateur connecté. */
export const useUserNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    const { data, error } = await (supabase as any)
      .from('user_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) console.error('Error loading user notifications:', error);
    else setNotifications((data || []) as UserNotification[]);
    initialized.current = true;
    setLoading(false);
  }, [user]);

  useEffect(() => {
    initialized.current = false;
    fetchNotifications();
    if (!user) return;

    const channel = supabase
      .channel(`user-notifs-${user.id}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as UserNotification;
            setNotifications((prev) =>
              prev.some((n) => n.id === row.id) ? prev : [row, ...prev].slice(0, 30)
            );
            if (initialized.current) playNotificationChime(0.2);
            return;
          }
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await (supabase as any)
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await (supabase as any).from('user_notifications').update({ is_read: true }).eq('id', id);
  }, []);

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((n) => !n.is_read).length,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
};

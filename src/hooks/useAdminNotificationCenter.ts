import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { playNotificationChime } from '@/lib/notificationSound';

export interface AdminNotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  entity_id: string | null;
  entity_type: string | null;
  is_read: boolean;
  created_at: string;
}

const SOUND_KEY = 'hmtv_admin_notif_sound';

export const isAdminNotifSoundEnabled = () =>
  typeof window === 'undefined' ? true : window.localStorage.getItem(SOUND_KEY) !== 'off';

export const setAdminNotifSoundEnabled = (enabled: boolean) => {
  window.localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
};

/** Centre de notifications admin : liste, compteur non lus, temps réel + son. */
export const useAdminNotifications = (enabled = true) => {
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabledState] = useState(isAdminNotifSoundEnabled);
  const knownIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading admin notifications:', error);
    } else {
      setNotifications((data || []) as AdminNotificationItem[]);
      (data || []).forEach((n: any) => knownIds.current.add(n.id));
      initialized.current = true;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    fetchNotifications();

    const channel = supabase
      .channel(`admin-notif-center-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as AdminNotificationItem;
            if (!knownIds.current.has(row.id)) {
              knownIds.current.add(row.id);
              setNotifications((prev) => [row, ...prev].slice(0, 50));
              if (initialized.current && isAdminNotifSoundEnabled()) {
                playNotificationChime();
              }
              return;
            }
          }
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase
      .from('admin_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from('admin_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('is_read', false);
  }, []);

  const remove = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await supabase.from('admin_notifications').delete().eq('id', id);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabledState((prev) => {
      const next = !prev;
      setAdminNotifSoundEnabled(next);
      if (next) playNotificationChime();
      return next;
    });
  }, []);

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((n) => !n.is_read).length,
    soundEnabled,
    toggleSound,
    markAsRead,
    markAllAsRead,
    remove,
    refresh: fetchNotifications,
  };
};

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useActiveIntegrations } from '@/hooks/useActiveIntegrations';

declare global {
  interface Window {
    OneSignalDeferred?: any[];
    OneSignal?: any;
  }
}

export const MatchNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const { getConfig, isEnabled } = useActiveIntegrations();
  const { toast } = useToast();

  const oneSignalEnabled = isEnabled('onesignal');
  const config = getConfig('onesignal');

  useEffect(() => {
    if (!oneSignalEnabled || !config?.app_id) {
      setIsLoading(false);
      return;
    }

    // Load OneSignal SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    document.head.appendChild(script);

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal: any) {
      try {
        await OneSignal.init({
          appId: config.app_id,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enable: false },
        });

        setIsSupported(true);
        const permission = await OneSignal.Notifications.permission;
        setIsSubscribed(permission);
        setIsLoading(false);

        console.log('OneSignal initialized, permission:', permission);
      } catch (error) {
        console.error('OneSignal init error:', error);
        setIsLoading(false);
      }
    });

    return () => {
      const existingScript = document.querySelector('script[src*="OneSignalSDK"]');
      if (existingScript) existingScript.remove();
    };
  }, [oneSignalEnabled, config?.app_id]);

  const handleToggleNotifications = async () => {
    if (!window.OneSignal) return;

    setIsLoading(true);
    try {
      if (isSubscribed) {
        await window.OneSignal.User.PushSubscription.optOut();
        setIsSubscribed(false);
        toast({
          title: "Notifications désactivées",
          description: "Vous ne recevrez plus de notifications pour les matchs",
        });
      } else {
        await window.OneSignal.Notifications.requestPermission();
        const permission = await window.OneSignal.Notifications.permission;
        setIsSubscribed(permission);
        
        if (permission) {
          toast({
            title: "Notifications activées",
            description: "Vous recevrez des alertes pour les matchs en direct",
          });
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier les notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!oneSignalEnabled || !config?.app_id) {
    return null;
  }

  if (!isSupported && !isLoading) {
    return null;
  }

  return (
    <Button
      variant={isSubscribed ? "default" : "outline"}
      size="sm"
      onClick={handleToggleNotifications}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isSubscribed ? (
        <>
          <Bell className="h-4 w-4" />
          Notifications actives
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4" />
          Activer les alertes
        </>
      )}
    </Button>
  );
};

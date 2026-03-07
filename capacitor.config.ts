import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.halamadridtv',
  appName: 'HALA MADRID TV',
  webDir: 'dist',
  server: {
    url: 'https://www.hala-madrid-tv.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0a0f1c',
    overScrollMode: 'never' as any,
  },
  ios: {
    backgroundColor: '#0a0f1c',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0f1c',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#1a56db',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0f1c',
    },
  },
};

export default config;

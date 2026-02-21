import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.halamadridtv',
  appName: 'hala-madrid-tv',
  webDir: 'dist',
  server: {
    url: 'https://hala-madrid-tv.lovable.app?forceHideBadge=true',
    cleartext: true
  }
};

export default config;

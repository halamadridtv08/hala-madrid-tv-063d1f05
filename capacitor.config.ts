import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.halamadridtv',
  appName: 'hala-madrid-tv',
  webDir: 'dist',
  server: {
    url: 'https://73064fd2-8b52-40c2-b76d-341c01c8ff9d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;

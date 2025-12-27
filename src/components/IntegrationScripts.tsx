import { useEffect } from 'react';
import { useActiveIntegrations } from '@/hooks/useActiveIntegrations';

// Validation functions for tracking IDs to prevent XSS
function isValidGATrackingId(id: string): boolean {
  // Google Analytics IDs: G-XXXXXXX, UA-XXXXXX-X, AW-XXXXXXX, DC-XXXXXXX
  return /^(G|UA|AW|DC)-[A-Z0-9-]+$/i.test(id) && id.length <= 30;
}

function isValidFacebookPixelId(id: string): boolean {
  // Facebook Pixel IDs are numeric only
  return /^\d{10,20}$/.test(id);
}

function isValidHotjarSiteId(id: string): boolean {
  // Hotjar site IDs are numeric only
  return /^\d{5,10}$/.test(id);
}

function isValidAdsensePublisherId(id: string): boolean {
  // Google AdSense publisher IDs: ca-pub-XXXXXXXXXXXXXXXX
  return /^ca-pub-\d{16}$/.test(id);
}

export const IntegrationScripts = () => {
  const { integrations, loading } = useActiveIntegrations();

  useEffect(() => {
    if (loading) return;

    integrations.forEach(integration => {
      const { integration_key, config } = integration;

      switch (integration_key) {
        case 'google_analytics':
          injectGoogleAnalytics(config.tracking_id);
          break;
        case 'facebook_pixel':
          injectFacebookPixel(config.pixel_id);
          break;
        case 'hotjar':
          injectHotjar(config.site_id);
          break;
        case 'google_adsense':
          injectGoogleAdsense(config.publisher_id);
          break;
      }
    });
  }, [integrations, loading]);

  return null;
};

// Google Analytics
function injectGoogleAnalytics(trackingId?: string) {
  if (!trackingId || document.getElementById('ga-script')) return;
  
  // Validate tracking ID format before injection
  if (!isValidGATrackingId(trackingId)) {
    console.warn('Invalid Google Analytics tracking ID format:', trackingId);
    return;
  }

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(trackingId)}`;
  document.head.appendChild(script);

  const inlineScript = document.createElement('script');
  inlineScript.id = 'ga-inline';
  // Use safer approach with properly escaped values
  inlineScript.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', ${JSON.stringify(trackingId)});
  `;
  document.head.appendChild(inlineScript);
  console.log('Google Analytics loaded:', trackingId);
}

// Facebook Pixel
function injectFacebookPixel(pixelId?: string) {
  if (!pixelId || document.getElementById('fb-pixel')) return;
  
  // Validate pixel ID format before injection
  if (!isValidFacebookPixelId(pixelId)) {
    console.warn('Invalid Facebook Pixel ID format:', pixelId);
    return;
  }

  const script = document.createElement('script');
  script.id = 'fb-pixel';
  // Use safer approach with JSON.stringify for proper escaping
  script.textContent = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', ${JSON.stringify(pixelId)});
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
  console.log('Facebook Pixel loaded:', pixelId);
}

// Hotjar
function injectHotjar(siteId?: string) {
  if (!siteId || document.getElementById('hotjar-script')) return;
  
  // Validate site ID format before injection
  if (!isValidHotjarSiteId(siteId)) {
    console.warn('Invalid Hotjar site ID format:', siteId);
    return;
  }

  const script = document.createElement('script');
  script.id = 'hotjar-script';
  // Parse siteId as integer to ensure it's numeric
  const numericSiteId = parseInt(siteId, 10);
  script.textContent = `
    (function(h,o,t,j,a,r){
      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
      h._hjSettings={hjid:${numericSiteId},hjsv:6};
      a=o.getElementsByTagName('head')[0];
      r=o.createElement('script');r.async=1;
      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
      a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  `;
  document.head.appendChild(script);
  console.log('Hotjar loaded:', siteId);
}

// Google AdSense
function injectGoogleAdsense(publisherId?: string) {
  if (!publisherId || document.getElementById('adsense-script')) return;
  
  // Validate publisher ID format before injection
  if (!isValidAdsensePublisherId(publisherId)) {
    console.warn('Invalid Google AdSense publisher ID format:', publisherId);
    return;
  }

  const script = document.createElement('script');
  script.id = 'adsense-script';
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
  console.log('Google AdSense loaded:', publisherId);
}

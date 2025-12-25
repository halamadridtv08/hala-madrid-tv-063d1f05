import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Generate or get existing visitor ID
const getVisitorId = (): string => {
  const key = 'hala_madrid_visitor_id';
  let visitorId = localStorage.getItem(key);
  
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(key, visitorId);
  }
  
  return visitorId;
};

// Generate session ID (new per browser session)
const getSessionId = (): string => {
  const key = 'hala_madrid_session_id';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
};

// Detect device type
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
};

// Detect browser
const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
};

export const usePageTracking = () => {
  const location = useLocation();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    const trackPageView = async () => {
      // Avoid tracking the same page twice in a row
      if (location.pathname === lastPathRef.current) return;
      lastPathRef.current = location.pathname;

      const visitorId = getVisitorId();
      const sessionId = getSessionId();
      const deviceType = getDeviceType();
      const browser = getBrowser();

      // Get user ID if logged in
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      // Get page title
      const pageTitle = document.title;

      // Track page view
      const { error } = await supabase.from('page_views').insert({
        page_path: location.pathname,
        page_title: pageTitle,
        visitor_id: visitorId,
        user_id: userId,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        device_type: deviceType,
        browser: browser,
        session_id: sessionId,
      });

      if (error) {
        console.error('Error tracking page view:', error);
      }

      // If it's an article page, track article view
      const articleMatch = location.pathname.match(/\/article\/([a-f0-9-]+)/i);
      if (articleMatch) {
        const articleId = articleMatch[1];
        
        // Insert into article_view_history
        await supabase.from('article_view_history').insert({
          article_id: articleId,
          visitor_id: visitorId,
          user_id: userId,
        });

        // Increment view_count on the article (this is already done in ArticleDetail, but keeping as backup)
      }
    };

    // Small delay to ensure page title is updated
    const timeoutId = setTimeout(trackPageView, 100);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
};

export default usePageTracking;

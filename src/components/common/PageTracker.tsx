import { usePageTracking } from '@/hooks/usePageTracking';

/**
 * Component that tracks page views across the site.
 * This should be placed inside BrowserRouter to access location.
 */
export const PageTracker = () => {
  usePageTracking();
  return null;
};

export default PageTracker;

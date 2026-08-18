import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";
import { HelmetProvider } from "react-helmet-async";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import { IntegrationScripts } from "./components/IntegrationScripts";
import { MediaProtectionProvider } from "./components/common/MediaProtectionProvider";
import { SessionTimeoutProvider } from "./components/auth/SessionTimeoutProvider";
import { ScrollToTopButton } from "./components/common/ScrollToTopButton";
import { BadgeUnlockToast } from "./components/badges/BadgesDisplay";
import { PageTracker } from "./components/common/PageTracker";
import { PasswordResetHandler } from "./components/auth/PasswordResetHandler";
import { SoundProvider } from "./components/sound/SoundProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// Lazy load non-critical pages for better Core Web Vitals
const lazyRetry = (importFn: () => Promise<any>) =>
  lazy(async () => {
    const key = 'chunk-retry-at';
    try {
      const mod = await importFn();
      sessionStorage.removeItem(key);
      return mod;
    } catch (err) {
      // Second attempt: transient network / partially deployed chunk
      try {
        await new Promise((r) => setTimeout(r, 600));
        const mod = await importFn();
        sessionStorage.removeItem(key);
        return mod;
      } catch (err2) {
        // Stale build: force a hard reload, at most once every 10s
        const last = Number(sessionStorage.getItem(key) || 0);
        if (Date.now() - last > 10000) {
          sessionStorage.setItem(key, String(Date.now()));
          if ('caches' in window) {
            try {
              const names = await caches.keys();
              await Promise.all(names.map((n) => caches.delete(n)));
            } catch {
              /* ignore */
            }
          }
          if ('serviceWorker' in navigator) {
            try {
              const regs = await navigator.serviceWorker.getRegistrations();
              await Promise.all(regs.map((r) => r.unregister()));
            } catch {
              /* ignore */
            }
          }
          window.location.reload();
          return new Promise(() => {}) as Promise<any>;
        }
        throw err2;
      }
    }
  });

const News = lazyRetry(() => import("./pages/News"));
const Players = lazyRetry(() => import("./pages/Players"));
const Matches = lazyRetry(() => import("./pages/Matches"));
const Training = lazyRetry(() => import("./pages/Training"));
const Press = lazyRetry(() => import("./pages/Press"));
const Kits = lazyRetry(() => import("./pages/Kits"));
const Calendar = lazyRetry(() => import("./pages/Calendar"));
const Stats = lazyRetry(() => import("./pages/Stats"));
const PlayerProfile = lazyRetry(() => import("./pages/PlayerProfile"));
const Admin = lazyRetry(() => import("./pages/Admin"));
const ArticleDetail = lazyRetry(() => import("./pages/ArticleDetail"));
const Videos = lazyRetry(() => import("./pages/Videos"));
const Search = lazyRetry(() => import("./pages/Search"));
const Favorites = lazyRetry(() => import("./pages/Favorites"));
const Predictions = lazyRetry(() => import("./pages/Predictions"));
const DreamTeam = lazyRetry(() => import("./pages/DreamTeam"));
const LiveBlog = lazyRetry(() => import("./pages/LiveBlog"));
const Transfers = lazyRetry(() => import("./pages/Transfers"));
const PlayerComparator = lazyRetry(() => import("./pages/PlayerComparator"));
const Shop = lazyRetry(() => import("./pages/Shop"));
const ShopProduct = lazyRetry(() => import("./pages/ShopProduct"));
const ShopCart = lazyRetry(() => import("./pages/ShopCart"));
const ShopCheckout = lazyRetry(() => import("./pages/ShopCheckout"));
const ShopOrders = lazyRetry(() => import("./pages/ShopOrders"));
const ShopWishlist = lazyRetry(() => import("./pages/ShopWishlist"));
const Profile = lazyRetry(() => import("./pages/Profile"));
const AdminSecurity = lazyRetry(() => import("./pages/AdminSecurity"));
const AdminSEO = lazyRetry(() => import("./pages/AdminSEO"));
const AuthCallback = lazyRetry(() => import("./pages/AuthCallback"));

// Legal pages
const MentionsLegales = lazyRetry(() => import("./pages/legal/MentionsLegales"));
const PolitiqueConfidentialite = lazyRetry(() => import("./pages/legal/PolitiqueConfidentialite"));
const PreferencesCookies = lazyRetry(() => import("./pages/legal/PreferencesCookies"));
const Contact = lazyRetry(() => import("./pages/legal/Contact"));
const CGU = lazyRetry(() => import("./pages/legal/CGU"));
const DynamicLegalPage = lazyRetry(() => import("./pages/legal/DynamicLegalPage"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Create query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <InstallPrompt />
              <IntegrationScripts />
              <MediaProtectionProvider />
              <SessionTimeoutProvider />
              <ScrollToTopButton />
              <BadgeUnlockToast />
              <PageTracker />
              <PasswordResetHandler />
              <SoundProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/:id" element={<ArticleDetail />} />
                  <Route path="/article/:id" element={<ArticleDetail />} />
                  <Route path="/players" element={<Players />} />
                  <Route path="/players/:id" element={<PlayerProfile />} />
                  <Route path="/matches" element={<Matches />} />
                  <Route path="/training" element={<Training />} />
                  <Route path="/press" element={<Press />} />
                  <Route path="/kits" element={<Kits />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/stats" element={<Stats />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/predictions" element={<Predictions />} />
                  <Route path="/dream-team" element={<DreamTeam />} />
                  <Route path="/transfers" element={<Transfers />} />
                  <Route path="/comparator" element={<PlayerComparator />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/:slug" element={<ShopProduct />} />
                  <Route path="/shop/cart" element={<ShopCart />} />
                  <Route path="/shop/checkout" element={<ShopCheckout />} />
                  <Route path="/shop/orders" element={<ShopOrders />} />
                  <Route path="/shop/wishlist" element={<ShopWishlist />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/live-blog/:matchId" element={<LiveBlog />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <Admin />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/security" 
                    element={
                      <ProtectedRoute requireAdminOnly={true}>
                        <AdminSecurity />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/seo" 
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminSEO />
                      </ProtectedRoute>
                    } 
                  />
                  {/* Legal pages */}
                  <Route path="/mentions-legales" element={<MentionsLegales />} />
                  <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
                  <Route path="/preferences-cookies" element={<PreferencesCookies />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cgu" element={<CGU />} />
                  {/* Dynamic legal pages - catches any page created from admin */}
                  <Route path="/legal/:slug" element={<DynamicLegalPage />} />
                  <Route path="/:slug" element={<DynamicLegalPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              </SoundProvider>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

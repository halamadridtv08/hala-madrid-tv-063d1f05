import { lazy, Suspense } from "react";
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
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages for better Core Web Vitals
const News = lazy(() => import("./pages/News"));
const Players = lazy(() => import("./pages/Players"));
const Matches = lazy(() => import("./pages/Matches"));
const Training = lazy(() => import("./pages/Training"));
const Press = lazy(() => import("./pages/Press"));
const Kits = lazy(() => import("./pages/Kits"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Stats = lazy(() => import("./pages/Stats"));
const PlayerProfile = lazy(() => import("./pages/PlayerProfile"));
const Admin = lazy(() => import("./pages/Admin"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const Videos = lazy(() => import("./pages/Videos"));
const Search = lazy(() => import("./pages/Search"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Predictions = lazy(() => import("./pages/Predictions"));
const DreamTeam = lazy(() => import("./pages/DreamTeam"));
const LiveBlog = lazy(() => import("./pages/LiveBlog"));
const Transfers = lazy(() => import("./pages/Transfers"));
const PlayerComparator = lazy(() => import("./pages/PlayerComparator"));
const Profile = lazy(() => import("./pages/Profile"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
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
                  <Route path="/live-blog/:matchId" element={<LiveBlog />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <Admin />
                      </ProtectedRoute>
                    } 
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider } from "@/i18n/useTranslation";
import { useUpdateLastSeen } from "@/hooks/useUpdateLastSeen";
import Index from "./pages/Index";

const LastSeenTracker = () => {
  useUpdateLastSeen();
  return null;
};

const DiscoverPage = lazy(() => import("./pages/DiscoverPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const PublishListing = lazy(() => import("./pages/PublishListing"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const MyListings = lazy(() => import("./pages/MyListings"));
const EditListing = lazy(() => import("./pages/EditListing"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const SellerProfile = lazy(() => import("./pages/SellerProfile"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <LastSeenTracker />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/decouvrir" element={<DiscoverPage />} />
                <Route path="/categorie/:categoryId" element={<CategoryPage />} />
                <Route path="/categorie/:categoryId/:subId" element={<CategoryPage />} />
                <Route path="/annonce/:id" element={<ListingDetail />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/publier" element={<PublishListing />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/compte" element={<AccountPage />} />
                <Route path="/mes-annonces" element={<MyListings />} />
                <Route path="/modifier/:id" element={<EditListing />} />
                <Route path="/favoris" element={<FavoritesPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/vendeur/:sellerId" element={<SellerProfile />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;

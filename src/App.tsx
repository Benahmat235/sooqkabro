import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ListingDetail from "./pages/ListingDetail";
import SearchPage from "./pages/SearchPage";
import PublishListing from "./pages/PublishListing";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";
import MyListings from "./pages/MyListings";
import EditListing from "./pages/EditListing";
import FavoritesPage from "./pages/FavoritesPage";
import MessagesPage from "./pages/MessagesPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/categorie/:categoryId" element={<CategoryPage />} />
            <Route path="/categorie/:categoryId/:subId" element={<CategoryPage />} />
            <Route path="/annonce/:id" element={<ListingDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/publier" element={<PublishListing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/compte" element={<AccountPage />} />
            <Route path="/mes-annonces" element={<MyListings />} />
            <Route path="/modifier/:id" element={<EditListing />} />
            <Route path="/favoris" element={<FavoritesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

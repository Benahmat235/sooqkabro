import { useState, useEffect } from "react";
import Header from "@/components/Header";
import CategoryGrid from "@/components/CategoryGrid";
import QuickActions from "@/components/QuickActions";
import HorizontalProductScroll from "@/components/HorizontalProductScroll";
import ProductTabs from "@/components/ProductTabs";
import PromoBanner from "@/components/PromoBanner";
import PublishCTA from "@/components/PublishCTA";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { useListings } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Percent, Sparkles, TrendingUp } from "lucide-react";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { categories } from "@/data/categories";
import { useTranslation } from "@/i18n/useTranslation";
import type { ListingWithImages } from "@/hooks/useListings";

const Index = () => {
  const [selectedCity, setSelectedCity] = useState("all");
  const { detectedCity } = useGeoLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (detectedCity && selectedCity === "all") {
      setSelectedCity(detectedCity);
    }
  }, [detectedCity]);
  
  const { user } = useAuth();
  const { data: listings = [], isLoading } = useListings(selectedCity);
  const isLoggedIn = !!user;

  // Group listings by category for horizontal sections
  const listingsByCategory = categories.reduce<Record<string, ListingWithImages[]>>((acc, cat) => {
    acc[cat.id] = listings.filter((l) => l.category_id === cat.id).slice(0, 10);
    return acc;
  }, {});

  // Get popular categories that have listings
  const popularCategories = categories.filter((cat) => (listingsByCategory[cat.id]?.length || 0) > 0).slice(0, 4);

  // Simulate deals (listings with original_price or random selection)
  const deals = listings.filter(l => (l as any).original_price || Math.random() > 0.7).slice(0, 10);

  // Trending products (sort by views or random)
  const trending = [...listings].sort((a, b) => ((b as any).view_count || 0) - ((a as any).view_count || 0)).slice(0, 10);

  // Recent products
  const recent = [...listings].sort((a, b) => 
    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  ).slice(0, 10);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <main className="container mx-auto px-4">
        {/* Quick Action Buttons - Like Alibaba */}
        <QuickActions />

        {/* Category Icons Grid */}
        <CategoryGrid />

        {/* Promo Banners */}
        <PromoBanner />

        {isLoading ? (
          <LoadingSkeleton />
        ) : listings.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <>
            {/* Best Deals Section - Horizontal Scroll */}
            {deals.length > 0 && (
              <HorizontalProductScroll
                title="Meilleures offres"
                subtitle="Les meilleurs prix du moment"
                listings={deals}
                viewAllLink="/offres"
                showPriceComparison
                icon={<Percent className="h-5 w-5 text-destructive" />}
                accentColor="text-destructive"
              />
            )}

            {/* Personalized / Recent Section - Horizontal Scroll */}
            <HorizontalProductScroll
              title={isLoggedIn ? "Selections pour vous" : "Nouveautes"}
              subtitle={isLoggedIn ? "Base sur vos preferences" : "Dernieres annonces publiees"}
              listings={recent}
              viewAllLink="/nouveautes"
              icon={<Sparkles className="h-5 w-5 text-primary" />}
            />

            {/* Publish CTA */}
            <div className="py-3">
              <PublishCTA />
            </div>

            {/* Trending Section */}
            {trending.length > 0 && (
              <HorizontalProductScroll
                title="Tendances"
                subtitle="Les plus consultes cette semaine"
                listings={trending}
                viewAllLink="/tendances"
                icon={<Flame className="h-5 w-5 text-orange-500" />}
                accentColor="text-orange-500"
              />
            )}

            {/* Category-based Horizontal Sections */}
            {popularCategories.slice(0, 2).map((cat) => {
              const catListings = listingsByCategory[cat.id];
              if (!catListings || catListings.length === 0) return null;
              const Icon = cat.icon;
              return (
                <HorizontalProductScroll
                  key={cat.id}
                  title={cat.name.split(" ")[0]}
                  listings={catListings}
                  viewAllLink={`/categorie/${cat.id}`}
                  icon={<Icon className="h-5 w-5 text-muted-foreground" />}
                />
              );
            })}

            {/* Tab-based Product Discovery - Like Alibaba "For You" / "Inspirations" */}
            <div className="border-t border-border/50 mt-4">
              <ProductTabs listings={listings} />
            </div>
          </>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="py-4 space-y-6">
    {/* Horizontal scroll skeleton */}
    <div>
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shrink-0 w-[160px]">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Grid skeleton */}
    <div>
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Empty state
const EmptyState = ({ t }: { t: (key: string) => string }) => (
  <div className="text-center py-16 animate-fade-in">
    <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
      <TrendingUp className="h-10 w-10 text-muted-foreground" />
    </div>
    <p className="text-lg font-bold text-foreground">{t("listings.none")}</p>
    <p className="text-sm text-muted-foreground mt-1">{t("listings.beFirst")}</p>
  </div>
);

export default Index;

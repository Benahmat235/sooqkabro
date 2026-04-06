import { useState, useEffect } from "react";
import Header from "@/components/Header";
import CategoryGrid from "@/components/CategoryGrid";
import PublishCTA from "@/components/PublishCTA";
import ListingCard from "@/components/ListingCard";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { useListings } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Clock, ChevronRight } from "lucide-react";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { categories } from "@/data/categories";
import { Link } from "react-router-dom";
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

  const listingsByCategory = categories.reduce<Record<string, ListingWithImages[]>>((acc, cat) => {
    acc[cat.id] = listings.filter((l) => l.category_id === cat.id).slice(0, 6);
    return acc;
  }, {});

  const popularCategories = categories.filter((cat) => (listingsByCategory[cat.id]?.length || 0) > 0).slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <main className="container mx-auto px-3">
        <CategoryGrid />

        <div className="py-2">
          <PublishCTA />
        </div>

        {isLoading ? (
          <section className="py-3">
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-1.5 space-y-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl">📦</span>
            </div>
            <p className="text-base font-bold text-foreground">{t("listings.none")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("listings.beFirst")}</p>
          </div>
        ) : (
          <>
            <section className="py-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-accent">
                    {isLoggedIn ? <Sparkles className="h-4 w-4 text-accent-foreground" /> : <Clock className="h-4 w-4 text-accent-foreground" />}
                  </div>
                  <h2 className="text-sm font-extrabold text-foreground">{isLoggedIn ? t("listings.forYou") : t("listings.recent")}</h2>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {listings.slice(0, 9).map((listing, i) => (
                  <div key={listing.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}>
                    <ListingCard listing={listing} />
                  </div>
                ))}
              </div>
            </section>

            {popularCategories.map((cat) => {
              const catListings = listingsByCategory[cat.id];
              if (!catListings || catListings.length === 0) return null;
              const Icon = cat.icon;
              return (
                <section key={cat.id} className="py-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-accent">
                        <Icon className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <h2 className="text-sm font-extrabold text-foreground">{t(`cat.${cat.id}`).split(" ")[0]}</h2>
                    </div>
                    <Link 
                      to={`/categorie/${cat.id}`} 
                      className="text-primary text-xs font-semibold flex items-center gap-0.5 hover:underline"
                    >
                      {t("listings.seeMore")} <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {catListings.map((listing, i) => (
                      <div key={listing.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}>
                        <ListingCard listing={listing} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;

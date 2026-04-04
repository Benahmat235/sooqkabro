import { useState, useEffect } from "react";
import Header from "@/components/Header";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryNav from "@/components/CategoryNav";
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

      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-tight text-balance">
            {t("hero.title1")}<br />
            <span className="text-primary">{t("hero.title2")}</span>
          </h1>
          <p className="text-base text-muted-foreground mt-3 max-w-md mx-auto text-pretty">
            {t("hero.subtitle")}
          </p>
          {/* Dynamic stats */}
          {!isLoading && listings.length > 0 && (
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-primary">{listings.length}+</p>
                <p className="text-xs text-muted-foreground">{t("hero.stats.ads")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-primary">13</p>
                <p className="text-xs text-muted-foreground">{t("hero.stats.cities")}</p>
              </div>
            </div>
          )}
        </section>

        <CategoryNav />
        <CategoryGrid />

        <div className="py-3">
          <PublishCTA />
        </div>

        {isLoading ? (
          <section className="py-4">
            <Skeleton className="h-7 w-48 mb-5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-3xl overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3 space-y-2.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
            <p className="text-lg font-bold text-foreground">{t("listings.none")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("listings.beFirst")}</p>
          </div>
        ) : (
          <>
            <section className="py-4">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2 rounded-xl bg-accent">
                  {isLoggedIn ? <Sparkles className="h-5 w-5 text-accent-foreground" /> : <Clock className="h-5 w-5 text-accent-foreground" />}
                </div>
                <h2 className="text-xl font-extrabold text-foreground">{isLoggedIn ? t("listings.forYou") : t("listings.recent")}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {listings.slice(0, 8).map((listing, i) => (
                  <div key={listing.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
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
                <section key={cat.id} className="py-4">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-accent">
                        <Icon className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <h2 className="text-xl font-extrabold text-foreground">{t(`cat.${cat.id}`).split(" ")[0]}</h2>
                    </div>
                    <Link 
                      to={`/categorie/${cat.id}`} 
                      className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline focus-ring rounded-lg px-2 py-1"
                    >
                      {t("listings.seeMore")} <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {catListings.map((listing, i) => (
                      <div key={listing.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
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

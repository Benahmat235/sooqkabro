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
import type { ListingWithImages } from "@/hooks/useListings";

const Index = () => {
  const [selectedCity, setSelectedCity] = useState("all");
  const { detectedCity } = useGeoLocation();

  useEffect(() => {
    if (detectedCity && selectedCity === "all") {
      setSelectedCity(detectedCity);
    }
  }, [detectedCity]);
  const { user } = useAuth();

  const { data: listings = [], isLoading } = useListings(selectedCity);

  const isLoggedIn = !!user;

  // Group listings by category
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
        <section className="py-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
            Cherchez. Trouvez.<br />
            <span className="text-primary">Partout au Tchad.</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Des milliers d'annonces à portée de main
          </p>
        </section>

        {/* Secondary category nav */}
        <CategoryNav />

        <CategoryGrid />

        {/* CTA Banner */}
        <div className="py-3">
          <PublishCTA />
        </div>

        {/* Category sections */}
        {isLoading ? (
          <section className="py-3">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-2.5 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
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
            <p className="text-lg font-bold text-foreground">Aucune annonce</p>
            <p className="text-sm text-muted-foreground mt-1">Soyez le premier à publier une annonce !</p>
          </div>
        ) : (
          <>
            {/* Recent / For You section */}
            <section className="py-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-accent">
                  {isLoggedIn ? <Sparkles className="h-4 w-4 text-accent-foreground" /> : <Clock className="h-4 w-4 text-accent-foreground" />}
                </div>
                <h2 className="text-lg font-extrabold text-foreground">{isLoggedIn ? "Pour vous" : "Annonces récentes"}</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listings.slice(0, 6).map((listing, i) => (
                  <div key={listing.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
                    <ListingCard listing={listing} />
                  </div>
                ))}
              </div>
            </section>

            {/* Per-category sections */}
            {popularCategories.map((cat) => {
              const catListings = listingsByCategory[cat.id];
              if (!catListings || catListings.length === 0) return null;
              const Icon = cat.icon;
              return (
                <section key={cat.id} className="py-3">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-accent">
                        <Icon className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <h2 className="text-lg font-extrabold text-foreground">{cat.name.split(" ")[0]}</h2>
                    </div>
                    <Link to={`/categorie/${cat.id}`} className="text-primary text-xs font-semibold flex items-center gap-0.5 hover:underline">
                      Voir plus <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

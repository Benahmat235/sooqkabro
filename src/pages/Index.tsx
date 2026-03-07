import { useState, useEffect } from "react";
import Header from "@/components/Header";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryNav from "@/components/CategoryNav";
import PublishCTA from "@/components/PublishCTA";
import ListingCard from "@/components/ListingCard";
import BottomNav from "@/components/BottomNav";
import { usePersonalizedFeed } from "@/hooks/usePersonalizedFeed";
import { useListings } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Clock } from "lucide-react";
import { useGeoLocation } from "@/hooks/useGeoLocation";

const Index = () => {
  const [selectedCity, setSelectedCity] = useState("all");
  const { detectedCity } = useGeoLocation();

  useEffect(() => {
    if (detectedCity && selectedCity === "all") {
      setSelectedCity(detectedCity);
    }
  }, [detectedCity]);
  const { user } = useAuth();

  const personalizedQuery = usePersonalizedFeed(selectedCity);
  const regularQuery = useListings(selectedCity);

  const isLoggedIn = !!user;
  const { data: listings = [], isLoading } = isLoggedIn ? personalizedQuery : regularQuery;

  const displayListings = listings.slice(0, 12);
  const sectionTitle = isLoggedIn ? "Pour vous" : "Annonces récentes";
  const SectionIcon = isLoggedIn ? Sparkles : Clock;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <main className="container mx-auto px-4">
        {/* Secondary category nav */}
        <CategoryNav />

        <CategoryGrid />

        {/* CTA Banner */}
        <div className="py-3">
          <PublishCTA />
        </div>

        <section className="py-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-accent">
              <SectionIcon className="h-4 w-4 text-accent-foreground" />
            </div>
            <h2 className="text-lg font-extrabold text-foreground">{sectionTitle}</h2>
          </div>

          {isLoading ? (
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
          ) : displayListings.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
              <p className="text-lg font-bold text-foreground">Aucune annonce</p>
              <p className="text-sm text-muted-foreground mt-1">Soyez le premier à publier une annonce !</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {displayListings.map((listing, i) => (
                <div
                  key={listing.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;

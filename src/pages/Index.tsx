import { useState } from "react";
import Header from "@/components/Header";
import CategoryGrid from "@/components/CategoryGrid";
import ListingCard from "@/components/ListingCard";
import BottomNav from "@/components/BottomNav";
import { useListings } from "@/hooks/useListings";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [selectedCity, setSelectedCity] = useState("all");
  const { data: listings = [], isLoading } = useListings(selectedCity);

  const recentListings = listings.slice(0, 9);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <main className="container mx-auto px-4">
        <CategoryGrid />

        {/* Recent */}
        <section className="py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Annonces récentes</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 gap-2.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : recentListings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-semibold">Aucune annonce</p>
              <p className="text-sm mt-1">Soyez le premier à publier !</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {recentListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
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

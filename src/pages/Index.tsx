import { useState } from "react";
import Header from "@/components/Header";
import CategoryGrid from "@/components/CategoryGrid";
import ListingCard from "@/components/ListingCard";
import BottomNav from "@/components/BottomNav";
import { mockListings } from "@/data/mockListings";

const Index = () => {
  const [selectedCity, setSelectedCity] = useState("all");

  const filteredListings =
    selectedCity === "all"
      ? mockListings
      : mockListings.filter((l) => l.cityId === selectedCity);

  const featuredListings = filteredListings.filter((l) => l.featured);
  const recentListings = filteredListings.slice(0, 9);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <main className="container mx-auto px-4">
        <CategoryGrid />

        {/* Featured */}
        {featuredListings.length > 0 && (
          <section className="py-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">⭐ Annonces à la une</h2>
              <span className="text-primary text-sm font-semibold cursor-pointer">Voir tout →</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        {/* Recent */}
        <section className="py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Annonces récentes</h2>
            <span className="text-primary text-sm font-semibold cursor-pointer">Voir tout →</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {recentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;

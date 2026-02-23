import { useState } from "react";
import Header from "@/components/Header";
import CategoryGrid from "@/components/CategoryGrid";
import ListingCard from "@/components/ListingCard";
import { mockListings } from "@/data/mockListings";

const Index = () => {
  const [selectedCity, setSelectedCity] = useState("all");

  const filteredListings =
    selectedCity === "all"
      ? mockListings
      : mockListings.filter((l) => l.cityId === selectedCity);

  const featuredListings = filteredListings.filter((l) => l.featured);
  const recentListings = filteredListings.slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <main className="container mx-auto px-4 pb-10">
        <CategoryGrid />

        {/* Featured */}
        {featuredListings.length > 0 && (
          <section className="py-4">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              ⭐ Annonces à la une
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        {/* Recent */}
        <section className="py-4">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            🕐 Annonces récentes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {recentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      </main>

      {/* Mobile FAB */}
      <a
        href="/publier"
        className="md:hidden fixed bottom-6 right-6 z-50 bg-secondary text-secondary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
      >
        <span className="text-2xl font-bold">+</span>
      </a>

      <footer className="bg-primary text-primary-foreground py-6 text-center text-sm">
        <p className="font-semibold">🇹🇩 TchadMarket</p>
        <p className="text-primary-foreground/70 mt-1">La plateforme de petites annonces du Tchad</p>
      </footer>
    </div>
  );
};

export default Index;

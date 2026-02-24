import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { mockListings } from "@/data/mockListings";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const cityParam = searchParams.get("city") || "all";
  const [selectedCity, setSelectedCity] = useState(cityParam);

  const results = mockListings.filter((l) => {
    const matchQuery = l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.description.toLowerCase().includes(query.toLowerCase());
    const matchCity = selectedCity === "all" || l.cityId === selectedCity;
    return matchQuery && matchCity;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />
      <main className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Link to="/" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">"{query}"</span>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          {results.length} résultat{results.length !== 1 ? "s" : ""}
        </p>

        {results.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-semibold">Aucun résultat</p>
            <p className="text-sm mt-1">Essayez d'autres mots-clés</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {results.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default SearchPage;

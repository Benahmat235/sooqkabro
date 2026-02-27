import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { useSearchListings } from "@/hooks/useListings";
import { Skeleton } from "@/components/ui/skeleton";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const cityParam = searchParams.get("city") || "all";
  const [selectedCity, setSelectedCity] = useState(cityParam);

  const { data: results = [], isLoading } = useSearchListings(query, selectedCity);

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

        {isLoading ? (
          <div className="grid grid-cols-3 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : results.length === 0 ? (
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

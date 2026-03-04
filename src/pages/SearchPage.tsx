import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, SearchX, Search } from "lucide-react";
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
        {query && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link to="/" className="hover:text-primary flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Accueil
            </Link>
            <span className="text-border">/</span>
            <span className="text-foreground font-semibold">"{query}"</span>
          </div>
        )}

        {query && (
          <p className="text-sm text-muted-foreground mb-4">
            <span className="font-semibold text-foreground">{results.length}</span> résultat{results.length !== 1 ? "s" : ""} trouvé{results.length !== 1 ? "s" : ""}
          </p>
        )}

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
        ) : !query ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
              <Search className="h-9 w-9 text-accent-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">Trouvez ce que vous cherchez</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Utilisez la barre de recherche pour trouver des annonces parmi toutes les catégories
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <SearchX className="h-9 w-9 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">Aucun résultat</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Essayez d'autres mots-clés ou changez de ville
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.map((listing, i) => (
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
      </main>
      <BottomNav />
    </div>
  );
};

export default SearchPage;

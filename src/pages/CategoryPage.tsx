import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryById } from "@/data/categories";
import { cities } from "@/data/cities";
import { useListings } from "@/hooks/useListings";

const CategoryPage = () => {
  const { categoryId, subId } = useParams();
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const { data: allListings = [], isLoading } = useListings(selectedCity);

  const listings = useMemo(() => {
    let filtered = allListings.filter((l) => l.category_id === categoryId);
    if (subId) filtered = filtered.filter((l) => l.subcategory_id === subId);
    if (minPrice) filtered = filtered.filter((l) => l.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter((l) => l.price <= Number(maxPrice));

    if (sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
    else filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return filtered;
  }, [allListings, categoryId, subId, minPrice, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <main className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Link to="/" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{category?.name || categoryId}</span>
        </div>

        {category && !subId && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
            {category.subcategories.map((sub) => (
              <Link key={sub.id} to={`/categorie/${categoryId}/${sub.id}`}>
                <Button variant="outline" size="sm" className="text-xs whitespace-nowrap rounded-full">
                  {sub.name}
                </Button>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-3 gap-2">
          <p className="text-sm text-muted-foreground">
            {listings.length} annonce{listings.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full text-xs gap-1" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtres
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-8 text-xs rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Récentes</SelectItem>
                <SelectItem value="price-asc">Prix ↑</SelectItem>
                <SelectItem value="price-desc">Prix ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-3 p-3 bg-card rounded-xl border">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-36 h-9 text-xs rounded-full">
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Min FCFA" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-28 h-9 text-xs rounded-full" type="number" />
            <Input placeholder="Max FCFA" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-28 h-9 text-xs rounded-full" type="number" />
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-3 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-semibold">Aucune annonce</p>
            <p className="text-sm mt-1">Modifiez vos filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default CategoryPage;

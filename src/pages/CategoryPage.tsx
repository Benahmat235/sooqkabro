import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Grid3X3, List, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoryById } from "@/data/categories";
import { cities } from "@/data/cities";
import { mockListings } from "@/data/mockListings";

const CategoryPage = () => {
  const { categoryId, subId } = useParams();
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const category = categoryId ? getCategoryById(categoryId) : undefined;

  let listings = mockListings.filter((l) => l.categoryId === categoryId);
  if (subId) listings = listings.filter((l) => l.subcategoryId === subId);
  if (selectedCity !== "all") listings = listings.filter((l) => l.cityId === selectedCity);
  if (minPrice) listings = listings.filter((l) => l.price >= Number(minPrice));
  if (maxPrice) listings = listings.filter((l) => l.price <= Number(maxPrice));

  if (sortBy === "price-asc") listings.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-desc") listings.sort((a, b) => b.price - a.price);
  else listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-background">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <main className="container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{category?.name || categoryId}</span>
        </div>

        {/* Subcategories */}
        {category && !subId && (
          <div className="flex flex-wrap gap-2 mb-4">
            {category.subcategories.map((sub) => (
              <Link key={sub.id} to={`/categorie/${categoryId}/${sub.id}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  {sub.name}
                </Button>
              </Link>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <p className="text-sm text-muted-foreground">
            {listings.length} annonce{listings.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récentes</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 mb-4 p-3 bg-card rounded-lg border">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-40 h-9 text-xs">
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Prix min (FCFA)" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-36 h-9 text-xs" type="number" />
            <Input placeholder="Prix max (FCFA)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-36 h-9 text-xs" type="number" />
          </div>
        )}

        {/* Listings */}
        {listings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-semibold">Aucune annonce trouvée</p>
            <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" : "flex flex-col gap-3"}>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;

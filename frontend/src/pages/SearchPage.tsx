import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, SearchX, Search, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import FilterPanel from "@/components/FilterPanel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchListings } from "@/hooks/useListings";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/i18n/useTranslation";
import { usePriceStatsBatch } from "@/hooks/usePriceStats";
import { classifyPrice } from "@/lib/pricing";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const cityParam = searchParams.get("city") || "all";
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [quartier, setQuartier] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const { t } = useTranslation();

  const { data: rawResults = [], isLoading } = useSearchListings(query, selectedCity);

  const results = useMemo(() => {
    let filtered = [...rawResults];
    if (minPrice) filtered = filtered.filter((l) => l.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter((l) => l.price <= Number(maxPrice));
    if (quartier !== "all") filtered = filtered.filter((l) => l.quartier === quartier);
    if (dateFilter !== "all") {
      const now = Date.now();
      const ms = dateFilter === "today" ? 86400000 : dateFilter === "7days" ? 604800000 : 2592000000;
      filtered = filtered.filter((l) => now - new Date(l.created_at).getTime() < ms);
    }
    if (sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === "recent") filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return filtered;
  }, [rawResults, minPrice, maxPrice, quartier, dateFilter, sortBy]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />
      <main className="container mx-auto px-4 py-3">
        {query && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link to="/" className="hover:text-primary flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-4 w-4" /> {t("common.home")}
            </Link>
            <span className="text-border">/</span>
            <span className="text-foreground font-semibold">"{query}"</span>
          </div>
        )}

        {query && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{results.length}</span> {results.length !== 1 ? t("search.resultsPlural") : t("search.results")} {results.length !== 1 ? t("search.foundPlural") : t("search.found")}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5 border-border/50" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {t("filter.filters")}
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 h-8 text-xs rounded-full border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t("filter.recent")}</SelectItem>
                  <SelectItem value="price-asc">{t("filter.priceAsc")}</SelectItem>
                  <SelectItem value="price-desc">{t("filter.priceDesc")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {showFilters && (
          <div className="mb-3">
            <FilterPanel
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              minPrice={minPrice}
              onMinPriceChange={setMinPrice}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              quartier={quartier}
              onQuartierChange={setQuartier}
              verifiedOnly={verifiedOnly}
              onVerifiedOnlyChange={setVerifiedOnly}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
            />
          </div>
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
            <p className="text-lg font-bold text-foreground">{t("search.find")}</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              {t("search.useBar")}
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <SearchX className="h-9 w-9 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">{t("search.noResults")}</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              {t("search.tryOther")}
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

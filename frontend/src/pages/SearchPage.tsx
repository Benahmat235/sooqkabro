import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, BadgeCheck, SearchX, Search, SlidersHorizontal, X, BellPlus, Check } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import FilterPanel from "@/components/FilterPanel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSearchListings, type ListingWithImages } from "@/hooks/useListings";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/i18n/useTranslation";
import { usePriceStatsBatch } from "@/hooks/usePriceStats";
import { classifyPrice } from "@/lib/pricing";
import { getCityById } from "@/data/cities";
import { useAuth } from "@/hooks/useAuth";
import { useSaveSearch, useSavedSearches } from "@/hooks/useSavedSearches";
import { useToast } from "@/hooks/use-toast";

const defaultFilters = {
  city: "all",
  sort: "recent",
  min: "",
  max: "",
  quartier: "all",
  verified: "0",
  date: "all",
};

const dateLabels: Record<string, string> = {
  today: "Aujourd'hui",
  "7days": "7 jours",
  "30days": "30 jours",
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const selectedCity = searchParams.get("city") || defaultFilters.city;
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const sortBy = searchParams.get("sort") || defaultFilters.sort;
  const minPrice = searchParams.get("min") || defaultFilters.min;
  const maxPrice = searchParams.get("max") || defaultFilters.max;
  const quartier = searchParams.get("quartier") || defaultFilters.quartier;
  const verifiedOnly = searchParams.get("verified") === "1";
  const dateFilter = searchParams.get("date") || defaultFilters.date;
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const saveSearch = useSaveSearch();
  const { data: savedSearches = [] } = useSavedSearches();

  const { data: rawResults = [], isLoading } = useSearchListings(query, selectedCity);

  const currentFilterPayload = useMemo(
    () => ({
      city: selectedCity,
      sort: sortBy,
      min: minPrice,
      max: maxPrice,
      quartier,
      verified: verifiedOnly ? "1" : "0",
      date: dateFilter,
    }),
    [selectedCity, sortBy, minPrice, maxPrice, quartier, verifiedOnly, dateFilter]
  );

  const alreadySaved = useMemo(() => {
    const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();
    return savedSearches.some(
      (s) =>
        norm(s.query) === norm(query) &&
        JSON.stringify(s.filters || {}) === JSON.stringify(currentFilterPayload)
    );
  }, [savedSearches, query, currentFilterPayload]);

  const handleSaveSearch = () => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour sauvegarder vos recherches.", variant: "destructive" });
      return;
    }
    if (!query && selectedCity === "all" && !minPrice && !maxPrice && quartier === "all" && !verifiedOnly && dateFilter === "all") {
      toast({ title: "Recherche vide", description: "Ajoutez un mot-clé ou un filtre.", variant: "destructive" });
      return;
    }
    const cityName = getCityById(selectedCity)?.name;
    const label = query || cityName || "Recherche";
    saveSearch.mutate(
      { label, query, filters: currentFilterPayload },
      {
        onSuccess: () => toast({ title: "Recherche sauvegardée", description: "Retrouvez-la dans Mon compte." }),
        onError: (e) => toast({ title: "Erreur", description: e instanceof Error ? e.message : "Sauvegarde impossible", variant: "destructive" }),
      }
    );
  };

  const updateFilter = (key: string, value: string, defaultValue = "") => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (!value || value === defaultValue) next.delete(key);
      else next.set(key, value);
      return next;
    });
  };

  const resetFilters = () => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      ["city", "sort", "min", "max", "quartier", "verified", "date"].forEach((key) => next.delete(key));
      return next;
    });
  };

  const updateCityFilter = (value: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (!value || value === "all") next.delete("city");
      else next.set("city", value);
      next.delete("quartier");
      return next;
    });
  };

  const results = useMemo(() => {
    let filtered = [...rawResults];
    if (minPrice) filtered = filtered.filter((l) => l.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter((l) => l.price <= Number(maxPrice));
    if (quartier !== "all") filtered = filtered.filter((l) => l.quartier === quartier);
    if (verifiedOnly) filtered = filtered.filter((l) => l.is_verified);
    if (dateFilter !== "all") {
      const now = Date.now();
      const ms = dateFilter === "today" ? 86400000 : dateFilter === "7days" ? 604800000 : 2592000000;
      filtered = filtered.filter((l) => now - new Date(l.created_at).getTime() < ms);
    }
    if (sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === "recent") filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return filtered;
  }, [rawResults, minPrice, maxPrice, quartier, verifiedOnly, dateFilter, sortBy]);

  const activeFilters = useMemo(() => {
    const filters: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (selectedCity !== "all") {
      filters.push({
        key: "city",
        label: getCityById(selectedCity)?.name || selectedCity,
        onRemove: () => updateFilter("city", "all", "all"),
      });
    }
    if (quartier !== "all") {
      filters.push({
        key: "quartier",
        label: quartier,
        onRemove: () => updateFilter("quartier", "all", "all"),
      });
    }
    if (minPrice) {
      filters.push({
        key: "min",
        label: `Min ${Number(minPrice).toLocaleString("fr-FR")} FCFA`,
        onRemove: () => updateFilter("min", ""),
      });
    }
    if (maxPrice) {
      filters.push({
        key: "max",
        label: `Max ${Number(maxPrice).toLocaleString("fr-FR")} FCFA`,
        onRemove: () => updateFilter("max", ""),
      });
    }
    if (dateFilter !== "all") {
      filters.push({
        key: "date",
        label: dateLabels[dateFilter] || dateFilter,
        onRemove: () => updateFilter("date", "all", "all"),
      });
    }
    if (verifiedOnly) {
      filters.push({
        key: "verified",
        label: "Vendeur verifie",
        onRemove: () => updateFilter("verified", "0", "0"),
      });
    }
    return filters;
  }, [selectedCity, quartier, minPrice, maxPrice, dateFilter, verifiedOnly, setSearchParams]);

  const filterPanel = (
    <FilterPanel
      selectedCity={selectedCity}
      onCityChange={updateCityFilter}
      minPrice={minPrice}
      onMinPriceChange={(value) => updateFilter("min", value)}
      maxPrice={maxPrice}
      onMaxPriceChange={(value) => updateFilter("max", value)}
      quartier={quartier}
      onQuartierChange={(value) => updateFilter("quartier", value, "all")}
      verifiedOnly={verifiedOnly}
      onVerifiedOnlyChange={(value) => updateFilter("verified", value ? "1" : "0", "0")}
      dateFilter={dateFilter}
      onDateFilterChange={(value) => updateFilter("date", value, "all")}
    />
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header selectedCity={selectedCity} onCityChange={updateCityFilter} />
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
              <Button
                variant="outline"
                size="sm"
                className="hidden rounded-full text-xs gap-1.5 border-border/50 sm:inline-flex"
                onClick={() => setShowFilters((open) => !open)}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {t("filter.filters")}
                {activeFilters.length > 0 && (
                  <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs gap-1.5 border-border/50 sm:hidden"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {t("filter.filters")}
                {activeFilters.length > 0 && (
                  <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
              <Select value={sortBy} onValueChange={(value) => updateFilter("sort", value, "recent")}>
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

        {query && activeFilters.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={filter.onRemove}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 text-xs font-medium text-foreground hover:bg-muted/80"
              >
                {filter.key === "verified" && <BadgeCheck className="h-3 w-3 text-primary" />}
                <span>{filter.label}</span>
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
            <button
              type="button"
              onClick={resetFilters}
              className="h-8 shrink-0 rounded-full px-2 text-xs font-semibold text-primary hover:underline"
            >
              Effacer
            </button>
          </div>
        )}

        {showFilters && (
          <div className="mb-3 hidden sm:block">
            {filterPanel}
          </div>
        )}

        <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-4 sm:hidden">
            <SheetHeader className="mb-4 text-left">
              <SheetTitle>{t("filter.filters")}</SheetTitle>
            </SheetHeader>
            {filterPanel}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" className="rounded-xl" onClick={resetFilters}>
                Effacer
              </Button>
              <Button className="rounded-xl" onClick={() => setShowMobileFilters(false)}>
                Voir {results.length}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
	                <Skeleton className="aspect-[4/3] w-full" />
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
          <PricedSearchGrid items={results} />
        )}
      </main>
      <BottomNav />
    </div>
  );
};

function PricedSearchGrid({ items }: { items: ListingWithImages[] }) {
  const { data: statsMap } = usePriceStatsBatch(
    items.map((l) => ({ category_id: l.category_id, subcategory_id: l.subcategory_id }))
  );
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((listing, i) => {
        const key = `${listing.category_id}::${listing.subcategory_id ?? ""}`;
        const level = classifyPrice(listing.price, statsMap?.get(key));
        return (
          <div
            key={listing.id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
          >
            <ListingCard listing={listing} priceLevel={level} />
          </div>
        );
      })}
    </div>
  );
}

export default SearchPage;

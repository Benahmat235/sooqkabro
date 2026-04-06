import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, X, Clock, Trash2, Heart, Bell, Menu, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cities } from "@/data/cities";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useTranslation } from "@/i18n/useTranslation";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface HeaderProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

const Header = ({ selectedCity, onCityChange }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearch(searchQuery.trim());
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}&city=${selectedCity}`);
      setShowHistory(false);
    }
  };

  const handleHistoryClick = (q: string) => {
    setSearchQuery(q);
    addSearch(q);
    navigate(`/search?q=${encodeURIComponent(q)}&city=${selectedCity}`);
    setShowHistory(false);
  };

  const selectedCityName = selectedCity === "all" 
    ? t("filter.allCities") 
    : cities.find(c => c.id === selectedCity)?.name || selectedCity;

  return (
    <header className="bg-card border-b border-border/50">
      <div className="container mx-auto px-3">
        {/* Row 1: Actions left + Logo right */}
        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center gap-3">
            <Link to="/favoris" className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Favoris">
              <Heart className="h-5 w-5 text-foreground" />
            </Link>
            <button className="p-2 rounded-full hover:bg-muted transition-colors relative" aria-label="Notifications">
              <Bell className="h-5 w-5 text-foreground" />
            </button>
            <Link
              to="/publier"
              className="bg-primary text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-full hover:bg-primary/90 transition-colors"
            >
              + {t("nav.publish")}
            </Link>
          </div>

          <Link 
            to="/" 
            className="flex items-center gap-2 focus-ring rounded-lg"
            aria-label="SooqKabro - Accueil"
          >
            <span className="text-lg font-extrabold text-foreground tracking-tight">
              Sooq<span className="text-primary">Kabro</span>
            </span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(var(--chad-blue))] flex items-center justify-center">
              <span className="text-primary-foreground font-extrabold text-xs">SK</span>
            </div>
          </Link>
        </div>

        {/* Row 2: City selector with flag */}
        <div className="pb-2">
          <Select value={selectedCity} onValueChange={onCityChange}>
            <SelectTrigger 
              className="w-full h-10 rounded-lg bg-muted/40 border-0 text-sm gap-2 focus:ring-primary/30 justify-start"
              aria-label="Sélectionner une ville"
            >
              <span className="text-base mr-1">🇹🇩</span>
              <span className="text-foreground font-medium">Tchad</span>
              <span className="text-muted-foreground mx-1">—</span>
              <span className="text-muted-foreground truncate">{selectedCityName}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.allCities")}</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 3: Search bar */}
        <div className="pb-3 relative" ref={historyRef}>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => history.length > 0 && setShowHistory(true)}
                className="bg-muted/40 border-0 h-11 rounded-lg text-sm pr-10 focus-visible:ring-primary/30 focus-visible:bg-card transition-colors"
                aria-label={t("search.placeholder")}
                aria-expanded={showHistory}
                aria-haspopup="listbox"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-11 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Search history dropdown */}
          {showHistory && history.length > 0 && (
            <div 
              className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl border shadow-lg z-50 overflow-hidden animate-fade-in"
              role="listbox"
              aria-label="Historique de recherche"
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b">
                <span className="text-xs font-semibold text-muted-foreground">{t("search.recent")}</span>
                <button 
                  onClick={clearHistory} 
                  className="text-xs text-destructive hover:underline flex items-center gap-1 p-1 rounded focus-ring"
                  aria-label="Effacer tout l'historique"
                >
                  <Trash2 className="h-3 w-3" />{t("search.clear")}
                </button>
              </div>
              {history.map((q) => (
                <button 
                  key={q} 
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors text-left" 
                  onClick={() => handleHistoryClick(q)}
                  role="option"
                >
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate flex-1">{q}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeSearch(q); }} 
                    className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-muted transition-colors"
                    aria-label={`Supprimer "${q}"`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

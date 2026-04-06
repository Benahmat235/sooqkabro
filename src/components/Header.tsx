import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, X, Clock, Trash2, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cities } from "@/data/cities";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";
import { useTranslation } from "@/i18n/useTranslation";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

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

  return (
    <header className="glass border-b shadow-warm">
      <div className="container mx-auto px-4">
        {/* Top row: Logo + Actions */}
        <div className="flex items-center justify-between py-3">
          <Link 
            to="/" 
            className="flex items-center gap-2.5 focus-ring rounded-lg"
            aria-label="SooqKabro - Accueil"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--chad-blue))] flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-extrabold text-sm">SK</span>
            </div>
            <span className="text-lg font-extrabold text-foreground tracking-tight">
              Sooq<span className="text-primary">Kabro</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            {/* Hide publish button on small screens - it's in BottomNav */}
            <Button 
              asChild 
              size="sm" 
              className="hidden sm:inline-flex rounded-xl font-bold text-sm gap-1.5 h-10 px-4 bg-[hsl(var(--chad-yellow))] text-foreground hover:bg-[hsl(var(--chad-yellow))]/90 focus-ring"
            >
              <Link to="/publier">
                <PlusCircle className="h-4 w-4" />
                {t("nav.publish")}
              </Link>
            </Button>
          </div>
        </div>

        {/* Search row */}
        <div className="pb-3 flex gap-2 relative" ref={historyRef}>
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => history.length > 0 && setShowHistory(true)}
                className="pl-11 bg-muted/50 border-0 h-12 rounded-xl text-sm focus-visible:ring-primary/30 focus-visible:bg-card transition-colors"
                aria-label={t("search.placeholder")}
                aria-expanded={showHistory}
                aria-haspopup="listbox"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted transition-colors focus-ring"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </form>

          {/* City selector - hidden on mobile, visible on tablet+ */}
          <Select value={selectedCity} onValueChange={onCityChange}>
            <SelectTrigger 
              className="hidden md:flex w-auto min-w-[130px] h-12 rounded-xl bg-muted/50 border-0 text-sm gap-2 focus:ring-primary/30"
              aria-label="Selectionner une ville"
            >
              <MapPin className="h-4 w-4 text-[hsl(var(--chad-yellow))] shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.allCities")}</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mobile city selector - compact */}
          <Select value={selectedCity} onValueChange={onCityChange}>
            <SelectTrigger 
              className="flex md:hidden w-12 h-12 rounded-xl bg-muted/50 border-0 justify-center p-0 focus:ring-primary/30"
              aria-label="Selectionner une ville"
            >
              <MapPin className="h-5 w-5 text-[hsl(var(--chad-yellow))]" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.allCities")}</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search history dropdown */}
          {showHistory && history.length > 0 && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border shadow-lg z-50 overflow-hidden animate-fade-in"
              role="listbox"
              aria-label="Historique de recherche"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="text-sm font-semibold text-muted-foreground">{t("search.recent")}</span>
                <button 
                  onClick={clearHistory} 
                  className="text-xs text-destructive hover:underline flex items-center gap-1.5 p-1 rounded focus-ring"
                  aria-label="Effacer tout l'historique"
                >
                  <Trash2 className="h-3.5 w-3.5" />{t("search.clear")}
                </button>
              </div>
              {history.map((q) => (
                <button 
                  key={q} 
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left focus-ring" 
                  onClick={() => handleHistoryClick(q)}
                  role="option"
                >
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate flex-1">{q}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeSearch(q); }} 
                    className="text-muted-foreground hover:text-destructive p-1.5 rounded-full hover:bg-muted transition-colors focus-ring"
                    aria-label={`Supprimer "${q}" de l'historique`}
                  >
                    <X className="h-4 w-4" />
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

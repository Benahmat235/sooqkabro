import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, X, Clock, Trash2, Heart, Bell, ChevronDown, CloudSun, MoonStar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cities } from "@/data/cities";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useNotifications } from "@/hooks/useNotifications";
import { useTranslation } from "@/i18n/useTranslation";
import NotificationCenter from "@/components/NotificationCenter";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { buttonVariants, pulseVariants } from "@/lib/animations";

interface HeaderProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

const Header = ({ selectedCity, onCityChange }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();
  const { unreadCount } = useNotifications();
  const { t, locale: language } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const isRTL = language === 'ar';

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

  const trendingSearches = ["Toyota", "iPhone 15", "Appartement", "Moto Jakarta", "HP Laptop"];

  return (
    <>
    <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    <motion.header 
      className={cn("bg-card/95 backdrop-blur-md border-b border-border/50 z-40", isRTL && "rtl")}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top Bar: Weather & Prayer (Utility Widget) */}
      <div className="hidden sm:block bg-primary/5 border-b border-primary/10 py-1">
        <div className="container mx-auto px-3 flex justify-between items-center text-[10px] font-medium text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><CloudSun className="h-3 w-3 text-amber-500" /> N'Djaména 34°C</span>
            <span className="flex items-center gap-1 border-l pl-3 border-border"><MoonStar className="h-3 w-3 text-indigo-500" /> Prochaine prière: Dhuhr (12:15)</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3">
        {/* Row 1: Actions left + Logo right */}
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/favoris" 
                className="p-1.5 rounded-full hover:bg-muted transition-colors group relative" 
                aria-label="Favoris"
              >
                <Heart className="h-[18px] w-[18px] text-foreground group-hover:text-[hsl(var(--chad-red))] transition-colors" />
              </Link>
            </motion.div>
            
            <motion.button 
              onClick={() => setShowNotifications(true)}
              className="p-1.5 rounded-full hover:bg-muted transition-colors relative" 
              aria-label="Notifications"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="h-[18px] w-[18px] text-foreground" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    variants={pulseVariants}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Link
                to="/publier"
                className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all"
              >
                + {t("nav.publish")}
              </Link>
            </motion.div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link 
              to="/" 
              className="flex items-center gap-1.5 focus-ring rounded-lg"
              aria-label="SooqKabro - Accueil"
            >
              <span className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                Sooq<span className="text-primary">Kabro</span>
              </span>
              <motion.div 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(var(--chad-blue))] flex items-center justify-center shadow-sm"
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-primary-foreground font-extrabold text-xs">SK</span>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Row 2: City selector + Search bar */}
        <motion.div
          className="pb-1.5 relative"
          ref={historyRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSearch} className="grid grid-cols-[110px_minmax(0,1fr)_44px] gap-2 sm:grid-cols-[160px_minmax(0,1fr)_44px]">
            <Select value={selectedCity} onValueChange={onCityChange}>
              <SelectTrigger
                className="h-11 w-full rounded-full bg-muted/60 border-0 px-3 text-xs gap-1 focus:ring-primary/30 justify-start sm:text-sm"
                aria-label="Sélectionner une ville"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
                <span className="text-foreground truncate font-medium">{selectedCityName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0 sm:h-4 sm:w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.allCities")}</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none", isRTL ? "right-4" : "left-4")} />
              <Input
                ref={inputRef}
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => history.length > 0 && setShowHistory(true)}
                className={cn(
                  "bg-muted/60 border-0 h-11 rounded-full text-sm focus-visible:ring-primary/30 focus-visible:bg-card transition-colors",
                  isRTL ? "pr-11 pl-10" : "pl-11 pr-10"
                )}
                aria-label={t("search.placeholder")}
                aria-expanded={showHistory}
                aria-haspopup="listbox"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={cn("absolute top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors", isRTL ? "left-3" : "right-3")}
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-11 w-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>


          {/* Search history dropdown */}
          <AnimatePresence>
            {showHistory && history.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl border shadow-xl-warm z-50 overflow-hidden"
                role="listbox"
                aria-label="Historique de recherche"
              >
	              <div className="flex items-center justify-between px-4 py-2.5 border-b">
	                <span className="text-xs font-semibold text-muted-foreground">{t("search.recent")}</span>
                <motion.button 
                  onClick={clearHistory} 
                  className="text-xs text-destructive hover:underline flex items-center gap-1 p-1 rounded focus-ring"
                  aria-label="Effacer tout l'historique"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 className="h-3 w-3" />{t("search.clear")}
                </motion.button>
              </div>
              {history.map((q, index) => (
                <motion.button
                  key={q} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors text-left" 
                  onClick={() => handleHistoryClick(q)}
                  role="option"
                  whileHover={{ x: 4 }}
                >
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate flex-1">{q}</span>
                  <motion.button 
                    onClick={(e) => { e.stopPropagation(); removeSearch(q); }} 
                    className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-muted transition-colors"
                    aria-label={`Supprimer "${q}"`}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                </motion.button>
              ))}
	            </motion.div>
	            )}
          </AnimatePresence>
        </motion.div>

        {/* Row 3: Trending Searches */}
        <div className="hidden md:flex pb-2 items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap uppercase tracking-wider">{t("search.recent")}:</span>
          <div className="flex gap-2">
            {trendingSearches.map((s) => (
              <button 
                key={s}
                onClick={() => handleHistoryClick(s)}
                className="text-[10px] bg-muted/60 hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded-full transition-colors whitespace-nowrap font-medium border border-transparent hover:border-primary/20"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.header>
    </>
  );
};

export default Header;

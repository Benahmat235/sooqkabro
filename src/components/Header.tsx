import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, MessageCircle, X, Clock, Trash2, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cities } from "@/data/cities";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useUnreadCount } from "@/hooks/useConversations";
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
  const { data: unreadCount = 0 } = useUnreadCount();
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
    <header className="sticky top-0 z-50 glass border-b shadow-warm">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--chad-blue))] flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-extrabold text-sm">TC</span>
            </div>
            <span className="text-lg font-extrabold text-foreground tracking-tight">
              Tchad<span className="text-primary">Market</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="rounded-xl font-bold text-xs gap-1.5 h-9 px-3 bg-[hsl(var(--chad-yellow))] text-foreground hover:bg-[hsl(var(--chad-yellow))]/90">
              <Link to="/publier">
                <PlusCircle className="h-4 w-4" />
                Publier
              </Link>
            </Button>
            <Link to="/messages" className="relative text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-accent">
              <MessageCircle className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center ring-2 ring-card">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <div className="pb-3 flex gap-2 relative" ref={historyRef}>
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Que recherchez-vous ?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => history.length > 0 && setShowHistory(true)}
                className="pl-10 bg-muted/50 border-0 h-11 rounded-xl text-sm focus-visible:ring-primary/30 focus-visible:bg-card transition-colors"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          </form>
          <Select value={selectedCity} onValueChange={onCityChange}>
            <SelectTrigger className="w-auto min-w-[110px] h-11 rounded-xl bg-muted/50 border-0 text-xs gap-1.5 focus:ring-primary/30">
              <MapPin className="h-3.5 w-3.5 text-[hsl(var(--chad-yellow))] shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout le Tchad</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search history dropdown */}
          {showHistory && history.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl border shadow-lg z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-xs font-semibold text-muted-foreground">Recherches récentes</span>
                <button onClick={clearHistory} className="text-[10px] text-destructive hover:underline flex items-center gap-1">
                  <Trash2 className="h-2.5 w-2.5" />Effacer
                </button>
              </div>
              {history.map((q) => (
                <button key={q} className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-accent/50 transition-colors text-left" onClick={() => handleHistoryClick(q)}>
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate flex-1">{q}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeSearch(q); }} className="text-muted-foreground hover:text-destructive p-0.5">
                    <X className="h-3 w-3" />
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

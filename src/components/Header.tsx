import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cities } from "@/data/cities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

const Header = ({ selectedCity, onCityChange }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}&city=${selectedCity}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b shadow-warm">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-chad-blue flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-extrabold text-sm">TC</span>
            </div>
            <span className="text-lg font-extrabold text-foreground tracking-tight">
              Tchad<span className="text-primary">Market</span>
            </span>
          </Link>

          <button className="relative text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-accent">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 bg-chad-red text-primary-foreground text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center ring-2 ring-card">
              3
            </span>
          </button>
        </div>

        {/* Search bar */}
        <div className="pb-3 flex gap-2">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Que recherchez-vous ?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-0 h-11 rounded-xl text-sm focus-visible:ring-primary/30 focus-visible:bg-card transition-colors"
              />
            </div>
          </form>
          <Select value={selectedCity} onValueChange={onCityChange}>
            <SelectTrigger className="w-auto min-w-[110px] h-11 rounded-xl bg-muted/50 border-0 text-xs gap-1.5 focus:ring-primary/30">
              <MapPin className="h-3.5 w-3.5 text-chad-yellow shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout le Tchad</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};

export default Header;

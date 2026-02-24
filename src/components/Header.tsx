import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Bell, Heart } from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-1">
            <span className="text-xl font-extrabold text-primary">
              🇹🇩 TchadMarket
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="relative text-muted-foreground hover:text-primary">
              <Heart className="h-5 w-5" />
            </button>
            <button className="relative text-muted-foreground hover:text-primary">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="pb-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher sur TchadMarket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border h-11 rounded-full text-sm"
              />
            </div>
            <Select value={selectedCity} onValueChange={onCityChange}>
              <SelectTrigger className="w-auto min-w-[100px] h-11 rounded-full bg-background border text-xs gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
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
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;

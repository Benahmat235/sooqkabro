import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Menu, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}&city=${selectedCity}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-primary shadow-md">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-primary-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              🇹🇩 TchadMarket
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/publier">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold gap-2">
                <Plus className="h-4 w-4" />
                Publier une annonce
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden text-primary-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Search bar */}
        <div className="pb-3 flex gap-2 items-center">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher sur TchadMarket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-primary-foreground border-0 h-11"
              />
            </div>
            <Button type="submit" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-11 px-6 font-semibold">
              Rechercher
            </Button>
          </form>
          <div className="hidden sm:block w-44">
            <Select value={selectedCity} onValueChange={onCityChange}>
              <SelectTrigger className="bg-primary-foreground border-0 h-11">
                <MapPin className="h-4 w-4 mr-1 text-accent" />
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

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <Select value={selectedCity} onValueChange={onCityChange}>
              <SelectTrigger className="bg-primary-foreground border-0 h-11">
                <MapPin className="h-4 w-4 mr-1 text-accent" />
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
            <Link to="/publier" onClick={() => setMenuOpen(false)}>
              <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold gap-2">
                <Plus className="h-4 w-4" />
                Publier une annonce
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

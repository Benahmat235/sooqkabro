import { Link } from "react-router-dom";
import { categories } from "@/data/categories";
import {
  Car, Home, Smartphone, Briefcase, Wrench, PawPrint,
  Shirt, Sofa, Monitor, UtensilsCrossed
} from "lucide-react";

const categoryImages: Record<string, string> = {
  vehicules: "🚗",
  immobilier: "🏠",
  telephones: "📱",
  emploi: "💼",
  services: "🔧",
  animaux: "🐄",
  mode: "👗",
  maison: "🛋️",
  electronique: "💻",
  alimentation: "🍽️",
};

const CategoryGrid = () => {
  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Catégories</h2>
        <Link to="/categories" className="text-primary text-sm font-semibold flex items-center gap-1">
          Voir tout →
        </Link>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/categorie/${cat.id}`}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-card border shadow-sm flex items-center justify-center text-3xl group-hover:shadow-md transition-shadow group-hover:border-primary/30">
              {categoryImages[cat.id] || "📦"}
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-foreground text-center leading-tight line-clamp-2">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;

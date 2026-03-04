import { Link } from "react-router-dom";
import { categories } from "@/data/categories";

const categoryEmojis: Record<string, string> = {
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

const categoryGradients: Record<string, string> = {
  vehicules: "from-blue-50 to-blue-100/50",
  immobilier: "from-emerald-50 to-emerald-100/50",
  telephones: "from-violet-50 to-violet-100/50",
  emploi: "from-amber-50 to-amber-100/50",
  services: "from-cyan-50 to-cyan-100/50",
  animaux: "from-orange-50 to-orange-100/50",
  mode: "from-pink-50 to-pink-100/50",
  maison: "from-teal-50 to-teal-100/50",
  electronique: "from-indigo-50 to-indigo-100/50",
  alimentation: "from-red-50 to-red-100/50",
};

const CategoryGrid = () => {
  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-extrabold text-foreground">Catégories</h2>
        <Link to="/categories" className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
          Voir tout →
        </Link>
      </div>
      <div className="grid grid-cols-5 gap-2.5">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            to={`/categorie/${cat.id}`}
            className="flex flex-col items-center gap-1.5 group animate-fade-in"
            style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
          >
            <div className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl sm:text-3xl",
              "shadow-card group-hover:shadow-card-hover group-hover:scale-105 transition-all duration-200",
              "border border-border/50",
              categoryGradients[cat.id] || "from-muted to-muted"
            )}>
              {categoryEmojis[cat.id] || "📦"}
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-foreground/80 text-center leading-tight line-clamp-2">
              {cat.name.split(" ")[0]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export default CategoryGrid;

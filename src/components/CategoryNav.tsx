import { Link, useLocation } from "react-router-dom";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

const CategoryNav = () => {
  const location = useLocation();

  return (
    <div className="overflow-x-auto scrollbar-hide py-2">
      <div className="flex gap-2 min-w-max px-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = location.pathname.includes(`/categorie/${cat.id}`);
          return (
            <Link
              key={cat.id}
              to={`/categorie/${cat.id}`}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.name.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryNav;

import { Link } from "react-router-dom";
import { categories } from "@/data/categories";
import { CategoryImage } from "@/components/CategoryImage";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/useTranslation";

const CategoryGrid = () => {
  const { t } = useTranslation();

  const popularCategories = categories.slice(0, 8); // Showing 8 categories

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Popular Categories</h2>
        <Link to="/decouvrir" className="text-sm font-semibold text-primary hover:underline">
          {t("listings.seeMore")}
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {popularCategories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              to={`/categorie/${cat.id}`}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-xl border border-border/50 bg-card transition-all duration-200",
                "hover:shadow-md hover:border-primary/20 active:scale-95",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
            >
              <div className={cn("p-3 rounded-full", cat.bgColor, cat.color)}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-foreground text-center leading-tight">
                {t(`cat.${cat.id}`).split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;

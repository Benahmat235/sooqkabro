import { Link } from "react-router-dom";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/useTranslation";

const CategoryGrid = () => {
  const { t } = useTranslation();

  return (
    <section className="py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-extrabold text-foreground">SooqKabro</h2>
        <Link to="/decouvrir" className="text-xs font-semibold text-primary hover:underline">
          {t("listings.seeMore")}
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            to={`/categorie/${cat.id}`}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-2xl overflow-hidden transition-all duration-200",
              "hover:shadow-md active:scale-95",
              cat.bgColor,
              "animate-fade-in"
            )}
            style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
          >
            <div className="w-full aspect-square overflow-hidden">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] font-semibold text-foreground/80 text-center leading-tight line-clamp-2 px-1 pb-2">
              {t(`cat.${cat.id}`).split(" ")[0]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;

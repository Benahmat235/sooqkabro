import { Link } from "react-router-dom";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/useTranslation";

const categoryStyles: Record<string, { bg: string; iconBg: string; text: string }> = {
  vehicules:    { bg: "bg-blue-50",    iconBg: "bg-blue-100",    text: "text-blue-600" },
  immobilier:   { bg: "bg-emerald-50", iconBg: "bg-emerald-100", text: "text-emerald-600" },
  telephones:   { bg: "bg-violet-50",  iconBg: "bg-violet-100",  text: "text-violet-600" },
  emploi:       { bg: "bg-amber-50",   iconBg: "bg-amber-100",   text: "text-amber-600" },
  services:     { bg: "bg-cyan-50",    iconBg: "bg-cyan-100",    text: "text-cyan-600" },
  animaux:      { bg: "bg-orange-50",  iconBg: "bg-orange-100",  text: "text-orange-600" },
  mode:         { bg: "bg-pink-50",    iconBg: "bg-pink-100",    text: "text-pink-600" },
  maison:       { bg: "bg-teal-50",    iconBg: "bg-teal-100",    text: "text-teal-600" },
  electronique: { bg: "bg-indigo-50",  iconBg: "bg-indigo-100",  text: "text-indigo-600" },
  alimentation: { bg: "bg-red-50",     iconBg: "bg-red-100",     text: "text-red-600" },
};

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
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          const style = categoryStyles[cat.id] || { bg: "bg-muted", iconBg: "bg-muted", text: "text-muted-foreground" };
          return (
            <Link
              key={cat.id}
              to={`/categorie/${cat.id}`}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200",
                "hover:shadow-md active:scale-95",
                style.bg,
                "animate-fade-in"
              )}
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
            >
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", style.iconBg)}>
                <Icon className={cn("h-6 w-6", style.text)} />
              </div>
              <span className="text-[10px] font-semibold text-foreground/80 text-center leading-tight line-clamp-2">
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

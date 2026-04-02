import { Link } from "react-router-dom";
import { categories } from "@/data/categories";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  vehicules: "bg-blue-100 text-blue-600",
  immobilier: "bg-emerald-100 text-emerald-600",
  telephones: "bg-violet-100 text-violet-600",
  emploi: "bg-amber-100 text-amber-600",
  services: "bg-cyan-100 text-cyan-600",
  animaux: "bg-orange-100 text-orange-600",
  mode: "bg-pink-100 text-pink-600",
  maison: "bg-teal-100 text-teal-600",
  electronique: "bg-indigo-100 text-indigo-600",
  alimentation: "bg-red-100 text-red-600",
};

const CategoryGrid = () => {
  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-extrabold text-foreground">Catégories</h2>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-2">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/categorie/${cat.id}`}
                className="flex flex-col items-center gap-1.5 group animate-fade-in shrink-0"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
              >
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  "shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200",
                  "border border-border/30",
                  categoryColors[cat.id] || "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-7 w-7" />
                </div>
                <span className="text-[10px] font-semibold text-foreground/80 text-center leading-tight w-16 line-clamp-2">
                  {cat.name.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};

export default CategoryGrid;

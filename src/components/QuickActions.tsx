import { Link } from "react-router-dom";
import { Grid3X3, FileText, Trophy, TrendingUp, Percent, Sparkles } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const actions = [
  {
    id: "categories",
    label: "Explorer",
    sublabel: "Categories",
    icon: Grid3X3,
    href: "/categories",
    color: "bg-orange-500",
    iconBg: "bg-orange-100",
  },
  {
    id: "deals",
    label: "Meilleures",
    sublabel: "Offres",
    icon: Percent,
    href: "/offres",
    color: "bg-red-500",
    iconBg: "bg-red-100",
  },
  {
    id: "top",
    label: "Produits",
    sublabel: "Populaires",
    icon: Trophy,
    href: "/populaires",
    color: "bg-amber-500",
    iconBg: "bg-amber-100",
  },
  {
    id: "new",
    label: "Nouveautes",
    sublabel: "Recentes",
    icon: Sparkles,
    href: "/nouveautes",
    color: "bg-blue-500",
    iconBg: "bg-blue-100",
  },
  {
    id: "trending",
    label: "Tendances",
    sublabel: "Du moment",
    icon: TrendingUp,
    href: "/tendances",
    color: "bg-green-500",
    iconBg: "bg-green-100",
  },
];

const QuickActions = () => {
  return (
    <section className="py-3">
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                to={action.href}
                className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl px-4 py-3 min-w-[160px] shrink-0 hover:shadow-md hover:border-primary/30 transition-all duration-200 group animate-fade-in"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
              >
                <div className={`${action.iconBg} p-2.5 rounded-xl group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-5 w-5 ${action.color.replace("bg-", "text-")}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground leading-tight">{action.label}</span>
                  <span className="text-xs text-muted-foreground">{action.sublabel}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};

export default QuickActions;

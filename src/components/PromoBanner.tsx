import { Link } from "react-router-dom";
import { ArrowRight, Zap, TrendingUp } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const banners = [
  {
    id: "deals",
    title: "Ventes Flash",
    subtitle: "Jusqu'a -50% sur une selection",
    href: "/offres",
    bgGradient: "from-orange-500 to-red-500",
    icon: Zap,
  },
  {
    id: "trends",
    title: "Tendances du moment",
    subtitle: "Decouvrez les dernieres nouveautes",
    href: "/tendances",
    bgGradient: "from-blue-500 to-purple-500",
    icon: TrendingUp,
  },
];

const PromoBanner = () => {
  return (
    <section className="py-3">
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2">
          {banners.map((banner, i) => {
            const Icon = banner.icon;
            return (
              <Link
                key={banner.id}
                to={banner.href}
                className="block shrink-0 w-[280px] sm:w-[320px] animate-fade-in group"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
              >
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${banner.bgGradient} p-5 text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                  <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-white/10" />
                  
                  <div className="relative flex items-center gap-3">
                    <div className="bg-white/20 rounded-xl p-2.5 backdrop-blur-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base">{banner.title}</h3>
                      <p className="text-xs text-white/80 mt-0.5">{banner.subtitle}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>
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

export default PromoBanner;

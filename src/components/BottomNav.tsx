import { Link, useLocation } from "react-router-dom";
import { Home, PlusCircle, Search, User, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/useTranslation";

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: "/", icon: Home, label: t("nav.home") },
    { path: "/decouvrir", icon: Compass, label: t("nav.discover") },
    { path: "/publier", icon: PlusCircle, label: t("nav.publish"), isMain: true },
    { path: "/search", icon: Search, label: t("nav.search") },
    { path: "/compte", icon: User, label: t("nav.account") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center -mt-6">
                <div className="bg-gradient-to-br from-chad-yellow to-secondary rounded-2xl p-3 shadow-lg shadow-secondary/30 active:scale-95 transition-transform">
                  <PlusCircle className="h-7 w-7 text-secondary-foreground" />
                </div>
                <span className="text-[10px] mt-1 font-bold text-secondary">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1 rounded-lg transition-colors relative",
                isActive && "bg-accent"
              )}>
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

import { Link, useLocation } from "react-router-dom";
import { Home, PlusCircle, MessageCircle, User, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/useTranslation";

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: "/", icon: Home, label: t("nav.home"), ariaLabel: "Accueil" },
    { path: "/messages", icon: MessageCircle, label: t("nav.messages") || "Messages", ariaLabel: "Messages" },
    { path: "/publier", icon: PlusCircle, label: t("nav.publish"), isMain: true, ariaLabel: "Publier" },
    { path: "/mes-annonces", icon: List, label: "Annonces", ariaLabel: "Mes annonces" },
    { path: "/compte", icon: User, label: t("nav.account"), ariaLabel: "Compte" },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50 safe-area-bottom"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className="flex flex-col items-center -mt-5"
                aria-label={item.ariaLabel}
              >
                <div className="w-14 h-14 rounded-full bg-[hsl(var(--chad-yellow))] flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                  <PlusCircle className="h-7 w-7 text-foreground" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

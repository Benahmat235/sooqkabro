import { Link, useLocation } from "react-router-dom";
import { Home, PlusCircle, MessageCircle, User, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/useTranslation";

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: "/", icon: Home, label: t("nav.home"), ariaLabel: "Aller a la page d'accueil" },
    { path: "/decouvrir", icon: Compass, label: t("nav.discover"), ariaLabel: "Decouvrir les annonces" },
    { path: "/publier", icon: PlusCircle, label: t("nav.publish"), isMain: true, ariaLabel: "Publier une annonce" },
    { path: "/messages", icon: MessageCircle, label: t("nav.messages") || "Messages", ariaLabel: "Voir mes messages" },
    { path: "/compte", icon: User, label: t("nav.account"), ariaLabel: "Mon compte" },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t safe-area-bottom"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="flex items-center justify-around h-18 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className="flex flex-col items-center -mt-6 focus-ring rounded-2xl"
                aria-label={item.ariaLabel}
              >
                <div className="bg-gradient-to-br from-[hsl(var(--chad-yellow))] to-secondary rounded-2xl p-3.5 shadow-lg shadow-secondary/30 active:scale-95 transition-transform">
                  <PlusCircle className="h-7 w-7 text-secondary-foreground" />
                </div>
                <span className="text-xs mt-1.5 font-bold text-secondary">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative min-w-[60px] focus-ring",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors relative",
                isActive && "bg-accent"
              )}>
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn("text-xs", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
              
              {/* Active indicator bar */}
              {isActive && (
                <span className="nav-indicator" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

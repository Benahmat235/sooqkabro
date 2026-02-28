import { Link, useLocation } from "react-router-dom";
import { Home, PlusCircle, Search, User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Accueil" },
  { path: "/search", icon: Search, label: "Recherche" },
  { path: "/publier", icon: PlusCircle, label: "Publier", isMain: true },
  { path: "/favoris", icon: Heart, label: "Favoris" },
  { path: "/compte", icon: User, label: "Compte" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center -mt-5">
                <div className="bg-secondary rounded-full p-3 shadow-lg">
                  <PlusCircle className="h-7 w-7 text-secondary-foreground" />
                </div>
                <span className="text-[10px] mt-1 font-semibold text-secondary">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

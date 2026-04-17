import { Link, useLocation } from "react-router-dom";
import { Home, PlusCircle, MessageCircle, User, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 safe-area-bottom"
      role="navigation"
      aria-label="Navigation principale"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
        {navItems.map((item, index) => {
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
                <motion.div 
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(var(--chad-yellow))] to-amber-400 flex items-center justify-center shadow-xl relative"
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {/* Pulsing ring effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[hsl(var(--chad-yellow))]"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.3, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                  <PlusCircle className="h-7 w-7 text-foreground relative z-10" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[56px]"
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div
                className={cn(
                  "flex flex-col items-center gap-0.5",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  animate={isActive ? { y: [-2, 0], scale: [0.95, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                </motion.div>
                <motion.span 
                  className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {item.label}
                </motion.span>
              </motion.div>

              {/* Active indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-primary"
                    layoutId="activeIndicator"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;

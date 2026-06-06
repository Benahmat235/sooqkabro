import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/i18n/useTranslation";

interface HelloHeaderProps {
  onBellClick?: () => void;
}

const getGreeting = (locale: string) => {
  const h = new Date().getHours();
  if (locale === "ar") return h < 12 ? "صباح الخير" : h < 18 ? "مساء الخير" : "مساء الخير";
  if (locale === "en") return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
};

const HelloHeader = ({ onBellClick }: HelloHeaderProps) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { locale } = useTranslation();

  const fullName =
    (user?.user_metadata as any)?.full_name ||
    (user?.user_metadata as any)?.name ||
    user?.email?.split("@")[0] ||
    "";
  const firstName = fullName.split(" ")[0] || "";
  const initials = firstName.slice(0, 2).toUpperCase() || "SK";
  const avatarUrl = (user?.user_metadata as any)?.avatar_url;

  const subtitle =
    locale === "ar"
      ? "ماذا تبحث اليوم؟"
      : locale === "en"
      ? "What are you looking for today?"
      : "Que cherchez-vous aujourd'hui ?";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-center justify-between px-1 pt-3 pb-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Link to="/compte" aria-label="Mon compte">
          <Avatar className="h-11 w-11 ring-2 ring-primary/20">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={firstName} />}
            <AvatarFallback className="bg-primary/10 text-primary font-extrabold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground leading-tight">
            {getGreeting(locale)}
          </p>
          <h1 className="text-lg font-extrabold text-foreground leading-tight truncate">
            {firstName ? `${firstName} 👋` : subtitle}
          </h1>
        </div>
      </div>

      <button
        onClick={onBellClick}
        className="relative h-11 w-11 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px] text-foreground" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1 right-1 min-w-[16px] h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-1"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
};

export default HelloHeader;

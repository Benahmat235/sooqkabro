import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  MessageSquare,
  Tag,
  Heart,
  Star,
  UserPlus,
  Info,
  Check,
  CheckCheck,
  Trash2,
  X,
} from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const notificationIcons: Record<Notification["type"], React.ElementType> = {
  message: MessageSquare,
  offer: Tag,
  favorite: Heart,
  review: Star,
  follow: UserPlus,
  system: Info,
};

const notificationColors: Record<Notification["type"], string> = {
  message: "bg-blue-100 text-blue-600",
  offer: "bg-green-100 text-green-600",
  favorite: "bg-pink-100 text-pink-600",
  review: "bg-yellow-100 text-yellow-600",
  follow: "bg-purple-100 text-purple-600",
  system: "bg-gray-100 text-gray-600",
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const getNotificationLink = (notification: Notification): string | null => {
    switch (notification.type) {
      case "message":
        return "/messages";
      case "offer":
      case "favorite":
        return notification.data?.listingId
          ? `/annonce/${notification.data.listingId}`
          : null;
      case "follow":
        return notification.data?.userId
          ? `/vendeur/${notification.data.userId}`
          : "/compte";
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-background shadow-xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                filter === "unread"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              Non lues ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tout marquer lu
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-semibold">
                {filter === "unread"
                  ? "Aucune notification non lue"
                  : "Aucune notification"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Vous recevrez des notifications pour les messages, offres et mises a jour
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                const colorClass = notificationColors[notification.type];
                const link = getNotificationLink(notification);

                const content = (
                  <div
                    className={cn(
                      "flex gap-3 p-4 transition-colors",
                      !notification.read && "bg-primary/5",
                      link && "hover:bg-muted cursor-pointer"
                    )}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        colorClass
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm font-semibold text-foreground",
                            !notification.read && "font-bold"
                          )}
                        >
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(notification.createdAt, {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.body}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                          >
                            <Check className="h-3 w-3" />
                            Marquer lu
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-xs text-muted-foreground flex items-center gap-1 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </div>
                );

                return link ? (
                  <Link key={notification.id} to={link} onClick={onClose}>
                    {content}
                  </Link>
                ) : (
                  <div key={notification.id}>{content}</div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="w-full text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Effacer toutes les notifications
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationCenter;

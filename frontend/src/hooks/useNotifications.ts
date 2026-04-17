import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export interface Notification {
  id: string;
  type: "message" | "offer" | "favorite" | "review" | "system" | "follow";
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  data?: {
    listingId?: string;
    conversationId?: string;
    sellerId?: string;
    userId?: string;
  };
}

const STORAGE_KEY = "sooqkabro_notifications";

// Generate mock notifications for demo
const generateMockNotifications = (userId: string): Notification[] => {
  const now = Date.now();
  return [
    {
      id: "1",
      type: "message",
      title: "Nouveau message",
      body: "Ahmed vous a envoye un message concernant votre annonce",
      read: false,
      createdAt: new Date(now - 5 * 60 * 1000),
      data: { conversationId: "conv1" },
    },
    {
      id: "2",
      type: "offer",
      title: "Nouvelle offre",
      body: "Vous avez recu une offre de 150,000 FCFA pour iPhone 13",
      read: false,
      createdAt: new Date(now - 30 * 60 * 1000),
      data: { listingId: "listing1" },
    },
    {
      id: "3",
      type: "favorite",
      title: "Annonce sauvegardee",
      body: "5 personnes ont ajoute votre annonce en favoris",
      read: true,
      createdAt: new Date(now - 2 * 60 * 60 * 1000),
    },
    {
      id: "4",
      type: "review",
      title: "Nouvel avis",
      body: "Un acheteur vous a laisse un avis 5 etoiles",
      read: true,
      createdAt: new Date(now - 24 * 60 * 60 * 1000),
    },
    {
      id: "5",
      type: "follow",
      title: "Nouvel abonne",
      body: "Fatima suit maintenant votre boutique",
      read: true,
      createdAt: new Date(now - 48 * 60 * 60 * 1000),
    },
    {
      id: "6",
      type: "system",
      title: "Bienvenue sur SooqKabro",
      body: "Votre compte a ete cree avec succes. Commencez a publier vos annonces!",
      read: true,
      createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
    },
  ];
};

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notifications from localStorage
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(
          parsed.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          }))
        );
      } catch {
        // Generate mock notifications for demo
        const mocks = generateMockNotifications(user.id);
        setNotifications(mocks);
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(mocks));
      }
    } else {
      // Generate mock notifications for demo
      const mocks = generateMockNotifications(user.id);
      setNotifications(mocks);
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(mocks));
    }
    setLoading(false);
  }, [user]);

  // Save to localStorage when notifications change
  useEffect(() => {
    if (user && notifications.length > 0) {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    if (user) {
      localStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
    }
  }, [user]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
  };
}

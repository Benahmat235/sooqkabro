import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

interface FollowerData {
  followerCount: number;
  isFollowing: boolean;
}

export const useSellerFollowers = (sellerId?: string) => {
  const [data, setData] = useState<FollowerData>({ followerCount: 0, isFollowing: false });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load followers from localStorage
  useEffect(() => {
    if (!sellerId) return;

    const storageKey = `followers_${sellerId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(prev => ({ ...prev, followerCount: parsed.count || 0 }));
      } catch {}
    }

    // Check if current user is following
    if (user?.id) {
      const followingKey = `following_${user.id}_${sellerId}`;
      const isFollowing = localStorage.getItem(followingKey) === "true";
      setData(prev => ({ ...prev, isFollowing }));
    }
  }, [sellerId, user?.id]);

  const toggleFollow = useCallback(async () => {
    if (!sellerId || !user?.id) return;

    setLoading(true);
    try {
      const storageKey = `followers_${sellerId}`;
      const followingKey = `following_${user.id}_${sellerId}`;
      
      const isCurrentlyFollowing = localStorage.getItem(followingKey) === "true";
      
      if (isCurrentlyFollowing) {
        // Unfollow
        localStorage.removeItem(followingKey);
        const stored = localStorage.getItem(storageKey);
        const parsed = stored ? JSON.parse(stored) : { count: 0 };
        parsed.count = Math.max(0, (parsed.count || 1) - 1);
        localStorage.setItem(storageKey, JSON.stringify(parsed));
        
        setData(prev => ({
          ...prev,
          isFollowing: false,
          followerCount: Math.max(0, prev.followerCount - 1)
        }));
      } else {
        // Follow
        localStorage.setItem(followingKey, "true");
        const stored = localStorage.getItem(storageKey);
        const parsed = stored ? JSON.parse(stored) : { count: 0 };
        parsed.count = (parsed.count || 0) + 1;
        localStorage.setItem(storageKey, JSON.stringify(parsed));
        
        setData(prev => ({
          ...prev,
          isFollowing: true,
          followerCount: prev.followerCount + 1
        }));
      }
    } finally {
      setLoading(false);
    }
  }, [sellerId, user?.id]);

  return { data, loading, toggleFollow };
};

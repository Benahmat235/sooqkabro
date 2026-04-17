import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FollowerData {
  followerCount: number;
  isFollowing: boolean;
}

export const useSellerFollowers = (sellerId?: string) => {
  const [data, setData] = useState<FollowerData>({ followerCount: 0, isFollowing: false });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!sellerId) return;

    const fetchFollowers = async () => {
      // Get count
      const { count } = await supabase
        .from("seller_followers")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", sellerId);

      let isFollowing = false;
      if (user?.id) {
        const { data: follow } = await supabase
          .from("seller_followers")
          .select("id")
          .eq("seller_id", sellerId)
          .eq("follower_id", user.id)
          .maybeSingle();
        isFollowing = !!follow;
      }

      setData({ followerCount: count || 0, isFollowing });
    };

    fetchFollowers();
  }, [sellerId, user?.id]);

  const toggleFollow = useCallback(async () => {
    if (!sellerId || !user?.id) return;

    setLoading(true);
    try {
      if (data.isFollowing) {
        await supabase
          .from("seller_followers")
          .delete()
          .eq("seller_id", sellerId)
          .eq("follower_id", user.id);

        setData(prev => ({
          isFollowing: false,
          followerCount: Math.max(0, prev.followerCount - 1),
        }));
      } else {
        await supabase
          .from("seller_followers")
          .insert({ seller_id: sellerId, follower_id: user.id });

        setData(prev => ({
          isFollowing: true,
          followerCount: prev.followerCount + 1,
        }));
      }
    } finally {
      setLoading(false);
    }
  }, [sellerId, user?.id, data.isFollowing]);

  return { data, loading, toggleFollow };
};

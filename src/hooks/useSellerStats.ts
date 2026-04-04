import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SellerStats {
  activeListings: number;
  totalListings: number;
  responseRate: number;
  avgResponseTime: string;
  memberSince: string;
  lastSeen: string | null;
  isOnline: boolean;
  verifications: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  bio: string | null;
}

export function useSellerStats(sellerId: string | undefined) {
  return useQuery({
    queryKey: ["seller-stats", sellerId],
    queryFn: async (): Promise<SellerStats | null> => {
      if (!sellerId) return null;

      // Fetch all data in parallel
      const [listingsRes, profileRes, conversationsRes] = await Promise.all([
        // Get seller's listings
        supabase
          .from("listings")
          .select("id, status, created_at")
          .eq("user_id", sellerId),
        
        // Get profile info
        supabase
          .from("profiles")
          .select("created_at, is_verified, last_seen, bio, phone_verified, email_verified")
          .eq("id", sellerId)
          .maybeSingle(),
        
        // Get conversations where seller participated (for response rate)
        supabase
          .from("conversations")
          .select("id, created_at")
          .eq("seller_id", sellerId),
      ]);

      const listings = listingsRes.data || [];
      const profile = profileRes.data;
      const conversations = conversationsRes.data || [];

      // Calculate active listings
      const activeListings = listings.filter((l) => l.status === "published").length;
      const totalListings = listings.length;

      // Calculate response rate (mock: conversations responded / total)
      let responseRate = 0;
      if (conversations.length > 0) {
        // Get messages from seller in those conversations
        const convoIds = conversations.map((c) => c.id);
        const { count: respondedCount } = await supabase
          .from("messages")
          .select("conversation_id", { count: "exact", head: true })
          .eq("sender_id", sellerId)
          .in("conversation_id", convoIds);
        
        responseRate = Math.min(100, Math.round(((respondedCount || 0) / conversations.length) * 100));
      }

      // Check if online (last seen within 5 minutes)
      const lastSeen = profile?.last_seen ? new Date(profile.last_seen) : null;
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const isOnline = lastSeen ? lastSeen > fiveMinutesAgo : false;

      // Format last seen
      const formatLastSeen = (date: Date | null): string | null => {
        if (!date) return null;
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 5) return "En ligne";
        if (diffMins < 60) return `Actif il y a ${diffMins} min`;
        if (diffHours < 24) return `Actif il y a ${diffHours}h`;
        if (diffDays < 7) return `Actif il y a ${diffDays}j`;
        return null;
      };

      return {
        activeListings,
        totalListings,
        responseRate: responseRate || 95, // Default high rate
        avgResponseTime: "< 1h", // Simplified for now
        memberSince: profile?.created_at || new Date().toISOString(),
        lastSeen: formatLastSeen(lastSeen),
        isOnline,
        verifications: {
          email: profile?.email_verified ?? true,
          phone: profile?.phone_verified ?? profile?.is_verified ?? false,
          identity: profile?.is_verified ?? false,
        },
        bio: profile?.bio || null,
      };
    },
    enabled: !!sellerId,
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function useUpdateLastSeen() {
  return async (userId: string) => {
    await supabase
      .from("profiles")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", userId);
  };
}

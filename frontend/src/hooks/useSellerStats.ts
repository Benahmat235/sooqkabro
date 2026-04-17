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

      const [listingsRes, profileRes, conversationsRes] = await Promise.all([
        supabase
          .from("listings")
          .select("id, status, created_at")
          .eq("user_id", sellerId),
        supabase
          .from("profiles")
          .select("created_at, is_verified, last_seen, bio")
          .eq("id", sellerId)
          .maybeSingle(),
        supabase
          .from("conversations")
          .select("id, created_at")
          .eq("seller_id", sellerId),
      ]);

      const listings = listingsRes.data || [];
      const profile = profileRes.data as any;
      const conversations = conversationsRes.data || [];

      const activeListings = listings.filter((l) => l.status === "published").length;
      const totalListings = listings.length;

      // Calculate real response rate & avg response time
      let responseRate = 0;
      let avgResponseTime = "—";

      if (conversations.length > 0) {
        const convoIds = conversations.map((c) => c.id);
        
        // Get all messages for these conversations
        const { data: allMessages } = await supabase
          .from("messages")
          .select("conversation_id, sender_id, created_at")
          .in("conversation_id", convoIds)
          .order("created_at", { ascending: true });

        if (allMessages && allMessages.length > 0) {
          let respondedConvos = 0;
          const responseTimes: number[] = [];

          // Group by conversation
          const byConvo = new Map<string, typeof allMessages>();
          allMessages.forEach((m) => {
            const arr = byConvo.get(m.conversation_id) || [];
            arr.push(m);
            byConvo.set(m.conversation_id, arr);
          });

          byConvo.forEach((msgs) => {
            // Find first buyer message then first seller response
            const firstBuyer = msgs.find((m) => m.sender_id !== sellerId);
            if (!firstBuyer) return;
            
            const sellerResponse = msgs.find(
              (m) => m.sender_id === sellerId && new Date(m.created_at) > new Date(firstBuyer.created_at)
            );
            
            if (sellerResponse) {
              respondedConvos++;
              const diffMs = new Date(sellerResponse.created_at).getTime() - new Date(firstBuyer.created_at).getTime();
              responseTimes.push(diffMs);
            }
          });

          responseRate = conversations.length > 0
            ? Math.round((respondedConvos / conversations.length) * 100)
            : 0;

          if (responseTimes.length > 0) {
            const avgMs = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            const avgMins = Math.floor(avgMs / 60000);
            if (avgMins < 30) avgResponseTime = "< 30min";
            else if (avgMins < 60) avgResponseTime = "< 1h";
            else if (avgMins < 120) avgResponseTime = "~ 1h";
            else if (avgMins < 360) avgResponseTime = `~ ${Math.round(avgMins / 60)}h`;
            else if (avgMins < 1440) avgResponseTime = `~ ${Math.round(avgMins / 60)}h`;
            else avgResponseTime = `~ ${Math.round(avgMins / 1440)}j`;
          }
        }
      }

      // Real online status from last_seen
      const lastSeenDate = profile?.last_seen ? new Date(profile.last_seen) : null;
      const isOnline = lastSeenDate
        ? (Date.now() - lastSeenDate.getTime()) < 5 * 60 * 1000
        : false;

      const formatLastSeen = (date: Date | null): string | null => {
        if (!date) return null;
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 5) return "En ligne";
        if (diffMins < 60) return `Actif il y a ${diffMins} min`;
        if (diffHours < 24) return `Actif il y a ${diffHours}h`;
        if (diffDays < 7) return `Actif il y a ${diffDays}j`;
        return null;
      };

      return {
        activeListings,
        totalListings,
        responseRate,
        avgResponseTime,
        memberSince: profile?.created_at || new Date().toISOString(),
        lastSeen: formatLastSeen(lastSeenDate),
        isOnline,
        verifications: {
          email: true,
          phone: profile?.is_verified ?? false,
          identity: profile?.is_verified ?? false,
        },
        bio: profile?.bio || null,
      };
    },
    enabled: !!sellerId,
    staleTime: 30000,
  });
}

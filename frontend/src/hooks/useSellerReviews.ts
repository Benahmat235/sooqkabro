import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SellerReview {
  id: string;
  seller_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
}

export function useSellerReviews(sellerId: string | undefined) {
  return useQuery({
    queryKey: ["seller-reviews", sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      const { data, error } = await supabase
        .from("seller_reviews")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Extract unique reviewer IDs
      const reviewerIds = [...new Set(data.map((r) => r.reviewer_id))];

      // Fetch all profiles in one go
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", reviewerIds);

      if (profilesError) throw profilesError;

      // Create a map for fast lookup
      const profileMap = new Map(
        (profiles || []).map((p) => [p.id, p])
      );

      // Enrich with reviewer names
      const enriched = data.map((r) => {
        const profile = profileMap.get(r.reviewer_id);
        return {
          ...r,
          reviewer_name: profile?.display_name || "Utilisateur",
          reviewer_avatar: profile?.avatar_url,
        };
      });

      return enriched as SellerReview[];
    },
    enabled: !!sellerId,
  });
}

export function useSellerRating(sellerId: string | undefined) {
  const { data: reviews = [] } = useSellerReviews(sellerId);
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return { avg: Math.round(avg * 10) / 10, count: reviews.length };
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sellerId, reviewerId, rating, comment }: {
      sellerId: string;
      reviewerId: string;
      rating: number;
      comment: string;
    }) => {
      const { error } = await supabase.from("seller_reviews").upsert(
        { seller_id: sellerId, reviewer_id: reviewerId, rating, comment: comment || null },
        { onConflict: "seller_id,reviewer_id" }
      );
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["seller-reviews", vars.sellerId] });
    },
  });
}

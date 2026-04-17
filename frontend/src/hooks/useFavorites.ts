import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useFavorites() {
  const { user } = useAuth();

  const { data: favoriteIds = [], ...rest } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", user.id);
      return (data || []).map((f: any) => f.listing_id as string);
    },
    enabled: !!user,
  });

  return { favoriteIds, ...rest };
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, isFav }: { listingId: string; isFav: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (isFav) {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

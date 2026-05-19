import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const favoritesQueryKey = ["favorites", user?.id];

  return useMutation({
    mutationFn: async ({ listingId, isFav }: { listingId: string; isFav: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (isFav) {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });
      }
    },
    onMutate: async ({ listingId, isFav }) => {
      await queryClient.cancelQueries({ queryKey: favoritesQueryKey });
      const previousFavorites = queryClient.getQueryData<string[]>(favoritesQueryKey);
      queryClient.setQueryData<string[]>(favoritesQueryKey, (old) => {
        if (!old) return isFav ? [] : [listingId];
        return isFav 
          ? old.filter((id) => id !== listingId) 
          : [...old, listingId];
      });
      return { previousFavorites };
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.isFav ? "Retiré des favoris" : "Ajouté aux favoris !",
        description: variables.isFav ? "L'annonce n'est plus dans vos favoris." : "Nous avons enregistré cette annonce pour vous.",
        variant: variables.isFav ? "info" : "success",
      });
    },
    onError: (err, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(favoritesQueryKey, context.previousFavorites);
      }
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour des favoris.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
    },
  });
}

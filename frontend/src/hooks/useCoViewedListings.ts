import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CoViewedListing {
  id: string;
  title: string;
  price: number;
  city_id: string;
  category_id: string;
  subcategory_id: string;
  created_at: string;
  badge: string | null;
  status: string;
  images: string[];
  co_view_count: number;
}

export function useCoViewedListings(listingId: string | undefined, limit = 6) {
  return useQuery({
    queryKey: ["co-viewed", listingId, limit],
    enabled: !!listingId,
    staleTime: 1000 * 60 * 10,
    queryFn: async (): Promise<CoViewedListing[]> => {
      const { data, error } = await supabase.functions.invoke("getCoViewedListings", {
        body: { listing_id: listingId, limit },
      });
      if (error) throw error;
      return (data?.listings ?? []) as CoViewedListing[];
    },
  });
}

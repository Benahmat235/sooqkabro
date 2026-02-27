import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ListingWithImages {
  id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  subcategory_id: string;
  city_id: string;
  quartier: string | null;
  phone: string;
  status: string;
  created_at: string;
  user_id: string;
  images: string[];
}

async function fetchListings(cityId?: string): Promise<ListingWithImages[]> {
  let query = supabase
    .from("listings")
    .select("*, listing_images(image_url, position)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (cityId && cityId !== "all") {
    query = query.eq("city_id", cityId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((l: any) => ({
    ...l,
    images: (l.listing_images || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((img: any) => img.image_url),
  }));
}

export function useListings(cityId?: string) {
  return useQuery({
    queryKey: ["listings", cityId || "all"],
    queryFn: () => fetchListings(cityId),
  });
}

export function useSearchListings(query: string, cityId?: string) {
  return useQuery({
    queryKey: ["listings-search", query, cityId || "all"],
    queryFn: async () => {
      const listings = await fetchListings(cityId);
      if (!query) return listings;
      const q = query.toLowerCase();
      return listings.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    },
    enabled: true,
  });
}

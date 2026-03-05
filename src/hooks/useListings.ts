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
  badge?: string | null;
  view_count?: number;
  is_verified?: boolean;
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

  const listings = (data || []).map((l: any) => ({
    ...l,
    images: (l.listing_images || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((img: any) => img.image_url),
  }));

  // Fetch view counts and verified status in batch
  if (listings.length > 0) {
    const ids = listings.map((l: any) => l.id);
    const userIds = [...new Set(listings.map((l: any) => l.user_id))];

    // View counts
    const viewPromises = ids.map((id: string) =>
      supabase.from("listing_views").select("id", { count: "exact", head: true }).eq("listing_id", id)
    );
    const viewResults = await Promise.all(viewPromises);

    // Verified status
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, is_verified")
      .in("id", userIds);

    const verifiedMap = new Map((profiles || []).map((p: any) => [p.id, p.is_verified]));

    return listings.map((l: any, i: number) => ({
      ...l,
      view_count: viewResults[i]?.count || 0,
      is_verified: verifiedMap.get(l.user_id) || false,
    }));
  }

  return listings;
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

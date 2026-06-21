import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ListingWithImages {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number | null;
  attributes?: {
    listingType?: string;
    priceType?: "fixed" | "negotiable" | "free";
    categoryDetails?: Record<string, string | string[]>;
  } | null;
  category_id: string;
  subcategory_id: string;
  city_id: string;
  quartier: string | null;
  status: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  images: string[];
  badge?: string | null;
  view_count?: number;
  is_verified?: boolean;
}

async function fetchListings(cityId?: string, limit = 50): Promise<ListingWithImages[]> {
  let query = supabase
    .from("listings")
    .select("id, user_id, title, description, price, original_price, attributes, category_id, subcategory_id, city_id, quartier, status, created_at, updated_at, badge, listing_images(image_url, position)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(0, limit - 1);

  if (cityId && cityId !== "all") {
    query = query.eq("city_id", cityId);
  }

  const { data, error } = await query;
  if (error) throw error;

  type RawListing = Omit<ListingWithImages, "images" | "view_count" | "is_verified"> & {
    listing_images?: { image_url: string; position: number }[];
  };
  const listings = ((data || []) as RawListing[]).map((l) => ({
    ...l,
    images: (l.listing_images || [])
      .sort((a, b) => a.position - b.position)
      .map((img) => img.image_url),
  }));

  if (listings.length > 0) {
    const ids = listings.map((l) => l.id);
    const userIds = [...new Set(listings.map((l) => l.user_id))];

    // Batch view counts — single query, count client-side
    const { data: viewRows } = await supabase
      .from("listing_views")
      .select("listing_id")
      .in("listing_id", ids);

    const viewCounts = new Map<string, number>();
    ((viewRows || []) as { listing_id: string }[]).forEach((r) => {
      viewCounts.set(r.listing_id, (viewCounts.get(r.listing_id) || 0) + 1);
    });

    // Verified status
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, is_verified")
      .in("id", userIds);

    const verifiedMap = new Map(
      ((profiles || []) as { id: string; is_verified: boolean | null }[]).map((p) => [p.id, p.is_verified])
    );

    return listings.map((l) => ({
      ...l,
      view_count: viewCounts.get(l.id) || 0,
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
      const listings = await fetchListings(cityId, 200);
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

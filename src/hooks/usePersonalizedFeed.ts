import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ListingWithImages } from "./useListings";

interface ScoredListing extends ListingWithImages {
  _score: number;
}

async function fetchPersonalizedFeed(cityId?: string): Promise<ScoredListing[]> {
  const { data: { session } } = await supabase.auth.getSession();

  const params: Record<string, string> = { limit: "50" };
  if (cityId && cityId !== "all") params.city_id = cityId;

  const queryString = new URLSearchParams(params).toString();
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/getPersonalizedFeed?${queryString}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch personalized feed");
  return res.json();
}

export function usePersonalizedFeed(cityId?: string) {
  return useQuery({
    queryKey: ["personalized-feed", cityId || "all"],
    queryFn: () => fetchPersonalizedFeed(cityId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

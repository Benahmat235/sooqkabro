import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PriceStats } from "@/lib/pricing";

async function fetchPriceStats(categoryId: string, subcategoryId?: string): Promise<PriceStats | null> {
  const params = new URLSearchParams({ category_id: categoryId });
  if (subcategoryId) params.set("subcategory_id", subcategoryId);

  const { data, error } = await supabase.functions.invoke(`getPriceStats?${params.toString()}`, {
    method: "GET",
  });
  if (error) {
    console.warn("getPriceStats error", error);
    return null;
  }
  if (!data || data.error) return null;
  return data as PriceStats;
}

export function usePriceStats(categoryId?: string | null, subcategoryId?: string | null) {
  return useQuery({
    queryKey: ["price-stats", categoryId, subcategoryId],
    queryFn: () => fetchPriceStats(categoryId!, subcategoryId || undefined),
    enabled: !!categoryId,
    staleTime: 60 * 60 * 1000, // 1h
    gcTime: 60 * 60 * 1000,
  });
}

/**
 * Batch hook : fetch stats for multiple (category, subcategory) pairs
 * and return a Map keyed by `${category}::${subcategory||''}`.
 */
export function usePriceStatsBatch(pairs: Array<{ category_id: string; subcategory_id?: string | null }>) {
  const uniqueKeys = Array.from(
    new Set(pairs.map((p) => `${p.category_id}::${p.subcategory_id ?? ""}`))
  );

  return useQuery({
    queryKey: ["price-stats-batch", uniqueKeys.sort().join("|")],
    enabled: uniqueKeys.length > 0,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    queryFn: async () => {
      const map = new Map<string, PriceStats>();
      await Promise.all(
        uniqueKeys.map(async (key) => {
          const [cat, sub] = key.split("::");
          const stats = await fetchPriceStats(cat, sub || undefined);
          if (stats) map.set(key, stats);
        })
      );
      return map;
    },
  });
}

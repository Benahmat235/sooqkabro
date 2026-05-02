import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Stats {
  count: number;
  min: number;
  max: number;
  p25: number;
  median: number;
  p75: number;
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

// In-memory cache: key -> { stats, expiresAt }
const cache = new Map<string, { stats: Stats; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let categoryId = url.searchParams.get("category_id");
    let subcategoryId = url.searchParams.get("subcategory_id");

    if (!categoryId && (req.method === "POST")) {
      try {
        const body = await req.json();
        categoryId = body.category_id ?? null;
        subcategoryId = body.subcategory_id ?? null;
      } catch (_) {}
    }

    if (!categoryId || typeof categoryId !== "string" || categoryId.length > 64) {
      return new Response(JSON.stringify({ error: "category_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (subcategoryId && (typeof subcategoryId !== "string" || subcategoryId.length > 64)) {
      return new Response(JSON.stringify({ error: "invalid subcategory_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cacheKey = `${categoryId}::${subcategoryId ?? ""}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return new Response(JSON.stringify({ ...cached.stats, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let query = supabase
      .from("listings")
      .select("price")
      .eq("status", "published")
      .eq("category_id", categoryId)
      .gt("price", 0)
      .limit(2000);

    if (subcategoryId) query = query.eq("subcategory_id", subcategoryId);

    const { data, error } = await query;
    if (error) throw error;

    const prices = (data ?? [])
      .map((r: any) => Number(r.price))
      .filter((n) => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b);

    const stats: Stats = {
      count: prices.length,
      min: prices[0] ?? 0,
      max: prices[prices.length - 1] ?? 0,
      p25: Math.round(quantile(prices, 0.25)),
      median: Math.round(quantile(prices, 0.5)),
      p75: Math.round(quantile(prices, 0.75)),
    };

    cache.set(cacheKey, { stats, expiresAt: Date.now() + CACHE_TTL_MS });

    return new Response(JSON.stringify({ ...stats, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("getPriceStats error", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

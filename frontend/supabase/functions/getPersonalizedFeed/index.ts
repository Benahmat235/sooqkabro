import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Quality scoring (mirrors src/lib/quality.ts) ──
function computeQuality(l: any, sellerVerified: boolean, avgRating: number, reviewCount: number): number {
  let score = 0;
  // Photos (0-25)
  const photos = Math.min(l.images?.length ?? 0, 5);
  score += (photos / 5) * 25;
  // Title (0-10)
  const titleLen = (l.title || "").trim().length;
  if (titleLen >= 10 && titleLen <= 80) score += 10;
  else if (titleLen >= 5) score += 6;
  else if (titleLen > 0) score += 3;
  // Description (0-25)
  const descLen = (l.description || "").trim().length;
  if (descLen >= 150) score += 25;
  else if (descLen >= 80) score += 18;
  else if (descLen >= 40) score += 10;
  else if (descLen > 0) score += 4;
  // Price (0-10)
  if (l.price && l.price > 0) score += 10;
  // Quartier (0-5)
  if ((l.quartier || "").trim().length > 0) score += 5;
  // Phone (0-10)
  if (/^\+235\d{8}$/.test((l.phone || "").trim())) score += 10;
  // Verified (0-10)
  if (sellerVerified) score += 10;
  // Reputation (0-5)
  if (reviewCount >= 3) {
    if (avgRating >= 4.5) score += 5;
    else if (avgRating >= 4) score += 4;
    else if (avgRating >= 3) score += 2;
  }
  return Math.min(100, score) / 100; // normalised 0-1
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const cityId = url.searchParams.get("city_id") || null;
    const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 200);

    const authHeader = req.headers.get("authorization") ?? "";
    let userId: string | null = null;
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    let listingsQuery = supabase
      .from("listings")
      .select("*, listing_images(image_url, position)")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (cityId && cityId !== "all") {
      listingsQuery = listingsQuery.eq("city_id", cityId);
    }

    const { data: rawListings, error: listingsErr } = await listingsQuery;
    if (listingsErr) throw listingsErr;

    const listings = (rawListings || []).map((l: any) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      price: l.price,
      category_id: l.category_id,
      subcategory_id: l.subcategory_id,
      city_id: l.city_id,
      quartier: l.quartier,
      phone: l.phone,
      status: l.status,
      user_id: l.user_id,
      created_at: l.created_at,
      images: (l.listing_images || [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((img: any) => img.image_url),
    }));

    if (listings.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const listingIds = listings.map((l: any) => l.id);
    const sellerIds = [...new Set(listings.map((l: any) => l.user_id))];

    // ── Parallel fetches ──
    const [viewsRes, profilesRes, reviewsRes] = await Promise.all([
      supabase.from("listing_views").select("listing_id").in("listing_id", listingIds),
      supabase.from("profiles").select("id, is_verified").in("id", sellerIds),
      supabase.from("seller_reviews").select("seller_id, rating").in("seller_id", sellerIds),
    ]);

    const viewCounts: Record<string, number> = {};
    (viewsRes.data || []).forEach((v: any) => {
      viewCounts[v.listing_id] = (viewCounts[v.listing_id] || 0) + 1;
    });

    const verifiedMap: Record<string, boolean> = {};
    (profilesRes.data || []).forEach((p: any) => {
      verifiedMap[p.id] = !!p.is_verified;
    });

    const ratingsMap: Record<string, { sum: number; count: number }> = {};
    (reviewsRes.data || []).forEach((r: any) => {
      const m = ratingsMap[r.seller_id] || { sum: 0, count: 0 };
      m.sum += r.rating;
      m.count += 1;
      ratingsMap[r.seller_id] = m;
    });

    // ── User-specific affinity ──
    const categoryAffinity: Record<string, number> = {};
    const viewedIds = new Set<string>();
    const favIds = new Set<string>();

    if (userId) {
      const [uViews, uFavs] = await Promise.all([
        supabase.from("listing_views").select("listing_id").eq("viewer_id", userId),
        supabase.from("favorites").select("listing_id").eq("user_id", userId),
      ]);
      (uViews.data || []).forEach((v: any) => viewedIds.add(v.listing_id));
      (uFavs.data || []).forEach((f: any) => favIds.add(f.listing_id));

      const interactedIds = new Set([...viewedIds, ...favIds]);
      listings.forEach((l: any) => {
        if (!interactedIds.has(l.id)) return;
        const weight = favIds.has(l.id) ? 3 : 1;
        categoryAffinity[l.category_id] = (categoryAffinity[l.category_id] || 0) + weight;
      });
    }

    const now = Date.now();
    const ONE_DAY_MS = 86_400_000;
    const maxViews = Math.max(1, ...Object.values(viewCounts));
    const maxAffinity = Math.max(1, ...Object.values(categoryAffinity), 0);

    const scored = listings.map((listing: any) => {
      const views = viewCounts[listing.id] || 0;
      const popularityScore = views / maxViews;

      const ageDays = (now - new Date(listing.created_at).getTime()) / ONE_DAY_MS;
      const recencyScore = Math.exp(-0.1 * ageDays);

      const affinityRaw = categoryAffinity[listing.category_id] || 0;
      const affinityScore = userId ? affinityRaw / maxAffinity : 0;

      const ratings = ratingsMap[listing.user_id];
      const avgRating = ratings ? ratings.sum / ratings.count : 0;
      const reviewCount = ratings ? ratings.count : 0;
      const qualityScore = computeQuality(listing, verifiedMap[listing.user_id] || false, avgRating, reviewCount);

      const seenPenalty = viewedIds.has(listing.id) ? 0.85 : 1;

      // New weighted combination: 25% pop / 25% recency / 30% affinity / 20% quality
      const score =
        (0.25 * popularityScore +
          0.25 * recencyScore +
          0.30 * affinityScore +
          0.20 * qualityScore) *
        seenPenalty;

      return {
        ...listing,
        _score: Math.round(score * 10000) / 10000,
        _quality: Math.round(qualityScore * 100),
      };
    });

    scored.sort((a: any, b: any) => b._score - a._score);
    const result = scored.slice(0, limit);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("getPersonalizedFeed error:", err);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

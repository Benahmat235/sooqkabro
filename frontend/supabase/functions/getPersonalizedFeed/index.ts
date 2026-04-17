import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ── Parse optional filters from query string ──
    const url = new URL(req.url);
    const cityId = url.searchParams.get("city_id") || null;
    const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 200);

    // ── Identify authenticated user (optional – anon gets popularity-only) ──
    const authHeader = req.headers.get("authorization") ?? "";
    let userId: string | null = null;
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    // ── 1. Fetch all published listings with images ──
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

    // ── 2. Fetch view counts per listing (popularity) ──
    const listingIds = listings.map((l: any) => l.id);
    const { data: viewRows } = await supabase
      .from("listing_views")
      .select("listing_id")
      .in("listing_id", listingIds);

    const viewCounts: Record<string, number> = {};
    (viewRows || []).forEach((v: any) => {
      viewCounts[v.listing_id] = (viewCounts[v.listing_id] || 0) + 1;
    });

    // ── 3. Fetch user interactions (views + favorites) for category affinity ──
    const categoryAffinity: Record<string, number> = {};
    const viewedIds = new Set<string>();
    const favIds = new Set<string>();

    if (userId) {
      // User's viewed listings
      const { data: userViews } = await supabase
        .from("listing_views")
        .select("listing_id")
        .eq("viewer_id", userId);

      (userViews || []).forEach((v: any) => viewedIds.add(v.listing_id));

      // User's favorites
      const { data: userFavs } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", userId);

      (userFavs || []).forEach((f: any) => favIds.add(f.listing_id));

      // Build category affinity from viewed + favorited listings
      const interactedIds = [...new Set([...viewedIds, ...favIds])];
      const interactedListings = listings.filter((l: any) =>
        interactedIds.includes(l.id)
      );
      interactedListings.forEach((l: any) => {
        // Favorites count double
        const weight = favIds.has(l.id) ? 3 : 1;
        categoryAffinity[l.category_id] =
          (categoryAffinity[l.category_id] || 0) + weight;
      });
    }

    // ── 4. Score each listing ──
    const now = Date.now();
    const ONE_DAY_MS = 86_400_000;
    const maxViews = Math.max(1, ...Object.values(viewCounts));

    // Normalize affinity
    const maxAffinity = Math.max(1, ...Object.values(categoryAffinity), 0);

    const scored = listings.map((listing: any) => {
      // Popularity score (0-1): normalised view count
      const views = viewCounts[listing.id] || 0;
      const popularityScore = views / maxViews;

      // Recency score (0-1): exponential decay, half-life = 7 days
      const ageMs = now - new Date(listing.created_at).getTime();
      const ageDays = ageMs / ONE_DAY_MS;
      const recencyScore = Math.exp(-0.1 * ageDays); // ~0.5 at 7 days

      // Category affinity score (0-1)
      const affinityRaw = categoryAffinity[listing.category_id] || 0;
      const affinityScore = userId ? affinityRaw / maxAffinity : 0;

      // Don't exclude own listings but penalise already-viewed ones slightly
      const seenPenalty = viewedIds.has(listing.id) ? 0.85 : 1;

      // Weighted combination
      const score =
        (0.3 * popularityScore +
          0.3 * recencyScore +
          0.4 * affinityScore) *
        seenPenalty;

      return { ...listing, _score: Math.round(score * 10000) / 10000 };
    });

    // ── 5. Sort by score descending ──
    scored.sort((a: any, b: any) => b._score - a._score);

    // Return limited results
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

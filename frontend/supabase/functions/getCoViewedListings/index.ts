import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Body {
  listing_id: string;
  limit?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { listing_id, limit = 6 } = (await req.json()) as Body;
    if (!listing_id || typeof listing_id !== "string") {
      return json({ error: "listing_id required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1) Find viewers of this listing (last 60 days, max 500)
    const since = new Date(Date.now() - 60 * 86400 * 1000).toISOString();
    const { data: viewerRows, error: vErr } = await supabase
      .from("listing_views")
      .select("viewer_id")
      .eq("listing_id", listing_id)
      .gt("created_at", since)
      .not("viewer_id", "is", null)
      .limit(500);
    if (vErr) throw vErr;

    const viewerIds = Array.from(
      new Set((viewerRows ?? []).map((r: any) => r.viewer_id).filter(Boolean)),
    );

    if (viewerIds.length === 0) {
      return json({ listings: [] });
    }

    // 2) Other listings these viewers looked at
    const { data: otherViews, error: oErr } = await supabase
      .from("listing_views")
      .select("listing_id")
      .in("viewer_id", viewerIds)
      .neq("listing_id", listing_id)
      .gt("created_at", since)
      .limit(2000);
    if (oErr) throw oErr;

    // 3) Count frequency
    const freq = new Map<string, number>();
    for (const r of otherViews ?? []) {
      const id = (r as any).listing_id;
      freq.set(id, (freq.get(id) ?? 0) + 1);
    }
    const topIds = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit * 3)
      .map(([id]) => id);

    if (topIds.length === 0) return json({ listings: [] });

    // 4) Fetch listing details (only published) + images
    const { data: listings, error: lErr } = await supabase
      .from("listings")
      .select("id, title, price, city_id, category_id, subcategory_id, created_at, badge, status")
      .in("id", topIds)
      .eq("status", "published");
    if (lErr) throw lErr;

    const validIds = (listings ?? []).map((l) => l.id);
    const { data: images } = await supabase
      .from("listing_images")
      .select("listing_id, image_url, position")
      .in("listing_id", validIds)
      .order("position", { ascending: true });

    const imgMap = new Map<string, string[]>();
    for (const img of images ?? []) {
      const arr = imgMap.get((img as any).listing_id) ?? [];
      arr.push((img as any).image_url);
      imgMap.set((img as any).listing_id, arr);
    }

    const enriched = (listings ?? [])
      .map((l) => ({
        ...l,
        images: imgMap.get(l.id) ?? [],
        co_view_count: freq.get(l.id) ?? 0,
      }))
      .sort((a, b) => b.co_view_count - a.co_view_count)
      .slice(0, limit);

    return json({ listings: enriched });
  } catch (e) {
    console.error("getCoViewedListings error:", e);
    return json({ error: "Internal server error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

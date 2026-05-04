import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  listing_id: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body?.listing_id || typeof body.listing_id !== "string") {
      return new Response(JSON.stringify({ error: "invalid_listing_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Load the listing (must belong to user, or skip ownership check — we only flag, not modify)
    const { data: listing, error: lErr } = await admin
      .from("listings")
      .select("id, user_id, phone, price, category_id, status")
      .eq("id", body.listing_id)
      .maybeSingle();

    if (lErr || !listing) {
      return new Response(JSON.stringify({ error: "listing_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const flags: { reason: string; details: any }[] = [];

    // Pattern 1: same phone used by >5 distinct active users
    const { data: phoneRows } = await admin
      .from("listings")
      .select("user_id")
      .eq("phone", listing.phone)
      .eq("status", "published");
    const distinctUsers = new Set((phoneRows || []).map((r: any) => r.user_id));
    if (distinctUsers.size > 5) {
      flags.push({
        reason: "shared_phone_multiple_users",
        details: { phone_distinct_users: distinctUsers.size },
      });
    }

    // Pattern 2: price abnormally low vs category median
    if (listing.price > 0) {
      const { data: prices } = await admin
        .from("listings")
        .select("price")
        .eq("category_id", listing.category_id)
        .eq("status", "published")
        .gt("price", 0)
        .limit(1000);
      const arr = (prices || []).map((p: any) => Number(p.price)).sort((a, b) => a - b);
      if (arr.length >= 10) {
        const median = arr[Math.floor(arr.length / 2)];
        if (listing.price < median * 0.1) {
          flags.push({
            reason: "abnormally_low_price",
            details: { price: listing.price, category_median: median },
          });
        }
      }
    }

    if (flags.length > 0) {
      const rows = flags.map((f) => ({
        listing_id: listing.id,
        reason: f.reason,
        details: f.details,
      }));
      await admin.from("listing_flags").insert(rows);
    }

    return new Response(JSON.stringify({ flagged: flags.length, reasons: flags.map((f) => f.reason) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("flagSuspiciousListing error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

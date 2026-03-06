import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonRes(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonRes({ error: "Non autorisé" }, 401);

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return jsonRes({ error: "Non autorisé" }, 401);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) return jsonRes({ error: "Accès refusé" }, 403);

    const body = await req.json();
    const { action } = body;

    // List all merchants
    if (action === "list") {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, phone, avatar_url, is_verified, created_at, username")
        .order("created_at", { ascending: false });

      const profileIds = (profiles || []).map((p: any) => p.id);
      const { data: listings } = await supabase
        .from("listings")
        .select("user_id")
        .in("user_id", profileIds.length > 0 ? profileIds : ["__none__"]);

      const listingCounts = new Map<string, number>();
      (listings || []).forEach((l: any) => {
        listingCounts.set(l.user_id, (listingCounts.get(l.user_id) || 0) + 1);
      });

      const result = (profiles || []).map((p: any) => ({
        ...p,
        listing_count: listingCounts.get(p.id) || 0,
      }));

      return jsonRes({ merchants: result });
    }

    // Toggle verification status
    if (action === "toggle_verified") {
      const { merchant_id, verified } = body;
      if (!merchant_id || typeof verified !== "boolean") {
        return jsonRes({ error: "Paramètres manquants" }, 400);
      }

      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: verified })
        .eq("id", merchant_id);

      if (error) {
        console.error("Toggle verified error:", error);
        return jsonRes({ error: "Une erreur est survenue" }, 500);
      }

      return jsonRes({ success: true });
    }

    return jsonRes({ error: "Action inconnue" }, 400);
  } catch (err) {
    console.error("Admin merchants error:", err);
    return jsonRes({ error: "Une erreur est survenue" }, 500);
  }
});

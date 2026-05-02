import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ valid: false, error: 'Non autorisé' }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ valid: false, error: 'Non autorisé' }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return new Response(JSON.stringify({ valid: false, error: "Numéro requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 8) {
      return new Response(JSON.stringify({ valid: false, error: "Numéro trop court" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("NUMVERIFY_API_KEY");
    if (!apiKey) {
      const isValid = /^235\d{8}$/.test(cleaned) || /^\d{8}$/.test(cleaned);
      return new Response(JSON.stringify({ valid: isValid, fallback: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const number = cleaned.startsWith("235") ? cleaned : `235${cleaned}`;
    const url = `http://apilayer.net/api/validate?access_key=${apiKey}&number=${number}&country_code=TD`;
    const res = await fetch(url);
    const data = await res.json();

    return new Response(JSON.stringify({
      valid: data.valid === true,
      carrier: data.carrier || null,
      line_type: data.line_type || null,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, error: "Erreur de validation" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

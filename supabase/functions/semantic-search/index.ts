import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, match_count, match_threshold } = await req.json();

    if (!query) {
      throw new Error("Missing query in request body");
    }

    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      throw new Error("Missing GROQ_API_KEY environment variable");
    }

    // Step 1: Pre-parse and expand the query with Groq (Llama 3.1)
    const AVAILABLE_NICHES = [
      "Art & Design", "Automotive", "Comedy & Entertainment", "Education & Tutorials", 
      "Fashion & Apparel", "Finance & Crypto", "Fitness & Wellness", "Food & Beverage", 
      "Gaming & Esports", "Home & DIY", "Music & Audio", "Parenting & Family", 
      "Pet Care", "Photography", "Skincare & Beauty", "Sustainable Living", 
      "Tech & Software", "Travel & Outdoors"
    ];

    const parsePrompt = `You are a search query router for an influencer database. Output ONLY valid JSON with no extra text or explanations inside array values.

Available database niches (SELECT ONLY FROM THIS LIST): ${AVAILABLE_NICHES.join(", ")}

Query: '${query}'

STRICT RULES:
1. All values in target_niches and fallback_niches MUST be exact strings from the Available list above. No explanations, no modified strings.
2. fallback_niches must ALWAYS have 3-5 entries - pick the closest available niches even if not perfect.
3. vibe_keywords must be simple single lowercase words only.

Example output for "business influencers":
{"target_niches":["Finance & Crypto","Tech & Software"],"fallback_niches":["Education & Tutorials","Comedy & Entertainment","Automotive"],"vibe_keywords":["entrepreneur","startup","growth","strategy","revenue","profit","corporate","venture","investment","leadership"],"max_price":null,"min_price":null}

Now output JSON for the query '${query}':`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: parsePrompt }],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      console.error("Groq API error:", errorText);
      throw new Error(`Failed to parse query with Groq: ${errorText}`);
    }

    const groqData = await groqRes.json();
    const parsedJsonText = groqData.choices[0].message.content;
    const parsedFilters = JSON.parse(parsedJsonText);

    console.log("LLM Extracted Filters (via Groq):", parsedFilters);

    // Step 2: Query Supabase RPC
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const rpcPayload = {
      target_niches: parsedFilters.target_niches || [],
      fallback_niches: parsedFilters.fallback_niches || [],
      vibe_keywords: parsedFilters.vibe_keywords || [],
      match_count: match_count || 15,
      min_price: parsedFilters.min_price || null,
      max_price: parsedFilters.max_price || null,
      match_threshold: match_threshold !== undefined ? match_threshold : 10.0
    };

    console.log("Calling match_creators with payload:", rpcPayload);

    let { data, error } = await supabaseClient.rpc("match_creators", rpcPayload);

    if (error) {
      console.error("Supabase RPC error:", error);
      throw error;
    }

    // Stage 2: If zero results AND a price filter was active, retry WITHOUT price to surface closest niche matches
    let relaxedPriceSearch = false;
    if ((!data || data.length === 0) && (rpcPayload.max_price || rpcPayload.min_price)) {
      console.log("No results with price filter. Retrying without price constraint...");
      const relaxedPayload = { ...rpcPayload, min_price: null, max_price: null };
      const { data: relaxedData, error: relaxedError } = await supabaseClient.rpc("match_creators", relaxedPayload);
      if (!relaxedError && relaxedData && relaxedData.length > 0) {
        data = relaxedData;
        relaxedPriceSearch = true;
      }
    }

    // Determine if any result is an exact target niche match (score >= 20)
    const hasExactMatch = (data || []).some((r: any) => r.similarity >= 20);
    const targetNiches = parsedFilters.target_niches || [];
    const maxPrice = parsedFilters.max_price;

    const responsePayload = {
      creators: data || [],
      meta: {
        has_exact_match: hasExactMatch || targetNiches.length === 0,
        relaxed_price_search: relaxedPriceSearch,
        max_price: maxPrice,
        target_niches: targetNiches,
        fallback_niches: parsedFilters.fallback_niches || [],
        query: query,
      }
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Edge Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests from the React Native app
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase Client with the GOD MODE Service Role Key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      throw new Error("Missing essential environment variables (URL, Service Key, or Gemini Key).");
    }

    // THIS BYPASSES RLS COMPLETELY
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Fetching profiles without embeddings...");

    // 2. Fetch profiles that need backfilling (select only existing columns)
    const { data: profiles, error: fetchError } = await supabase
      .from("profiles")
      .select("id, display_name, niche_industry, bio")
      .eq("role", "influencer")
      .is("embedding", null);

    if (fetchError) throw fetchError;

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No profiles need backfilling. All caught up!" }), 
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let successCount = 0;

    // 3. Loop through and generate vectors
    for (const profile of profiles) {
      // Construct a rich document string for maximum semantic coverage
      const parts = [
        `Creator Name: ${profile.display_name || 'Unknown'}.`,
        `Niche: ${profile.niche_industry || 'General Content Creator'}.`,
        profile.bio       ? `Bio: ${profile.bio}.`             : null,
      ].filter(Boolean);

      const documentString = parts.join(' ');
      console.log(`Embedding: "${documentString.substring(0, 80)}..."`);
      
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text: documentString }] },
          }),
        }
      );

      if (!geminiRes.ok) continue;

      const geminiData = await geminiRes.json();
      const embedding = geminiData.embedding.values;

      // 4. Update the database row using GOD MODE client
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ embedding })
        .eq("id", profile.id);

      if (!updateError) {
        successCount++;
      }
    }

    return new Response(
      JSON.stringify({ message: `Successfully backfilled ${successCount} out of ${profiles.length} profiles.` }), 
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

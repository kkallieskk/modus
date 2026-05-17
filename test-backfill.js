require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

async function main() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY; // Let's try with anon key if service key is missing locally
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!supabaseUrl || !geminiApiKey) {
    console.error("Missing URL or Gemini Key");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log("Fetching profiles...");
  
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, display_name, niche_industry")
    .eq("role", "influencer")
    .is("embedding", null)
    .limit(1);

  if (error) {
    console.error("Supabase fetch error:", error);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.log("No profiles found");
    return;
  }

  const profile = profiles[0];
  console.log("Generating embedding for", profile.display_name);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text: "Test bio" }] },
      }),
    }
  );

  if (!res.ok) {
    console.error("Gemini API Error:", await res.text());
    return;
  }

  const data = await res.json();
  const embedding = data.embedding.values;

  console.log("Got vector of length:", embedding.length);

  console.log("Updating Supabase...");
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ embedding })
    .eq("id", profile.id);

  if (updateError) {
    console.error("Supabase Update Error:", updateError);
  } else {
    console.log("Success!");
  }
}

main();

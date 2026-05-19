import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const urlObj = new URL(req.url);
  let code = urlObj.searchParams.get("code");
  const stateParam = urlObj.searchParams.get("state"); // contains userId passed during auth
  const error = urlObj.searchParams.get("error");
  const errorDescription = urlObj.searchParams.get("error_description");

  // Parse webRedirectUrl if present in state (format: USER_ID__webRedirect__URL)
  let webRedirectUrl: string | null = null;
  let parsedState = stateParam;
  if (stateParam && stateParam.includes("__webRedirect__")) {
    const parts = stateParam.split("__webRedirect__");
    parsedState = parts[0];
    webRedirectUrl = parts[1];
  }

  // Check request body if POST
  let reqBody: any = {};
  if (req.method === "POST") {
    try {
      reqBody = await req.json();
      if (reqBody.code) code = reqBody.code;
    } catch (_) {
      // Bypassed JSON error
    }
  }

  // If Meta returned an error during OAuth login
  if (error) {
    console.error("[InstagramOAuth] Meta OAuth Error:", error, errorDescription);
    if (webRedirectUrl) {
      const errRedirect = `${webRedirectUrl}?error=${encodeURIComponent(errorDescription || error)}`;
      return Response.redirect(errRedirect, 302);
    }
    // Redirect back to app with error
    const redirectErrorUrl = `modus://auth/callback?error=${encodeURIComponent(errorDescription || error)}`;
    return Response.redirect(redirectErrorUrl, 302);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
    const instagramAppId = Deno.env.get("INSTAGRAM_APP_ID") || "";
    const instagramAppSecret = Deno.env.get("INSTAGRAM_APP_SECRET") || "";

    // Use service role key for db writes
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // The redirect_uri must match exactly what was registered in Meta App
    const oauthCallbackUrl = `${supabaseUrl}/functions/v1/instagram-oauth`;

    // Creator ID: either from state param (GET redirect from Meta) or from POST body
    let creatorId = parsedState || reqBody.state || null;
    if (creatorId && creatorId.includes("__webRedirect__")) {
      const parts = creatorId.split("__webRedirect__");
      creatorId = parts[0];
      if (!webRedirectUrl) webRedirectUrl = parts[1];
    }

    // Primary scenario: We have an OAuth code from Meta's redirect
    if (code) {
      console.log(`[InstagramOAuth] Processing OAuth code: ${code.substring(0, 15)}...`);
      console.log(`[InstagramOAuth] Creator ID from state: ${creatorId}`);

      // ----------- REAL META API FLOW -----------
      if (instagramAppId && instagramAppSecret) {

        // STEP 1: Exchange auth code for short-lived access token
        console.log("[InstagramOAuth] Step 1: Exchanging code for short-lived token...");
        const tokenFormData = new FormData();
        tokenFormData.append("client_id", instagramAppId);
        tokenFormData.append("client_secret", instagramAppSecret);
        tokenFormData.append("grant_type", "authorization_code");
        tokenFormData.append("redirect_uri", oauthCallbackUrl);
        tokenFormData.append("code", code);

        const shortLivedRes = await fetch("https://api.instagram.com/oauth/access_token", {
          method: "POST",
          body: tokenFormData,
        });

        if (!shortLivedRes.ok) {
          const errText = await shortLivedRes.text();
          console.error("[InstagramOAuth] Short-lived token exchange failed:", errText);
          throw new Error(`Token exchange failed: ${errText}`);
        }

        const shortLivedData = await shortLivedRes.json();
        const shortToken = shortLivedData.access_token;
        const metaUserId = shortLivedData.user_id;
        console.log(`[InstagramOAuth] Short-lived token acquired for Meta user ID: ${metaUserId}`);

        // STEP 2: Try to upgrade to long-lived token (may fail in dev mode — graceful fallback)
        let accessToken = shortToken;
        let expiresIn = 3600; // short-lived = 1 hour
        try {
          console.log("[InstagramOAuth] Step 2: Attempting 60-day long-lived token upgrade...");
          const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${instagramAppSecret}&access_token=${shortToken}`;
          const longLivedRes = await fetch(longLivedUrl);
          if (longLivedRes.ok) {
            const longLivedData = await longLivedRes.json();
            accessToken = longLivedData.access_token || shortToken;
            expiresIn = longLivedData.expires_in || expiresIn;
            console.log(`[InstagramOAuth] Long-lived token acquired. Expires in ${expiresIn}s`);
          } else {
            const errText = await longLivedRes.text();
            console.warn(`[InstagramOAuth] Long-lived token upgrade failed (using short-lived): ${errText}`);
            // Continue with short-lived token — it works for profile fetching
          }
        } catch (upgradeErr: any) {
          console.warn(`[InstagramOAuth] Long-lived upgrade exception (using short-lived): ${upgradeErr.message}`);
        }

        // STEP 3: Fetch profile data - try multiple approaches for dev mode compatibility
        console.log("[InstagramOAuth] Step 3: Fetching profile from Instagram API...");

        let username = "";
        let displayName = "";
        let profilePictureUrl = "";
        let platformUserId = `ig_${metaUserId}`;
        let accountType = "CREATOR"; // assume creator since they passed OAuth scope
        let mediaCount = 0;
        let followerCount = 0;

        // Approach A: Try graph.instagram.com (works for Business/Creator with app review)
        try {
          const profileUrl = `https://graph.instagram.com/v21.0/me?fields=id,username,name,profile_picture_url,followers_count,media_count,account_type&access_token=${accessToken}`;
          const profileRes = await fetch(profileUrl);
          const profileData = await profileRes.json();

          if (!profileData.error) {
            username = profileData.username || "";
            displayName = profileData.name || username;
            profilePictureUrl = profileData.profile_picture_url || "";
            platformUserId = profileData.id || platformUserId;
            accountType = profileData.account_type || "CREATOR";
            mediaCount = profileData.media_count || 0;
            followerCount = profileData.followers_count || 0;
            console.log(`[InstagramOAuth] ✅ Graph API success: @${username} | ${followerCount} followers`);
          } else {
            console.warn(`[InstagramOAuth] Graph API blocked (${profileData.error?.code}): ${profileData.error?.message}`);
          }
        } catch (graphErr: any) {
          console.warn(`[InstagramOAuth] Graph API exception: ${graphErr.message}`);
        }

        // Approach B: Try Basic Display API (works in dev mode for all app types)
        if (!username) {
          try {
            const basicUrl = `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`;
            const basicRes = await fetch(basicUrl);
            const basicData = await basicRes.json();
            if (!basicData.error && basicData.username) {
              username = basicData.username;
              displayName = basicData.username;
              platformUserId = basicData.id || platformUserId;
              console.log(`[InstagramOAuth] ✅ Basic Display API success: @${username}`);
            } else {
              console.warn(`[InstagramOAuth] Basic Display API also blocked: ${JSON.stringify(basicData.error)}`);
            }
          } catch (basicErr: any) {
            console.warn(`[InstagramOAuth] Basic Display API exception: ${basicErr.message}`);
          }
        }

        // Approach C: We at least have metaUserId from the token exchange - use it as identifier
        if (!username) {
          username = `instagram_user_${metaUserId}`;
          displayName = username;
          platformUserId = String(metaUserId);
          console.log(`[InstagramOAuth] ⚠️ Using metaUserId as fallback identifier: ${username}`);
        }

        console.log(`[InstagramOAuth] ✅ Final profile: @${username} | ${accountType} | ${followerCount} followers`);

        // STEP 4: Fetch recent media to calculate engagement and analyze content
        console.log("[InstagramOAuth] Step 4: Fetching recent media...");
        let calculatedEngagementRate = 0;
        let recentCaptions = "";
        
        try {
          // Attempt to fetch media. This requires instagram_business_basic.
          // In dev mode, if the app doesn't have advanced access, this might fail, so we wrap it in a try-catch.
          const mediaUrl = `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,like_count,comments_count,timestamp&limit=15&access_token=${accessToken}`;
          const mediaRes = await fetch(mediaUrl);
          const mediaData = await mediaRes.json();
          
          if (!mediaData.error && mediaData.data && mediaData.data.length > 0) {
            const posts = mediaData.data;
            let totalLikes = 0;
            let totalComments = 0;
            
            posts.forEach((post: any) => {
              totalLikes += post.like_count || 0;
              totalComments += post.comments_count || 0;
              if (post.caption) {
                recentCaptions += `${post.caption}\n---\n`;
              }
            });
            
            if (followerCount > 0 && posts.length > 0) {
              const avgEngagementPerPost = (totalLikes + totalComments) / posts.length;
              calculatedEngagementRate = (avgEngagementPerPost / followerCount) * 100;
              // Cap at 100% just in case of weird data
              if (calculatedEngagementRate > 100) calculatedEngagementRate = 100;
            }
            console.log(`[InstagramOAuth] ✅ Calculated real engagement rate: ${calculatedEngagementRate.toFixed(2)}% based on ${posts.length} posts`);
          } else {
            console.warn(`[InstagramOAuth] Could not fetch media data: ${JSON.stringify(mediaData.error)}`);
          }
        } catch (mediaErr: any) {
          console.warn(`[InstagramOAuth] Media fetch exception: ${mediaErr.message}`);
        }
        
        // If calculation returned 0 because they have no posts, we keep it as 0.
        // We no longer fake the engagement rate with a placeholder.

        // STEP 5: AI Post Analysis using Groq
        console.log("[InstagramOAuth] Step 5: Analyzing content with Groq AI...");
        let niche = "Lifestyle";
        let contentStyle = "Creator Content";
        let recentPostThemes = ["Aesthetics", "Personal Brand", "Lifestyle"];
        
        const groqApiKey = Deno.env.get("GROQ_API_KEY");
        if (groqApiKey && recentCaptions.length > 50) {
          try {
            // Truncate captions to avoid exceeding token limits
            const truncatedCaptions = recentCaptions.substring(0, 3000);
            
            const aiPrompt = `
You are an expert social media analyst. Analyze the following recent Instagram captions from a creator.
Based on the captions, determine their primary niche, their content style, and 3 specific recurring themes.

Captions:
${truncatedCaptions}

Return ONLY a valid JSON object matching this exact schema, with no markdown formatting:
{
  "niche": "string (e.g. Fitness, Tech, Fashion)",
  "contentStyle": "string (e.g. High-energy motivational videos)",
  "recentPostThemes": ["string", "string", "string"]
}`;

            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${groqApiKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: "llama-3.1-8b-instant", // Fast Llama 3.1 model on Groq
                messages: [{ role: "user", content: aiPrompt }],
                temperature: 0.2,
                response_format: { type: "json_object" }
              })
            });
            
            if (groqRes.ok) {
              const groqData = await groqRes.json();
              const analysis = JSON.parse(groqData.choices[0].message.content);
              
              niche = analysis.niche || niche;
              contentStyle = analysis.contentStyle || contentStyle;
              recentPostThemes = analysis.recentPostThemes || recentPostThemes;
              
              console.log(`[InstagramOAuth] ✅ Groq AI Analysis success: ${niche}`);
            } else {
              console.warn(`[InstagramOAuth] Groq API returned error: ${await groqRes.text()}`);
            }
          } catch (groqErr: any) {
            console.warn(`[InstagramOAuth] Groq AI exception: ${groqErr.message}`);
          }
        } else {
          console.log("[InstagramOAuth] ⚠️ Skipping Groq AI analysis (Missing GROQ_API_KEY or insufficient captions).");
        }

        // STEP 5.5: Fetch Verified Audience Demographics (Age, Gender, Location)
        console.log("[InstagramOAuth] Step 5.5: Fetching Audience Insights...");
        let audienceDemographics: any = null;
        
        try {
          // Insights API requires instagram_business_manage_insights permission
          // The creator must have at least 100 followers for this data to be returned by Meta.
          const insightsUrl = `https://graph.instagram.com/v21.0/me/insights?metric=audience_city,audience_country,audience_gender_age&period=lifetime&access_token=${accessToken}`;
          const insightsRes = await fetch(insightsUrl);
          const insightsData = await insightsRes.json();
          
          if (!insightsData.error && insightsData.data) {
            audienceDemographics = {};
            insightsData.data.forEach((metric: any) => {
              audienceDemographics[metric.name] = metric.values[0].value;
            });
            console.log(`[InstagramOAuth] ✅ Insights API success. Fetched demographics.`);
          } else {
            console.warn(`[InstagramOAuth] Insights API blocked or no data (e.g., <100 followers): ${JSON.stringify(insightsData.error || 'No data array')}`);
          }
        } catch (insightsErr: any) {
          console.warn(`[InstagramOAuth] Insights API exception: ${insightsErr.message}`);
        }

        const verifiedInstagramStats = {
          handle: username,
          displayName: displayName,
          followersCount: followerCount,
          engagementRate: calculatedEngagementRate,
          profilePictureUrl: profilePictureUrl,
          niche: niche,
          contentStyle: contentStyle,
          recentPostThemes: recentPostThemes,
          audienceDemographics: audienceDemographics, // Will be null if < 100 followers
        };

        // STEP 6: Save the verified account to Supabase profiles table
        if (creatorId) {
          // Sync profiles.social_link JSON blob
          const { data: existingProfile } = await supabaseAdmin
            .from("profiles")
            .select("social_link")
            .eq("id", creatorId)
            .single();

          let socials: Record<string, any> = {};
          if (existingProfile?.social_link) {
            try {
              socials = typeof existingProfile.social_link === "string"
                ? JSON.parse(existingProfile.social_link)
                : existingProfile.social_link;
            } catch (_) {}
          }

          socials["instagram"] = {
            handle: username,
            displayName,
            followersCount: followerCount,
            profilePictureUrl,
            engagementRate: calculatedEngagementRate,
            accountType,
            mediaCount,
            niche,
            contentStyle,
            recentPostThemes,
            audienceDemographics,
            linkedAt: new Date().toISOString(),
          };

          await supabaseAdmin
            .from("profiles")
            .update({ social_link: JSON.stringify(socials) })
            .eq("id", creatorId);

          console.log(`[InstagramOAuth] ✅ Saved @${username} to database for creator ${creatorId}`);
        }

        // STEP 7: Return results
        const responsePayload = {
          success: true,
          platform: "instagram",
          username,
          displayName,
          followersCount: followerCount,
          profilePictureUrl,
          accountType,
          mediaCount,
          niche: niche,
          engagementRate: calculatedEngagementRate,
          contentStyle: contentStyle,
          recentPostThemes: recentPostThemes,
        };

        if (req.method === "POST") {
          return new Response(JSON.stringify(responsePayload), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        // GET redirect flow (Meta → Edge Function → App / Web)
        if (webRedirectUrl) {
          const successRedirectUrl = `${webRedirectUrl}?code=${code}&handle=${encodeURIComponent(username)}&followers=${followerCount}&account_type=${accountType}`;
          console.log(`[InstagramOAuth] Redirecting back to Web App: ${successRedirectUrl}`);
          return Response.redirect(successRedirectUrl, 302);
        }
        const successRedirectUrl = `modus://auth/callback?handle=${encodeURIComponent(username)}&followers=${followerCount}&account_type=${accountType}`;
        console.log(`[InstagramOAuth] Redirecting back to Mobile App: ${successRedirectUrl}`);
        return Response.redirect(successRedirectUrl, 302);

      } else {
        // ----------- SIMULATION MODE (no Meta credentials in env) -----------
        console.warn("[InstagramOAuth] ⚠️ Meta credentials not found in environment. Running simulation mode.");

        // In simulation, we cannot detect personal vs. creator.
        // Default to creator mode with placeholder data.
        // Look up user's real name from the database if we have their ID.
        let displayName = "kk.23.02";
        if (creatorId) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("full_name")
            .eq("id", creatorId)
            .single();
          if (profile?.full_name) displayName = profile.full_name;
        }

        const simulatedPayload = {
          success: true,
          platform: "instagram",
          username: "kk.23.02",
          displayName,
          followersCount: 142800,
          profilePictureUrl: "",
          accountType: "CREATOR",
          mediaCount: 47,
          niche: "Lifestyle",
          engagementRate: 4.85,
          contentStyle: "Premium high-aesthetic travel content",
          recentPostThemes: ["Editorial Travel", "Minimalist Architecture", "Luxury Hotels"],
          isSimulated: true,
        };

        if (req.method === "POST") {
          return new Response(JSON.stringify(simulatedPayload), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        if (webRedirectUrl) {
          const simulatedRedirect = `${webRedirectUrl}?code=simulated_code&handle=kk.23.02&followers=142800&account_type=CREATOR`;
          return Response.redirect(simulatedRedirect, 302);
        }
        const simulatedRedirect = `modus://auth/callback?handle=kk.23.02&followers=142800&account_type=CREATOR`;
        return Response.redirect(simulatedRedirect, 302);
      }
    }

    // No code param — health check / direct GET
    return new Response(
      JSON.stringify({ success: true, message: "Instagram OAuth endpoint online. Awaiting code redirect from Meta." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err: any) {
    console.error("[InstagramOAuth] Unhandled error:", err.message);

    if (req.method === "POST") {
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (webRedirectUrl) {
      const errRedirect = `${webRedirectUrl}?error=${encodeURIComponent(err.message)}`;
      return Response.redirect(errRedirect, 302);
    }
    const errRedirect = `modus://auth/callback?error=${encodeURIComponent(err.message)}`;
    return Response.redirect(errRedirect, 302);
  }
});

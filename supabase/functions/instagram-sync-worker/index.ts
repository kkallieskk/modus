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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const instagramAppSecret = Deno.env.get("INSTAGRAM_APP_SECRET") || "";

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    console.log("[SyncWorker] Starting automated social accounts synchronization job...");

    // 1. Query all connected Instagram accounts
    const { data: accounts, error: fetchErr } = await supabaseClient
      .from("social_accounts")
      .select("*")
      .eq("platform", "instagram");

    if (fetchErr) throw fetchErr;

    console.log(`[SyncWorker] Fetched ${accounts?.length || 0} Instagram accounts for verification.`);

    const syncResults = [];

    for (const acc of (accounts || [])) {
      console.log(`[SyncWorker] Processing @${acc.username} (User: ${acc.creator_id})...`);
      
      let token = acc.access_token;
      let expiresAt = new Date(acc.expires_at);
      let isVerified = acc.is_verified;
      let currentFollowers = Number(acc.follower_count);

      // A: Token Refresh check (If token is within 15 days of expiring, refresh it)
      const daysUntilExpiration = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      console.log(`[SyncWorker] Token for @${acc.username} expires in ${daysUntilExpiration.toFixed(1)} days.`);

      if (daysUntilExpiration <= 15 && token && !token.startsWith("mock_")) {
        console.log(`[SyncWorker] Refreshing token for @${acc.username} (within 15-day limit)...`);
        
        try {
          const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`;
          const refreshRes = await fetch(refreshUrl);
          
          if (refreshRes.status === 401) {
            throw new Error("UNAUTHORIZED_REVOKED");
          }

          if (!refreshRes.ok) {
            const errText = await refreshRes.text();
            console.error(`[SyncWorker] Refresh failed for @${acc.username}: ${errText}`);
          } else {
            const refreshData = await refreshRes.json();
            token = refreshData.access_token;
            // Update expiration (usually adds another 60 days)
            expiresAt = new Date(Date.now() + Number(refreshData.expires_in) * 1000);
            console.log(`[SyncWorker] Successfully refreshed token for @${acc.username}.`);
          }
        } catch (err: any) {
          if (err.message === "UNAUTHORIZED_REVOKED") {
            console.warn(`[SyncWorker] Credentials revoked for @${acc.username}. Triggering alert...`);
            isVerified = false;
          }
        }
      }

      // B: Metric Synchronization & 401 Revocation Handler
      if (isVerified && token && !token.startsWith("mock_")) {
        try {
          const profileUrl = `https://graph.instagram.com/v12.0/me?fields=followers_count,profile_picture_url&access_token=${token}`;
          const profileRes = await fetch(profileUrl);

          if (profileRes.status === 401) {
            throw new Error("UNAUTHORIZED_REVOKED");
          }

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            currentFollowers = profileData.followers_count || currentFollowers;
            
            // Log in social_metrics_history for historical timeline analytics
            const { error: histErr } = await supabaseClient
              .from("social_metrics_history")
              .insert({
                social_account_id: acc.id,
                follower_count: currentFollowers
              });

            if (histErr) {
              console.error(`[SyncWorker] Failed to write metrics history: ${histErr.message}`);
            }

            console.log(`[SyncWorker] Updated statistics for @${acc.username}. Current followers: ${currentFollowers}`);
          }
        } catch (err: any) {
          if (err.message === "UNAUTHORIZED_REVOKED") {
            console.warn(`[SyncWorker] Token revoked (401) for @${acc.username}. Flagging verification error.`);
            isVerified = false;
          }
        }
      }

      // C: Revoked Credentials System Notification
      if (acc.is_verified && !isVerified) {
        console.log(`[SyncWorker] Injecting critical notification alert to user: ${acc.creator_id}`);
        
        // 1. Create a high-priority action_required item inside user notifications hub
        const { error: notifErr } = await supabaseClient
          .from("notifications")
          .insert({
            user_id: acc.creator_id,
            title: "Instagram Verification Expired",
            message: `Your Instagram account connection (@${acc.username}) has been revoked or expired. Please re-authenticate inside Modus Social Settings to restore premium matching.`,
            type: "action_required",
            data: JSON.stringify({ screen: "SocialAccounts" }),
            is_read: false
          });

        if (notifErr) {
          console.error(`[SyncWorker] Notification delivery failed: ${notifErr.message}`);
        }
      }

      // D: Save synchronized stats to the DB
      const { error: updateErr } = await supabaseClient
        .from("social_accounts")
        .update({
          access_token: token,
          expires_at: expiresAt.toISOString(),
          is_verified: isVerified,
          follower_count: currentFollowers,
          last_synced_at: new Date().toISOString()
        })
        .eq("id", acc.id);

      if (updateErr) {
        console.error(`[SyncWorker] DB update failed for @${acc.username}: ${updateErr.message}`);
      }

      // Also keep profiles.social_link JSON up to date
      if (creatorIdHasProfileUpdate(acc.creator_id)) {
        try {
          const { data: profile } = await supabaseClient
            .from("profiles")
            .select("social_link")
            .eq("id", acc.creator_id)
            .single();

          if (profile) {
            let parsed = typeof profile.social_link === "string" 
              ? JSON.parse(profile.social_link) 
              : profile.social_link || {};

            if (parsed.instagram) {
              parsed.instagram.followersCount = currentFollowers;
              parsed.instagram.avatarUrl = acc.profile_picture_url;
              
              await supabaseClient
                .from("profiles")
                .update({ social_link: JSON.stringify(parsed) })
                .eq("id", acc.creator_id);
            }
          }
        } catch (jsonErr) {
          console.error("[SyncWorker] Legacy profile JSON sync failed:", jsonErr);
        }
      }

      syncResults.push({
        username: acc.username,
        followers: currentFollowers,
        is_verified: isVerified,
        token_refreshed: token !== acc.access_token
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: syncResults.length,
        results: syncResults
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    console.error("[SyncWorker] Error running background sync job:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

function creatorIdHasProfileUpdate(creatorId: string): boolean {
  return !!creatorId;
}

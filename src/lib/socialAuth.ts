import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle(role?: 'brand' | 'influencer') {
  const isWeb = Platform.OS === 'web';

  const redirectTo = AuthSession.makeRedirectUri({
    scheme: 'modus',
    path: 'auth/callback',
  });

  console.log('Google Auth Redirect URI:', redirectTo);

  if (isWeb) {
    // Store role in local storage for retrieval after redirection
    if (role && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('pending_oauth_role', role);
    }

    // Direct in-window redirect on the web to avoid popups blocking or hanging
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });

    if (error) throw error;
    return;
  }

  // Native platforms flow (iOS / Android) using WebBrowser
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('No OAuth URL returned');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !result.url) {
    throw new Error('Google sign-in was cancelled');
  }

  const url = result.url;
  const params = new URLSearchParams(url.includes('#') ? url.split('#')[1] : url.split('?')[1]);

  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');

  if (!access_token || !refresh_token) {
    throw new Error('Missing authentication tokens');
  }

  if (role) {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${access_token}` } }
    });

    const { data: { user } } = await tempClient.auth.getUser();
    if (user) {
      await tempClient.from('profiles').update({ role }).eq('id', user.id);
    }
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (sessionError) throw sessionError;
  return sessionData;
}

/**
 * Builds the real Instagram OAuth URL pointing to our Supabase Edge Function as the redirect receiver.
 * The Edge Function will complete the server-side code exchange and then deep-link back into the app.
 */
export function buildInstagramAuthUrl(userId: string): string {
  const instagramAppId = process.env.EXPO_PUBLIC_INSTAGRAM_APP_ID || '1530182758639376';
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

  // The Edge Function is the redirect_uri so it can do the server-side token exchange
  const edgeFunctionCallbackUrl = `${supabaseUrl}/functions/v1/instagram-oauth`;

  // Pass the user's ID as 'state' so the Edge Function knows who to link the account to
  const params = new URLSearchParams({
    client_id: instagramAppId,
    redirect_uri: edgeFunctionCallbackUrl,
    scope: 'instagram_business_basic,instagram_business_manage_messages',
    response_type: 'code',
    state: userId,
  });

  return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
}

/**
 * Initiates the real Instagram OAuth 2.0 login flow.
 * Opens the actual Instagram login page in a browser.
 * After login, Meta redirects to our Edge Function which detects account type,
 * exchanges the token, fetches profile data, and deep-links back with results.
 *
 * Returns the verified Instagram profile data or throws with account_type info.
 */
export async function linkInstagramAccount(userId: string): Promise<{
  code: string;
  handle: string;
  followers: number;
  accountType: 'creator' | 'personal' | 'unknown';
}> {
  const instagramAppId = process.env.EXPO_PUBLIC_INSTAGRAM_APP_ID || '1530182758639376';
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

  if (!instagramAppId || !supabaseUrl) {
    throw new Error('Instagram App ID or Supabase URL is not configured.');
  }

  // The Edge Function receives the OAuth code and handles the token exchange server-side
  const edgeFunctionCallbackUrl = `${supabaseUrl}/functions/v1/instagram-oauth`;

  // For web, pass the dynamic web redirect URL appended to the userId, e.g. "USER_ID__webRedirect__URL"
  const isWeb = Platform.OS === 'web';
  const webRedirectUrl = isWeb ? `${window.location.origin}/auth/callback` : '';
  const stateStr = isWeb ? `${userId}__webRedirect__${webRedirectUrl}` : userId;

  // Build the real Meta authorization URL
  const authParams = new URLSearchParams({
    client_id: instagramAppId,
    redirect_uri: edgeFunctionCallbackUrl,
    scope: 'instagram_business_basic',
    response_type: 'code',
    state: stateStr, // Pass userId and optionally the web redirect URL
  });

  const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?${authParams.toString()}`;

  console.log(`[SocialAuth] Opening real Instagram login page. App ID: ${instagramAppId}`);
  console.log(`[SocialAuth] Edge Function callback: ${edgeFunctionCallbackUrl}`);
  console.log(`[SocialAuth] Full Instagram OAuth URL: ${instagramAuthUrl}`);

  // The app's deep link scheme that the Edge Function will redirect back to
  const appDeepLinkCallback = Platform.OS === 'web'
    ? `${window.location.origin}/auth/callback`
    : AuthSession.makeRedirectUri({ scheme: 'modus', path: 'auth/callback' });

  try {
    // Open the actual Instagram login page
    const result = await WebBrowser.openAuthSessionAsync(
      instagramAuthUrl,
      // Watch for our app's callback URL pattern (the Edge Function redirects here after token exchange)
      Platform.OS === 'web' ? `${window.location.origin}/auth/callback` : 'modus://auth/callback'
    );

    console.log(`[SocialAuth] Browser session result type: ${result.type}`);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Instagram login was cancelled.');
    }

    if (result.type === 'success' && result.url) {
      const callbackUrl = result.url;
      console.log(`[SocialAuth] Received callback URL: ${callbackUrl}`);

      const urlParams = new URLSearchParams(
        callbackUrl.includes('?') ? callbackUrl.split('?')[1] : ''
      );

      const error = urlParams.get('error');
      if (error) {
        const errorDesc = urlParams.get('error_description') || error;
        // Check if this is a personal account error from the Edge Function
        if (errorDesc.includes('personal') || errorDesc.includes('not a business') || errorDesc.includes('not_business')) {
          throw new Error(`PERSONAL_ACCOUNT: ${errorDesc}`);
        }
        throw new Error(errorDesc);
      }

      const code = urlParams.get('code') || '';
      const handle = urlParams.get('handle') || '';
      const followers = parseInt(urlParams.get('followers') || '0', 10);
      const rawAccountType = urlParams.get('account_type') || 'creator';
      const accountType: 'creator' | 'personal' | 'unknown' = 
        rawAccountType === 'personal' ? 'personal' : 
        rawAccountType === 'creator' ? 'creator' : 'unknown';

      if (code) {
        return { code, handle, followers, accountType };
      }
    }

    // If browser returned without a proper callback, it likely means the Edge Function
    // already handled the redirect server-side. The account data is in the database.
    throw new Error('Instagram login completed but no callback received. Try refreshing.');
  } catch (err: any) {
    throw err;
  }
}

/**
 * @deprecated Use linkInstagramAccount() instead. Kept for compatibility.
 */
export async function linkSocialAccount(
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter'
): Promise<{ code: string; handle: string }> {
  if (platform !== 'instagram') {
    throw new Error(`${platform} linking is not supported yet. Only Instagram is available.`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to link your Instagram account.');

  const result = await linkInstagramAccount(user.id);
  return { code: result.code, handle: result.handle };
}

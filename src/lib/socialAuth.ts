import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

import { createClient } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

// Use the Supabase callback URL as the redirect - Supabase will then
// deep-link back into the app using the scheme configured in app.json.
// Let Expo handle generating the correct exp:// or modus:// URI automatically
export async function signInWithGoogle(role?: 'brand' | 'influencer') {
  // Explicitly defining scheme and path ensures a highly predictable URL structure.
  // In Expo Go, this becomes exp://<ip>:8081/--/auth/callback
  // In the standalone app, it becomes modus://auth/callback
  const redirectTo = AuthSession.makeRedirectUri({
    scheme: 'modus',
    path: 'auth/callback',
  });

  console.log('Google Auth Redirect URI:', redirectTo);

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

  // Extract tokens from the redirect URL fragment
  const url = result.url;
  const params = new URLSearchParams(url.includes('#') ? url.split('#')[1] : url.split('?')[1]);

  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');

  if (!access_token || !refresh_token) {
    throw new Error('Missing authentication tokens');
  }

  // If a role was provided during signup, update the profile BEFORE setting the session globally
  // This prevents the race condition where RootNavigator routes the user based on default 'influencer' role
  if (role) {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
    
    // Create a temporary authenticated client
    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    });

    const { data: { user } } = await tempClient.auth.getUser();
    if (user) {
      await tempClient
        .from('profiles')
        .update({ role })
        .eq('id', user.id);
    }
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (sessionError) throw sessionError;

  return sessionData;
}

import 'react-native-gesture-handler';
import "./global.css";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import * as WebBrowser from 'expo-web-browser';
import { 
  Platform, 
  View, 
  Text, 
  useWindowDimensions, 
  StyleSheet, 
  StatusBar 
} from 'react-native';

// Complete any pending Auth session (e.g. from popup callback on Web)
if (Platform.OS === 'web') {
  WebBrowser.maybeCompleteAuthSession();

  // Capture Instagram OAuth callback params from the URL and store in localStorage.
  // The Edge Function redirects to /auth/callback?handle=...&followers=...&account_type=...
  // We store them so the onboarding screen can read them after the page reloads.
  if (typeof window !== 'undefined') {
    const url = window.location.href;
    const urlObj = new URL(url);
    const handle = urlObj.searchParams.get('handle');
    const followers = urlObj.searchParams.get('followers');
    const accountType = urlObj.searchParams.get('account_type');
    const errorParam = urlObj.searchParams.get('error');
    
    if (handle && followers) {
      // Store verified instagram data from Meta's callback
      const payload = JSON.stringify({
        handle,
        followers: parseInt(followers, 10),
        accountType: accountType || 'creator',
        timestamp: Date.now(),
      });
      window.localStorage.setItem('instagram_oauth_callback', payload);
      console.log('[App] Stored Instagram OAuth callback:', payload);
      // Clean the URL so the user sees a clean page
      window.history.replaceState({}, document.title, '/');
    } else if (errorParam) {
      window.localStorage.setItem('instagram_oauth_error', errorParam);
      window.history.replaceState({}, document.title, '/');
    }
  }
}
import { Sparkles, Shield, Compass, Cpu } from 'lucide-react-native';

import { ProfileProvider } from './src/lib/ProfileContext';

const linking = {
  prefixes: ['modus://', 'https://modus-kk-modus.vercel.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
          Login: 'login',
          SignUp: 'signup',
        },
      },
      RoleSelection: 'role-selection',
      BrandSetup: 'brand/setup',
      CreatorOnboarding: 'creator/onboarding',
      BrandRoot: 'brand',
      InfluencerRoot: 'creator',
      AdminRoot: 'admin',
    },
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ProfileProvider>
          <NavigationContainer linking={linking}>
            <RootNavigator />
          </NavigationContainer>
        </ProfileProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


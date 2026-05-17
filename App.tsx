import 'react-native-gesture-handler';
import "./global.css";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';

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

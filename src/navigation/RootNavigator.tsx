import React, { useEffect, useState, createContext } from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

// Screens & Stacks
import { AdminStack } from './AdminStack';
import { AuthStack } from './AuthStack';
import { BrandStack } from './BrandStack';
import { InfluencerStack } from './InfluencerStack';
import { BrandOnboardingScreen } from '@/screens/brand/BrandOnboardingScreen';
import { CreatorOnboardingScreen } from '@/screens/onboarding/CreatorOnboardingScreen';
import { RoleSelectionScreen } from '@/screens/onboarding/RoleSelectionScreen';

import { useProfile } from '@/lib/ProfileContext';


export const DemoContext = createContext<{demoRole: string|null, setDemoRole: (r: string|null)=>void}>({demoRole: null, setDemoRole: ()=>{}});

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const [session, setSession] = useState<Session | null>(null);
  const { profile: userProfile, loading: profileLoading, refreshProfile } = useProfile();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading || profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const isAuthed = !!session || !!demoRole;
  const activeRole = demoRole || userProfile?.role;
  const needsOnboarding = !demoRole && (!userProfile || userProfile.onboarding_completed === false);

  return (
    <DemoContext.Provider value={{demoRole, setDemoRole}}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthed ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : needsOnboarding ? (
        <>
          {!userProfile?.role && (
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          )}
          {activeRole === 'brand' && (
            <Stack.Screen name="BrandSetup" component={BrandOnboardingScreen} />
          )}
          {activeRole === 'influencer' && (
            <Stack.Screen name="CreatorOnboarding" component={CreatorOnboardingScreen} />
          )}
        </>
      ) : activeRole === 'admin' ? (
        <Stack.Screen name="AdminRoot" component={AdminStack} />
      ) : activeRole === 'brand' ? (
        <Stack.Screen name="BrandRoot" component={BrandStack} />
      ) : activeRole === 'influencer' ? (
        <Stack.Screen name="InfluencerRoot" component={InfluencerStack} />
      ) : (
        <Stack.Screen name="AppPlaceholder" component={() => (
          <View style={styles.loadingContainer}>
            <Text style={styles.placeholderText}>Welcome {activeRole}</Text>
          </View>
        )} />
      )}
    </Stack.Navigator>
    </DemoContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
});

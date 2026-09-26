import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LandingScreen } from '@/screens/auth/LandingScreen';
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { PricingScreen } from '@/screens/auth/PricingScreen';
import { ResourcesScreen } from '@/screens/auth/ResourcesScreen';
import { ForBrandsScreen } from '@/screens/auth/ForBrandsScreen';
import { ForCreatorsScreen } from '@/screens/auth/ForCreatorsScreen';
import { BrandOnboardingScreen } from '@/screens/brand/BrandOnboardingScreen';

const Stack = createNativeStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Landing">
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="BrandSetup" component={BrandOnboardingScreen} />
          <Stack.Screen name="Pricing" component={PricingScreen} />
      <Stack.Screen name="Resources" component={ResourcesScreen} />
      <Stack.Screen name="ForBrands" component={ForBrandsScreen} />
      <Stack.Screen name="ForCreators" component={ForCreatorsScreen} />
    </Stack.Navigator>
  );
};

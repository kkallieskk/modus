import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Image, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandDashboard } from '@/screens/brand/BrandDashboard';
import { CheckoutScreen } from '@/screens/brand/CheckoutScreen';
import { CampaignBuilderScreen } from '@/screens/brand/CampaignBuilderScreen';
import { CreatorSelectionScreen } from '@/screens/brand/CreatorSelectionScreen';
import { ActiveCampaignsScreen } from '@/screens/brand/ActiveCampaignsScreen';
import { CreatorProfileScreen } from '@/screens/brand/CreatorProfileScreen';
import { BrandVaultScreen } from '@/screens/brand/BrandVaultScreen';
import { BrandProfileScreen } from '@/screens/brand/BrandProfileScreen';
import { EditProfileScreen } from '@/screens/brand/EditProfileScreen';
import { AccountSettingsScreen } from '@/screens/brand/AccountSettingsScreen';
import { CampaignDetailScreen } from '@/screens/brand/CampaignDetailScreen';
import { CampaignManagementHub } from '@/screens/brand/CampaignManagementHub';
import { ApplicantReviewScreen } from '@/screens/brand/ApplicantReviewScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { ChatScreen } from '@/screens/influencer/ChatScreen';
import { Users, LayoutGrid, FolderOpen, User, MessageSquare } from 'lucide-react-native';
import { useProfile } from '@/lib/ProfileContext';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

const HeaderTitle = () => {
  const { profile } = useProfile();
  const brandColor = profile?.brand_color || '#8B5CF6';
  return (
    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000', marginLeft: 16 }}>
      Curated for <Text style={{ color: brandColor }}>{profile?.display_name || 'You'}</Text>
    </Text>
  );
};

const HeaderAvatar = () => {
  const navigation = useNavigation<any>();
  const { profile } = useProfile();
  const avatarUrl = profile?.avatar_url;

  return (
    <TouchableOpacity onPress={() => navigation.navigate('BrandProfile')} style={{ marginRight: 16 }}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={{ width: 32, height: 32, borderRadius: 16 }} />
      ) : (
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }}>
          <User size={18} color="#9CA3AF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const RosterStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BrandDashboard" component={BrandDashboard} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="CampaignBuilder" component={CampaignBuilderScreen} />
    <Stack.Screen name="CreatorSelection" component={CreatorSelectionScreen} />
    <Stack.Screen name="CreatorProfile" component={CreatorProfileScreen} />
    <Stack.Screen name="BrandProfile" component={BrandProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
  </Stack.Navigator>
);

const ActiveStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ActiveCampaigns" component={ActiveCampaignsScreen} />
    <Stack.Screen name="CampaignManagementHub" component={CampaignManagementHub} />
    <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} />
    <Stack.Screen name="ApplicantReview" component={ApplicantReviewScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

const BottomTab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

const DashboardPager = () => {
  return (
    <TopTab.Navigator
      tabBarPosition="top"
      screenOptions={{
        tabBarIndicatorStyle: { display: 'none' },
        tabBarLabelStyle: { display: 'none' },
        tabBarStyle: { height: 0, elevation: 0, shadowOpacity: 0 },
        swipeEnabled: true,
      }}
    >
      <TopTab.Screen name="RosterPager" component={RosterStack} />
      <TopTab.Screen name="ActivePager" component={ActiveStack} />
      <TopTab.Screen name="VaultPager" component={BrandVaultScreen} />
    </TopTab.Navigator>
  );
};

export const BrandStack = () => {
  const { profile } = useProfile();
  const insets = useSafeAreaInsets();
  const brandColor = profile?.brand_color || '#8B5CF6';

  return (
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brandColor,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <BottomTab.Screen 
        name="RosterTab" 
        component={DashboardPager} 
        options={{
          title: 'Roster',
          tabBarIcon: ({ color }: { color: string }) => <Users size={22} color={color} />,
        }}
      />
      <BottomTab.Screen 
        name="WorkspaceTab" 
        component={ActiveStack} 
        options={{
          title: 'Workspace',
          tabBarIcon: ({ color }: { color: string }) => <LayoutGrid size={22} color={color} />,
        }}
      />
      <BottomTab.Screen 
        name="VaultTab" 
        component={BrandVaultScreen} 
        options={{
          title: 'Vault',
          tabBarIcon: ({ color }: { color: string }) => <FolderOpen size={22} color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
};

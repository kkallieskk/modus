import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { InfluencerDashboard } from '@/screens/influencer/InfluencerDashboard';
import { JobDetailScreen } from '@/screens/influencer/JobDetailScreen';
import { EarningsScreen } from '@/screens/influencer/EarningsScreen';
import { ChatScreen } from '@/screens/influencer/ChatScreen';
import { OfferReviewScreen } from '@/screens/influencer/OfferReviewScreen';
import { CreatorProfileScreen } from '@/screens/influencer/CreatorProfileScreen';
import { EditProfileScreen } from '@/screens/influencer/EditProfileScreen';
import { SettingsScreen } from '@/screens/influencer/SettingsScreen';
import { NotificationScreen } from '@/screens/influencer/NotificationScreen';
import { PublicMediaKitScreen } from '@/screens/influencer/PublicMediaKitScreen';
import { PipelineScreen } from '@/screens/influencer/PipelineScreen';
import { LogoutButton } from '@/components/LogoutButton';
import { NotificationBell } from '@/components/NotificationBell';
import { Inbox, User, Briefcase, Wallet, MessageSquare, Zap, Bell } from 'lucide-react-native';
import { OpportunitiesScreen } from '@/screens/influencer/OpportunitiesScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const InfluencerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: true,
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <NotificationBell />
          <LogoutButton />
        </View>
      ),
      headerTitleStyle: { fontWeight: 'bold' },
      tabBarActiveTintColor: '#000',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: 8,
        paddingTop: 8,
        height: 64,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      }
    }}
  >
    <Tab.Screen 
      name="Opportunities" 
      component={OpportunitiesScreen} 
      options={{
        tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Workspace" 
      component={InfluencerDashboard} 
      options={{
        tabBarIcon: ({ color, size }) => <Inbox size={size} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Earnings" 
      component={EarningsScreen} 
      options={{
        tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={CreatorProfileScreen} 
      options={{
        tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

export const InfluencerStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InfluencerTabs" component={InfluencerTabs} />
      <Stack.Screen 
        name="JobDetail" 
        component={JobDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="OfferReview" 
        component={OfferReviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PublicMediaKit" 
        component={PublicMediaKitScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Pipeline" 
        component={PipelineScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

import React from 'react';
import { View, useWindowDimensions, Platform, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
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
import { useProfile } from '@/lib/ProfileContext';
import { supabase } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const { profile } = useProfile();
  const creatorColor = '#10B981';

  if (isDesktop) {
    return (
      <View style={styles.webSidebar}>
        <View>
          <View style={styles.webSidebarHeader}>
            <Text style={styles.webSidebarLogo}>MODUS</Text>
            <Text style={styles.webSidebarRole}>Creator Portal</Text>
          </View>

          <View style={styles.webSidebarMenu}>
            {state.routes.map((route: any, index: number) => {
              const { options } = descriptors[route.key];
              const label = options.title !== undefined ? options.title : route.name;
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const renderIcon = () => {
                const iconColor = isFocused ? creatorColor : '#64748B';
                if (label === 'Opportunities') return <Briefcase size={20} color={iconColor} />;
                if (label === 'Workspace') return <Inbox size={20} color={iconColor} />;
                if (label === 'Earnings') return <Wallet size={20} color={iconColor} />;
                return <User size={20} color={iconColor} />;
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  style={[
                    styles.webSidebarItem,
                    isFocused && styles.webSidebarItemActive
                  ]}
                >
                  {renderIcon()}
                  <Text
                    style={[
                      styles.webSidebarLabel,
                      isFocused ? { color: '#0F172A', fontWeight: '700' } : { color: '#64748B' }
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.webSidebarFooter}>
          <TouchableOpacity 
            style={styles.webSidebarProfile}
            onPress={() => {
              navigation.navigate('Profile');
            }}
          >
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.webSidebarAvatar} />
            ) : (
              <View style={styles.webSidebarAvatarPlaceholder}>
                <User size={16} color="#94A3B8" />
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.webSidebarName} numberOfLines={1}>
                {profile?.display_name || 'Creator Account'}
              </Text>
              <Text style={styles.webSidebarIndustry} numberOfLines={1}>
                {profile?.niche_industry || 'Creator'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.webSidebarLogout}
            onPress={() => {
              const confirmed = window.confirm('Are you sure you want to log out?');
              if (confirmed) {
                supabase.auth.signOut();
              }
            }}
          >
            <Text style={styles.webSidebarLogoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.mobileTabBar, { height: 60 + insets.bottom, paddingBottom: insets.bottom + 8 }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const renderIcon = () => {
          const iconColor = isFocused ? creatorColor : '#9CA3AF';
          if (label === 'Opportunities') return <Briefcase size={22} color={iconColor} />;
          if (label === 'Workspace') return <Inbox size={22} color={iconColor} />;
          if (label === 'Earnings') return <Wallet size={22} color={iconColor} />;
          return <User size={22} color={iconColor} />;
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.mobileTabItem}
          >
            {renderIcon()}
            <Text style={[styles.mobileTabLabel, { color: isFocused ? creatorColor : '#9CA3AF' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const InfluencerTabs = () => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      sceneContainerStyle={{
        paddingLeft: isDesktop ? 260 : 0,
        backgroundColor: '#FFFFFF',
      }}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Opportunities" 
        component={OpportunitiesScreen} 
      />
      <Tab.Screen 
        name="Workspace" 
        component={InfluencerDashboard} 
      />
      <Tab.Screen 
        name="Earnings" 
        component={EarningsScreen} 
      />
      <Tab.Screen 
        name="Profile" 
        component={CreatorProfileScreen} 
      />
    </Tab.Navigator>
  );
};

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

const styles = StyleSheet.create({
  webSidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    zIndex: 9999,
  },
  webSidebarHeader: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  webSidebarLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  webSidebarRole: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  webSidebarMenu: {
    gap: 8,
  },
  webSidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    backgroundColor: 'transparent',
  },
  webSidebarItemActive: {
    backgroundColor: '#F1F5F9',
  },
  webSidebarLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  webSidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
    gap: 16,
  },
  webSidebarProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  webSidebarAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  webSidebarAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webSidebarName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  webSidebarIndustry: {
    fontSize: 12,
    color: '#64748B',
  },
  webSidebarLogout: {
    paddingVertical: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webSidebarLogoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  mobileTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  mobileTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileTabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});

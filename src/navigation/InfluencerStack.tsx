import React, { useState } from 'react';
import { View, useWindowDimensions, Platform, StyleSheet, TouchableOpacity, Image, Text, Modal, TextInput, Pressable } from 'react-native';
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
import { OpportunitiesScreen } from '@/screens/influencer/OpportunitiesScreen';
import { MessagesScreen } from '@/screens/influencer/MessagesScreen';
import { CampaignWorkspaceScreen } from '@/screens/influencer/CampaignWorkspaceScreen';
import { SupportModal } from '@/components/SupportModal';
import { 
  Inbox, User, Briefcase, Wallet, Search, 
  Settings, Bell, LogOut, X, Star,
  Zap, PanelLeftClose, PanelLeftOpen,
  Home, MessageCircle, Headphones
} from 'lucide-react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useProfile } from '@/lib/ProfileContext';
import { supabase } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomTabBar = ({ state, descriptors, navigation, isExpanded, setIsExpanded }: any) => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const { profile } = useProfile();
  
  const userColors = profile?.brand_color ? profile.brand_color.split(',') : ['#10B981'];
  const creatorColor = userColors[0] || '#10B981';

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (isDesktop) {
    const sidebarWidth = isExpanded ? 240 : 64;

    return (
      <View style={[styles.webSidebar, { width: sidebarWidth }]}>
        {/* Click-outside overlay to close menu */}
        {isMenuOpen && (
          <Pressable
            style={{ position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}
            onPress={() => setIsMenuOpen(false)}
          />
        )}

        <View style={{ zIndex: 200, flex: 1, justifyContent: 'space-between' }}>
          {/* ─── TOP: Logo + Toggle ─── */}
          <View>
            <View style={[
              styles.sidebarHeader,
              !isExpanded && styles.sidebarHeaderCollapsed
            ]}>
              {isExpanded ? (
                <>
                  <Text style={styles.webSidebarLogo}>MODUS</Text>
                  <TouchableOpacity
                    style={styles.toggleBtn}
                    onPress={() => { setIsExpanded(false); setIsMenuOpen(false); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <PanelLeftClose size={20} color="#94A3B8" strokeWidth={2.5} />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.toggleBtnCollapsed}
                  onPress={() => setIsExpanded(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <PanelLeftOpen size={20} color="#64748B" strokeWidth={2.5} />
                </TouchableOpacity>
              )}
            </View>

            {/* ─── Navigation Menu ─── */}
            <View style={styles.webSidebarMenu}>
              {/* Tab Routes */}
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
                  if (label === 'Home') return <Home size={18} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />;
                  if (label === 'Find Work') return <Search size={18} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />;
                  if (label === 'My Campaigns') return <Briefcase size={18} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />;
                  if (label === 'Earnings') return <Wallet size={18} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />;
                  return <Zap size={18} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />;
                };

                return (
                  <TouchableOpacity
                    key={route.key}
                    onPress={onPress}
                    style={[
                      styles.webSidebarItem,
                      isFocused && styles.webSidebarItemActive,
                      !isExpanded && styles.webSidebarItemCollapsed,
                      isFocused && !isExpanded && styles.webSidebarItemActiveCollapsed,
                    ]}
                  >
                    {renderIcon()}
                    {isExpanded && (
                      <Text style={[
                        styles.webSidebarLabel,
                        isFocused && { color: '#0F172A', fontWeight: '700' }
                      ]}>
                        {label}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ─── BOTTOM: Profile + Dropdown Actions ─── */}
          <View style={styles.webSidebarFooter}>

            {/* Profile action menu (slides up from footer, closes on outside click) */}
            {isMenuOpen && isExpanded && (
              <View style={styles.quickMenu}>
                <TouchableOpacity style={styles.quickMenuItem} onPress={() => { setIsMenuOpen(false); navigation.navigate('Profile'); }}>
                  <Star size={15} color="#475569" strokeWidth={2} />
                  <Text style={styles.quickMenuText}>Live Media Kit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickMenuItem} onPress={() => { setIsMenuOpen(false); navigation.navigate('Settings'); }}>
                  <Settings size={15} color="#475569" strokeWidth={2} />
                  <Text style={styles.quickMenuText}>Settings</Text>
                </TouchableOpacity>
                <View style={styles.quickMenuDivider} />
                <TouchableOpacity style={styles.quickMenuItem} onPress={() => {
                  setIsMenuOpen(false);
                  const confirmed = window.confirm('Are you sure you want to log out?');
                  if (confirmed) supabase.auth.signOut();
                }}>
                  <LogOut size={15} color="#EF4444" strokeWidth={2} />
                  <Text style={[styles.quickMenuText, { color: '#EF4444' }]}>Log Out</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Profile Row */}
            <TouchableOpacity
              style={[styles.profileRow, !isExpanded && styles.profileRowCollapsed]}
              onPress={() => isExpanded && setIsMenuOpen(!isMenuOpen)}
              activeOpacity={0.7}
            >
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.profileAvatar} />
              ) : (
                <View style={styles.profileAvatarPlaceholder}>
                  <User size={14} color="#94A3B8" />
                </View>
              )}
              {isExpanded && (
                <Text style={styles.profileName} numberOfLines={1}>
                  {profile?.display_name || 'Creator'}
                </Text>
              )}
              {isExpanded && (
                <View style={styles.profileMenuDot}>
                  <View style={styles.profileMenuDotInner} />
                  <View style={styles.profileMenuDotInner} />
                  <View style={styles.profileMenuDotInner} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Mobile Bottom Tab Bar
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.mobileTabBar, { height: 60 + insets.bottom, paddingBottom: insets.bottom + 8 }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;
        const creatorColor = '#10B981';

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
          if (label === 'Home') return <Home size={22} color={iconColor} />;
          if (label === 'Find Work') return <Search size={22} color={iconColor} />;
          if (label === 'My Campaigns') return <Briefcase size={22} color={iconColor} />;
          if (label === 'Earnings') return <Wallet size={22} color={iconColor} />;
          return <Zap size={22} color={iconColor} />;
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
  const [isExpanded, setIsExpanded] = useState(true);
  const navigation = useNavigation<any>();

  const paddingLeft = isDesktop ? (isExpanded ? 240 : 64) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Global TopBar */}
      <View style={{
        position: 'absolute',
        top: 0,
        right: 0,
        left: paddingLeft,
        height: 64,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 24,
        zIndex: 50,
        pointerEvents: 'box-none'
      }}>
        <View style={{ flexDirection: 'row', gap: 16, pointerEvents: 'auto', paddingTop: 16 }}>
          <TouchableOpacity 
            style={styles.topBarBtn}
            onPress={() => navigation.navigate('Messages')}
          >
            <MessageCircle size={20} color="#475569" strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.topBarBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell size={20} color="#475569" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />}
        sceneContainerStyle={{
          paddingLeft,
          backgroundColor: '#F8FAFC', // light grey background
        }}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Dashboard" 
          options={{ title: 'Home' }}
          component={InfluencerDashboard} 
        />
        <Tab.Screen 
          name="Opportunities" 
          options={{ title: 'Find Work' }}
          component={OpportunitiesScreen} 
        />
        <Tab.Screen 
          name="Pipeline" 
          options={{ title: 'My Campaigns' }}
          component={PipelineScreen} 
        />
        <Tab.Screen 
          name="Earnings" 
          options={{ title: 'Earnings' }}
          component={EarningsScreen} 
        />
      </Tab.Navigator>
    </View>
  );
};

export const InfluencerStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InfluencerTabs" component={InfluencerTabs} />
      <Stack.Screen name="Profile" component={CreatorProfileScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="OfferReview" component={OfferReviewScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="PublicMediaKit" component={PublicMediaKitScreen} />
      <Stack.Screen name="CampaignWorkspace" component={CampaignWorkspaceScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  webSidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingVertical: 20,
    justifyContent: 'space-between',
    zIndex: 9999,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 28,
    height: 36,
  },
  sidebarHeaderCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  toggleBtn: {
    padding: 4,
    borderRadius: 6,
  },
  toggleBtnCollapsed: {
    padding: 4,
    borderRadius: 6,
    alignSelf: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  profileRowCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  profileAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  profileAvatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  profileMenuDot: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  profileMenuDotInner: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  quickMenu: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    padding: 6,
  },
  quickMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 10,
  },
  quickMenuText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  quickMenuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  webSidebarMenu: {
    gap: 2,
    paddingHorizontal: 10,
  },
  webSidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 9,
    gap: 11,
    backgroundColor: 'transparent',
  },
  webSidebarItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginHorizontal: 8,
    paddingVertical: 11,
  },
  webSidebarItemActive: {
    backgroundColor: '#F1F5F9',
  },
  webSidebarItemActiveCollapsed: {
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
  },
  webSidebarLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  webSidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  webSidebarLogo: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
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
  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  }
});

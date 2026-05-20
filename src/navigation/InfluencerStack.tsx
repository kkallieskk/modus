import React, { useState } from 'react';
import { View, useWindowDimensions, Platform, StyleSheet, TouchableOpacity, Image, Text, Modal, TextInput } from 'react-native';
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
import { 
  Inbox, User, Briefcase, Wallet, Search, 
  ChevronDown, Settings, Info, Bell, LogOut, X,
  Menu, ChevronLeft, Zap
} from 'lucide-react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useProfile } from '@/lib/ProfileContext';
import { supabase } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomTabBar = ({ state, descriptors, navigation, isExpanded, setIsExpanded }: any) => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const { profile } = useProfile();
  
  // Custom theme colors processing
  const userColors = profile?.brand_color ? profile.brand_color.split(',') : ['#10B981'];
  const creatorColor = userColors[0] || '#10B981';

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (isDesktop) {
    const sidebarWidth = isExpanded ? 260 : 80;

    return (
      <View style={[styles.webSidebar, { width: sidebarWidth }]}>
        <View style={{ zIndex: 10 }}>
          {/* Top Profile Section */}
          <TouchableOpacity 
            style={[styles.webSidebarProfile, !isExpanded && { justifyContent: 'center' }]}
            onPress={() => isExpanded && setIsDropdownOpen(!isDropdownOpen)}
          >
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.webSidebarAvatar} />
            ) : (
              <View style={styles.webSidebarAvatarPlaceholder}>
                <User size={16} color="#94A3B8" />
              </View>
            )}
            
            {isExpanded && (
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.webSidebarName} numberOfLines={1}>
                  {profile?.display_name || 'Creator Account'}
                </Text>
                <Text style={styles.webSidebarIndustry} numberOfLines={1}>
                  {profile?.niche_industry || 'Creator'}
                </Text>
              </View>
            )}
            {isExpanded && <ChevronDown size={16} color="#64748B" />}
          </TouchableOpacity>

          {/* Profile Dropdown */}
          {isExpanded && isDropdownOpen && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setIsDropdownOpen(false); navigation.navigate('Settings'); }}>
                <Settings size={16} color="#475569" />
                <Text style={styles.dropdownItemText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setIsDropdownOpen(false); navigation.navigate('Notifications'); }}>
                <Bell size={16} color="#475569" />
                <Text style={styles.dropdownItemText}>Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => setIsDropdownOpen(false)}>
                <Info size={16} color="#475569" />
                <Text style={styles.dropdownItemText}>About Modus</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dropdownItem, { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8, marginTop: 4 }]} 
                onPress={() => {
                  setIsDropdownOpen(false);
                  const confirmed = window.confirm('Are you sure you want to log out?');
                  if (confirmed) supabase.auth.signOut();
                }}
              >
                <LogOut size={16} color="#EF4444" />
                <Text style={[styles.dropdownItemText, { color: '#EF4444' }]}>Log Out</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Expand / Collapse Toggle */}
          <TouchableOpacity 
            style={[styles.toggleBtn, !isExpanded && { alignSelf: 'center', marginLeft: 0 }]} 
            onPress={() => { setIsExpanded(!isExpanded); setIsDropdownOpen(false); }}
          >
            {isExpanded ? <ChevronLeft size={16} color="#64748B" /> : <Menu size={20} color="#64748B" />}
          </TouchableOpacity>

          {/* Navigation Menu */}
          <View style={styles.webSidebarMenu}>
            {/* Search (Custom Action) */}
            <TouchableOpacity
              onPress={() => setIsSearchOpen(true)}
              style={[styles.webSidebarItem, !isExpanded && { justifyContent: 'center', paddingHorizontal: 0 }]}
            >
              <Search size={20} color="#64748B" />
              {isExpanded && <Text style={styles.webSidebarLabel}>Search</Text>}
            </TouchableOpacity>

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
                if (label === 'Dashboard') return <Briefcase size={20} color={iconColor} />;
                if (label === 'Workspace') return <Inbox size={20} color={iconColor} />;
                if (label === 'Earnings') return <Wallet size={20} color={iconColor} />;
                return <Zap size={20} color={iconColor} />;
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  style={[
                    styles.webSidebarItem,
                    isFocused && styles.webSidebarItemActive,
                    !isExpanded && { justifyContent: 'center', paddingHorizontal: 0 }
                  ]}
                >
                  {renderIcon()}
                  {isExpanded && (
                    <Text
                      style={[
                        styles.webSidebarLabel,
                        isFocused ? { color: '#0F172A', fontWeight: '700' } : { color: '#64748B' }
                      ]}
                    >
                      {label}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bottom Branding */}
        <View style={[styles.webSidebarFooter, !isExpanded && { alignItems: 'center' }]}>
          <Text style={isExpanded ? styles.webSidebarLogo : styles.webSidebarLogoSmall}>
            {isExpanded ? 'MODUS' : 'M'}
          </Text>
        </View>

        {/* Search Modal */}
        <Modal visible={isSearchOpen} transparent animationType="fade">
          <View style={styles.searchOverlay}>
            <View style={styles.searchModal}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color="#9CA3AF" />
                <TextInput 
                  placeholder="Search campaigns, brands, or help..."
                  style={styles.searchInput}
                  autoFocus
                  {...(Platform.OS === 'web' ? { style: [styles.searchInput, { outlineWidth: 0 }] } : {})}
                />
                <TouchableOpacity onPress={() => setIsSearchOpen(false)}>
                  <X size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
          if (label === 'Dashboard') return <Briefcase size={22} color={iconColor} />;
          if (label === 'Workspace') return <Inbox size={22} color={iconColor} />;
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

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />}
      sceneContainerStyle={{
        paddingLeft: isDesktop ? (isExpanded ? 260 : 80) : 0,
        backgroundColor: '#FFFFFF',
      }}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={InfluencerDashboard} 
      />
      <Tab.Screen 
        name="Workspace" 
        component={OpportunitiesScreen} 
      />
      <Tab.Screen 
        name="Earnings" 
        component={EarningsScreen} 
      />
    </Tab.Navigator>
  );
};

export const InfluencerStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InfluencerTabs" component={InfluencerTabs} />
      <Stack.Screen name="Profile" component={CreatorProfileScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="OfferReview" component={OfferReviewScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="PublicMediaKit" component={PublicMediaKitScreen} />
      <Stack.Screen name="Pipeline" component={PipelineScreen} />
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
    paddingVertical: 24,
    justifyContent: 'space-between',
    zIndex: 9999,
  },
  webSidebarProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
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
    backgroundColor: '#E2E8F0',
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
  dropdownMenu: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    padding: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  toggleBtn: {
    marginLeft: 16,
    marginBottom: 24,
    padding: 8,
    alignSelf: 'flex-start',
  },
  webSidebarMenu: {
    gap: 4,
    paddingHorizontal: 12,
  },
  webSidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 12,
    backgroundColor: 'transparent',
  },
  webSidebarItemActive: {
    backgroundColor: '#F1F5F9',
  },
  webSidebarLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  webSidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  webSidebarLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
  },
  webSidebarLogoSmall: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
  },
  searchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
  },
  searchModal: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#0F172A',
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

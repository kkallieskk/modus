import { TouchableOpacity, Image, View, Text, useWindowDimensions, Platform, StyleSheet } from 'react-native';
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

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const { profile } = useProfile();
  const brandColor = profile?.brand_color || '#8B5CF6';

  if (isDesktop) {
    return (
      <View style={styles.webSidebar}>
        <View>
          <TouchableOpacity style={styles.webSidebarHeader} onPress={() => navigation.navigate('RosterTab')}>
            <Text style={styles.webSidebarLogo}>MODUS</Text>
            <Text style={styles.webSidebarRole}>Brand Portal</Text>
          </TouchableOpacity>

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
                const iconColor = isFocused ? brandColor : '#64748B';
                if (label === 'Roster') return <Users size={20} color={iconColor} />;
                if (label === 'Workspace') return <LayoutGrid size={20} color={iconColor} />;
                if (label === 'Vault') return <FolderOpen size={20} color={iconColor} />;
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
              navigation.navigate('RosterTab', { screen: 'BrandProfile' });
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
                {profile?.display_name || 'Brand Account'}
              </Text>
              <Text style={styles.webSidebarIndustry} numberOfLines={1}>
                {profile?.industry || 'Portal'}
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
          const iconColor = isFocused ? brandColor : '#9CA3AF';
          if (label === 'Roster') return <Users size={22} color={iconColor} />;
          if (label === 'Workspace') return <LayoutGrid size={22} color={iconColor} />;
          if (label === 'Vault') return <FolderOpen size={22} color={iconColor} />;
          return <User size={22} color={iconColor} />;
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.mobileTabItem}
          >
            {renderIcon()}
            <Text style={[styles.mobileTabLabel, { color: isFocused ? brandColor : '#9CA3AF' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const BrandStack = () => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  return (
    <BottomTab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      sceneContainerStyle={{
        paddingLeft: isDesktop ? 260 : 0,
        backgroundColor: '#FFFFFF',
      }}
      screenOptions={{
        headerShown: false,
      }}
    >
      <BottomTab.Screen 
        name="RosterTab" 
        component={DashboardPager} 
        options={{
          title: 'Roster',
        }}
      />
      <BottomTab.Screen 
        name="WorkspaceTab" 
        component={ActiveStack} 
        options={{
          title: 'Workspace',
        }}
      />
      <BottomTab.Screen 
        name="VaultTab" 
        component={BrandVaultScreen} 
        options={{
          title: 'Vault',
        }}
      />
    </BottomTab.Navigator>
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

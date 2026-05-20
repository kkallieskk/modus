import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  RefreshControl,
  Platform,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';
import { Link, TrendingUp, Users, Inbox, Search, CheckCircle2, ChevronRight, AlertTriangle, Clock, Copy, Instagram, Youtube, ExternalLink } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from '@/lib/ProfileContext';

type Campaign = {
  id: string;
  campaign_id: string;
  creator_id: string;
  status: 'pending' | 'accepted' | 'pending_review' | 'completed' | 'rejected' | 'revision_requested';
  created_at: string;
  campaigns: {
    title: string;
    brand_guidelines: string;
    budget: number;
    profiles: {
      display_name: string;
    };
  };
};

export const InfluencerDashboard = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 1024;
  const { profile } = useProfile();
  
  const [activeTab, setActiveTab] = useState<'new' | 'active'>('new');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userColors = profile?.brand_color ? profile.brand_color.split(',') : ['#10B981'];
  const creatorColor = userColors[0] || '#10B981';

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('campaign_offers')
        .select(`
          *,
          campaigns (
            title,
            brand_guidelines,
            budget,
            profiles:brand_id (display_name)
          )
        `)
        .eq('creator_id', user.id);

      if (activeTab === 'new') {
        query = query.eq('status', 'pending');
      } else {
        query = query.in('status', ['accepted', 'revision_requested', 'pending_review']);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching influencer data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAction = async (offerId: string, newStatus: 'accepted' | 'rejected') => {
    setCampaigns(campaigns.filter(c => c.id !== offerId));
    const { error } = await supabase
      .from('campaign_offers')
      .update({ status: newStatus })
      .eq('id', offerId);

    if (error) {
      fetchData();
      Alert.alert('Error', 'Action failed');
    } else if (newStatus === 'accepted') {
      Alert.alert('Deal Accepted!', 'This deal is now in your Active tab.');
    }
  };

  const copyMediaKitLink = async () => {
    if (!profile?.username) {
      Alert.alert('Profile Incomplete', 'Please set up your username in settings first.');
      return;
    }
    const url = `https://modus.app/${profile.username}`;
    await Clipboard.setStringAsync(url);
    if (Platform.OS === 'web') {
      window.alert('Media Kit link copied to clipboard!');
    } else {
      Alert.alert('Copied!', 'Media Kit link copied to clipboard.');
    }
  };

  // --- Components for Quadrants ---

  // 1. Live Media Kit (Top Left)
  const LiveMediaKit = () => (
    <View className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex-1">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-900">Live Media Kit</Text>
        <Link size={20} color="#9CA3AF" />
      </View>
      <Text className="text-gray-500 mb-6 text-sm">
        Send this link to brands via DM or Email to showcase your portfolio and rates.
      </Text>
      
      <View className="bg-gray-50 p-4 rounded-2xl mb-6 flex-row items-center border border-gray-200">
        <View className="w-12 h-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
             <View className="flex-1 justify-center items-center bg-gray-300">
               <Text className="font-bold text-gray-500">{(profile?.display_name || 'U')[0]}</Text>
             </View>
          )}
        </View>
        <View className="flex-1">
          <Text className="font-bold text-gray-900">{profile?.display_name || 'Creator'}</Text>
          <Text className="text-gray-500 text-xs">modus.app/{profile?.username || 'username'}</Text>
        </View>
        <ExternalLink size={16} color="#9CA3AF" />
      </View>

      <TouchableOpacity 
        onPress={copyMediaKitLink}
        className="h-14 rounded-xl flex-row items-center justify-center mt-auto"
        style={{ backgroundColor: creatorColor }}
      >
        <Copy size={20} color="#FFF" className="mr-2" />
        <Text className="text-white font-bold text-lg">Copy Media Kit Link</Text>
      </TouchableOpacity>
    </View>
  );

  // 2. Market Radar (Top Right)
  const MarketRadar = () => (
    <View className="bg-gray-900 p-6 rounded-3xl shadow-sm flex-1">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-lg font-bold text-white">Market Radar</Text>
        <TrendingUp size={20} color="#34D399" />
      </View>
      
      <View className="mb-6">
        <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Trending on Modus</Text>
        <View className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <Text className="text-white font-bold mb-1">Top-hiring Niche:</Text>
          <Text className="text-green-400 text-lg font-black">FinTech Apps</Text>
        </View>
      </View>

      <View>
        <Text className="text-gray-400 text-xs font-bold uppercase mb-2">High Demand Formats</Text>
        <View className="flex-row flex-wrap gap-2">
          <View className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
            <Text className="text-gray-200 font-medium text-sm">YouTube Shorts</Text>
          </View>
          <View className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
            <Text className="text-gray-200 font-medium text-sm">UGC Ad Creatives</Text>
          </View>
          <View className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
            <Text className="text-gray-200 font-medium text-sm">Tech Reviews</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // 3. Live Social Audit (Bottom Left)
  const LiveSocialAudit = () => (
    <View className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex-1">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-lg font-bold text-gray-900">Live Social Audit</Text>
        <Users size={20} color="#6366F1" />
      </View>

      <View className="gap-y-4">
        {/* Instagram Mock */}
        <View className="flex-row items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <View className="w-10 h-10 rounded-full bg-pink-100 items-center justify-center mr-4">
            <Instagram size={20} color="#E1306C" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs font-semibold mb-0.5">Instagram Audience</Text>
            <Text className="text-gray-900 font-black text-lg">124.5K <Text className="text-sm font-medium text-green-500 ml-1">+2.4%</Text></Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-400 text-xs font-semibold mb-0.5">Engagement</Text>
            <Text className="text-gray-900 font-bold">4.8%</Text>
          </View>
        </View>

        {/* YouTube Mock */}
        <View className="flex-row items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
            <Youtube size={20} color="#FF0000" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs font-semibold mb-0.5">YouTube Subscribers</Text>
            <Text className="text-gray-900 font-black text-lg">89.2K <Text className="text-sm font-medium text-green-500 ml-1">+1.1%</Text></Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-400 text-xs font-semibold mb-0.5">Avg Views</Text>
            <Text className="text-gray-900 font-bold">45K</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // 4. Inbox & Offers (Bottom Right)
  const InboxOffers = () => {
    const renderNewOffer = ({ item }: { item: Campaign }) => (
      <View className="bg-white p-5 rounded-2xl mb-3 border border-gray-200">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 pr-4">
            <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Incoming</Text>
            <Text className="font-bold text-gray-900">{item.campaigns?.profiles?.display_name}</Text>
          </View>
          <Text className="text-green-600 font-bold">₹{item.campaigns?.budget?.toLocaleString()}</Text>
        </View>
        <Text className="text-gray-700 text-sm font-medium mb-3">{item.campaigns?.title}</Text>
        <View className="flex-row gap-x-2">
          <TouchableOpacity onPress={() => handleAction(item.id, 'accepted')} className="flex-1 bg-black h-10 rounded-lg items-center justify-center"><Text className="text-white font-bold text-sm">Accept</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handleAction(item.id, 'rejected')} className="flex-1 bg-gray-100 h-10 rounded-lg items-center justify-center"><Text className="text-gray-600 font-bold text-sm">Decline</Text></TouchableOpacity>
        </View>
      </View>
    );

    const renderActiveDeal = ({ item }: { item: Campaign }) => (
      <TouchableOpacity 
        onPress={() => navigation.navigate('JobDetail', { offerId: item.id })}
        className="bg-white p-5 rounded-2xl mb-3 border border-gray-200"
      >
        <View className="flex-row justify-between items-start mb-2">
          <Text className="font-bold text-gray-900">{item.campaigns?.profiles?.display_name}</Text>
          <View className="bg-blue-50 px-2 py-0.5 rounded-full">
            <Text className="text-blue-600 font-bold text-[10px] uppercase">{item.status.replace('_', ' ')}</Text>
          </View>
        </View>
        <Text className="text-gray-600 text-sm mb-3" numberOfLines={1}>{item.campaigns?.title}</Text>
        <View className="flex-row items-center justify-between border-t border-gray-100 pt-3 mt-1">
          <View className="flex-row items-center">
            <CheckCircle2 size={14} color="#059669" />
            <Text className="text-green-600 text-xs font-bold ml-1">Escrow Funded</Text>
          </View>
          <ChevronRight size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );

    return (
      <View className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm flex-1 flex flex-col">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-bold text-gray-900">Inbox</Text>
          <View className="flex-row bg-gray-200 p-1 rounded-xl">
            <TouchableOpacity onPress={() => setActiveTab('new')} className={`px-4 py-1.5 rounded-lg ${activeTab === 'new' ? 'bg-white shadow-sm' : ''}`}>
              <Text className={`text-sm font-bold ${activeTab === 'new' ? 'text-gray-900' : 'text-gray-500'}`}>New</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('active')} className={`px-4 py-1.5 rounded-lg ${activeTab === 'active' ? 'bg-white shadow-sm' : ''}`}>
              <Text className={`text-sm font-bold ${activeTab === 'active' ? 'text-gray-900' : 'text-gray-500'}`}>Active</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center py-10"><ActivityIndicator size="small" color="#000" /></View>
        ) : campaigns.length > 0 ? (
          <FlatList
            data={campaigns}
            keyExtractor={(item) => item.id}
            renderItem={activeTab === 'new' ? renderNewOffer : renderActiveDeal}
            showsVerticalScrollIndicator={false}
            className="flex-1"
          />
        ) : (
          <View className="flex-1 items-center justify-center py-12">
            <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-4 shadow-sm">
              <Inbox size={24} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-base mb-2">Your inbox is primed</Text>
            <Text className="text-gray-500 text-center text-sm mb-6 max-w-[200px]">
              No {activeTab === 'new' ? 'new offers' : 'active deals'} right now. Brands will reach out here.
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Workspace')}
              className="bg-black px-6 py-3 rounded-xl flex-row items-center"
            >
              <Search size={16} color="#FFF" className="mr-2" />
              <Text className="text-white font-bold text-sm">Browse Campaigns</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView 
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingTop: 32,
          paddingBottom: 40,
          maxWidth: isDesktop ? 1200 : undefined,
          width: isDesktop ? '100%' : undefined,
          alignSelf: isDesktop ? 'center' : undefined,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={{ fontSize: 28, fontWeight: '900', color: '#000', letterSpacing: -0.5, marginBottom: 24 }}>
          Dashboard
        </Text>

        {isDesktop ? (
          <View style={{ flex: 1, gap: 24 }}>
            {/* Top Row */}
            <View style={{ flexDirection: 'row', gap: 24, minHeight: 320 }}>
              <View style={{ flex: 1 }}><LiveMediaKit /></View>
              <View style={{ flex: 1 }}><MarketRadar /></View>
            </View>
            {/* Bottom Row */}
            <View style={{ flexDirection: 'row', gap: 24, minHeight: 400 }}>
              <View style={{ flex: 1 }}><LiveSocialAudit /></View>
              <View style={{ flex: 1 }}><InboxOffers /></View>
            </View>
          </View>
        ) : (
          <View style={{ gap: 20 }}>
            <LiveMediaKit />
            <MarketRadar />
            <LiveSocialAudit />
            {/* Fixed height for Inbox in scrollview on mobile to allow scrolling inside or just disable inner scrolling */}
            <View style={{ height: 450 }}>
              <InboxOffers />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

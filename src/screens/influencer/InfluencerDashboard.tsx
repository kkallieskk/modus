import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { Inbox, CheckCircle2, XCircle, Send, Link, AlertTriangle, Upload, FileVideo, Check, ChevronRight, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

type Campaign = {
  id: string;
  campaign_id: string;
  creator_id: string;
  status: 'pending' | 'accepted' | 'pending_review' | 'completed' | 'rejected' | 'revision_requested';
  deliverable_url?: string;
  revision_notes?: string;
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
  const [activeTab, setActiveTab] = useState<'new' | 'active'>('new');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Upload State
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{[key: string]: {uri: string, type: string}}>({});

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
      Alert.alert('Error', 'Failed to load deals');
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

  const pickMedia = async (dealId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Support images and videos
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedMedia({
        ...selectedMedia,
        [dealId]: { 
          uri: result.assets[0].uri, 
          type: result.assets[0].type || 'image' 
        }
      });
    }
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

  const handleSubmitDeliverable = async (dealId: string) => {
    const media = selectedMedia[dealId];
    if (!media) {
      Alert.alert('No File Selected', 'Please upload your deliverable first.');
      return;
    }

    try {
      setUploadingId(dealId);
      
      // 1. Upload to Supabase Storage
      const response = await fetch(media.uri);
      const blob = await response.blob();
      const fileExt = media.uri.split('.').pop();
      const fileName = `${dealId}/${Date.now()}.${fileExt}`;
      const filePath = `deliverables/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('modus-assets')
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('modus-assets')
        .getPublicUrl(filePath);

      // 3. Update campaign_offers table
      const { error: updateError } = await supabase
        .from('campaign_offers')
        .update({ 
          status: 'pending_review',
          deliverable_url: publicUrl
        })
        .eq('id', dealId);

      if (updateError) throw updateError;

      Alert.alert('Success', 'Deliverable uploaded and sent for verification.');
      setCampaigns(campaigns.filter(c => c.id !== dealId));
    } catch (err: any) {
      console.error('Upload error:', err);
      Alert.alert('Upload Failed', err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const renderNewOffer = ({ item }: { item: Campaign }) => (
    <View className="bg-white p-6 rounded-3xl mb-4 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Incoming From</Text>
          <Text className="text-xl font-bold text-black">{item.campaigns?.profiles?.display_name}</Text>
        </View>
        <View className="bg-green-50 px-3 py-1 rounded-lg">
          <Text className="text-green-600 font-bold">₹{item.campaigns?.budget?.toLocaleString()}</Text>
        </View>
      </View>
      <Text className="text-black font-bold text-base mb-2">{item.campaigns?.title}</Text>
      <Text className="text-gray-600 text-sm mb-6 leading-5" numberOfLines={3}>{item.campaigns?.brand_guidelines}</Text>
      <View className="flex-row">
        <TouchableOpacity onPress={() => handleAction(item.id, 'accepted')} className="flex-1 bg-black h-12 rounded-xl flex-row items-center justify-center mr-2"><Text className="text-white font-bold">Accept</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleAction(item.id, 'rejected')} className="flex-1 bg-gray-100 h-12 rounded-xl items-center justify-center"><Text className="text-gray-500 font-bold">Decline</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderActiveDeal = ({ item }: { item: Campaign }) => {
    const getStatusLabel = (status: string) => {
      switch(status) {
        case 'accepted': return 'Ready to Shoot';
        case 'pending_review': return 'In Review';
        case 'revision_requested': return 'Revision Requested';
        default: return status;
      }
    };

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('JobDetail', { offerId: item.id })}
        className={`bg-white p-6 rounded-3xl mb-4 border ${item.status === 'revision_requested' ? 'border-orange-200' : 'border-gray-100'} shadow-sm`}
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Collaboration with</Text>
            <Text className="text-xl font-bold text-black">{item.campaigns?.profiles?.display_name}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full flex-row items-center ${
            item.status === 'revision_requested' ? 'bg-orange-50' : 
            item.status === 'pending_review' ? 'bg-blue-50' : 'bg-green-50'
          }`}>
            {item.status === 'revision_requested' ? (
              <AlertTriangle size={12} color="#F97316" />
            ) : (
              <Clock size={12} color={item.status === 'pending_review' ? '#3B82F6' : '#059669'} />
            )}
            <Text className={`font-bold text-[10px] ml-1 uppercase ${
              item.status === 'revision_requested' ? 'text-orange-600' : 
              item.status === 'pending_review' ? 'text-blue-600' : 'text-green-600'
            }`}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <Text className="text-black font-bold text-base mb-1">{item.campaigns?.title}</Text>
        <Text className="text-gray-600 text-sm mb-4 leading-5" numberOfLines={2}>
          {item.campaigns?.brand_guidelines}
        </Text>

        <View className="flex-row items-center justify-between border-t border-gray-50 pt-4">
          <View className="flex-row items-center">
            <CheckCircle2 size={16} color="#059669" />
            <Text className="text-green-600 text-xs font-bold ml-2">Escrow Funded</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-blue-600 text-xs font-bold mr-1">Open Workspace</Text>
            <ChevronRight size={16} color="#3B82F6" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 60 }}>
      <View className="mb-6">
        <Text style={{ fontSize: 28, fontWeight: '900', color: '#000', letterSpacing: -0.5 }}>Collaboration Hub</Text>
        <Text className="text-gray-500 mt-1">Manage your active campaigns and brand deals</Text>
      </View>

      <View className="flex-row bg-gray-200 p-1 rounded-2xl mb-6">
        <TouchableOpacity onPress={() => setActiveTab('new')} className="flex-1 py-3 rounded-xl items-center" style={{ backgroundColor: activeTab === 'new' ? 'white' : 'transparent' }}><Text className={`font-bold ${activeTab === 'new' ? 'text-black' : 'text-gray-500'}`}>New Offers</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('active')} className="flex-1 py-3 rounded-xl items-center" style={{ backgroundColor: activeTab === 'active' ? 'white' : 'transparent' }}><Text className={`font-bold ${activeTab === 'active' ? 'text-black' : 'text-gray-500'}`}>Active Deals</Text></TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#000" /></View>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === 'new' ? renderNewOffer : renderActiveDeal}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<View className="flex-1 items-center justify-center pt-20"><Text className="text-gray-400 text-center">{activeTab === 'new' ? 'No new offers yet' : 'No active deals found'}</Text></View>}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
};

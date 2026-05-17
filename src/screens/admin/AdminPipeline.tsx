import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { DollarSign, Send, X, Briefcase, ExternalLink, CheckCircle, RotateCcw, ShieldCheck } from 'lucide-react-native';

type Campaign = {
  id: string;
  brand_id: string;
  brand_guidelines: string;
  budget: number;
  creator_payout: number;
  status: string;
  escrow_status: 'unfunded' | 'funded' | 'released';
  deliverable_url?: string;
  revision_notes?: string;
  created_at: string;
  profiles: {
    display_name: string;
  };
};

export const AdminPipeline = () => {
  const [activeTab, setActiveTab] = useState<'negotiation' | 'verification'>('negotiation');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal States
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [payout, setPayout] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revision Modal State
  const [isRevisionModalVisible, setIsRevisionModalVisible] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [campaignToRevise, setCampaignToRevise] = useState<Campaign | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === 'negotiation' ? 'pending_admin' : 'submitted';
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*, profiles:brand_id(display_name)')
        .eq('status', statusFilter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching pipeline:', err);
      Alert.alert('Error', 'Failed to fetch deal pipeline');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCampaigns();
  };

  const handleApprove = async () => {
    if (!selectedCampaign) return;

    const payoutNum = parseFloat(payout);
    if (isNaN(payoutNum) || payoutNum <= 0) {
      Alert.alert('Invalid Payout', 'Please enter a valid payout amount.');
      return;
    }

    if (payoutNum >= selectedCampaign.budget) {
      Alert.alert('Invalid Payout', 'Creator payout must be less than the total brand budget.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('campaigns')
        .update({
          creator_payout: payoutNum,
          status: 'pending_influencer',
        })
        .eq('id', selectedCampaign.id);

      if (error) throw error;

      Alert.alert('Success', 'Offer sent to creator!');
      setCampaigns(campaigns.filter(c => c.id !== selectedCampaign.id));
      setSelectedCampaign(null);
      setPayout('');
    } catch (err) {
      Alert.alert('Error', 'Failed to approve deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteDeal = async (campaignId: string) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: 'completed',
          escrow_status: 'released' // Release funds upon completion
        })
        .eq('id', campaignId);

      if (error) throw error;

      Alert.alert('Deal Closed', 'The campaign is completed and funds have been released to the creator.');
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
    } catch (err) {
      Alert.alert('Error', 'Failed to complete deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!campaignToRevise || !revisionNote.trim()) {
      Alert.alert('Missing Note', 'Please explain what needs to be fixed.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: 'revision',
          revision_notes: revisionNote,
          deliverable_url: null 
        })
        .eq('id', campaignToRevise.id);

      if (error) throw error;

      Alert.alert('Revision Requested', 'The creator has been notified to fix the deliverable.');
      setCampaigns(campaigns.filter(c => c.id !== campaignToRevise.id));
      setIsRevisionModalVisible(false);
      setRevisionNote('');
      setCampaignToRevise(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to request revision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderNegotiationItem = ({ item }: { item: Campaign }) => (
    <TouchableOpacity 
      onPress={() => {
        setSelectedCampaign(item);
        setPayout('');
      }}
      className="bg-white p-5 rounded-2xl mb-4 border border-gray-100 shadow-sm"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-gray-400 text-[10px] font-bold uppercase mr-2">Incoming Brief</Text>
            {item.escrow_status === 'funded' && (
              <View className="bg-blue-50 px-2 py-0.5 rounded-full flex-row items-center">
                <ShieldCheck size={10} color="#2563EB" />
                <Text className="text-blue-600 text-[8px] font-bold ml-1 uppercase">Funds Secured</Text>
              </View>
            )}
          </View>
          <Text className="text-xl font-bold text-black">{item.profiles?.display_name}</Text>
        </View>
        <View className="bg-green-50 px-3 py-1 rounded-lg">
          <Text className="text-green-600 font-bold">${item.budget.toLocaleString()}</Text>
        </View>
      </View>
      <Text className="text-gray-600 text-sm mb-4" numberOfLines={2}>{item.brand_guidelines}</Text>
      <View className="flex-row items-center">
        <Briefcase size={14} color="#9CA3AF" />
        <Text className="text-gray-400 text-xs ml-1">Submitted {new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderVerificationItem = ({ item }: { item: Campaign }) => (
    <View className="bg-white p-6 rounded-3xl mb-4 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-gray-400 text-[10px] font-bold uppercase mr-2">Deliverable Review</Text>
            {item.escrow_status === 'funded' && (
              <View className="bg-blue-50 px-2 py-0.5 rounded-full flex-row items-center">
                <ShieldCheck size={10} color="#2563EB" />
                <Text className="text-blue-600 text-[8px] font-bold ml-1 uppercase">Escrow Funded</Text>
              </View>
            )}
          </View>
          <Text className="text-xl font-bold text-black">{item.profiles?.display_name}</Text>
        </View>
        <View className="bg-indigo-50 px-3 py-1 rounded-lg">
          <Text className="text-indigo-600 font-bold">${item.creator_payout.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => item.deliverable_url && Linking.openURL(item.deliverable_url)}
        className="bg-blue-50 p-4 rounded-2xl flex-row items-center justify-between mb-6"
      >
        <View className="flex-1 mr-4">
          <Text className="text-blue-600 font-bold text-xs uppercase mb-1">Live Post Link</Text>
          <Text className="text-blue-800 text-sm" numberOfLines={1}>{item.deliverable_url}</Text>
        </View>
        <ExternalLink size={20} color="#2563EB" />
      </TouchableOpacity>

      <View className="flex-row">
        <TouchableOpacity 
          onPress={() => handleCompleteDeal(item.id)}
          disabled={isSubmitting}
          className="flex-1 bg-black h-12 rounded-xl flex-row items-center justify-center mr-2"
        >
          <CheckCircle size={18} color="white" />
          <Text className="text-white font-bold ml-2">Verify & Close</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => {
            setCampaignToRevise(item);
            setIsRevisionModalVisible(true);
          }}
          disabled={isSubmitting}
          className="flex-1 bg-gray-100 h-12 rounded-xl flex-row items-center justify-center"
        >
          <RotateCcw size={18} color="#4B5563" />
          <Text className="text-gray-600 font-bold ml-2">Revision</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 60 }}>
      <View className="mb-6">
        <Text className="text-3xl font-bold text-black">Deal Pipeline</Text>
        <Text className="text-gray-500 mt-1">Review proposals and verify work</Text>
      </View>

      <View className="flex-row bg-gray-200 p-1 rounded-xl mb-6">
        <TouchableOpacity 
          onPress={() => setActiveTab('negotiation')}
          style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: activeTab === 'negotiation' ? 'white' : 'transparent' }}
        >
          <Text className={`font-semibold ${activeTab === 'negotiation' ? 'text-black' : 'text-gray-500'}`}>Negotiation</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('verification')}
          style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: activeTab === 'verification' ? 'white' : 'transparent' }}
        >
          <Text className={`font-semibold ${activeTab === 'verification' ? 'text-black' : 'text-gray-500'}`}>Verification</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === 'negotiation' ? renderNegotiationItem : renderVerificationItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-gray-400 text-center">No deals in this stage</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {/* Negotiation Modal */}
      <Modal visible={!!selectedCampaign} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="bg-white rounded-t-[32px] p-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-black">Review Proposal</Text>
              <TouchableOpacity onPress={() => setSelectedCampaign(null)}><X size={24} color="#000" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[60vh]">
              <View className="mb-6">
                <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Campaign Brief</Text>
                <Text className="text-gray-700 leading-6">{selectedCampaign?.brand_guidelines}</Text>
              </View>
              <View className="flex-row mb-8">
                <View className="flex-1 bg-gray-50 p-4 rounded-2xl mr-2">
                  <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Brand Budget</Text>
                  <Text className="text-xl font-bold text-black">${selectedCampaign?.budget.toLocaleString()}</Text>
                </View>
                <View>
                  <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Profit Estimate</Text>
                  <Text className="text-xl font-bold text-emerald-600">
                    ${((selectedCampaign?.budget ?? 0) - (parseFloat(payout) || 0)).toLocaleString()}
                  </Text>
                </View>
              </View>
              <View className="mb-8">
                <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Set Creator Payout</Text>
                <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-1">
                  <DollarSign size={20} color="#000" />
                  <TextInput
                    className="flex-1 h-12 text-xl font-bold text-black ml-1"
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={payout}
                    onChangeText={setPayout}
                  />
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity onPress={handleApprove} disabled={isSubmitting} className={`bg-black h-16 rounded-2xl flex-row items-center justify-center ${isSubmitting ? 'opacity-50' : ''}`}>
              {isSubmitting ? <ActivityIndicator color="white" /> : <><Text className="text-white font-bold text-lg mr-2">Approve & Send Offer</Text><Send size={20} color="white" /></>}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Revision Modal */}
      <Modal visible={isRevisionModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="bg-white rounded-t-[32px] p-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-black">Request Revision</Text>
              <TouchableOpacity onPress={() => setIsRevisionModalVisible(false)}><X size={24} color="#000" /></TouchableOpacity>
            </View>
            <View className="mb-8">
              <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Feedback for Creator</Text>
              <TextInput
                className="bg-gray-100 rounded-2xl p-4 text-black text-base min-h-[100px]"
                placeholder="Explain what needs to be changed (e.g. 'Please tag the brand' or 'Audio is too low')..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={revisionNote}
                onChangeText={setRevisionNote}
              />
            </View>
            <TouchableOpacity 
              onPress={handleRequestRevision} 
              disabled={isSubmitting} 
              className={`bg-orange-500 h-16 rounded-2xl flex-row items-center justify-center ${isSubmitting ? 'opacity-50' : ''}`}
            >
              {isSubmitting ? <ActivityIndicator color="white" /> : <><Text className="text-white font-bold text-lg mr-2">Send Feedback</Text><RotateCcw size={20} color="white" /></>}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

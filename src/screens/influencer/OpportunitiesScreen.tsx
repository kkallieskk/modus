import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { 
  Briefcase,
  ChevronRight,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Lightbulb,
  X,
  CheckCircle2,
  Send,
  Zap,
  Bookmark,
  Heart
} from 'lucide-react-native';

type Opportunity = {
  id: string;
  title: string;
  deliverable_type: string;
  vibe: string;
  budget: number;
  created_at: string;
  brand_id: string;
  profiles: {
    display_name: string;
  };
  has_applied?: boolean;
};

export const OpportunitiesScreen = () => {
  const insets = useSafeAreaInsets();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedCampaign, setSelectedCampaign] = useState<Opportunity | null>(null);
  const [pitch, setPitch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'invites'>('marketplace');
  const [invites, setInvites] = useState<any[]>([]);

  const PipelineHeader = () => (
    <View style={styles.pipelineHeader}>
      <TouchableOpacity 
        style={styles.pipelineBtn}
        onPress={() => navigation.navigate('Pipeline')}
      >
        <Briefcase size={18} color="#FFF" />
        <Text style={styles.pipelineBtnText}>My Pipeline</Text>
        <View style={styles.pipelineDot} />
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    fetchOpportunities();
    fetchInvites();
    fetchSavedIds();
  }, []);

  const fetchSavedIds = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('saved_campaigns')
        .select('campaign_id')
        .eq('user_id', user.id);
      if (data) setSavedIds(data.map(d => d.campaign_id));
    } catch (err) {
      console.error('Error fetching saved ids:', err);
    }
  };

  const toggleSave = async (campaignId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (savedIds.includes(campaignId)) {
        await supabase.from('saved_campaigns').delete().eq('user_id', user.id).eq('campaign_id', campaignId);
        setSavedIds(prev => prev.filter(id => id !== campaignId));
      } else {
        await supabase.from('saved_campaigns').insert({ user_id: user.id, campaign_id: campaignId });
        setSavedIds(prev => [...prev, campaignId]);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch public campaigns
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          deliverable_type,
          vibe,
          budget,
          created_at,
          brand_id,
          profiles:brand_id (display_name)
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. Fetch current user's applications to mark "already applied"
      const { data: applications } = await supabase
        .from('campaign_applications')
        .select('campaign_id')
        .eq('creator_id', user.id);

      const appliedIds = new Set(applications?.map(a => a.campaign_id) || []);

      const formatted = (campaigns || []).map((c: any) => ({
        ...c,
        has_applied: appliedIds.has(c.id)
      }));

      setOpportunities(formatted);
    } catch (err: any) {
      console.error('Error fetching opportunities:', err);
      // If table doesn't exist yet, we'll just show empty state
      if (err.code === 'PGRST116' || err.message?.includes('campaign_applications')) {
        // Table likely doesn't exist, ignore for now to prevent crash
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchInvites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('campaign_offers')
        .select(`
          *,
          campaigns (
            title,
            deliverable_type,
            budget,
            profiles:brand_id (display_name)
          )
        `)
        .eq('creator_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setInvites(data || []);
    } catch (err) {
      console.error('Error fetching invites:', err);
    }
  };

  const handleApply = (opportunity: Opportunity) => {
    setSelectedCampaign(opportunity);
    setPitch('');
  };

  const submitPitch = async () => {
    if (!pitch.trim()) {
      Alert.alert('Pitch Required', 'Please tell the brand how you would shoot this.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Auth required');

      const { error } = await supabase
        .from('campaign_applications')
        .insert({
          campaign_id: selectedCampaign?.id,
          creator_id: user.id,
          pitch: pitch.trim()
        });

      if (error) throw error;

      Alert.alert(
        'Pitch Submitted!',
        'The brand will be notified. Your profile and portfolio have been attached.',
        [{ text: 'Great!', onPress: () => {
          setOpportunities(prev => prev.map(o => 
            o.id === selectedCampaign?.id ? { ...o, has_applied: true } : o
          ));
          setSelectedCampaign(null);
        }}]
      );
    } catch (err: any) {
      console.error('Error submitting pitch:', err);
      Alert.alert('Submission Failed', 'This usually happens if the application table is not ready or you have already applied.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOpportunities = opportunities.filter(o => 
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.vibe?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [savedIds, setSavedIds] = useState<string[]>([]);

  const OpportunityCard = ({ item }: { item: Opportunity }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandName}>{item.profiles?.display_name || 'Premium Brand'}</Text>
          <Text style={styles.campaignTitle}>{item.title}</Text>
        </View>
        <TouchableOpacity 
          style={styles.saveBtn}
          onPress={() => toggleSave(item.id)}
        >
          <Bookmark 
            size={22} 
            color={savedIds.includes(item.id) ? '#000' : '#E5E7EB'} 
            fill={savedIds.includes(item.id) ? '#000' : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.budgetBadge}>
        <Text style={styles.budgetText}>₹{item.budget.toLocaleString()}</Text>
      </View>

      <View style={styles.tagContainer}>
        <View style={styles.tag}>
          <Briefcase size={12} color="#8B5CF6" />
          <Text style={[styles.tagText, { color: '#8B5CF6' }]}>{item.vibe || 'Lifestyle'}</Text>
        </View>
        <View style={styles.tag}>
          <Clock size={12} color="#6B7280" />
          <Text style={styles.tagText}>Active Now</Text>
        </View>
      </View>

      <View style={styles.deliverableRow}>
        <Text style={styles.deliverableLabel}>Deliverables:</Text>
        <Text style={styles.deliverableValue}>{item.deliverable_type || '1x TikTok Video'}</Text>
      </View>

      <TouchableOpacity 
        onPress={() => handleApply(item)}
        disabled={item.has_applied}
        style={[
          styles.applyButton, 
          item.has_applied && styles.appliedButton
        ]}
      >
        {item.has_applied ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} color="#9CA3AF" />
            <Text style={styles.appliedButtonText}>Pitch Submitted</Text>
          </View>
        ) : (
          <Text style={styles.applyButtonText}>Pitch Your Idea</Text>
        )}
      </TouchableOpacity>
    </View>
  );

const DirectInviteCard = ({ item, navigation }: { item: any, navigation: any }) => (
  <TouchableOpacity 
    style={[styles.card, styles.inviteCard]}
    onPress={() => navigation.navigate('OfferReview', { offerId: item.id })}
  >
    <View style={styles.cardTop}>
      <View style={{ flex: 1 }}>
        <View style={styles.exclusiveBadgeRow}>
          <Zap size={12} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.exclusiveBadgeText}>EXCLUSIVE INVITE</Text>
        </View>
        <Text style={styles.brandName}>{item.campaigns?.profiles?.display_name}</Text>
        <Text style={styles.campaignTitle}>{item.campaigns?.title}</Text>
      </View>
      <View style={styles.budgetBadge}>
        <Text style={styles.budgetText}>₹{item.campaigns?.budget?.toLocaleString()}</Text>
      </View>
    </View>

    <View style={styles.deliverableRow}>
      <Text style={styles.deliverableLabel}>Deliverables:</Text>
      <Text style={styles.deliverableValue}>{item.campaigns?.deliverable_type}</Text>
    </View>

    <View style={styles.inviteFooter}>
      <Text style={styles.viewOfferText}>View Full Brief</Text>
      <ChevronRight size={16} color="#000" />
    </View>
  </TouchableOpacity>
);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View className="flex-row justify-between items-end">
          <View>
            <Text style={styles.headerTitle}>Casting Board</Text>
            <Text style={styles.headerSubtitle}>Discover public collaboration briefs</Text>
          </View>
          <View className="bg-black px-3 py-1 rounded-full mb-1">
            <Text className="text-white text-[10px] font-black uppercase">Marketplace</Text>
          </View>
        </View>
        
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search niches or campaigns..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            onPress={() => setActiveTab('marketplace')}
            style={[styles.tab, activeTab === 'marketplace' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === 'marketplace' && styles.activeTabText]}>Casting Board</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('invites')}
            style={[styles.tab, activeTab === 'invites' && styles.activeTab]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.tabText, activeTab === 'invites' && styles.activeTabText]}>Direct Invites</Text>
              {invites.length > 0 && <View style={styles.badge} />}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { fetchOpportunities(); fetchInvites(); }} tintColor="#000" />}
      >
        {loading && !refreshing ? (
          <View style={{ marginTop: 100 }}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : activeTab === 'marketplace' ? (
          filteredOpportunities.length > 0 ? (
            filteredOpportunities.map(o => <OpportunityCard key={o.id} item={o} />)
          ) : (
            <View style={styles.emptyState}>
              <Briefcase size={48} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No Casting Calls Found</Text>
              <Text style={styles.emptySubtitle}>Check back later for new brand collaboration briefs.</Text>
            </View>
          )
        ) : (
          invites.length > 0 ? (
            invites.map(i => <DirectInviteCard key={i.id} item={i} navigation={useNavigation()} />)
          ) : (
            <View style={styles.emptyState}>
              <Zap size={48} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No Direct Invites</Text>
              <Text style={styles.emptySubtitle}>When a brand hand-picks you for a campaign, it will appear here.</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Pitch Modal */}
      <Modal
        visible={!!selectedCampaign}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCampaign(null)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Submit Your Pitch</Text>
                <Text style={styles.modalSubtitle}>{selectedCampaign?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedCampaign(null)} style={styles.closeButton}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView bounces={false} style={{ padding: 24 }}>
              <View style={styles.infoBox}>
                <Lightbulb size={18} color="#D97706" />
                <Text style={styles.infoBoxText}>
                  Explain your creative concept. How would you shoot this content to stand out?
                </Text>
              </View>

              <TextInput
                style={styles.pitchInput}
                placeholder="Start typing your creative strategy..."
                multiline
                textAlignVertical="top"
                value={pitch}
                onChangeText={setPitch}
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.attachedNote}>
                <CheckCircle2 size={14} color="#059669" />
                <Text style={styles.attachedNoteText}>
                  Your Modus Profile & Portfolio will be automatically attached.
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                onPress={submitPitch}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={styles.submitButtonText}>Send Pitch</Text>
                    <Send size={18} color="white" />
                  </View>
                )}
              </TouchableOpacity>
              
              <Text style={styles.noFreeWorkNote}>
                Note: Brands cannot ask for custom content before hiring. Keep your pitch strategic.
              </Text>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginTop: 20,
    height: 52,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.3,
  },
  budgetBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  budgetText: {
    color: '#166534',
    fontSize: 15,
    fontWeight: '900',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  deliverableRow: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  deliverableLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  deliverableValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#000',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  appliedButton: {
    backgroundColor: '#F3F4F6',
  },
  appliedButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 20,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 20,
  },
  pitchInput: {
    height: 180,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  attachedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
  },
  attachedNoteText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#000',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  noFreeWorkNote: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 20,
    fontWeight: '700',
    lineHeight: 16,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#000',
  },
  badge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  inviteCard: {
    borderColor: '#FEF3C7',
    borderWidth: 1.5,
  },
  exclusiveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  exclusiveBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D97706',
  },
  inviteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewOfferText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  pipelineHeader: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  pipelineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    gap: 12,
  },
  pipelineBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  pipelineDot: {
    marginLeft: 'auto',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  saveBtn: {
    padding: 4,
    marginRight: -4,
  }
});

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
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { JobAlertsModal } from '@/components/JobAlertsModal';
import { 
  Briefcase,
  ChevronRight,
  Search,
  CheckCircle2,
  Send,
  Zap,
  Bookmark,
  Bell,
  ChevronDown,
  Clock,
  ShieldCheck,
  Building2,
  Video,
  X,
  Lightbulb
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

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

export const OpportunitiesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
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
  const [savedIds, setSavedIds] = useState<string[]>([]);
  
  const [isJobAlertsOpen, setIsJobAlertsOpen] = useState(false);

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
      Alert.alert('Submission Failed', 'You may have already applied for this campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOpportunities = opportunities.filter(o => 
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.vibe?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const OpportunityCard = ({ item }: { item: Opportunity }) => (
    <View style={styles.campaignCard}>
      <View style={styles.cardTopRow}>
        <View style={styles.brandInfo}>
          <View style={styles.brandLogoPlaceholder}>
            <Building2 size={16} color="#6B7280" />
          </View>
          <Text style={styles.brandNameText}>{item.profiles?.display_name || 'Premium Brand'}</Text>
        </View>
        <View style={styles.escrowBadge}>
          <ShieldCheck size={14} color="#10B981" />
          <Text style={styles.escrowText}>₹{item.budget.toLocaleString()} Guaranteed</Text>
        </View>
      </View>

      <Text style={styles.campaignTitleText}>{item.title}</Text>
      
      <View style={styles.cardBottomRow}>
        <View style={styles.requirementsRow}>
          <View style={styles.reqChip}>
            <Video size={12} color="#4F46E5" />
            <Text style={styles.reqChipText}>{item.deliverable_type || '1x IG Reel'}</Text>
          </View>
          <View style={styles.reqChip}>
            <Briefcase size={12} color="#D97706" />
            <Text style={styles.reqChipText}>{item.vibe || 'Tech Niche'}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => handleApply(item)}
          disabled={item.has_applied}
          style={[
            styles.primaryApplyBtn,
            item.has_applied && styles.appliedBtn
          ]}
        >
          {item.has_applied ? (
            <>
              <CheckCircle2 size={14} color="#9CA3AF" />
              <Text style={styles.appliedBtnText}>Applied</Text>
            </>
          ) : (
            <Text style={styles.primaryApplyText}>Apply Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const DirectInviteCard = ({ item, navigation }: { item: any, navigation: any }) => (
    <TouchableOpacity 
      style={[styles.campaignCard, { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }]}
      onPress={() => navigation.navigate('OfferReview', { offerId: item.id })}
    >
      <View style={styles.cardTopRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.exclusiveBadgeRow}>
            <Zap size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.exclusiveBadgeText}>VIP DIRECT INVITE</Text>
          </View>
          <Text style={styles.brandNameText}>{item.campaigns?.profiles?.display_name}</Text>
          <Text style={styles.campaignTitleText}>{item.campaigns?.title}</Text>
        </View>
        <View style={styles.escrowBadge}>
          <Text style={styles.escrowText}>₹{item.campaigns?.budget?.toLocaleString()} Guaranteed</Text>
        </View>
      </View>
  
      <View style={[styles.cardBottomRow, { marginTop: 16 }]}>
        <View style={styles.requirementsRow}>
          <Text style={styles.reqChipText}>Deliverable: {item.campaigns?.deliverable_type}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#000', marginRight: 4 }}>View Offer</Text>
          <ChevronRight size={16} color="#000" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleJobAlertsSubmit = (data: any) => {
    console.log('Job alerts set:', data);
    Alert.alert('Alerts Activated', `We'll notify you when a ${data.niche} brand posts a ${data.deliverable} brief.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={[
        styles.header, 
        { 
          paddingTop: isDesktop ? 24 : insets.top + 20,
          maxWidth: isDesktop ? 1200 : undefined,
          width: isDesktop ? '100%' : undefined,
          alignSelf: isDesktop ? 'center' : undefined,
        }
      ]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Text style={styles.headerTitle}>Casting Board</Text>
            <Text style={styles.headerSubtitle}>Discover exclusive collaboration briefs</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications' as never)} style={styles.bellIconBtn}>
            <Bell size={20} color="#000" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search campaigns by brand or keyword..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
            {...(Platform.OS === 'web' ? { style: [styles.searchInput, { outlineWidth: 0 } as any] } : {})}
          />
        </View>

        {/* Filter Console (Only on Marketplace Tab) */}
        {activeTab === 'marketplace' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {['Platform', 'Deliverable', 'Budget', 'Industry'].map(filter => (
              <TouchableOpacity key={filter} style={styles.filterPill}>
                <Text style={styles.filterPillText}>{filter}</Text>
                <ChevronDown size={14} color="#64748B" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            onPress={() => setActiveTab('marketplace')}
            style={[styles.tab, activeTab === 'marketplace' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === 'marketplace' && styles.activeTabText]}>Marketplace</Text>
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
        contentContainerStyle={{ 
          padding: 20, 
          paddingBottom: 100,
          maxWidth: isDesktop ? 1200 : undefined,
          width: isDesktop ? '100%' : undefined,
          alignSelf: isDesktop ? 'center' : undefined,
        }}
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
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyAlertBox}>
                <Zap size={32} color="#8B5CF6" />
                <Text style={styles.emptyAlertTitle}>No exact matches right now, but deals move fast.</Text>
                <Text style={styles.emptyAlertSub}>
                  Top brands post briefs daily. Don't miss out on lucrative collaborations that fit your niche.
                </Text>
                <TouchableOpacity 
                  style={styles.jobAlertsBtn}
                  onPress={() => setIsJobAlertsOpen(true)}
                >
                  <Bell size={16} color="#FFF" />
                  <Text style={styles.jobAlertsBtnText}>Set up Job Alerts</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.recentlyClosedTitle}>Recently Closed Deals</Text>
              
              {/* Mocked Social Proof Cards */}
              <View style={[styles.campaignCard, styles.mockCard]}>
                <View style={styles.cardTopRow}>
                  <View style={styles.brandInfo}>
                    <Building2 size={14} color="#9CA3AF" />
                    <Text style={[styles.brandNameText, { color: '#9CA3AF' }]}>Fintify App</Text>
                  </View>
                  <View style={[styles.escrowBadge, { backgroundColor: '#F3F4F6' }]}>
                    <Text style={[styles.escrowText, { color: '#6B7280' }]}>₹65,000 Payout</Text>
                  </View>
                </View>
                <Text style={[styles.campaignTitleText, { color: '#9CA3AF' }]}>Personal Finance App Promo</Text>
                <View style={[styles.cardBottomRow, { opacity: 0.5 }]}>
                  <View style={styles.requirementsRow}>
                    <Text style={styles.reqChipText}>1x YouTube Short</Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#9CA3AF' }}>Filled in 2 hours</Text>
                </View>
              </View>

              <View style={[styles.campaignCard, styles.mockCard]}>
                <View style={styles.cardTopRow}>
                  <View style={styles.brandInfo}>
                    <Building2 size={14} color="#9CA3AF" />
                    <Text style={[styles.brandNameText, { color: '#9CA3AF' }]}>Luxe Apparel</Text>
                  </View>
                  <View style={[styles.escrowBadge, { backgroundColor: '#F3F4F6' }]}>
                    <Text style={[styles.escrowText, { color: '#6B7280' }]}>₹30,000 Payout</Text>
                  </View>
                </View>
                <Text style={[styles.campaignTitleText, { color: '#9CA3AF' }]}>Summer Collection Unboxing</Text>
                <View style={[styles.cardBottomRow, { opacity: 0.5 }]}>
                  <View style={styles.requirementsRow}>
                    <Text style={styles.reqChipText}>1x IG Reel</Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#9CA3AF' }}>Filled in 45 mins</Text>
                </View>
              </View>

            </View>
          )
        ) : (
          invites.length > 0 ? (
            invites.map(i => <DirectInviteCard key={i.id} item={i} navigation={useNavigation()} />)
          ) : (
            <View style={styles.vipEmptyState}>
              <View style={styles.vipIconCircle}>
                <Zap size={32} color="#F59E0B" fill="#F59E0B" />
              </View>
              <Text style={styles.emptyTitle}>Your VIP Inbox is empty</Text>
              <Text style={styles.emptySubtitle}>When a brand bypasses the public board and sends an exclusive offer directly to you, it will appear here.</Text>
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
                {...(Platform.OS === 'web' ? { style: [styles.pitchInput, { outlineWidth: 0 } as any] } : {})}
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

      {/* Job Alerts Modal */}
      <JobAlertsModal 
        visible={isJobAlertsOpen}
        onClose={() => setIsJobAlertsOpen(false)}
        onSubmit={handleJobAlertsSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  bellIconBtn: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginTop: 20,
    height: 52,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  
  // Filter Console
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingBottom: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },

  tabContainer: {
    flexDirection: 'row',
    marginTop: 24,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
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
    color: '#64748B',
  },
  activeTabText: {
    color: '#0F172A',
  },
  badge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginTop: -8,
  },

  // Campaign Cards (Lucrative Bounty Style)
  campaignCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
      }
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  escrowText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  campaignTitleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  requirementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    paddingRight: 16,
  },
  reqChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reqChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  primaryApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  primaryApplyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  appliedBtn: {
    backgroundColor: '#F1F5F9',
  },
  appliedBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '800',
  },
  exclusiveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  exclusiveBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: 1,
  },

  // Empty State & Job Alerts
  emptyStateContainer: {
    marginTop: 20,
  },
  emptyAlertBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5F3FF',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: { elevation: 4 },
      web: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      }
    }),
  },
  emptyAlertTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyAlertSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  jobAlertsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  jobAlertsBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  recentlyClosedTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 40,
    marginBottom: 16,
    marginLeft: 4,
  },
  mockCard: {
    opacity: 0.7,
    backgroundColor: '#FAFAFA',
  },

  vipEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  vipIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  // Modal Styles
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
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
});

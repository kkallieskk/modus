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
  TextInput,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { JobAlertsModal } from '@/components/JobAlertsModal';
import { CampaignCard, CampaignData } from '@/components/CampaignCard';
import { PitchDrawer } from '@/components/PitchDrawer';
import { 
  Search,
  Bell,
  ChevronDown,
  Building2,
  Zap,
  CheckCircle2
} from 'lucide-react-native';

export const OpportunitiesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const numColumns = isDesktop ? 3 : 1;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'marketplace' | 'invites'>('marketplace');
  const [compensationFilter, setCompensationFilter] = useState<'all' | 'paid' | 'barter'>('all');
  
  // Data
  const [opportunities, setOpportunities] = useState<CampaignData[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  
  // Modals
  const [isJobAlertsOpen, setIsJobAlertsOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);
  const [isPitchDrawerOpen, setIsPitchDrawerOpen] = useState(false);

  useEffect(() => {
    fetchOpportunities();
    fetchInvites();
  }, []);

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

      const formatted: CampaignData[] = (campaigns || []).map((c: any) => ({
        id: c.id,
        brandName: c.profiles?.display_name || 'Premium Brand',
        title: c.title,
        deliverables: c.deliverable_type || '1x IG Reel',
        requirements: ['Min 50k Followers', c.vibe || 'Tech Niche'],
        compensationType: c.budget && c.budget > 5000 ? 'paid' : 'barter',
        payoutAmount: c.budget,
        barterValue: c.budget || 5000,
        timeLeftDays: Math.floor(Math.random() * 5) + 1, // Mock time left
        hasApplied: appliedIds.has(c.id)
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

  const handleOpenPitch = (campaign: CampaignData) => {
    setSelectedCampaign(campaign);
    setIsPitchDrawerOpen(true);
  };

  const submitPitch = async (pitch: string, fee: number) => {
    try {
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

      Alert.alert('Pitch Submitted!', 'The brand will be notified. Your profile and portfolio have been attached.');
      
      setOpportunities(prev => prev.map(o => 
        o.id === selectedCampaign?.id ? { ...o, has_applied: true } : o
      ));
      setIsPitchDrawerOpen(false);
      setSelectedCampaign(null);
    } catch (err: any) {
      console.error('Error submitting pitch:', err);
      Alert.alert('Submission Failed', 'You may have already applied for this campaign.');
    }
  };

  const handleJobAlertsSubmit = (data: any) => {
    Alert.alert('Alerts Activated', `We'll notify you when a ${data.niche} brand posts a ${data.deliverable} brief.`);
  };

  // Filters logic
  let filteredOpportunities = opportunities.filter(o => 
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.brandName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (compensationFilter !== 'all') {
    filteredOpportunities = filteredOpportunities.filter(o => o.compensationType === compensationFilter);
  }

  const DirectInviteCard = ({ item }: { item: any }) => (
    <View style={styles.vipCard}>
      <View style={styles.vipCardHeader}>
        <View style={styles.vipBadge}>
          <Zap size={12} color="#D97706" fill="#D97706" />
          <Text style={styles.vipBadgeText}>VIP DIRECT INVITE</Text>
        </View>
      </View>
      
      <View style={styles.vipCardBody}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Building2 size={14} color="#B45309" />
            <Text style={styles.vipBrandName}>{item.campaigns?.profiles?.display_name || 'Premium Brand'}</Text>
          </View>
          <Text style={styles.vipCampaignTitle} numberOfLines={2}>{item.campaigns?.title}</Text>
          <Text style={styles.vipDeliverable}>{item.campaigns?.deliverable_type}</Text>
        </View>
        <View style={styles.vipRateBox}>
          <Text style={styles.vipRateLabel}>Brand Offered</Text>
          <Text style={styles.vipRateAmount}>₹{item.campaigns?.budget?.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.vipAcceptBtn}
        onPress={() => navigation.navigate('OfferReview', { offerId: item.id })}
      >
        <CheckCircle2 size={16} color="#FFF" />
        <Text style={styles.vipAcceptBtnText}>Accept Invite</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      
      {/* HEADER & FILTERS */}
      <View style={[
        styles.headerContainer, 
        { 
          paddingTop: isDesktop ? 24 : insets.top + 20,
          maxWidth: isDesktop ? 1200 : undefined,
          width: isDesktop ? '100%' : undefined,
          alignSelf: isDesktop ? 'center' : undefined,
        }
      ]}>
        <Text style={styles.pageTitle}>Find Work</Text>
        <Text style={styles.pageSubtitle}>Discover exclusive collaboration briefs</Text>
        
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

        {activeTab === 'marketplace' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {/* 3-Way Segmented Control */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity 
                style={[styles.segmentBtn, compensationFilter === 'all' && styles.segmentBtnActive]}
                onPress={() => setCompensationFilter('all')}
              >
                <Text style={[styles.segmentText, compensationFilter === 'all' && styles.segmentTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.segmentBtn, compensationFilter === 'paid' && styles.segmentBtnActive]}
                onPress={() => setCompensationFilter('paid')}
              >
                <Text style={[styles.segmentText, compensationFilter === 'paid' && styles.segmentTextActive]}>Paid</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.segmentBtn, compensationFilter === 'barter' && styles.segmentBtnActive]}
                onPress={() => setCompensationFilter('barter')}
              >
                <Text style={[styles.segmentText, compensationFilter === 'barter' && styles.segmentTextActive]}>Barter</Text>
              </TouchableOpacity>
            </View>

            {/* Dropdowns */}
            {['Platform', 'Deliverable', 'Compensation', 'Industry'].map(filter => (
              <TouchableOpacity key={filter} style={styles.filterDropdownPill}>
                <Text style={styles.filterDropdownText}>{filter}</Text>
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

      {/* CONTENT SCROLLVIEW */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          padding: 24, 
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
            <View style={[styles.gridContainer, isDesktop && { gridTemplateColumns: `repeat(${numColumns}, 1fr)` } as any]}>
              {filteredOpportunities.map(o => (
                <View key={o.id} style={isDesktop && styles.gridItem}>
                  <CampaignCard campaign={o} onPress={handleOpenPitch} />
                </View>
              ))}
            </View>
          ) : (
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
          )
        ) : (
          invites.length > 0 ? (
            <View style={{ gap: 16 }}>
              {invites.map(i => <DirectInviteCard key={i.id} item={i} />)}
            </View>
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

      {/* Modals & Drawers */}
      <JobAlertsModal 
        visible={isJobAlertsOpen}
        onClose={() => setIsJobAlertsOpen(false)}
        onSubmit={handleJobAlertsSubmit}
      />

      <PitchDrawer 
        visible={isPitchDrawerOpen}
        campaign={selectedCampaign}
        onClose={() => setIsPitchDrawerOpen(false)}
        onSubmit={submitPitch}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
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
  
  // Filters
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingBottom: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }
    })
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  filterDropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  filterDropdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },

  // Tabs
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

  // Grid
  gridContainer: {
    ...Platform.select({
      web: {
        display: 'grid',
        gap: 24,
      },
      default: {
        gap: 16,
      }
    })
  },
  gridItem: {
    display: 'flex',
  },

  // VIP Direct Invite Card
  vipCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 20,
    ...Platform.select({
      ios: { shadowColor: '#D97706', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 2 },
      web: { shadowColor: '#D97706', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }
    })
  },
  vipCardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 4,
  },
  vipBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 1,
  },
  vipCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  vipBrandName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  vipCampaignTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    lineHeight: 24,
    marginBottom: 8,
  },
  vipDeliverable: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78350F',
  },
  vipRateBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  vipRateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  vipRateAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#B45309',
  },
  vipAcceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  vipAcceptBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // Empty States
  emptyAlertBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5F3FF',
    marginTop: 40,
    ...Platform.select({
      ios: { shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 4 },
      web: { shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 }
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
});

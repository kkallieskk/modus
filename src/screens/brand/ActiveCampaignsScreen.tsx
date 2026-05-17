import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import {
  Package, 
  Clock, 
  AlertCircle, 
  PlayCircle, 
  ChevronRight,
  User,
  LayoutGrid,
  Users,
  Megaphone,
  Trash2
} from 'lucide-react-native';
import { Alert } from 'react-native';
import { useProfile } from '@/lib/ProfileContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ActiveOffer = {
  id: string;
  status: string;
  created_at: string;
  campaigns: {
    title: string;
    budget: number;
  };
  profiles: {
    display_name: string;
    avatar_url: string | null;
  };
};

type FloatedCampaign = {
  id: string;
  title: string;
  created_at: string;
  applications_count: number;
  pending_offers_count: number;
  visibility?: 'public' | 'private';
};

type ActiveCampaignGroup = {
  id: string;
  title: string;
  creators_hired: number;
  draft_ready_count: number;
  status: 'action_required' | 'in_progress';
};

export const ActiveCampaignsScreen = () => {
  const navigation = useNavigation<any>();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState<'deals' | 'campaigns'>('deals');
  const [activeCampaignGroups, setActiveCampaignGroups] = useState<ActiveCampaignGroup[]>([]);
  const [floatedCampaigns, setFloatedCampaigns] = useState<FloatedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const brandColor = profile?.brand_color || '#8B5CF6';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'deals') {
      await fetchActiveCampaigns();
    } else {
      await fetchFloatedCampaigns();
    }
    setLoading(false);
  };

  const fetchActiveCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('campaign_offers')
        .select(`
          id,
          status,
          campaign_id,
          campaigns!inner(id, title, brand_id)
        `)
        .in('status', ['accepted', 'pending_review', 'revision_requested'])
        .eq('campaigns.brand_id', user.id);

      if (error) throw error;

      const groups: Record<string, ActiveCampaignGroup> = {};
      
      (data || []).forEach((offer: any) => {
        const cId = offer.campaign_id;
        if (!groups[cId]) {
          groups[cId] = {
            id: cId,
            title: offer.campaigns.title,
            creators_hired: 0,
            draft_ready_count: 0,
            status: 'in_progress'
          };
        }
        
        groups[cId].creators_hired += 1;
        if (offer.status === 'pending_review') {
          groups[cId].draft_ready_count += 1;
          groups[cId].status = 'action_required';
        }
      });

      setActiveCampaignGroups(Object.values(groups));
    } catch (err: any) {
      console.error('Error fetching active campaigns:', err);
    }
  };

  const fetchFloatedCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('id, title, created_at, visibility')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const campaignsWithRealCounts = await Promise.all((campaigns || []).map(async (c) => {
        const { count: offerCount } = await supabase
          .from('campaign_offers')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', c.id)
          .eq('status', 'pending');

        return {
          ...c,
          applications_count: 0,
          pending_offers_count: offerCount || 0,
        };
      }));

      setFloatedCampaigns(campaignsWithRealCounts);
    } catch (err: any) {
      console.error('Error fetching floated campaigns:', err);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    Alert.alert(
      'Delete Campaign',
      'Are you sure you want to delete this campaign? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('campaigns')
                .delete()
                .eq('id', campaignId);
              
              if (error) throw error;
              
              // Refresh data
              fetchData();
            } catch (err: any) {
              console.error('Error deleting campaign:', err);
              Alert.alert('Error', 'Failed to delete campaign');
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const insets = useSafeAreaInsets();

  const actionRequired = activeCampaignGroups.filter(g => g.status === 'action_required');
  const inProgress = activeCampaignGroups.filter(g => g.status === 'in_progress');

  const CampaignGroupCard = ({ group }: { group: ActiveCampaignGroup }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('CampaignManagementHub', { 
          campaignId: group.id,
          campaignTitle: group.title 
        })}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.campaignTitle} numberOfLines={1}>{group.title}</Text>
            <View style={styles.creatorRow}>
              <Users size={14} color="#9CA3AF" />
              <Text style={styles.creatorName}>
                {group.creators_hired} {group.creators_hired === 1 ? 'Creator' : 'Creators'} Hired
              </Text>
            </View>
          </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity 
              onPress={() => handleDeleteCampaign(group.id)}
              style={{ padding: 4 }}
            >
              <Trash2 size={18} color="#FCA5A5" />
            </TouchableOpacity>
            <ChevronRight size={18} color="#D1D5DB" />
          </View>
        </View>

        <View style={styles.cardFooter}>
          {group.draft_ready_count > 0 ? (
            <View style={[styles.statusBadge, { backgroundColor: '#FFEDD5' }]}>
              <Text style={[styles.statusText, { color: '#EA580C' }]}>
                {group.draft_ready_count} {group.draft_ready_count === 1 ? 'Draft' : 'Drafts'} Ready
              </Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: '#E0F2FE' }]}>
              <Text style={[styles.statusText, { color: '#0369A1' }]}>Filming In Progress</Text>
            </View>
          )}
          <View style={styles.deadlineRow}>
            <LayoutGrid size={12} color="#9CA3AF" />
            <Text style={styles.deadlineText}>Management Hub</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FloatedCampaignCard = ({ campaign }: { campaign: FloatedCampaign }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ApplicantReview', { 
          campaign_id: campaign.id, 
          campaign_title: campaign.title,
          visibility: campaign.visibility
        })}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.campaignTitle} numberOfLines={1}>{campaign.title}</Text>
            <View style={styles.creatorRow}>
              <Megaphone size={14} color="#9CA3AF" />
              <Text style={styles.creatorName}>
                {campaign.visibility === 'private' ? 'Private Campaign' : 'Open Casting Call'}
              </Text>
            </View>
          </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity 
              onPress={() => handleDeleteCampaign(campaign.id)}
              style={{ padding: 4 }}
            >
              <Trash2 size={18} color="#FCA5A5" />
            </TouchableOpacity>
            <ChevronRight size={18} color="#D1D5DB" />
          </View>
        </View>

        <View style={{ gap: 12, marginTop: 4 }}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {campaign.visibility !== 'private' && (
              <View>
                <Text style={styles.statLabel}>Creators Applied</Text>
                <Text style={styles.statValue}>{campaign.applications_count}</Text>
              </View>
            )}
            <View>
              <Text style={styles.statLabel}>Offers Pending</Text>
              <Text style={styles.statValue}>{campaign.pending_offers_count}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: '#F3F4F6' }]}>
            <Text style={[styles.statusText, { color: '#6B7280' }]}>Active Brief</Text>
          </View>
          <View style={styles.deadlineRow}>
            <Clock size={12} color="#9CA3AF" />
            <Text style={styles.deadlineText}>Casting Active</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ 
        paddingTop: insets.top + 20, 
        paddingHorizontal: 24, 
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
      }}>
        <Text style={styles.headerTitle}>Workspace</Text>
        
        {/* Toggle Pill */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            onPress={() => setActiveTab('deals')}
            style={[styles.togglePill, activeTab === 'deals' && styles.togglePillActive]}
          >
            <Text style={[styles.toggleText, activeTab === 'deals' && styles.toggleTextActive]}>Active Campaigns</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('campaigns')}
            style={[styles.togglePill, activeTab === 'campaigns' && styles.togglePillActive]}
          >
            <Text style={[styles.toggleText, activeTab === 'campaigns' && styles.toggleTextActive]}>Open Casting</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brandColor} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ marginTop: 100 }}>
            <ActivityIndicator size="large" color={brandColor} />
          </View>
        ) : activeTab === 'deals' ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <AlertCircle size={18} color="#EA580C" />
                <Text style={styles.sectionTitle}>Action Required</Text>
              </View>
              <View style={[styles.countBadge, { backgroundColor: '#FFEDD5' }]}>
                <Text style={[styles.countText, { color: '#EA580C' }]}>{actionRequired.length}</Text>
              </View>
            </View>

            {actionRequired.length > 0 ? (
              actionRequired.map(group => <CampaignGroupCard key={group.id} group={group} />)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>All campaigns are on track.</Text>
              </View>
            )}

            <View style={[styles.sectionHeader, { marginTop: 32 }]}>
              <View style={styles.sectionTitleRow}>
                <PlayCircle size={18} color={brandColor} />
                <Text style={styles.sectionTitle}>Campaigns In Progress</Text>
              </View>
              <View style={[styles.countBadge, { backgroundColor: brandColor + '15' }]}>
                <Text style={[styles.countText, { color: brandColor }]}>{inProgress.length}</Text>
              </View>
            </View>

            {inProgress.length > 0 ? (
              inProgress.map(group => <CampaignGroupCard key={group.id} group={group} />)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No active creator collaborations.</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Megaphone size={18} color={brandColor} />
                <Text style={styles.sectionTitle}>Published Briefs</Text>
              </View>
              <View style={[styles.countBadge, { backgroundColor: brandColor + '15' }]}>
                <Text style={[styles.countText, { color: brandColor }]}>{floatedCampaigns.length}</Text>
              </View>
            </View>

            {floatedCampaigns.length > 0 ? (
              floatedCampaigns.map(campaign => <FloatedCampaignCard key={campaign.id} campaign={campaign} />)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No open campaigns currently floated.</Text>
              </View>
            )}
          </>
        )}

        {((activeTab === 'deals' && activeCampaignGroups.length === 0) || (activeTab === 'campaigns' && floatedCampaigns.length === 0)) && !loading && (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Package size={48} color="#F3F4F6" />
            <Text style={{ color: '#9CA3AF', fontSize: 15, marginTop: 16, textAlign: 'center', lineHeight: 22 }}>
              Your workspace is clear.{"\n"}Start a new campaign to see it here!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 4,
  },
  togglePill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  togglePillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 13,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  campaignTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  avatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorName: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadlineText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginTop: 2,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
});

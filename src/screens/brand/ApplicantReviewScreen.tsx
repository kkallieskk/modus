import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Check, Star, Lightbulb, User, ShieldCheck, Clock } from 'lucide-react-native';

type Applicant = {
  id: string;
  display_name: string;
  niche_industry: string;
  avatar_url?: string;
  portfolio_thumbnail_url?: string;
  pitch: string;
  rating: number;
};

const MOCK_APPLICANTS: Applicant[] = [
  {
    id: 'app1',
    display_name: 'Sarah J.',
    niche_industry: 'Lifestyle & Wellness',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    portfolio_thumbnail_url: 'https://images.unsplash.com/photo-1545233310-cf96d4825906?w=600',
    pitch: "I'll create a 45-second high-energy Reel focusing on the morning clarity your supplement provides. I'll use soft morning light and custom voiceover narrating the benefits of the ingredients.",
    rating: 4.9,
  },
  {
    id: 'app2',
    display_name: 'David Chen',
    niche_industry: 'Tech & productivity',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    portfolio_thumbnail_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
    pitch: "Cinematic macro shots of the hardware coupled with a 'problem-solution' style walkthrough. I'll show exactly how it integrates into a minimalist desk setup.",
    rating: 4.8,
  },
];

export const ApplicantReviewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { campaign_id, campaign_title, visibility: initialVisibility } = route.params || {};
  const [visibility, setVisibility] = useState<'public' | 'private'>(initialVisibility || 'public');
  const [activeTab, setActiveTab] = useState<'applicants' | 'invited'>(initialVisibility === 'private' ? 'invited' : 'applicants');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [invitedCreators, setInvitedCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [campaign_id]);

  const fetchData = async () => {
    setLoading(true);
    // 1. Fetch Applicants (Only if public)
    if (visibility === 'public') {
      setApplicants(MOCK_APPLICANTS);
    } else {
      setApplicants([]);
    }

    // 2. Fetch Invited Creators (Pending Offers)
    try {
      const { data, error } = await supabase
        .from('campaign_offers')
        .select(`
          id,
          status,
          created_at,
          profiles!campaign_offers_creator_id_fkey (
            id,
            display_name,
            avatar_url,
            niche_industry,
            base_price
          )
        `)
        .eq('campaign_id', campaign_id)
        .eq('status', 'pending');

      if (error) throw error;
      setInvitedCreators(data || []);
    } catch (err) {
      console.error('Error fetching invited creators:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHire = (applicant: any) => {
    const name = applicant.display_name || applicant.profiles?.display_name;
    Alert.alert(
      'Hire ' + name + '?',
      'You will be moved to the Vault Escrow screen to secure the project funds.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Hire & Fund', 
          onPress: () => navigation.navigate('Checkout', { 
            campaign_id, 
            budget: 5000 
          }) 
        }
      ]
    );
  };

  const totalCandidates = applicants.length + invitedCreators.length;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Candidates</Text>
        <Text style={styles.headerSubtitle} numberOfLines={1}>{campaign_title || 'Active Brief'}</Text>

        {/* Tab Toggle */}
        <View style={styles.tabContainer}>
          {visibility === 'public' && (
            <TouchableOpacity 
              onPress={() => setActiveTab('applicants')}
              style={[styles.tab, activeTab === 'applicants' && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === 'applicants' && styles.activeTabText]}>
                Applicants ({applicants.length})
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => setActiveTab('invited')}
            style={[styles.tab, (activeTab === 'invited' || visibility === 'private') && styles.activeTab]}
          >
            <Text style={[styles.tabText, (activeTab === 'invited' || visibility === 'private') && styles.activeTabText]}>
              {visibility === 'private' ? 'Invited Creators' : `Invited (${invitedCreators.length})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ paddingTop: 100 }}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 16, fontWeight: '600' }}>
              Fetching latest candidates...
            </Text>
          </View>
        ) : activeTab === 'applicants' ? (
          <>
            <View style={styles.infoBanner}>
              <ShieldCheck size={16} color="#059669" />
              <Text style={styles.infoText}>These creators have applied with a specific strategy for your brief.</Text>
            </View>

            {applicants.length > 0 ? (
              applicants.map((applicant) => (
                <View key={applicant.id} style={styles.applicantCard}>
                  <View style={styles.cardHeader}>
                    <Image source={{ uri: applicant.avatar_url }} style={styles.avatar} />
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={styles.applicantName}>{applicant.display_name}</Text>
                      <View style={styles.ratingRow}>
                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                        <Text style={styles.ratingText}>{applicant.rating}</Text>
                        <Text style={styles.nicheText}>• {applicant.niche_industry}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.pitchContainer}>
                    <View style={styles.pitchHeader}>
                      <Lightbulb size={14} color="#D97706" />
                      <Text style={styles.pitchLabel}>The Concept Pitch</Text>
                    </View>
                    <Text style={styles.pitchText}>{applicant.pitch}</Text>
                  </View>

                  <View style={styles.portfolioSection}>
                    <Image source={{ uri: applicant.portfolio_thumbnail_url }} style={styles.portfolioImage} />
                    <TouchableOpacity 
                      onPress={() => handleHire(applicant)}
                      style={styles.hireButton}
                    >
                      <Text style={styles.hireButtonText}>Hire for ₹5000</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : totalCandidates === 0 ? (
              <EmptyStateView onBack={() => navigation.goBack()} />
            ) : (
              <View style={styles.subEmptyState}>
                <Text style={styles.subEmptyText}>No inbound applicants yet.</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={[styles.infoBanner, { backgroundColor: '#EFF6FF' }]}>
              <Clock size={16} color="#2563EB" />
              <Text style={[styles.infoText, { color: '#1E40AF' }]}>
                Creators you've invited to this campaign. They are currently reviewing your brief.
              </Text>
            </View>

            {invitedCreators.length > 0 ? (
              invitedCreators.map((item) => (
                <View key={item.id} style={styles.applicantCard}>
                  <View style={styles.cardHeader}>
                    <Image 
                      source={{ uri: item.profiles?.avatar_url || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=100' }} 
                      style={styles.avatar} 
                    />
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={styles.applicantName}>{item.profiles?.display_name}</Text>
                      <View style={styles.statusRow}>
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingText}>Awaiting Creator Response</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.portfolioSection}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nicheText}>{item.profiles?.niche_industry}</Text>
                      <Text style={styles.priceLabel}>Budget Allocation: ₹{item.profiles?.base_price || 5000}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.hireButton, { backgroundColor: '#F3F4F6' }]}
                      disabled
                    >
                      <Text style={[styles.hireButtonText, { color: '#9CA3AF' }]}>Offer Sent</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : totalCandidates === 0 ? (
              <EmptyStateView onBack={() => navigation.goBack()} />
            ) : (
              <View style={styles.subEmptyState}>
                <Text style={styles.subEmptyText}>No creators invited yet.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const EmptyStateView = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconContainer}>
      <User size={32} color="#9CA3AF" />
    </View>
    <Text style={styles.emptyTitle}>No Candidates Yet</Text>
    <Text style={styles.emptySubtitle}>
      Once creators apply to your brief or you invite them to participate, they will appear here.
    </Text>
    <TouchableOpacity 
      onPress={onBack}
      style={styles.emptyButton}
    >
      <Text style={styles.emptyButtonText}>Back to Workspace</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '600',
    flex: 1,
  },
  applicantCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  applicantName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  nicheText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  pitchContainer: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  pitchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  pitchLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#D97706',
    textTransform: 'uppercase',
  },
  pitchText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    fontWeight: '500',
  },
  portfolioSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  portfolioImage: {
    width: 80,
    height: 60,
    borderRadius: 12,
  },
  hireButton: {
    flex: 1,
    backgroundColor: '#000',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hireButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 4,
    marginTop: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
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
    color: '#6B7280',
  },
  activeTabText: {
    color: '#000',
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  pendingBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginTop: 4,
  },
  subEmptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  subEmptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});

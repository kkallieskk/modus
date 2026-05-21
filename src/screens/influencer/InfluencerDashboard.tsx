import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Platform,
  useWindowDimensions,
  ScrollView,
  StyleSheet
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from '@/lib/ProfileContext';
import { 
  Instagram, 
  Youtube, 
  Linkedin,
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Building2,
  Clock,
  ArrowRight
} from 'lucide-react-native';

export const InfluencerDashboard = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 1024;
  const { profile } = useProfile();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const userColors = profile?.brand_color ? profile.brand_color.split(',') : ['#10B981'];
  const creatorColor = userColors[0] || '#10B981';

  // In a real app we'd fetch this data, but using mock data for the UI implementation
  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock delay
      await new Promise(res => setTimeout(res, 600));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // --- Momentum Metrics (Top Row) ---

  const ConnectedReach = () => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>Connected Reach</Text>
      <Text style={styles.metricBigNumber}>125K</Text>
      <Text style={styles.metricSubtitle}>Total Audience</Text>

      <View style={styles.platformsRow}>
        <View style={styles.platformIconGroup}>
          <Instagram size={18} color="#E1306C" />
          <Text style={styles.platformNum}>89K</Text>
        </View>
        <View style={styles.platformIconGroup}>
          <Youtube size={18} color="#FF0000" />
          <Text style={styles.platformNum}>36K</Text>
        </View>
        <TouchableOpacity style={[styles.platformIconGroup, { opacity: 0.5 }]}>
          <Linkedin size={18} color="#9CA3AF" />
          <Text style={styles.platformNum}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ProfileStrength = () => (
    <View style={styles.metricCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.metricTitle}>Profile Strength</Text>
        <TrendingUp size={18} color={creatorColor} />
      </View>
      
      <View style={{ marginTop: 24, marginBottom: 16 }}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '80%', backgroundColor: creatorColor }]} />
        </View>
        <Text style={styles.progressText}>80% Complete</Text>
      </View>

      <View style={styles.strengthAlertBox}>
        <AlertCircle size={16} color="#D97706" />
        <Text style={styles.strengthAlertText}>Add 2 past collaborations to reach All-Star status.</Text>
      </View>
    </View>
  );

  const Reputation = () => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>Reputation</Text>
      
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: 10 }}>
        <View style={styles.reputationCircle}>
          <CheckCircle2 size={40} color="#10B981" />
        </View>
        <Text style={styles.reputationScore}>100%</Text>
        <Text style={styles.reputationSub}>On-Time Delivery</Text>
      </View>
    </View>
  );


  // --- Bottom Section (60/40 Split) ---

  const ActionCenter = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Action Center</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>2 Alerts</Text>
        </View>
      </View>

      <View style={styles.actionList}>
        {/* Action Item 1 */}
        <View style={styles.actionItem}>
          <View style={styles.actionIconBoxPrimary}>
            <Clock size={20} color="#000" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionItemTitle}>Upload draft for Campaign X by 5 PM</Text>
            <Text style={styles.actionItemSub}>Fintify App Promo • Due Today</Text>
          </View>
          <TouchableOpacity style={styles.actionBtnPrimary}>
            <Text style={styles.actionBtnPrimaryText}>Upload</Text>
          </TouchableOpacity>
        </View>

        {/* Action Item 2 */}
        <View style={styles.actionItem}>
          <View style={styles.actionIconBoxSecondary}>
            <AlertCircle size={20} color="#D97706" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionItemTitle}>Brand Y requested a revision</Text>
            <Text style={styles.actionItemSub}>Luxe Apparel Unboxing • Requires Action</Text>
          </View>
          <TouchableOpacity style={styles.actionBtnSecondary}>
            <Text style={styles.actionBtnSecondaryText}>View Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const ActivePipeline = () => (
    <TouchableOpacity 
      style={[styles.sectionCard, { padding: 20 }]} 
      onPress={() => navigation.navigate('Pipeline')}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={styles.sectionTitle}>Active Pipeline</Text>
        <ChevronRight size={20} color="#9CA3AF" />
      </View>

      <View style={styles.pipelineStats}>
        <View style={styles.pipelineStat}>
          <Text style={styles.pipelineNum}>3</Text>
          <Text style={styles.pipelineLabel}>Pitching</Text>
        </View>
        <View style={styles.pipelineDivider} />
        <View style={styles.pipelineStat}>
          <Text style={[styles.pipelineNum, { color: creatorColor }]}>1</Text>
          <Text style={styles.pipelineLabel}>In Production</Text>
        </View>
        <View style={styles.pipelineDivider} />
        <View style={styles.pipelineStat}>
          <Text style={[styles.pipelineNum, { color: '#10B981' }]}>2</Text>
          <Text style={styles.pipelineLabel}>Awaiting Payment</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const RecommendedGigs = () => (
    <View style={[styles.sectionCard, { flex: 1 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Opportunities')}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: creatorColor }}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 12 }}>
        {/* Gig 1 */}
        <View style={styles.gigCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Building2 size={14} color="#64748B" />
                <Text style={styles.gigBrand}>TechFlow</Text>
              </View>
              <Text style={styles.gigDeliverable}>1x YouTube Short</Text>
            </View>
            <Text style={styles.gigPayout}>₹25,000</Text>
          </View>
          <TouchableOpacity style={styles.applyBtn}>
            <Text style={styles.applyBtnText}>Apply Now</Text>
          </TouchableOpacity>
        </View>

        {/* Gig 2 */}
        <View style={styles.gigCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Building2 size={14} color="#64748B" />
                <Text style={styles.gigBrand}>Glow Cosmetics</Text>
              </View>
              <Text style={styles.gigDeliverable}>1x IG Reel</Text>
            </View>
            <Text style={styles.gigPayout}>₹40,000</Text>
          </View>
          <TouchableOpacity style={styles.applyBtn}>
            <Text style={styles.applyBtnText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
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
        <Text style={styles.pageTitle}>Dashboard</Text>

        {loading && !refreshing ? (
          <View style={{ marginTop: 100 }}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <View style={{ gap: 24 }}>
            
            {/* TOP ROW: Momentum Metrics */}
            <View style={isDesktop ? { flexDirection: 'row', gap: 24 } : { gap: 16 }}>
              <View style={isDesktop && { flex: 1 }}><ConnectedReach /></View>
              <View style={isDesktop && { flex: 1 }}><ProfileStrength /></View>
              <View style={isDesktop && { flex: 1 }}><Reputation /></View>
            </View>

            {/* BOTTOM ROW: Split Layout */}
            <View style={isDesktop ? { flexDirection: 'row', gap: 24 } : { gap: 16 }}>
              {/* Left Column (60%) */}
              <View style={isDesktop && { flex: 6 }}>
                <ActionCenter />
              </View>

              {/* Right Column (40%) */}
              <View style={isDesktop ? { flex: 4, gap: 24 } : { gap: 16 }}>
                <ActivePipeline />
                <RecommendedGigs />
              </View>
            </View>
            
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 180,
  },
  metricTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  metricBigNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1.5,
    marginTop: 8,
  },
  metricSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: -4,
  },
  platformsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 'auto',
    paddingTop: 16,
  },
  platformIconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  platformNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  strengthAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginTop: 'auto',
  },
  strengthAlertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    lineHeight: 16,
  },
  reputationCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  reputationScore: {
    fontSize: 24,
    fontWeight: '900',
    color: '#065F46',
  },
  reputationSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  
  // Bottom Section Styles
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  badge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B91C1C',
  },
  actionList: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionIconBoxPrimary: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionIconBoxSecondary: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
    paddingRight: 16,
  },
  actionItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  actionItemSub: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  actionBtnPrimary: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnSecondaryText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },

  pipelineStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pipelineStat: {
    flex: 1,
    alignItems: 'center',
  },
  pipelineNum: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  pipelineLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  pipelineDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },

  gigCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gigBrand: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  gigDeliverable: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  gigPayout: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
  },
  applyBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

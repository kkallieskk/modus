import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  Share,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';
import { linkInstagramAccount } from '@/lib/socialAuth';
import { PortfolioUploadModal } from '@/components/PortfolioUploadModal';
import { 
  Settings, 
  Edit3, 
  Star, 
  Instagram, 
  ExternalLink,
  Play,
  Grid,
  ChevronRight,
  TrendingUp,
  Award,
  Share2,
  Copy,
  Users,
  PieChart,
  MapPin,
  Eye,
  Link,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const CreatorProfileScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [reputation, setReputation] = useState<any>(null);
  const [isLinkingInstagram, setIsLinkingInstagram] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [hoveredPortfolioItem, setHoveredPortfolioItem] = useState<number | null>(null);

  useEffect(() => {
    if (isFocused) {
      fetchProfileData();
    }
  }, [isFocused]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profError) throw profError;
      setProfile(profData);

      const { data: reviews, error: revError } = await supabase
        .from('collab_reviews')
        .select('rating, tags')
        .eq('reviewee_id', user.id);

      if (!revError && reviews && reviews.length > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = totalRating / reviews.length;
        
        const tagCounts: Record<string, number> = {};
        reviews.forEach(r => {
          r.tags?.forEach((t: string) => {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
          });
        });
        
        const sortedTags = Object.entries(tagCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([tag]) => tag);

        setReputation({
          avgRating: avg,
          reviewCount: reviews.length,
          topTags: sortedTags
        });
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    const profileLink = `https://modus.app/${profile?.username || profile?.id}`;
    await Clipboard.setStringAsync(profileLink);
    if (Platform.OS === 'web') {
      window.alert('Media Kit link copied!');
    } else {
      Alert.alert('Link Copied', 'Media Kit link copied to clipboard.');
    }
  };

  const handleLinkInstagram = async () => {
    try {
      setIsLinkingInstagram(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { Alert.alert('Error', 'Please log in first.'); return; }

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('instagram_oauth_callback');
        window.localStorage.removeItem('instagram_oauth_error');
      }

      await linkInstagramAccount(user.id);

      let success = false;
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const { data } = await supabase.from('profiles').select('social_link').eq('id', user.id).single();
        if (data?.social_link) {
          try {
            const s = typeof data.social_link === 'string' ? JSON.parse(data.social_link) : data.social_link;
            if (s?.instagram?.handle) {
              success = true;
              await fetchProfileData();
              Alert.alert('🎉 Linked!', `@${s.instagram.handle} successfully connected!`);
              break;
            }
          } catch (_) {}
        }
      }
      if (!success) {
        Alert.alert('Timeout', 'Could not verify connection. Please try again.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setIsLinkingInstagram(false);
    }
  };

  const handlePortfolioUpload = (data: any) => {
    console.log('Portfolio Item Uploaded:', data);
    Alert.alert('Success', 'Portfolio item added successfully!');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  let followersText = '0';
  let engagementText = '0%';
  let nicheList = ['Lifestyle', 'Fashion', 'Comedy', 'Fitness'];
  let parsedSocialStats: any = null;

  if (profile?.social_link) {
    try {
      const socials = typeof profile.social_link === 'string'
        ? JSON.parse(profile.social_link)
        : profile.social_link;
      const primaryPlatform = Object.keys(socials)[0];
      if (primaryPlatform && socials[primaryPlatform]) {
        parsedSocialStats = socials[primaryPlatform];
        
        const count = parsedSocialStats.followersCount || parsedSocialStats.followerCount || 0;
        if (count >= 1000000) {
          followersText = (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
          followersText = (count / 1000).toFixed(1) + 'K';
        } else {
          followersText = String(count);
        }

        const rate = typeof parsedSocialStats.engagementRate === 'number' ? parsedSocialStats.engagementRate : 
                     (typeof parsedSocialStats.average_engagement_rate === 'number' ? parsedSocialStats.average_engagement_rate : 0);
        engagementText = rate.toFixed(1) + '%';
      }
    } catch (e) {
      console.warn('Error parsing social_link JSON in CreatorProfileScreen:', e);
    }
  }

  if (profile?.niche_industry) {
    nicheList = profile.niche_industry.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const avatarUri = profile?.avatar_url || parsedSocialStats?.avatarUrl || parsedSocialStats?.profilePictureUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6';

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. The Top Action Bar (The Utilities) - Sticky Header */}
      <View style={styles.stickyHeader}>
        <Text style={styles.headerTitle}>Media Kit Management</Text>
        <View style={styles.headerActionsGroup}>
          <TouchableOpacity 
            style={styles.pillBtn}
            onPress={() => navigation.navigate('PublicMediaKit')}
          >
            <Eye size={16} color="#0F172A" />
            {Platform.OS === 'web' && <Text style={styles.pillBtnText}>Preview</Text>}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.pillBtn}
            onPress={copyToClipboard}
          >
            <Link size={16} color="#0F172A" />
            {Platform.OS === 'web' && <Text style={styles.pillBtnText}>Copy Link</Text>}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.pillBtn, styles.pillBtnPrimary]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Edit3 size={16} color="#FFF" />
            <Text style={[styles.pillBtnText, { color: '#FFF' }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 2. The Identity Header (The Core Stats) - Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardLeft}>
            <View style={styles.avatarInner}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
              <View style={styles.verifiedBadge}>
                <Award size={10} color="#FFF" />
              </View>
            </View>
            <View style={styles.profileCardInfo}>
              <Text style={styles.profileCardName}>{profile?.display_name || 'Creator'}</Text>
              <Text style={styles.profileCardBio} numberOfLines={2}>
                {profile?.bio || 'Creator at Modus'}
              </Text>
            </View>
          </View>
          
          <View style={styles.profileCardRight}>
            <View style={styles.statsGrid}>
              <View style={styles.statsGridBox}>
                <View style={styles.statsIconRow}>
                  <Instagram size={14} color="#E1306C" />
                  <Text style={styles.statsGridLabel}>Total Reach</Text>
                </View>
                <Text style={styles.statsGridValue}>{followersText}</Text>
              </View>
              <View style={styles.statsDivider} />
              <View style={styles.statsGridBox}>
                <View style={styles.statsIconRow}>
                  <TrendingUp size={14} color="#10B981" />
                  <Text style={styles.statsGridLabel}>Engagement</Text>
                </View>
                <Text style={styles.statsGridValue}>{engagementText}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reputation Card */}
        {reputation && (
          <View style={styles.reputationCard}>
            <LinearGradient
              colors={['#FFFBEB', '#FEF3C7']}
              style={styles.reputationGradient}
            >
              <View style={styles.repLeft}>
                <View style={styles.ratingRow}>
                  <Star size={20} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>{reputation.avgRating.toFixed(1)}</Text>
                </View>
                <Text style={styles.reviewCount}>{reputation.reviewCount} verified reviews</Text>
              </View>
              <View style={styles.repRight}>
                {reputation.topTags.map((tag: string, i: number) => (
                  <View key={i} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        )}

        {/* 4. The Featured Portfolio (The Proof) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Grid size={18} color="#000" />
              <Text style={styles.sectionTitle}>Featured Portfolio</Text>
            </View>
            <TouchableOpacity 
              style={styles.addWorkBtn}
              onPress={() => setIsUploadModalOpen(true)}
            >
              <Plus size={14} color="#10B981" />
              <Text style={styles.addWorkText}>Add Past Work</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.portfolioScroll}
          >
            {[1, 2, 3].map((item) => (
              <View 
                key={item} 
                style={styles.portfolioItem}
                onMouseEnter={() => Platform.OS === 'web' && setHoveredPortfolioItem(item)}
                onMouseLeave={() => Platform.OS === 'web' && setHoveredPortfolioItem(null)}
              >
                <Image 
                  source={{ uri: `https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400` }} 
                  style={styles.portfolioImg} 
                />
                <View style={styles.playOverlay}>
                  <Play size={20} color="#FFF" fill="#FFF" />
                </View>

                {/* Edit/Trash Hover State */}
                {(Platform.OS !== 'web' || hoveredPortfolioItem === item) && (
                  <View style={styles.portfolioActionsOverlay}>
                    <TouchableOpacity style={styles.portfolioActionBtn}>
                      <Edit2 size={14} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.portfolioActionBtn, { backgroundColor: '#EF4444' }]}>
                      <Trash2 size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 5. Audience Demographics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="#000" />
              <Text style={styles.sectionTitle}>Audience Demographics</Text>
            </View>
            <View style={styles.verifiedTag}>
              <Award size={12} color="#10B981" />
              <Text style={styles.verifiedTagText}>Meta Verified</Text>
            </View>
          </View>

          {parsedSocialStats?.audienceDemographics ? (
            (() => {
              const genderAge = parsedSocialStats.audienceDemographics.audience_gender_age || {};
              let total = 0;
              let female = 0;
              let male = 0;
              
              Object.keys(genderAge).forEach(key => {
                const val = genderAge[key];
                total += val;
                if (key.startsWith('F')) female += val;
                if (key.startsWith('M')) male += val;
              });

              const femalePct = total > 0 ? Math.round((female / total) * 100) : 0;
              const malePct = total > 0 ? Math.round((male / total) * 100) : 0;

              return (
                <View style={styles.demographicsCard}>
                  <Text style={styles.demoTitle}>Audience Gender Split</Text>
                  
                  <View style={styles.demoBarContainer}>
                    <View style={[styles.demoBarFemale, { width: `${femalePct}%` }]} />
                    <View style={[styles.demoBarMale, { width: `${malePct}%` }]} />
                  </View>
                  
                  <View style={styles.demoLabels}>
                    <Text style={styles.demoLabelText}>👩 {femalePct}% Female</Text>
                    <Text style={styles.demoLabelText}>👨 {malePct}% Male</Text>
                  </View>
                </View>
              );
            })()
          ) : (
            <View style={styles.demoCompactBanner}>
              <Award size={18} color="#9CA3AF" />
              <Text style={styles.demoCompactText}>
                Unlock verified demographics by reaching 100 followers.
              </Text>
            </View>
          )}
        </View>

        {/* Niche Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niches & Expertise</Text>
          <View style={styles.nicheContainer}>
            {nicheList.map((niche) => (
              <View key={niche} style={styles.nicheBadge}>
                <Text style={styles.nicheText}>{niche}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Instagram Link Banner */}
        {!parsedSocialStats && (
          <View style={styles.igBanner}>
            <View style={styles.igBannerLeft}>
              <Instagram size={22} color="#E1306C" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.igBannerTitle}>Link your Instagram</Text>
                <Text style={styles.igBannerSub}>Let brands discover you & see your real stats</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.igBannerBtn}
              onPress={handleLinkInstagram}
              disabled={isLinkingInstagram}
            >
              {isLinkingInstagram
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Text style={styles.igBannerBtnText}>Connect</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Portfolio Upload Modal */}
      <PortfolioUploadModal 
        visible={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSubmit={handlePortfolioUpload} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  pillBtnPrimary: {
    backgroundColor: '#0F172A',
  },
  pillBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  
  // Profile Card
  profileCard: {
    flexDirection: Platform.OS === 'web' && Platform.isPad ? 'row' : 'column',
    alignItems: Platform.OS === 'web' && Platform.isPad ? 'center' : 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    gap: 24,
  },
  profileCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  avatar: { width: '100%', height: '100%' },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#10B981',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileCardInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileCardName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileCardBio: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 20,
    fontWeight: '500',
  },
  profileCardRight: {
    width: Platform.OS === 'web' && Platform.isPad ? 'auto' : '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statsGridBox: {
    flex: 1,
    alignItems: 'center',
  },
  statsIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statsGridLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  statsGridValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  statsDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },

  reputationCard: { paddingHorizontal: 20, marginTop: 24 },
  reputationGradient: { 
    flexDirection: 'row', 
    padding: 20, 
    borderRadius: 24, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEF3C7'
  },
  repLeft: { flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 24, fontWeight: '900', color: '#92400E' },
  reviewCount: { fontSize: 11, fontWeight: '700', color: '#B45309', marginTop: 4 },
  repRight: { flex: 1.2, flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' },
  tagBadge: { backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#FEF3C7' },
  tagText: { fontSize: 9, fontWeight: '800', color: '#B45309', textTransform: 'uppercase' },
  
  section: { marginTop: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#000', letterSpacing: -0.3 },
  addWorkBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  addWorkText: { fontSize: 13, fontWeight: '700', color: '#10B981' },
  portfolioScroll: { paddingLeft: 20, gap: 16 },
  portfolioItem: { width: 140, height: 200, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F3F4F6', position: 'relative' },
  portfolioImg: { width: '100%', height: '100%' },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.1)' },
  portfolioActionsOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
  },
  portfolioActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicheContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, marginTop: 4 },
  nicheBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  nicheText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  
  // Demographics
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedTagText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '700',
  },
  demographicsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 16,
  },
  demoBarContainer: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 16,
  },
  demoBarFemale: { backgroundColor: '#EC4899', height: '100%' },
  demoBarMale: { backgroundColor: '#3B82F6', height: '100%' },
  demoLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  demoLabelText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  demoCompactBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  demoCompactText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  
  // Instagram Link Banner
  igBanner: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: '#FFF0F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  igBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  igBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
  },
  igBannerSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  igBannerBtn: {
    backgroundColor: '#E1306C',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  igBannerBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

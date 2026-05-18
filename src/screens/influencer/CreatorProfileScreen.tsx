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
  Clipboard
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { linkInstagramAccount } from '@/lib/socialAuth';
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
  MapPin
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const CreatorProfileScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [reputation, setReputation] = useState<any>(null);
  const [isLinkingInstagram, setIsLinkingInstagram] = useState(false);

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

      // 1. Fetch Profile
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profError) throw profError;
      setProfile(profData);

      // 2. Fetch Reputation
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

  const handleShare = async () => {
    const profileLink = `https://modus.app/u/${profile.id}`;
    try {
      await Share.share({
        message: `Check out my Modus Media Kit: ${profileLink}`,
        url: profileLink,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const copyToClipboard = () => {
    const profileLink = `https://modus.app/u/${profile.id}`;
    Clipboard.setString(profileLink);
    Alert.alert('Link Copied', 'Your Media Kit link has been copied to your clipboard!');
  };

  const handleLinkInstagram = async () => {
    try {
      setIsLinkingInstagram(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { Alert.alert('Error', 'Please log in first.'); return; }

      // Clear stale callbacks
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('instagram_oauth_callback');
        window.localStorage.removeItem('instagram_oauth_error');
      }

      await linkInstagramAccount(user.id);

      // Poll for up to 10 seconds for the DB to update
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // 3. Parse live Instagram metrics from social_link JSON
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

  // Niches List from database profile or falling back to default lists
  if (profile?.niche_industry) {
    nicheList = profile.niche_industry.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const avatarUri = profile?.avatar_url || parsedSocialStats?.avatarUrl || parsedSocialStats?.profilePictureUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Controls */}
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.iconBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Settings size={22} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Edit3 size={18} color="#FFF" />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
 
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatarInner}>
              <Image 
                source={{ uri: avatarUri }} 
                style={styles.avatar} 
              />
            </View>
            <View style={styles.verifiedBadge}>
              <Award size={14} color="#FFF" />
            </View>
          </View>
          
          <Text style={styles.name}>{profile?.display_name}</Text>
          <Text style={styles.bio} numberOfLines={3}>{profile?.bio || 'Creator at Modus'}</Text>
          
          {/* Social Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{followersText}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{engagementText}</Text>
              <Text style={styles.statLabel}>Engagement</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{reputation?.reviewCount || 0}</Text>
              <Text style={styles.statLabel}>Collabs</Text>
            </View>
          </View>

          <View style={styles.shareRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Share2 size={18} color="#FFF" />
              <Text style={styles.shareBtnText}>Share Media Kit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard}>
              <Copy size={18} color="#000" />
            </TouchableOpacity>
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

        {/* Portfolio Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Grid size={18} color="#000" />
              <Text style={styles.sectionTitle}>Featured Portfolio</Text>
            </View>
            <TouchableOpacity style={styles.seeAll}>
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.portfolioScroll}
          >
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.portfolioItem}>
                <Image 
                  source={{ uri: `https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400` }} 
                  style={styles.portfolioImg} 
                />
                <View style={styles.playOverlay}>
                  <Play size={20} color="#FFF" fill="#FFF" />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Verified Audience Demographics */}
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
            <LinearGradient
              colors={['#F3F4F6', '#E5E7EB']}
              style={styles.demoNudgeCard}
            >
              <TrendingUp size={24} color="#6B7280" />
              <Text style={styles.demoNudgeTitle}>Grow Your Audience</Text>
              <Text style={styles.demoNudgeText}>
                Meta requires at least 100 followers to unlock verified audience insights. Focus on consistent posting to unlock this powerful brand magnet!
              </Text>
            </LinearGradient>
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

        {/* Instagram Link Banner — shown only if NOT linked yet */}
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

        {/* Developer Settings — visible only in dev/testing phase */}
        <View style={styles.devSection}>
          <View style={styles.devSectionHeader}>
            <Text style={styles.devSectionTitle}>⚙️ Developer Settings</Text>
            <Text style={styles.devSectionSub}>Temporary testing tools</Text>
          </View>
          <TouchableOpacity
            style={[styles.devBtn, isLinkingInstagram && { opacity: 0.6 }]}
            onPress={handleLinkInstagram}
            disabled={isLinkingInstagram}
          >
            <Instagram size={18} color="#E1306C" />
            <Text style={styles.devBtnText}>
              {parsedSocialStats ? `Re-link Instagram (@${parsedSocialStats.handle})` : 'Link Instagram Account'}
            </Text>
            {isLinkingInstagram && <ActivityIndicator size="small" color="#E1306C" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16,
    zIndex: 10
  },
  iconBtn: { padding: 10, backgroundColor: '#F9FAFB', borderRadius: 12 },
  editBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#000', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 14 
  },
  editBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  heroSection: { alignItems: 'center', paddingHorizontal: 40, marginTop: 10 },
  avatarOuter: { padding: 4, borderRadius: 54, borderWidth: 2, borderColor: '#F3F4F6', position: 'relative' },
  avatarInner: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  verifiedBadge: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: '#000', 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF'
  },
  name: { fontSize: 28, fontWeight: '900', color: '#000', marginTop: 16, letterSpacing: -0.5 },
  bio: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 20, fontWeight: '500' },
  statsContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 24, 
    backgroundColor: '#F9FAFB', 
    paddingVertical: 16, 
    paddingHorizontal: 24, 
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#000' },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginTop: 2 },
  divider: { width: 1, height: 24, backgroundColor: '#E5E7EB' },
  reputationCard: { paddingHorizontal: 20, marginTop: 32 },
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
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  portfolioScroll: { paddingLeft: 20, gap: 16 },
  portfolioItem: { width: 140, height: 200, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F3F4F6', position: 'relative' },
  portfolioImg: { width: '100%', height: '100%' },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.1)' },
  nicheContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, marginTop: 4 },
  nicheBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  nicheText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    height: 54,
    borderRadius: 18,
    gap: 10,
  },
  shareBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  copyBtn: {
    width: 54,
    height: 54,
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Instagram Link Banner
  igBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
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
    fontWeight: '700',
    color: '#111',
  },
  igBannerSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  igBannerBtn: {
    backgroundColor: '#E1306C',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  igBannerBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  // Developer Settings
  devSection: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    padding: 16,
  },
  devSectionHeader: {
    marginBottom: 12,
  },
  devSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  devSectionSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  devBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: 12,
    padding: 14,
  },
  devBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E1306C',
    flex: 1,
  },
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
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  demoBarContainer: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 16,
  },
  demoBarFemale: {
    backgroundColor: '#EC4899', // Pink
    height: '100%',
  },
  demoBarMale: {
    backgroundColor: '#3B82F6', // Blue
    height: '100%',
  },
  demoLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  demoLabelText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  demoNudgeCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoNudgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginTop: 12,
    marginBottom: 6,
  },
  demoNudgeText: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18,
  },
});

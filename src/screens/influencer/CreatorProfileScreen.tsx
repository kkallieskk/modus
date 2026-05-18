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
  Copy
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const CreatorProfileScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [reputation, setReputation] = useState<any>(null);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // 3. Parse live Instagram metrics from social_link JSON
  let followersText = '0';
  let engagementText = '3.5%';
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

        const rate = parsedSocialStats.engagementRate || parsedSocialStats.average_engagement_rate || 3.5;
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
});

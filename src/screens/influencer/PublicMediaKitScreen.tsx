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
  Linking,
  Dimensions
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { 
  Star, 
  Instagram, 
  Play,
  Grid,
  TrendingUp,
  Award,
  Zap,
  ShieldCheck
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const PublicMediaKitScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { creatorId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [reputation, setReputation] = useState<any>(null);

  useEffect(() => {
    if (creatorId) {
      fetchPublicData();
    }
  }, [creatorId]);

  const fetchPublicData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Public Profile
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('id, display_name, bio, avatar_url, niches')
        .eq('id', creatorId)
        .single();

      if (profError) throw profError;
      setProfile(profData);

      // 2. Fetch Reputation
      const { data: reviews, error: revError } = await supabase
        .from('collab_reviews')
        .select('rating, tags')
        .eq('reviewee_id', creatorId);

      if (!revError && reviews && reviews.length > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = totalRating / reviews.length;
        setReputation({
          avgRating: avg,
          reviewCount: reviews.length
        });
      }
    } catch (err) {
      console.error('Error fetching public media kit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHireMe = () => {
    // Route to Brand Onboarding to hire this specific creator
    navigation.navigate('Onboarding', { 
      role: 'brand', 
      targetCreator: creatorId,
      campaignTitle: `Campaign with ${profile?.display_name}`
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* Sticky Header CTA */}
        <View style={styles.stickyHeader}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>MODUS VERIFIED MEDIA KIT</Text>
          </View>
          <TouchableOpacity style={styles.hireMeBtnSmall} onPress={handleHireMe}>
            <Text style={styles.hireMeBtnSmallText}>Hire Me</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#000', '#222']}
            style={styles.avatarGlow}
          >
            <View style={styles.avatarInner}>
              <Image 
                source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6' }} 
                style={styles.avatar} 
              />
            </View>
          </LinearGradient>
          
          <View style={styles.titleRow}>
            <Text style={styles.name}>{profile?.display_name}</Text>
            <Award size={24} color="#F59E0B" fill="#F59E0B" />
          </View>
          <Text style={styles.bio}>{profile?.bio || 'Professional Creator on Modus'}</Text>
          
          <View style={styles.socialStats}>
            <View style={styles.statBox}>
              <Instagram size={20} color="#000" />
              <Text style={styles.statValue}>Verified</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <TrendingUp size={20} color="#000" />
              <Text style={styles.statValue}>Top 1%</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Star size={20} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.statValue}>{reputation?.avgRating.toFixed(1) || '5.0'}</Text>
            </View>
          </View>
        </View>

        {/* Portfolio Showreel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Work</Text>
          <View style={styles.portfolioGrid}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.portfolioCard}>
                <Image 
                  source={{ uri: `https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400` }} 
                  style={styles.portfolioImg} 
                />
                <View style={styles.playBtn}>
                  <Play size={24} color="#FFF" fill="#FFF" />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Hire Me CTA Section */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <ShieldCheck size={40} color="#000" />
            <Text style={styles.ctaTitle}>Hire Securely via Modus</Text>
            <Text style={styles.ctaText}>
              Collaborate with {profile?.display_name} using our secure Escrow system. Funds are only released when you approve the content.
            </Text>
            <TouchableOpacity style={styles.hireMeBtnLarge} onPress={handleHireMe}>
              <Zap size={20} color="#FFF" fill="#FFF" />
              <Text style={styles.hireMeBtnText}>Start Collaboration</Text>
            </TouchableOpacity>
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
  stickyHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  brandBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  brandBadgeText: { fontSize: 10, fontWeight: '900', color: '#6B7280', letterSpacing: 1 },
  hireMeBtnSmall: { backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  hireMeBtnSmallText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  heroSection: { alignItems: 'center', paddingHorizontal: 20, marginTop: 40 },
  avatarGlow: { padding: 4, borderRadius: 64, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  avatarInner: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', borderWidth: 4, borderColor: '#FFF' },
  avatar: { width: '100%', height: '100%' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24 },
  name: { fontSize: 32, fontWeight: '900', color: '#000', letterSpacing: -1 },
  bio: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 12, lineHeight: 24, paddingHorizontal: 20 },
  socialStats: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 32, 
    gap: 20,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
  },
  statBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statValue: { fontSize: 14, fontWeight: '800', color: '#000' },
  statDivider: { width: 1, height: 16, backgroundColor: '#E5E7EB' },
  section: { marginTop: 48, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#000', marginBottom: 20 },
  portfolioGrid: { gap: 16 },
  portfolioCard: { width: '100%', height: 240, borderRadius: 24, overflow: 'hidden', backgroundColor: '#F3F4F6' },
  portfolioImg: { width: '100%', height: '100%' },
  playBtn: { position: 'absolute', top: '50%', left: '50%', marginLeft: -30, marginTop: -30, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', borderWeight: 2, borderColor: '#FFF' },
  ctaSection: { marginTop: 60, paddingHorizontal: 20 },
  ctaCard: { backgroundColor: '#F9FAFB', padding: 32, borderRadius: 32, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  ctaTitle: { fontSize: 22, fontWeight: '900', color: '#000', marginTop: 16 },
  ctaText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 12, lineHeight: 22 },
  hireMeBtnLarge: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#000', width: '100%', height: 60, borderRadius: 20, justifyContent: 'center', marginTop: 24 },
  hireMeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

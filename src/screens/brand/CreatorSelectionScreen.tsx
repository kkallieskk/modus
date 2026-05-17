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
import { ArrowLeft, Check, Star, Lightbulb, User } from 'lucide-react-native';

type Influencer = {
  id: string;
  display_name: string;
  niche_industry: string;
  avatar_url?: string;
  portfolio_thumbnail_url?: string;
  base_price?: number;
  status: string;
  bio?: string;
  highlights?: string[];
};

// Fallback demo data with Bio & Highlights (Logic-Correct)
const DEMO_CREATORS: Influencer[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    display_name: 'Aisha K.',
    niche_industry: 'Fashion & Apparel',
    avatar_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
    portfolio_thumbnail_url: 'https://images.unsplash.com/photo-1493558103805-03cf4e3d2a79?w=600&h=400&fit=crop',
    base_price: 4000,
    status: 'approved',
    bio: "Specializing in high-energy transition reels and minimalist fashion aesthetics.",
    highlights: ["4.9/5 Avg. Rating", "3-Day Fast Delivery"]
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    display_name: 'Rohan Sharma',
    niche_industry: 'Tech & Gadgets',
    avatar_url: 'https://images.unsplash.com/photo-1503443207920-c2aab9d1f9b7?w=400&h=400&fit=crop',
    portfolio_thumbnail_url: 'https://images.unsplash.com/photo-1517059224940-d4af9eec41e3?w=600&h=400&fit=crop',
    base_price: 7500,
    status: 'approved',
    bio: "Cinematic product unboxings and deep-dive technical reviews with professional sound design.",
    highlights: ["Tech Expert", "Macro Cinematography"]
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    display_name: 'Lena M.',
    niche_industry: 'Skincare & Beauty',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    portfolio_thumbnail_url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=400&fit=crop',
    base_price: 6200,
    status: 'approved',
    bio: "Natural beauty advocate focusing on organic skincare routines and honest GRWM stories.",
    highlights: ["Audience Growth Expert", "Top 1% Beauty"]
  },
];

export const CreatorSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { campaign_id, budget } = route.params || {};

  const [creators, setCreators] = useState<Influencer[]>([]);
  const [selectedCreators, setSelectedCreators] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'influencer')
        .eq('status', 'approved');

      if (error) throw error;

      if (data && data.length > 0) {
        setCreators(data as Influencer[]);
      } else {
        setCreators(DEMO_CREATORS);
      }
    } catch (err) {
      console.error('Error fetching creators:', err);
      setCreators(DEMO_CREATORS);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCreator = (creator: Influencer) => {
    const isSelected = selectedCreators.find((c) => c.id === creator.id);

    if (isSelected) {
      setSelectedCreators(selectedCreators.filter((c) => c.id !== creator.id));
    } else {
      if (selectedCreators.length >= 3) {
        Alert.alert('Limit Reached', 'You can select a maximum of 3 creators.');
        return;
      }
      setSelectedCreators([...selectedCreators, creator]);
    }
  };

  const handleSubmitOffers = async () => {
    if (selectedCreators.length === 0) return;
    if (!campaign_id) {
      Alert.alert('Error', 'Missing campaign reference.');
      return;
    }

    try {
      setSubmitting(true);

      const offers = selectedCreators.map((creator, index) => ({
        campaign_id: campaign_id,
        creator_id: creator.id,
        rank: index + 1,
        status: 'pending',
      }));

      const { error } = await supabase.from('campaign_offers').insert(offers);
      if (error) throw error;

      navigation.navigate('Checkout', { campaign_id, budget });
    } catch (err: any) {
      console.error('Submit offers error:', err);
      Alert.alert('Error', err.message || 'Could not save your selections.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24, backgroundColor: 'white' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 32, fontWeight: '900', color: '#000', letterSpacing: -1 }}>Select Your Lineup</Text>
        <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 8, lineHeight: 24 }}>
          Choose up to 3 creators to receive your brief. We'll automatically cascade offers in your preferred order.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
        {creators.map((creator) => {
          const selectedIndex = selectedCreators.findIndex((c) => c.id === creator.id);
          const isSelected = selectedIndex !== -1;
          const rank = selectedIndex + 1;

          return (
            <TouchableOpacity
              key={creator.id}
              onPress={() => handleToggleCreator(creator)}
              activeOpacity={0.9}
              style={[
                styles.creatorCard,
                isSelected && { borderColor: '#000', borderWidth: 2 }
              ]}
            >
              <View style={styles.cardHeader}>
                <Image
                  source={{ uri: creator.avatar_url || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=100' }}
                  style={styles.avatar}
                />
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.creatorName}>{creator.display_name}</Text>
                  <Text style={styles.creatorNiche}>{creator.niche_industry}</Text>
                </View>
                {isSelected && (
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{rank}</Text>
                  </View>
                )}
              </View>

              <View style={styles.bioContainer}>
                <Text style={styles.bioText}>{creator.bio || DEMO_CREATORS[0].bio}</Text>
                <View style={styles.highlightsRow}>
                  {(creator.highlights || DEMO_CREATORS[0].highlights)?.map((h, i) => (
                    <View key={i} style={styles.highlightBadge}>
                      <Text style={styles.highlightText}>{h}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.portfolioGrid}>
                {creator.portfolio_thumbnail_url && (
                  <Image source={{ uri: creator.portfolio_thumbnail_url }} style={styles.portfolioThumb} />
                )}
                <View style={styles.portfolioStats}>
                  <Text style={styles.statLabel}>Starting From</Text>
                  <Text style={styles.priceText}>₹{creator.base_price || 0}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Preferred Order</Text>
          <Text style={styles.footerValue}>{selectedCreators.length} of 3 Selected</Text>
        </View>
        <TouchableOpacity
          onPress={handleSubmitOffers}
          disabled={selectedCreators.length === 0 || submitting}
          style={[
            styles.submitButton,
            { backgroundColor: selectedCreators.length > 0 ? '#000' : '#F3F4F6' }
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={[styles.submitButtonText, { color: selectedCreators.length > 0 ? '#FFF' : '#9CA3AF' }]}>
              Continue to Funding
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  creatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
  },
  creatorName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  creatorNiche: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  rankBadge: {
    backgroundColor: '#000',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  bioContainer: {
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    fontWeight: '500',
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  highlightBadge: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  highlightText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  portfolioGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    paddingTop: 16,
  },
  portfolioThumb: {
    width: 80,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  portfolioStats: {
    flex: 1,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footerValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  submitButton: {
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '900',
  },
});

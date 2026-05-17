import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  KeyboardAvoidingView,
  Animated,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { DollarSign, Send, X, ShieldCheck, Star, Sparkles, ShoppingBag, Tag, Store, Dumbbell, Heart, Timer, Smartphone, Laptop, Cpu, Coffee, Pizza, Utensils, Crown, User } from 'lucide-react-native';
import { useProfile } from '@/lib/ProfileContext';


// Niche filter pills
const FILTERS = ['All', 'Lifestyle', 'Unboxing', 'Under ₹5k', '₹5k–10k', 'Tech', 'Beauty'];

// Placeholder thumbnails per niche for visual richness
const NICHE_THUMBNAILS: Record<string, string> = {
  'Tech & Gadgets': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
  'Skincare & Beauty': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80',
  'Fashion & Apparel': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
  'Food & Beverage': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  'Premium Retail': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
  default: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80',
};

type Influencer = {
  id: string;
  display_name: string;
  niche_industry: string;
  avatar_url?: string;
  portfolio_thumbnail_url?: string;
  base_price?: number;
  status: string;
};

// Hardcoded demo creators used as fallback when DB fetch fails
const DEMO_CREATORS: Influencer[] = [
  {
    id: 'demo1',
    display_name: 'Aisha K.',
    niche_industry: 'Fashion & Apparel',
    avatar_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
    portfolio_thumbnail_url: 'https://images.unsplash.com/photo-1493558103805-03cf4e3d2a79?w=600&h=400&fit=crop',
    base_price: 4000,
    status: 'approved',
  },
  {
    id: 'demo2',
    display_name: 'Rohan Sharma',
    niche_industry: 'Tech & Gadgets',
    avatar_url: 'https://images.unsplash.com/photo-1503443207920-c2aab9d1f9b7?w=400&h=400&fit=crop',
    portfolio_thumbnail_url: 'https://images.unsplash.com/photo-1517059224940-d4af9eec41e3?w=600&h=400&fit=crop',
    base_price: 7500,
    status: 'approved',
  },
  {
    id: 'demo3',
    display_name: 'Lena M.',
    niche_industry: 'Skincare & Beauty',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    portfolio_thumbnail_url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=400&fit=crop',
    base_price: 6200,
    status: 'approved',
  },
  {
    id: 'demo4',
    display_name: 'Carlos D.',
    niche_industry: 'Food & Beverage',
    avatar_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
    portfolio_thumbnail_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    base_price: 5000,
    status: 'approved',
  },
  {
    id: 'demo5',
    display_name: 'Mira S.',
    niche_industry: 'Premium Retail',
    avatar_url: 'https://images.unsplash.com/photo-1602524202741-5d8b0d28fa6b?w=400&h=400&fit=crop',
    portfolio_thumbnail_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop',
    base_price: 12000,
    status: 'approved',
  },
];

const CreatorCardSkeleton = ({ index }: { index: number }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    const timer = setTimeout(startAnimation, index * 100);
    return () => clearTimeout(timer);
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#D1D5DB'],
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 20,
        margin: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Image Block Mirroring */}
      <Animated.View style={{ width: '100%', height: 140, backgroundColor }} />
      
      {/* Text Block Alignment */}
      <View style={{ padding: 12 }}>
        {/* Name Placeholder */}
        <Animated.View style={{ width: '70%', height: 14, backgroundColor, borderRadius: 100 }} />
        {/* Niche Placeholder */}
        <Animated.View style={{ width: '40%', height: 11, backgroundColor, borderRadius: 100, marginTop: 4 }} />
      </View>
    </View>
  );
};

type BrandProfile = {
  company_name?: string;
  industry?: string;
};

export const BrandDashboard = () => {
  const navigation = useNavigation<any>();
  const { profile: brandProfile, loading: profileLoading } = useProfile();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [filtered, setFiltered] = useState<Influencer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiEmptyState, setAiEmptyState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadingPhrases = ['Analyzing your brand vibe...', 'Scanning creator niches...', 'Sorting by highest match...'];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [searchMeta, setSearchMeta] = useState<{ has_exact_match: boolean; target_niches: string[]; query: string; relaxed_price_search?: boolean; max_price?: number | null } | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [isCampaignModalVisible, setIsCampaignModalVisible] = useState(false);
  const searchInputRef = React.useRef<TextInput>(null);


  const brandColor = brandProfile?.brand_color || '#8B5CF6';
  const complementaryColor = '#06B6D4'; // Soft cyan to complement the violet/blue



  // Background artifacts removed for "Scorched Earth" policy



  // Modal State
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [brief, setBrief] = useState('');
  const [budget, setBudget] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);

      let aiCreators = [];
      if (brandProfile && (brandProfile.industry || brandProfile.bio)) {
        const brandContext = `Brand Industry: ${brandProfile.industry || ''}. Brand Bio: ${brandProfile.bio || ''}`;
        try {
          const { data: searchData, error: searchError } = await supabase.functions.invoke('semantic-search', {
            body: { 
              query: brandContext,
              match_count: 15,
              match_threshold: 0.0
            }
          });

          if (!searchError && searchData) {
            aiCreators = searchData.creators || searchData || [];
          }
        } catch (e) {
          console.error('Failed to fetch semantic auto-match:', e);
        }
      }

      // Phase 2: The Global Fetch (The Rest)
      const { data: globalCreators, error: globalError } = await supabase
        .from('profiles')
        .select('id, display_name, niche_industry, avatar_url, portfolio_thumbnail_url, base_price, status')
        .eq('role', 'influencer')
        .eq('status', 'approved');

      let finalCreators = [];
      if (!globalError && globalCreators) {
        // Phase 3: The Merge & Deduplication
        const aiIds = new Set(aiCreators.map((c: any) => c.id));
        const restOfCreators = globalCreators.filter((c: any) => !aiIds.has(c.id));
        finalCreators = [...aiCreators, ...restOfCreators];
      } else {
        finalCreators = aiCreators.length > 0 ? aiCreators : DEMO_CREATORS;
      }

      setUsedFallback(aiCreators.length === 0);
      setInfluencers(finalCreators);
      setFiltered(finalCreators);
    } catch (err) {
      console.error('Fetch error:', err);
      setInfluencers(DEMO_CREATORS);
      setFiltered(DEMO_CREATORS);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setAiEmptyState(false);
    setSearchMeta(null);
    setFiltered([]); // Clear feed

    try {
      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: { 
          query: searchQuery,
          match_count: 10,
          match_threshold: 0.5
        }
      });

      if (error) {
        throw new Error(error.message || 'Error executing AI search');
      }

      // New response shape: { creators: [...], meta: { has_exact_match, target_niches, ... } }
      const creators = data?.creators || data || [];
      const meta = data?.meta || null;

      if (!creators || creators.length === 0) {
        setFiltered([]);
        setAiEmptyState(true);
      } else {
        setFiltered(creators);
        setSearchMeta(meta);
      }
    } catch (err: any) {
      console.error('Semantic search error:', err);
      Alert.alert('AI Search Failed', 'Could not complete the semantic search. Please check your network or try again.');
      setFiltered(influencers); // Revert to full list
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAiEmptyState(false);
    setSearchMeta(null);
    setFiltered(influencers);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getThumbnail = (niche: string) => {
    const key = Object.keys(NICHE_THUMBNAILS).find(k =>
      niche?.toLowerCase().includes(k.toLowerCase().split(' ')[0])
    );
    return NICHE_THUMBNAILS[key || 'default'];
  };

  const handleSubmitProposal = () => {
    if (!brief || !budget || !selectedInfluencer) {
      Alert.alert('Missing Info', 'Please provide a campaign brief and budget.');
      return;
    }
    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid budget amount.');
      return;
    }
    const influencerToPass = { ...selectedInfluencer };
    const briefToPass = brief;
    const budgetToPass = budget;
    setSelectedInfluencer(null);
    setBrief('');
    setBudget('');
    navigation.navigate('Checkout', {
      influencer: influencerToPass,
      brief: briefToPass,
      budget: budgetToPass,
    });
  };

  const renderCreatorCard = ({ item, index }: { item: Influencer, index: number }) => {
    const thumb = item.portfolio_thumbnail_url || item.avatar_url || getThumbnail(item.niche_industry || '');
    return (
      <View key={item.id ? item.id.toString() : `creator-${index}`} style={{ width: isDesktop ? '25%' : '50%' }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreatorProfile', { creator_id: item.id })}
          style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 20,
            margin: 8,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: thumb }}
              style={{ width: '100%', height: 140 }}
              resizeMode="cover"
            />
          </View>

          <View style={{ padding: 12 }}>
            <Text style={{ fontWeight: '800', fontSize: 14, color: '#000' }} numberOfLines={1}>
              {item.display_name}
            </Text>
            <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 4, fontWeight: '600' }} numberOfLines={1}>
              {item.niche_industry?.toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Premium Aurora Blend - Diagonal Mesh Gradient */}
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={[brandColor + '1A', complementaryColor + '10', '#FFFFFF00']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 450,
        }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + 100,
          maxWidth: isDesktop ? 1200 : undefined,
          width: isDesktop ? '100%' : undefined,
          alignSelf: isDesktop ? 'center' : undefined,
        }}
      >
        {/* Bespoke Roster Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingHorizontal: 20, 
          paddingTop: Math.max(insets.top, 20) + 12,
          paddingBottom: 12,
        }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#000' }}>
            Curated for <Text style={{ color: brandColor }}>{brandProfile?.display_name || 'You'}</Text>
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('CampaignBuilder')}
              style={{ 
                backgroundColor: '#000', 
                paddingHorizontal: 12, 
                paddingVertical: 8, 
                borderRadius: 100,
                marginRight: 12
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>+ Campaign</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('BrandProfile')}>
              {brandProfile?.avatar_url ? (
                <Image source={{ uri: brandProfile.avatar_url }} style={{ width: 36, height: 36, borderRadius: 18 }} />
              ) : (
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
                  <User size={20} color="#9CA3AF" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Content Container */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, position: 'relative' }}>
          {/* Background artifacts nuked */}

          {/* Aura Search Bar - True Glow */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              paddingHorizontal: 16,
              height: 58,
              // True Glow Shadow
              shadowColor: brandColor,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.12,
              shadowRadius: 15,
              elevation: 10,
            }}
          >
            <Sparkles size={20} color={brandColor} />
            <TextInput
              ref={searchInputRef}
              style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#000', fontWeight: '500' }}
              placeholder="Describe your ideal creator..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSemanticSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={handleClearSearch} style={{ padding: 4 }}>
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={() => navigation.navigate('CampaignBuilder')}
                style={{ 
                  backgroundColor: brandColor + '15', 
                  paddingHorizontal: 10, 
                  paddingVertical: 6, 
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Sparkles size={12} color={brandColor} />
                <Text style={{ color: brandColor, fontWeight: 'bold', fontSize: 11, marginLeft: 4 }}>Draft with AI</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Dynamic Content Area */}
        {isSearching ? (
          <View style={{ paddingVertical: 100, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={brandColor} />
            <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280', fontWeight: '600' }}>
              AI is analyzing the roster...
            </Text>
          </View>
        ) : aiEmptyState ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Sparkles size={48} color="#D1D5DB" />
            <Text style={{ marginTop: 16, fontSize: 18, color: '#374151', fontWeight: 'bold', textAlign: 'center' }}>
              No Perfect Matches Found
            </Text>
            <Text style={{ marginTop: 8, fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 }}>
              We couldn't find a creator matching that exact vibe. Try adjusting your search!
            </Text>
            <TouchableOpacity onPress={handleClearSearch} style={{ marginTop: 24, backgroundColor: '#000', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 100 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading && !refreshing ? (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 12 }}>
              {loadingPhrases[phraseIndex]}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View key={`skeleton-container-${i}`} style={{ width: '50%' }}>
                  <CreatorCardSkeleton index={i} />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 8 }}>
            {searchMeta && (!searchMeta.has_exact_match || searchMeta.relaxed_price_search) && (
              <View
                style={{
                  backgroundColor: '#FFFBEB',
                  borderWidth: 1,
                  borderColor: '#FDE68A',
                  borderRadius: 16,
                  padding: 14,
                  marginHorizontal: 8,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <Text style={{ fontSize: 18 }}>🔍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#92400E' }}>
                    {searchMeta.relaxed_price_search
                      ? `No ${searchMeta.target_niches.join(', ')} creators found under ₹${searchMeta.max_price?.toLocaleString()}`
                      : `No exact match for "${searchMeta.target_niches.join(', ')}"`
                    }
                  </Text>
                  <Text style={{ fontSize: 12, color: '#B45309', marginTop: 3, lineHeight: 18 }}>
                    {searchMeta.relaxed_price_search
                      ? `Showing the closest matching creators regardless of budget. You can negotiate rates directly!`
                      : `Showing creators from related niches who have relevant experience. They may be a great fit for your campaign!`
                    }
                  </Text>
                </View>
              </View>
            )}

            {(!searchMeta && !aiEmptyState && !isSearching) && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 12, marginTop: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#000' }}>
                  {usedFallback ? 'Trending Creators' : 'Recommended For You'}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              {filtered.map((item, index) => renderCreatorCard({ item, index }))}
            </View>

            {filtered.length === 0 && !isLoading && (
              <View style={{ alignItems: 'center', paddingTop: 80 }}>
                <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>
                  No creators found for this filter.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Propose Deal Modal */}
      <Modal visible={!!selectedInfluencer} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <View>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#000' }}>Propose Collab</Text>
                <Text style={{ color: '#9CA3AF', marginTop: 4 }}>
                  with {selectedInfluencer?.display_name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedInfluencer(null)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: 16 }}>
                <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Campaign Brief</Text>
                <TextInput
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                    borderRadius: 18,
                    padding: 16,
                    color: '#000',
                    fontSize: 15,
                    minHeight: 110,
                    textAlignVertical: 'top',
                  }}
                  placeholder="e.g. 1 Instagram Reel showcasing product unboxing..."
                  multiline
                  numberOfLines={4}
                  value={brief}
                  onChangeText={setBrief}
                />
              </View>

              <View style={{ marginBottom: 28 }}>
                <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Proposed Budget (₹)</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 18, paddingHorizontal: 16, height: 56 }}>
                  <DollarSign size={20} color="#000" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 10, fontSize: 20, fontWeight: '700', color: '#000' }}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={budget}
                    onChangeText={setBudget}
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleSubmitProposal}
              style={{ backgroundColor: '#000', height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 17, marginRight: 8 }}>
                Proceed to Checkout
              </Text>
              <Send size={18} color="white" />
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* AI Wizard Overlays nuked for separate screen architecture */}
    </View>
  );
};

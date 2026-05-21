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
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';
import { linkInstagramAccount } from '@/lib/socialAuth';
import { PortfolioUploadModal } from '@/components/PortfolioUploadModal';
import { 
  Edit3, 
  Star, 
  Instagram, 
  Youtube,
  Play,
  Grid,
  TrendingUp,
  Award,
  Eye,
  Link,
  Plus,
  Trash2,
  Edit2,
  Users,
  MapPin,
  Tag,
  CheckCircle2,
  X
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const CreatorProfileScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [reputation, setReputation] = useState<any>(null);
  
  // Rate Card State
  const [openToBarter, setOpenToBarter] = useState(true);
  const [rates, setRates] = useState([
    { id: 1, platform: 'instagram', name: 'Dedicated Reel', price: 45000, details: 'Includes 1 round of revisions, cross-posted to stories.' },
    { id: 2, platform: 'instagram', name: 'Story with Link', price: 15000, details: '3 frames, swipe-up link included.' },
    { id: 3, platform: 'youtube', name: 'Dedicated Video', price: 80000, details: '8-10 min video, full integration.' }
  ]);
  
  const [isEditRateModalOpen, setIsEditRateModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<any>(null);

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
    // Logic remains same
  };

  const handlePortfolioUpload = (data: any) => {
    Alert.alert('Success', 'Portfolio item added successfully!');
  };

  const saveRate = () => {
    setRates(prev => prev.map(r => r.id === editingRate.id ? editingRate : r));
    setIsEditRateModalOpen(false);
    setEditingRate(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // --- Mocked Stats for Display ---
  let igFollowersText = '1.2M';
  let ytSubsText = '450K';
  
  let nicheList = ['Lifestyle', 'Fashion', 'Comedy', 'Fitness'];
  if (profile?.niche_industry) {
    nicheList = profile.niche_industry.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const avatarUri = profile?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6';

  // --- MOCK PORTFOLIO DATA ---
  const portfolioItems = [
    { id: 1, image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df', brand: 'Netflix', metric: '1.2M Views' },
    { id: 2, image: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980', brand: 'Boat', metric: '10% CTR' },
    { id: 3, image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f', brand: 'Nike', metric: '800K Views' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. The Top Action Bar */}
      <View style={styles.stickyHeader}>
        <Text style={styles.headerTitle}>Media Kit</Text>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* 2. Hero & Verified Stats */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardLeft}>
            <View style={styles.avatarInner}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
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
                  <Text style={styles.statsGridLabel}>Instagram Reach</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.statsGridValue}>{igFollowersText}</Text>
                  <Award size={14} color="#10B981" />
                </View>
              </View>
              <View style={styles.statsDivider} />
              <View style={styles.statsGridBox}>
                <View style={styles.statsIconRow}>
                  <Youtube size={14} color="#FF0000" />
                  <Text style={styles.statsGridLabel}>YouTube Subs</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.statsGridValue}>{ytSubsText}</Text>
                  <Award size={14} color="#10B981" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Featured Portfolio (Enhanced) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Grid size={18} color="#0F172A" />
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
            {portfolioItems.map((item) => (
              <View 
                key={item.id} 
                style={styles.portfolioItem}
                onMouseEnter={() => Platform.OS === 'web' && setHoveredPortfolioItem(item.id)}
                onMouseLeave={() => Platform.OS === 'web' && setHoveredPortfolioItem(null)}
              >
                <Image source={{ uri: item.image }} style={styles.portfolioImg} />
                <View style={styles.playOverlay}>
                  <Play size={24} color="#FFF" fill="#FFF" />
                </View>
                
                {/* Brand Overlay Pill */}
                <View style={styles.brandOverlayPill}>
                  <Text style={styles.brandOverlayText}>{item.brand}</Text>
                </View>

                {/* Bottom Metric Banner */}
                <View style={styles.metricBanner}>
                  <TrendingUp size={12} color="#FFF" />
                  <Text style={styles.metricBannerText}>{item.metric}</Text>
                </View>

                {/* Edit/Trash Hover State */}
                {(Platform.OS !== 'web' || hoveredPortfolioItem === item.id) && (
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

        {/* 4. Audience Demographics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="#0F172A" />
              <Text style={styles.sectionTitle}>Audience Demographics</Text>
            </View>
            <View style={styles.verifiedTag}>
              <CheckCircle2 size={12} color="#10B981" />
              <Text style={styles.verifiedTagText}>Meta Verified</Text>
            </View>
          </View>

          <View style={styles.demoColumns}>
            {/* Left Column: Top Cities */}
            <View style={styles.demoCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <MapPin size={16} color="#64748B" />
                <Text style={styles.demoTitle}>Top Cities</Text>
              </View>
              <View style={styles.cityList}>
                {[{name: 'Mumbai', pct: 32}, {name: 'Bengaluru', pct: 24}, {name: 'Delhi', pct: 18}].map((city) => (
                  <View key={city.name} style={styles.cityRow}>
                    <View style={styles.cityTextRow}>
                      <Text style={styles.cityName}>{city.name}</Text>
                      <Text style={styles.cityPct}>{city.pct}%</Text>
                    </View>
                    <View style={styles.cityBarBg}>
                      <View style={[styles.cityBarFill, { width: `${city.pct}%` }]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Right Column: Age & Gender */}
            <View style={styles.demoCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <Users size={16} color="#64748B" />
                <Text style={styles.demoTitle}>Age & Gender</Text>
              </View>
              
              {/* Gender Split */}
              <View style={{ marginBottom: 24 }}>
                <View style={styles.demoBarContainer}>
                  <View style={[styles.demoBarFemale, { width: '55%' }]} />
                  <View style={[styles.demoBarMale, { width: '45%' }]} />
                </View>
                <View style={styles.demoLabels}>
                  <Text style={styles.demoLabelText}>👩 55% Female</Text>
                  <Text style={styles.demoLabelText}>👨 45% Male</Text>
                </View>
              </View>

              {/* Age Bracket */}
              <View style={styles.ageGrid}>
                <View style={styles.ageBox}>
                  <Text style={styles.ageBracket}>18-24</Text>
                  <Text style={styles.agePct}>42%</Text>
                </View>
                <View style={styles.ageBox}>
                  <Text style={styles.ageBracket}>25-34</Text>
                  <Text style={styles.agePct}>38%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 5. Deliverables & Rates (NEW) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Tag size={18} color="#0F172A" />
              <Text style={styles.sectionTitle}>Deliverables & Rates</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.barterText}>Open to Barter</Text>
              <Switch 
                value={openToBarter} 
                onValueChange={setOpenToBarter}
                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                thumbColor="#FFF"
              />
            </View>
          </View>

          <View style={styles.ratesContainer}>
            {rates.map((rate) => (
              <View key={rate.id} style={styles.rateCard}>
                <View style={styles.rateCardLeft}>
                  <View style={styles.platformIconBox}>
                    {rate.platform === 'instagram' ? <Instagram size={18} color="#E1306C" /> : <Youtube size={18} color="#FF0000" />}
                  </View>
                  <View>
                    <Text style={styles.rateName}>{rate.name}</Text>
                    <Text style={styles.rateDetails} numberOfLines={1}>{rate.details}</Text>
                  </View>
                </View>
                <View style={styles.rateCardRight}>
                  <Text style={styles.ratePrice}>₹{rate.price.toLocaleString()}</Text>
                  <TouchableOpacity 
                    style={styles.rateEditBtn}
                    onPress={() => { setEditingRate(rate); setIsEditRateModalOpen(true); }}
                  >
                    <Edit2 size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addRateBtn}>
              <Plus size={16} color="#4F46E5" />
              <Text style={styles.addRateBtnText}>Add Deliverable</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Portfolio Upload Modal */}
      <PortfolioUploadModal 
        visible={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSubmit={handlePortfolioUpload} 
      />

      {/* Edit Rate Modal */}
      <Modal
        visible={isEditRateModalOpen}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rateModalContent}>
            <View style={styles.rateModalHeader}>
              <Text style={styles.rateModalTitle}>Edit Deliverable</Text>
              <TouchableOpacity onPress={() => setIsEditRateModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price (₹)</Text>
              <TextInput
                style={styles.textInput}
                value={editingRate?.price?.toString()}
                onChangeText={(val) => setEditingRate({...editingRate, price: parseInt(val) || 0})}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Deliverable Details</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                value={editingRate?.details}
                onChangeText={(val) => setEditingRate({...editingRate, details: val})}
                multiline
              />
            </View>

            <TouchableOpacity style={styles.saveRateBtn} onPress={saveRate}>
              <Text style={styles.saveRateBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
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
    fontWeight: '900',
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
  
  // Profile Stats Hero
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
    borderColor: '#E2E8F0',
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
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  avatar: { width: '100%', height: '100%' },
  profileCardInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileCardName: {
    fontSize: 20,
    fontWeight: '900',
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
    borderColor: '#E2E8F0',
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
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  statsGridValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  statsDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  
  // Sections
  section: { marginTop: 40, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  
  // Enhanced Portfolio
  addWorkBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  addWorkText: { fontSize: 13, fontWeight: '700', color: '#10B981' },
  portfolioScroll: { gap: 16 },
  portfolioItem: { width: 160, height: 220, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F1F5F9', position: 'relative' },
  portfolioImg: { width: '100%', height: '100%' },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.15)' },
  brandOverlayPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backdropFilter: 'blur(4px)',
  },
  brandOverlayText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  metricBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metricBannerText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
  },
  portfolioActionsOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6,
  },
  portfolioActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Demographics Visualizer
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
  demoColumns: {
    flexDirection: Platform.OS === 'web' && Platform.isPad ? 'row' : 'column',
    gap: 16,
  },
  demoCol: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 20,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  cityList: { gap: 12 },
  cityRow: {},
  cityTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cityName: { fontSize: 13, color: '#334155', fontWeight: '600' },
  cityPct: { fontSize: 13, color: '#0F172A', fontWeight: '800' },
  cityBarBg: { width: '100%', height: 6, backgroundColor: '#F1F5F9', borderRadius: 3 },
  cityBarFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 3 },

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
    fontWeight: '700',
  },
  ageGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  ageBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  ageBracket: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 4,
  },
  agePct: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },

  // Rates & Deliverables
  barterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  ratesContainer: {
    gap: 12,
  },
  rateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  rateCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  platformIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rateName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  rateDetails: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  rateCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratePrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  rateEditBtn: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  addRateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    borderStyle: 'dashed',
    backgroundColor: '#EEF2FF',
    marginTop: 4,
  },
  addRateBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4F46E5',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rateModalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 10 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 }
    })
  },
  rateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rateModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  saveRateBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveRateBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  Check, 
  X,
  FileText,
  Building2
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const OfferReviewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { offerId } = route.params;

  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOffer();
  }, []);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaign_offers')
        .select(`
          *,
          campaigns (
            title,
            brand_guidelines,
            budget,
            deliverable_type,
            vibe,
            guardrails,
            profiles:brand_id (display_name, avatar_url)
          )
        `)
        .eq('id', offerId)
        .single();

      if (error) throw error;
      setOffer(data);
    } catch (err) {
      console.error('Error fetching offer:', err);
      Alert.alert('Error', 'Failed to load offer details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: 'accepted' | 'rejected') => {
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('campaign_offers')
        .update({ status })
        .eq('id', offerId);

      if (error) throw error;

      if (status === 'accepted') {
        Alert.alert(
          'Offer Accepted!',
          'This collaboration has been moved to your Workspace. The brand has been notified to fund the escrow.',
          [{ text: 'Go to Workspace', onPress: () => navigation.navigate('Workspace') }]
        );
      } else {
        Alert.alert('Offer Declined', 'We have notified the brand politely.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const campaign = offer?.campaigns;
  const brand = campaign?.profiles;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.exclusiveBadge}>
          <Zap size={14} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.exclusiveText}>EXCLUSIVE INVITE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandHero}>
          <View style={styles.avatarContainer}>
            <Building2 size={32} color="#000" />
          </View>
          <Text style={styles.brandName}>{brand?.display_name}</Text>
          <Text style={styles.campaignTitle}>{campaign?.title}</Text>
        </View>

        <View style={styles.offerBanner}>
          <View>
            <Text style={styles.bannerLabel}>Guaranteed Payout</Text>
            <Text style={styles.bannerValue}>₹{campaign?.budget?.toLocaleString()}</Text>
          </View>
          <View style={styles.escrowBadge}>
            <ShieldCheck size={14} color="#059669" />
            <Text style={styles.escrowText}>ESCROW PROTECTED</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collaboration Brief</Text>
          <View style={styles.briefCard}>
            <Text style={styles.briefText}>{campaign?.brand_guidelines}</Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.detailCard}>
            <FileText size={20} color="#6B7280" />
            <Text style={styles.detailLabel}>Deliverable</Text>
            <Text style={styles.detailValue}>{campaign?.deliverable_type}</Text>
          </View>
          <View style={styles.detailCard}>
            <Zap size={20} color="#6B7280" />
            <Text style={styles.detailLabel}>Niche/Vibe</Text>
            <Text style={styles.detailValue}>{campaign?.vibe}</Text>
          </View>
        </View>

        {campaign?.guardrails && campaign.guardrails.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guardrails</Text>
            <View style={styles.guardrailsCard}>
              {campaign.guardrails.map((g: string, i: number) => (
                <View key={i} style={styles.guardrailItem}>
                  <Check size={14} color="#059669" />
                  <Text style={styles.guardrailText}>{g}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.declineBtn, processing && { opacity: 0.5 }]}
          onPress={() => handleAction('rejected')}
          disabled={processing}
        >
          <Text style={styles.declineBtnText}>Decline</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.acceptBtn, processing && { opacity: 0.5 }]}
          onPress={() => handleAction('accepted')}
          disabled={processing}
        >
          <LinearGradient
            colors={['#000000', '#1F2937']}
            style={styles.acceptGradient}
          >
            <Text style={styles.acceptBtnText}>Accept Offer</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { padding: 8, backgroundColor: '#F9FAFB', borderRadius: 12 },
  exclusiveBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: '#FFFBEB', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7'
  },
  exclusiveText: { fontSize: 10, fontWeight: '900', color: '#B45309' },
  scrollContent: { padding: 24 },
  brandHero: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  brandName: { fontSize: 14, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  campaignTitle: { fontSize: 28, fontWeight: '900', color: '#000', textAlign: 'center', letterSpacing: -1 },
  offerBanner: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB', 
    padding: 24, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#F3F4F6',
    marginBottom: 32
  },
  bannerLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 4 },
  bannerValue: { fontSize: 32, fontWeight: '900', color: '#000' },
  escrowBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  escrowText: { fontSize: 9, fontWeight: '900', color: '#059669' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#000', marginBottom: 16 },
  briefCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  briefText: { fontSize: 16, color: '#4B5563', lineHeight: 26 },
  detailGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  detailCard: { flex: 1, backgroundColor: '#F9FAFB', padding: 16, borderRadius: 20, gap: 8 },
  detailLabel: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase' },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#000' },
  guardrailsCard: { backgroundColor: '#F9FAFB', padding: 20, borderRadius: 20, gap: 12 },
  guardrailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  guardrailText: { flex: 1, fontSize: 14, color: '#4B5563', fontWeight: '500' },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    padding: 24, 
    paddingBottom: 40, 
    gap: 16, 
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  declineBtn: { flex: 1, height: 64, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  declineBtnText: { fontSize: 16, fontWeight: '800', color: '#6B7280' },
  acceptBtn: { flex: 2, height: 64, borderRadius: 20, overflow: 'hidden' },
  acceptGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  acceptBtnText: { fontSize: 18, fontWeight: '900', color: '#FFF' },
});

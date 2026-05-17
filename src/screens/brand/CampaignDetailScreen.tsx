import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import {
  Package, Truck, CheckCircle2, X, Film, ThumbsUp,
  MessageSquareWarning, ExternalLink, Clock, RotateCcw, ChevronLeft, Building2,
  PlayCircle, AlertTriangle, Info
} from 'lucide-react-native';
import { RatingModal } from '@/components/RatingModal';
import { AutoReleaseTimer } from '@/components/AutoReleaseTimer';

export const CampaignDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { offerId } = route.params;

  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  // Shipping Modal State
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  const [courierName, setCourierName] = useState('');
  const [trackingLink, setTrackingLink] = useState('');

  // Revision Modal State
  const [revisionModalVisible, setRevisionModalVisible] = useState(false);
  const [revisionText, setRevisionText] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);

  // Rating Modal State
  const [ratingModalVisible, setRatingModalVisible] = useState(false);

  useEffect(() => {
    fetchOfferDetails();
  }, []);

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaign_offers')
        .select(`
          id,
          status,
          shipping_status,
          tracking_link,
          courier_name,
          deliverable_url,
          revision_notes,
          submitted_at,
          campaigns!inner(title, brand_id, budget),
          profiles!campaign_offers_creator_id_fkey(display_name, avatar_url)
        `)
        .eq('id', offerId)
        .single();

      if (error) throw error;
      setOffer(data);
      if (data.courier_name) setCourierName(data.courier_name);
      if (data.tracking_link) setTrackingLink(data.tracking_link);
    } catch (err: any) {
      console.error('Error fetching offer details:', err);
      Alert.alert('Error', 'Could not load campaign details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    Alert.alert(
      '🔒 Release Escrowed Funds',
      `Are you sure? This will instantly release ₹${offer.campaigns?.budget?.toLocaleString()} to the creator. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Release Funds',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              const { error } = await supabase
                .from('campaign_offers')
                .update({ status: 'pending_post' })
                .eq('id', offerId);

              if (error) throw error;
              setOffer((prev: any) => ({ ...prev, status: 'pending_post' }));
              
              // Trigger Rating Modal
              setTimeout(() => setRatingModalVisible(true), 500);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not approve the deliverable.');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleSubmitRevision = async () => {
    if (!revisionText.trim()) {
      Alert.alert('Missing Info', 'Please describe what needs to be revised.');
      return;
    }
    try {
      setSubmittingRevision(true);
      const { error } = await supabase
        .from('campaign_offers')
        .update({
          status: 'revision_requested',
          revision_notes: revisionText.trim(),
          submitted_at: null, // Reset the anti-ghosting timer
        })
        .eq('id', offerId);

      if (error) throw error;

      setOffer((prev: any) => ({ 
        ...prev, 
        status: 'revision_requested', 
        revision_notes: revisionText.trim(),
        submitted_at: null 
      }));
      setRevisionModalVisible(false);
      Alert.alert('📝 Revision Sent', 'The creator has been notified of your feedback.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send revision request.');
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleUpdateShipping = async (status: 'shipped' | 'not_required') => {
    if (status === 'shipped' && (!courierName.trim() || !trackingLink.trim())) {
      Alert.alert('Missing Info', 'Please enter both Courier Name and Tracking URL.');
      return;
    }
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('campaign_offers')
        .update({
          shipping_status: status,
          courier_name: status === 'shipped' ? courierName : null,
          tracking_link: status === 'shipped' ? trackingLink : null,
        })
        .eq('id', offerId);

      if (error) throw error;

      setOffer((prev: any) => ({ ...prev, shipping_status: status, courier_name: status === 'shipped' ? courierName : null, tracking_link: status === 'shipped' ? trackingLink : null }));
      setShippingModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update shipping status.');
    } finally {
      setUpdating(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
      pending: { bg: '#FEF3C7', color: '#D97706', icon: <Clock size={13} color="#D97706" />, label: 'Offer Sent' },
      accepted: { bg: '#DBEAFE', color: '#2563EB', icon: <Truck size={13} color="#2563EB" />, label: 'In Production' },
      pending_review: { bg: '#FFEBE0', color: '#EA580C', icon: <Film size={13} color="#EA580C" />, label: 'Review Required' },
      revision_requested: { bg: '#FEE2E2', color: '#DC2626', icon: <RotateCcw size={13} color="#DC2626" />, label: 'Revision Requested' },
      completed: { bg: '#D1FAE5', color: '#059669', icon: <CheckCircle2 size={13} color="#059669" />, label: 'Completed' },
    };
    const cfg = configs[status] || { bg: '#E5E7EB', color: '#6B7280', icon: <Clock size={13} color="#6B7280" />, label: 'Unknown' };
    
    const isActionRequired = status === 'pending_review';
    
    return (
      <View style={{ 
        backgroundColor: cfg.bg, 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 100, 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 5,
        borderWidth: isActionRequired ? 1.5 : 0,
        borderColor: isActionRequired ? '#EA580C' : 'transparent'
      }}>
        {cfg.icon}
        <Text style={{ color: cfg.color, fontWeight: '700', fontSize: 12 }}>{cfg.label}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!offer) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Offer not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Studio</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Media Viewer Placeholder */}
        <View style={styles.mediaContainer}>
          {offer.deliverable_url ? (
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => Linking.openURL(offer.deliverable_url)}
              style={styles.mediaPlaceholder}
            >
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80' }} 
                style={styles.mediaImage}
              />
              <View style={styles.mediaOverlay}>
                <PlayCircle size={64} color="white" />
                <Text style={styles.mediaOverlayText}>Tap to Play Draft</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.mediaPlaceholder, { backgroundColor: '#F3F4F6' }]}>
              <Film size={48} color="#9CA3AF" />
              <Text style={{ color: '#9CA3AF', marginTop: 12, fontWeight: '600' }}>Waiting for Content Draft...</Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <AutoReleaseTimer 
            submittedAt={offer?.submitted_at} 
            status={offer?.status} 
          />
        </View>

        {/* Status Banner */}
        {offer.status === 'pending_review' && (
          <View style={styles.statusBanner}>
            <Info size={18} color="#2563EB" />
            <Text style={styles.statusBannerText}>Draft 1 Submitted — Awaiting Your Review</Text>
          </View>
        )}

        {offer.status === 'revision_requested' && (
          <View style={[styles.statusBanner, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
            <RotateCcw size={18} color="#EA580C" />
            <Text style={[styles.statusBannerText, { color: '#EA580C' }]}>Revision Requested — Waiting for Creator</Text>
          </View>
        )}

        {/* Action Buttons (Massive & Side-by-Side) */}
        {offer.status === 'pending_review' && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={handleApprove}
              disabled={updating}
              style={[styles.massiveBtn, styles.approveBtn]}
            >
              <ThumbsUp size={24} color="white" />
              <Text style={styles.massiveBtnText}>Approve Draft: Awaiting Post</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRevisionModalVisible(true)}
              disabled={updating}
              style={[styles.massiveBtn, styles.reviseBtn]}
            >
              <MessageSquareWarning size={24} color="#DC2626" />
              <Text style={[styles.massiveBtnText, { color: '#DC2626' }]}>Request Revision</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Campaign Info Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.campaignTitle}>{offer.campaigns?.title}</Text>
              <Text style={styles.creatorName}>Creator: {offer.profiles?.display_name}</Text>
            </View>
            {renderStatusBadge(offer.status)}
          </View>

          <View style={styles.divider} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.label}>Budget (Escrowed)</Text>
              <Text style={styles.value}>₹{offer.campaigns?.budget?.toLocaleString()}</Text>
            </View>
            <View>
              <Text style={styles.label}>Shipping Status</Text>
              <Text style={styles.value}>{offer.shipping_status || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Revision Notes History */}
        {offer.revision_notes && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Revision History</Text>
            <View style={[styles.card, { backgroundColor: '#FEF2F2', borderLeftWidth: 4, borderLeftColor: '#EF4444' }]}>
              <Text style={{ color: '#7F1D1D', fontSize: 15, lineHeight: 22 }}>{offer.revision_notes}</Text>
            </View>
          </View>
        )}

        {/* Shipping Info Section (Only if accepted) */}
        {offer.status === 'accepted' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Shipping & Tracking</Text>
            <View style={styles.card}>
              {offer.shipping_status === 'shipped' && offer.tracking_link ? (
                <View>
                  <Text style={{ fontWeight: '700' }}>{offer.courier_name}</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(offer.tracking_link)}>
                    <Text style={{ color: '#2563EB', textDecorationLine: 'underline', marginTop: 4 }}>{offer.tracking_link}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={{ color: '#6B7280' }}>No shipping info provided yet.</Text>
              )}

              {offer.shipping_status === 'pending' && (
                <TouchableOpacity
                  onPress={() => setShippingModalVisible(true)}
                  style={[styles.actionBtn, { marginTop: 12 }]}
                >
                  <Truck size={18} color="white" />
                  <Text style={styles.actionBtnText}>Add Tracking Info</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={revisionModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={styles.modalTitle}>Request Revision</Text>
              <TouchableOpacity onPress={() => setRevisionModalVisible(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.revisionNotice}>
              <AlertTriangle size={16} color="#B45309" />
              <Text style={styles.revisionNoticeText}>1 of 1 Free Revisions Remaining</Text>
            </View>

            <Text style={styles.fieldLabel}>What needs to be changed?</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Please use a different background music or cut the first 3 seconds..."
              multiline
              numberOfLines={5}
              value={revisionText}
              onChangeText={setRevisionText}
            />
            
            <TouchableOpacity 
              onPress={handleSubmitRevision} 
              disabled={submittingRevision} 
              style={[styles.modalActionBtn, { backgroundColor: '#DC2626' }]}
            >
              {submittingRevision ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.modalActionBtnText}>Confirm Revision Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={shippingModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.modalTitle}>Update Shipping Info</Text>
              <TouchableOpacity onPress={() => setShippingModalVisible(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>Courier Name</Text>
            <TextInput style={styles.input} placeholder="e.g. FedEx" value={courierName} onChangeText={setCourierName} />
            <Text style={styles.fieldLabel}>Tracking URL</Text>
            <TextInput style={styles.input} placeholder="https://..." value={trackingLink} onChangeText={setTrackingLink} autoCapitalize="none" />
            
            <TouchableOpacity onPress={() => handleUpdateShipping('shipped')} disabled={updating} style={styles.modalActionBtn}>
              <Text style={styles.modalActionBtnText}>Mark as Shipped</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleUpdateShipping('not_required')} disabled={updating} style={[styles.modalActionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#000', marginTop: 8 }]}>
              <Text style={[styles.modalActionBtnText, { color: '#000' }]}>No Shipping Required</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {offer && (
        <RatingModal
          visible={ratingModalVisible}
          onClose={() => setRatingModalVisible(false)}
          offerId={offerId}
          reviewerId={offer.campaigns?.brand_id}
          revieweeId={offer.creator_id || route.params.creatorId} // Fallback to route params if not in select
          role="brand"
          campaignTitle={offer.campaigns?.title}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  scroll: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#000' },
  
  // Media Studio Styles
  mediaContainer: { marginBottom: 20, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  mediaPlaceholder: { height: 450, width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  mediaImage: { ...StyleSheet.absoluteFillObject },
  mediaOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  mediaOverlayText: { color: 'white', fontWeight: '800', fontSize: 16, marginTop: 12 },
  
  statusBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', padding: 16, borderRadius: 16, marginBottom: 20, gap: 10 },
  statusBannerText: { color: '#1E40AF', fontWeight: '700', fontSize: 14 },
  
  actionContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  massiveBtn: { flex: 1, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  massiveBtnText: { color: 'white', fontWeight: '800', fontSize: 13, textAlign: 'center', paddingHorizontal: 4 },

  card: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  campaignTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  creatorName: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  label: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  value: { fontSize: 16, fontWeight: '700', color: '#000', marginTop: 2 },
  section: { marginTop: 8 },
  sectionLabel: { fontSize: 14, fontWeight: '800', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase' },
  actionBtn: { backgroundColor: '#000', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  approveBtn: { backgroundColor: '#059669' },
  reviseBtn: { backgroundColor: 'white', borderWidth: 2, borderColor: '#DC2626' },
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#000' },
  revisionNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 12, borderRadius: 12, gap: 8, marginBottom: 20 },
  revisionNoticeText: { color: '#B45309', fontWeight: '700', fontSize: 14 },
  modalInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 20, fontSize: 16, minHeight: 120, textAlignVertical: 'top', color: '#000', marginBottom: 20 },
  modalActionBtn: { backgroundColor: '#000', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  modalActionBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
  fieldLabel: { fontSize: 15, fontWeight: '800', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, fontSize: 15, marginBottom: 16, color: '#000' },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  SafeAreaView,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  Upload, 
  Film, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck,
  FileText,
  Info,
  MessageSquare,
  Zap,
  RotateCcw,
  ExternalLink,
  Globe,
  Wallet,
  ShieldAlert,
  Star,
  CheckSquare,
  Square,
  Ban,
  LayoutGrid
} from 'lucide-react-native';
import { DisputeModal } from '@/components/DisputeModal';
import { RatingModal } from '@/components/RatingModal';
import { AutoReleaseTimer } from '@/components/AutoReleaseTimer';
import * as ImagePicker from 'expo-image-picker';

export const JobDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { offerId } = route.params;

  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<any>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [liveLink, setLiveLink] = useState('');
  const [submittingLink, setSubmittingLink] = useState(false);
  const [isDisputeVisible, setIsDisputeVisible] = useState(false);
  const [complianceChecks, setComplianceChecks] = useState({
    disclosure: false,
    brandMention: false,
    cta: false
  });
  const [selectedMedia, setSelectedMedia] = useState<{uri: string, type: string} | null>(null);
  const [addingToPortfolio, setAddingToPortfolio] = useState(false);

  useEffect(() => {
    fetchCampaignDetails();
  }, []);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data, error } = await supabase
        .from('campaign_offers')
        .select(`
          *,
          revision_count,
          campaigns (
            title,
            brand_guidelines,
            budget,
            deliverable_type,
            vibe,
            guardrails,
            brand_id,
            revision_limit,
            profiles:brand_id (display_name)
          )
        `)
        .eq('id', offerId)
        .single();

      if (error) throw error;
      setCampaign(data.campaigns);
      setOffer(data);

      if (data.status === 'completed') {
        const { data: existingReview } = await supabase
          .from('collab_reviews')
          .select('id')
          .eq('offer_id', offerId)
          .eq('reviewer_id', user?.id)
          .maybeSingle();
        
        if (!existingReview) {
          setTimeout(() => setRatingModalVisible(true), 1000);
        }
      }
    } catch (err: any) {
      console.error('Error fetching campaign details:', err);
      Alert.alert('Error', 'Failed to load campaign details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedMedia({
        uri: result.assets[0].uri,
        type: result.assets[0].type || 'image'
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedMedia) {
      Alert.alert('No File', 'Please select a draft to upload.');
      return;
    }

    try {
      setUploading(true);
      
      // 1. Upload to Storage
      const response = await fetch(selectedMedia.uri);
      const blob = await response.blob();
      const fileExt = selectedMedia.uri.split('.').pop();
      const fileName = `${offerId}/${Date.now()}.${fileExt}`;
      const filePath = `deliverables/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('modus-assets')
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Get URL
      const { data: { publicUrl } } = supabase.storage
        .from('modus-assets')
        .getPublicUrl(filePath);

      // 3. Update Status
      const { error: updateError } = await supabase
        .from('campaign_offers')
        .update({ 
          status: 'pending_review',
          deliverable_url: publicUrl,
          submitted_at: new Date().toISOString()
        })
        .eq('id', offerId);

      if (updateError) throw updateError;

      Alert.alert(
        'Success!',
        'Your draft has been submitted. The brand will review it shortly.',
        [{ text: 'Awesome', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      console.error('Upload error:', err);
      Alert.alert('Upload Failed', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitLiveLink = async () => {
    if (!liveLink.trim()) {
      Alert.alert('Link Required', 'Please paste the live URL of your post.');
      return;
    }

    if (!liveLink.includes('http')) {
      Alert.alert('Invalid URL', 'Please enter a valid URL (e.g., https://tiktok.com/...)');
      return;
    }

    try {
      setSubmittingLink(true);
      const { error } = await supabase
        .from('campaign_offers')
        .update({ 
          status: 'completed',
          live_link: liveLink.trim()
        })
        .eq('id', offerId);

      if (error) throw error;

      Alert.alert('Success!', 'Your post has been verified and funds have been released to your wallet.');
      setOffer((prev: any) => ({ ...prev, status: 'completed', live_link: liveLink.trim() }));
      setRatingModalVisible(true);
    } catch (err: any) {
      console.error('Error submitting live link:', err);
      Alert.alert('Error', 'Failed to submit live link. Please try again.');
    } finally {
      setSubmittingLink(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const handleAddToPortfolio = async () => {
    try {
      setAddingToPortfolio(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Project added to your public portfolio!');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToPortfolio(false);
    }
  };

  const brand = campaign?.profiles;

  const toggleCompliance = (key: keyof typeof complianceChecks) => {
    setComplianceChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isComplianceComplete = Object.values(complianceChecks).every(v => v);

  const handleBlockBrand = () => {
    Alert.alert(
      'Block Brand?',
      'You will no longer see opportunities or receive invites from this brand.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Block', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Brand has been blocked.');
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerSubtitle}>Collaboration Hub / Upload Studio</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{campaign?.title}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Chat', { offerId })}
          style={styles.chatBtn}
        >
          <MessageSquare size={20} color="#000" />
          <Text style={styles.chatBtnText}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setIsDisputeVisible(true)}
          style={styles.sosBtn}
        >
          <ShieldAlert size={20} color="#DC2626" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleBlockBrand}
          style={[styles.sosBtn, { backgroundColor: '#F3F4F6' }]}
        >
          <Ban size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Campaign Info Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color="#000" />
            <Text style={styles.sectionTitle}>Campaign Brief</Text>
            <View style={styles.lockedBadge}>
              <ShieldCheck size={12} color="#059669" />
              <Text style={styles.lockedText}>LOCKED</Text>
            </View>
          </View>

          {/* Brand Reputation Mirror */}
          <View style={styles.brandRepCard}>
            <View style={styles.brandRepHeader}>
              <View style={styles.brandRatingRow}>
                <Star size={16} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.brandRatingText}>{brand?.brand_rating || '4.8'}</Text>
                <Text style={styles.brandReviewCount}>({brand?.brand_review_count || '12'} reviews)</Text>
              </View>
              <View style={styles.tagContainer}>
                <View style={styles.repTag}><Text style={styles.repTagText}>Fast Approver</Text></View>
                <View style={[styles.repTag, { backgroundColor: '#F0F9FF' }]}><Text style={[styles.repTagText, { color: '#0369A1' }]}>Clear Briefs</Text></View>
              </View>
            </View>
          </View>
          
          {offer.status === 'completed' && (
            <View style={styles.successLoopCard}>
              <View style={styles.successIconBox}>
                <CheckCircle2 size={32} color="#10B981" />
              </View>
              <View style={styles.successInfo}>
                <Text style={styles.successLoopTitle}>Project Completed!</Text>
                <Text style={styles.successLoopSubtitle}>
                  This work is high-performing. Add it to your Modus Portfolio to attract more brands.
                </Text>
                <TouchableOpacity 
                  style={styles.addToPortfolioBtn}
                  onPress={handleAddToPortfolio}
                  disabled={addingToPortfolio}
                >
                  {addingToPortfolio ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <LayoutGrid size={18} color="#FFF" />
                      <Text style={styles.addToPortfolioText}>Add to My Portfolio</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <View style={styles.briefCard}>
            <Text style={styles.brandContext}>Brand: <Text style={{ color: '#000' }}>{brand?.display_name}</Text></Text>
            <Text style={styles.briefDescription}>{campaign?.brand_guidelines}</Text>
            
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Deliverable</Text>
                <Text style={styles.detailValue}>{campaign?.deliverable_type || 'TikTok Video'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Vibe</Text>
                <Text style={styles.detailValue}>{campaign?.vibe || 'Lifestyle'}</Text>
              </View>
            </View>

            {campaign?.guardrails && campaign.guardrails.length > 0 && (
              <View style={styles.guardrailsBox}>
                <Text style={styles.guardrailsTitle}>Guardrails</Text>
                {campaign.guardrails.map((g: string, i: number) => (
                  <Text key={i} style={styles.guardrailItem}>• {g}</Text>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Upload Studio */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Film size={18} color="#000" />
            <Text style={styles.sectionTitle}>Upload Studio</Text>
          </View>

          <AutoReleaseTimer 
            submittedAt={offer?.submitted_at} 
            status={offer?.status} 
          />

          <View style={styles.uploadContainer}>
            {selectedMedia ? (
              <View style={styles.previewContainer}>
                {selectedMedia.type === 'video' ? (
                  <View style={styles.videoPlaceholder}>
                    <Film size={48} color="#000" />
                    <Text style={styles.videoText}>Video Selected</Text>
                  </View>
                ) : (
                  <Image source={{ uri: selectedMedia.uri }} style={styles.imagePreview} />
                )}
                <TouchableOpacity onPress={pickMedia} style={styles.changeBtn}>
                  <Text style={styles.changeBtnText}>Change File</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={pickMedia} style={styles.dropzone}>
                <View style={styles.uploadCircle}>
                  <Upload size={32} color="#000" />
                </View>
                <Text style={styles.dropzoneTitle}>Tap to select draft</Text>
                <Text style={styles.dropzoneSubtitle}>Support for high-quality MP4, MOV or JPG</Text>
              </TouchableOpacity>
            )}
            
            {offer.status === 'pending_post' && (
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Globe size={24} color="#8B5CF6" />
                  <Text style={styles.postTitle}>Action Required: Go Live</Text>
                </View>
                <Text style={styles.postSubtitle}>
                  Your draft was approved! Post the content to your social channels and paste the live link below to release your payout.
                </Text>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.linkInput}
                    placeholder="https://tiktok.com/@user/video/..."
                    placeholderTextColor="#9CA3AF"
                    value={liveLink}
                    onChangeText={setLiveLink}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity 
                  style={styles.payBtn}
                  onPress={handleSubmitLiveLink}
                  disabled={submittingLink}
                >
                  {submittingLink ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Wallet size={20} color="#FFF" />
                      <Text style={styles.payBtnText}>Submit Link & Get Paid</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Compliance Checklist */}
            {(offer.status === 'active' || offer.status === 'revision_requested') && (
              <View style={styles.complianceCard}>
                <Text style={styles.complianceTitle}>FTC & Compliance Checklist</Text>
                <Text style={styles.complianceSubtitle}>You must verify these items before submitting your work.</Text>
                
                <TouchableOpacity 
                  style={styles.checkItem} 
                  onPress={() => toggleCompliance('disclosure')}
                >
                  {complianceChecks.disclosure ? <CheckSquare size={20} color="#000" /> : <Square size={20} color="#D1D5DB" />}
                  <Text style={styles.checkLabel}>Included required legal disclosures (#ad)</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.checkItem} 
                  onPress={() => toggleCompliance('brandMention')}
                >
                  {complianceChecks.brandMention ? <CheckSquare size={20} color="#000" /> : <Square size={20} color="#D1D5DB" />}
                  <Text style={styles.checkLabel}>Clearly mentioned the brand name</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.checkItem} 
                  onPress={() => toggleCompliance('cta')}
                >
                  {complianceChecks.cta ? <CheckSquare size={20} color="#000" /> : <Square size={20} color="#D1D5DB" />}
                  <Text style={styles.checkLabel}>Included the agreed-upon CTA / Code</Text>
                </TouchableOpacity>
              </View>
            )}

            {offer.status !== 'pending_post' && (
              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={!selectedMedia || uploading || !isComplianceComplete}
                style={[
                  styles.submitBtn,
                  (!selectedMedia || uploading || !isComplianceComplete) && styles.submitBtnDisabled
                ]}
              >
                {uploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {offer?.status === 'revision_requested' ? 'Resubmit Revised Draft' : 'Submit to Brand for Review'}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.trustFooter}>
              <Info size={14} color="#9CA3AF" />
              <Text style={styles.trustText}>
                The brand has already funded the escrow for this project. Your payout is secure.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <DisputeModal 
        visible={isDisputeVisible}
        onClose={() => setIsDisputeVisible(false)}
        offerId={offerId}
      />

      {offer && campaign && (
        <RatingModal
          visible={ratingModalVisible}
          onClose={() => setRatingModalVisible(false)}
          offerId={offerId}
          reviewerId={currentUser?.id}
          revieweeId={campaign.brand_id}
          role="influencer"
          campaignTitle={campaign.title}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  headerSubtitle: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#000', marginTop: 2 },
  scrollContent: { padding: 24, paddingBottom: 60 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  lockedBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0FDF4', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8, 
    gap: 4,
    marginLeft: 'auto'
  },
  lockedText: { fontSize: 10, fontWeight: '900', color: '#059669' },
  briefCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  brandContext: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 12 },
  briefDescription: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 20 },
  detailGrid: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#000' },
  guardrailsBox: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  guardrailsTitle: { fontSize: 12, fontWeight: '800', color: '#000', marginBottom: 8, textTransform: 'uppercase' },
  guardrailItem: { fontSize: 13, color: '#6B7280', marginBottom: 4, fontWeight: '500' },
  uploadContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 4,
  },
  dropzone: {
    backgroundColor: '#F9FAFB',
    height: 240,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  uploadCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  dropzoneTitle: { fontSize: 16, fontWeight: '800', color: '#000', marginBottom: 4 },
  dropzoneSubtitle: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  previewContainer: { height: 240, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F3F4F6' },
  imagePreview: { width: '100%', height: '100%' },
  videoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  videoText: { marginTop: 12, fontSize: 14, fontWeight: '700', color: '#000' },
  changeBtn: { position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  changeBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  revisionAlert: { 
    backgroundColor: '#FFF7ED', 
    padding: 16, 
    borderRadius: 16, 
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5'
  },
  revisionTitle: { fontSize: 14, fontWeight: '800', color: '#EA580C', marginBottom: 2 },
  revisionText: { fontSize: 13, color: '#9A3412', lineHeight: 18, fontStyle: 'italic' },
  submitBtn: {
    backgroundColor: '#000',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  submitBtnDisabled: { backgroundColor: '#E5E7EB', shadowOpacity: 0 },
  submitBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  trustFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingHorizontal: 12 },
  trustText: { flex: 1, fontSize: 11, color: '#9CA3AF', fontWeight: '600', lineHeight: 16 },
  postCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginTop: 20,
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#5B21B6',
  },
  postSubtitle: {
    fontSize: 14,
    color: '#6D28D9',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C4B5FD',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  linkInput: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    height: 56,
    borderRadius: 16,
    gap: 10,
  },
  payBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  revisionContainer: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  revisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  revisionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
  },
  protectionBadge: {
    marginLeft: 'auto',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  protectionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9A3412',
    textTransform: 'uppercase',
  },
  feedbackBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  feedbackLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  feedbackText: {
    fontSize: 14,
    color: '#431407',
    lineHeight: 20,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#FED7AA',
    marginVertical: 16,
  },
  reUploadHint: {
    fontSize: 13,
    color: '#9A3412',
    fontWeight: '600',
    textAlign: 'center',
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
  },
  sosBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  brandRepCard: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  brandRepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandRatingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  brandReviewCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  repTag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  repTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  complianceCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  complianceTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
    marginBottom: 4,
  },
  complianceSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  checkLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  successLoopCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 24,
    padding: 24,
    marginTop: 16,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  successIconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  successInfo: {
    flex: 1,
  },
  successLoopTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#065F46',
    marginBottom: 4,
  },
  successLoopSubtitle: {
    fontSize: 13,
    color: '#065F46',
    opacity: 0.8,
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: '600',
  },
  addToPortfolioBtn: {
    backgroundColor: '#000',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addToPortfolioText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  }
});

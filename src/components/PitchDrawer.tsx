import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  Modal, 
  TextInput, 
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Pressable
} from 'react-native';
import { X, CheckCircle2, AlertCircle, FileImage } from 'lucide-react-native';
import { CampaignData } from './CampaignCard';

interface PitchDrawerProps {
  visible: boolean;
  campaign: CampaignData | null;
  onClose: () => void;
  onSubmit: (pitch: string, fee: number) => void;
}

export const PitchDrawer = ({ visible, campaign, onClose, onSubmit }: PitchDrawerProps) => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const drawerWidth = isDesktop ? Math.max(400, width * 0.4) : '100%';

  const [pitch, setPitch] = useState('');
  const [fee, setFee] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When drawer opens/closes, reset state
  React.useEffect(() => {
    if (visible) {
      setPitch('');
      // Mock setting a base fee from user profile:
      setFee(campaign?.payoutAmount ? campaign.payoutAmount.toString() : '');
    }
  }, [visible, campaign]);

  if (!campaign) return null;

  const handleSubmit = () => {
    if (!pitch || !fee) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(pitch, Number(fee));
    }, 1200);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.overlayBackground} onPress={onClose} />
        
        {/* Slide-out Drawer Content */}
        <View style={[styles.drawer, { width: drawerWidth }]}>
          
          <View style={styles.header}>
            <View>
              <Text style={styles.brandName}>{campaign.brandName}</Text>
              <Text style={styles.title} numberOfLines={1}>{campaign.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            
            {/* Top Half: The Brief */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Campaign Brief</Text>
              <Text style={styles.bodyText}>
                We're launching our new summer collection and need highly engaging short-form content.
                We want creators who can seamlessly weave our product into their daily routine or tech-unboxing aesthetic.
                Showcase the unboxing experience, highlight 2 key features, and end with a strong CTA.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mood Board</Text>
              <View style={styles.moodboardRow}>
                <View style={styles.moodboardImagePlaceholder}><FileImage size={24} color="#9CA3AF" /></View>
                <View style={styles.moodboardImagePlaceholder}><FileImage size={24} color="#9CA3AF" /></View>
                <View style={styles.moodboardImagePlaceholder}><FileImage size={24} color="#9CA3AF" /></View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Strict Do's & Don'ts</Text>
              <View style={styles.ruleItem}>
                <CheckCircle2 size={16} color="#10B981" />
                <Text style={styles.ruleText}>DO shoot in high lighting (daylight preferred).</Text>
              </View>
              <View style={styles.ruleItem}>
                <CheckCircle2 size={16} color="#10B981" />
                <Text style={styles.ruleText}>DO mention the promo code in the first 3 seconds.</Text>
              </View>
              <View style={styles.ruleItem}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.ruleText}>DON'T mention any competing brands or apps.</Text>
              </View>
              <View style={styles.ruleItem}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.ruleText}>DON'T use copyrighted music.</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Bottom Half: The Pitch Input */}
            <View style={styles.section}>
              <View style={styles.pitchHeader}>
                <Text style={styles.sectionTitle}>Hook / Creative Angle</Text>
                <Text style={styles.charCount}>{pitch.length}/300</Text>
              </View>
              <TextInput 
                style={styles.pitchInput}
                placeholder="Briefly explain how you'll grab attention in the first 3 seconds..."
                multiline
                maxLength={300}
                value={pitch}
                onChangeText={setPitch}
                placeholderTextColor="#9CA3AF"
                {...(Platform.OS === 'web' ? { style: [styles.pitchInput, { outlineWidth: 0 } as any] } : {})}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Proposed Fee (₹)</Text>
              <View style={styles.feeInputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput 
                  style={styles.feeInput}
                  placeholder="e.g. 25000"
                  keyboardType="numeric"
                  value={fee}
                  onChangeText={setFee}
                  placeholderTextColor="#9CA3AF"
                  {...(Platform.OS === 'web' ? { style: [styles.feeInput, { outlineWidth: 0 } as any] } : {})}
                />
              </View>
              <Text style={styles.feeHint}>Auto-filled from your Media Kit base rate.</Text>
            </View>

          </ScrollView>

          {/* Sticky Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.submitBtn, (!pitch || !fee || isSubmitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!pitch || !fee || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Pitch</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    fontWeight: '500',
  },
  moodboardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  moodboardImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  ruleText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  pitchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  pitchInput: {
    height: 120,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  feeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 8,
  },
  feeInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  feeHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#0F172A',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

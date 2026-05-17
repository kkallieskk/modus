import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert,
  MessageSquare,
  Clock,
  Bug
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface DisputeModalProps {
  visible: boolean;
  onClose: () => void;
  offerId: string;
}

const REASONS = [
  { id: 'unresponsive', label: 'Brand is unresponsive', icon: Clock },
  { id: 'unfair_revision', label: 'Unfair revision request', icon: MessageSquare },
  { id: 'tech_bug', label: 'Technical bug', icon: Bug },
  { id: 'other', label: 'Other issue', icon: AlertTriangle },
];

export const DisputeModal = ({ visible, onClose, offerId }: DisputeModalProps) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Selection Required', 'Please select a reason for reporting.');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Auth required');

      // 1. Create Dispute Record
      const { error: disputeError } = await supabase
        .from('disputes')
        .insert({
          offer_id: offerId,
          user_id: user.id,
          reason: selectedReason,
          notes: notes.trim(),
          status: 'pending'
        });

      if (disputeError) throw disputeError;

      // 2. Flag the Campaign Offer
      const { error: offerError } = await supabase
        .from('campaign_offers')
        .update({ 
          is_disputed: true,
          status: 'disputed' // Pause the auto-release by changing status
        })
        .eq('id', offerId);

      if (offerError) throw offerError;

      Alert.alert(
        'Issue Reported',
        'Our support team has been notified. This collaboration is now paused and the auto-release timer is stopped while we investigate.',
        [{ text: 'Understood', onPress: onClose }]
      );
    } catch (err: any) {
      console.error('Error submitting dispute:', err);
      Alert.alert('Report Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <ShieldAlert size={24} color="#DC2626" />
              <Text style={styles.title}>Report an Issue</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            What's going wrong with this collaboration? Our team will review this and step in if necessary.
          </Text>

          <View style={styles.reasonGrid}>
            {REASONS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedReason === item.id;
              return (
                <TouchableOpacity 
                  key={item.id}
                  style={[styles.reasonItem, isSelected && styles.reasonItemSelected]}
                  onPress={() => setSelectedReason(item.id)}
                >
                  <Icon size={20} color={isSelected ? '#DC2626' : '#6B7280'} />
                  <Text style={[styles.reasonLabel, isSelected && styles.reasonLabelSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.notesInput}
            placeholder="Tell us more (optional)..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Report</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Submitting this report will pause all payments and timers.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  content: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24,
    paddingBottom: 40,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '900', color: '#000' },
  closeBtn: { padding: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginBottom: 24 },
  reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  reasonItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    minWidth: '47%'
  },
  reasonItemSelected: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  reasonLabel: { fontSize: 13, fontWeight: '700', color: '#4B5563' },
  reasonLabelSelected: { color: '#DC2626' },
  notesInput: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 14, 
    color: '#000', 
    borderWidth: 1, 
    borderColor: '#F3F4F6',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  submitBtn: { 
    backgroundColor: '#000', 
    height: 56, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  footerNote: { textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 16, fontWeight: '600' },
});

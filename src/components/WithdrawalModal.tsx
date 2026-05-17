import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  X, 
  ArrowRight, 
  Building2, 
  Info,
  CheckCircle2,
  AlertCircle,
  Square,
  CheckSquare
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

interface WithdrawalModalProps {
  visible: boolean;
  onClose: () => void;
  balance: number;
  onSuccess: (amount: number) => void;
}

export const WithdrawalModal = ({ visible, onClose, balance, onSuccess }: WithdrawalModalProps) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [taxResidencyAccepted, setTaxResidencyAccepted] = useState(false);

  const handleWithdraw = async () => {
    const withdrawAmount = amount === '' ? balance : parseFloat(amount);
    
    if (withdrawAmount > balance) {
      alert('Insufficient funds.');
      return;
    }

    if (withdrawAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      setTimeout(() => {
        onSuccess(withdrawAmount);
        onClose();
        setSuccess(false);
        setAmount('');
        setTaxResidencyAccepted(false);
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.successOverlay}>
          <LinearGradient colors={['#000', '#1F2937']} style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <CheckCircle2 size={60} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Transfer Started!</Text>
            <Text style={styles.successSubtitle}>
              ₹{(amount === '' ? balance : parseFloat(amount)).toLocaleString()} is on its way to your bank.
            </Text>
            <View style={styles.arrivalBadge}>
              <Text style={styles.arrivalText}>Est. Arrival: 2-3 Business Days</Text>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cash Out</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Withdrawal Amount</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder={balance.toLocaleString()}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                autoFocus
              />
            </View>
            <TouchableOpacity 
              style={styles.useMaxBtn}
              onPress={() => setAmount('')}
            >
              <Text style={styles.useMaxText}>Use Available Balance: ₹{balance.toLocaleString()}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.destinationCard}>
            <View style={styles.destHeader}>
              <Building2 size={20} color="#6B7280" />
              <Text style={styles.destTitle}>Destination</Text>
            </View>
            <View style={styles.bankInfo}>
              <Text style={styles.bankName}>HDFC Bank Primary</Text>
              <Text style={styles.bankNumber}>•••• 4567</Text>
            </View>
          </View>

          <View style={styles.receipt}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Withdrawal Amount</Text>
              <Text style={styles.receiptValue}>₹{(amount === '' ? balance : parseFloat(amount) || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Processing Fee</Text>
              <Text style={[styles.receiptValue, { color: '#059669' }]}>Free</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.receiptRow}>
              <View style={styles.estimateRow}>
                <Info size={14} color="#9CA3AF" />
                <Text style={styles.receiptLabel}>Est. Arrival</Text>
              </View>
              <Text style={styles.receiptValue}>2-3 Business Days</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.taxDeclaration}
            onPress={() => setTaxResidencyAccepted(!taxResidencyAccepted)}
            activeOpacity={0.7}
          >
            <View style={styles.checkIcon}>
              {taxResidencyAccepted ? (
                <CheckSquare size={20} color="#000" />
              ) : (
                <Square size={20} color="#D1D5DB" />
              )}
            </View>
            <Text style={styles.taxText}>
              I declare my tax residency is accurate and I am responsible for all local income tax obligations.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.transferBtn, 
              (loading || !taxResidencyAccepted) && styles.transferBtnDisabled
            ]}
            onPress={handleWithdraw}
            disabled={loading || !taxResidencyAccepted}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.transferBtnText}>Transfer Now</Text>
                <ArrowRight size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    padding: 32,
    paddingBottom: 50,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#000', letterSpacing: -0.5 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  amountContainer: { marginBottom: 32 },
  amountLabel: { fontSize: 13, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'baseline', borderBottomWidth: 2, borderBottomColor: '#F3F4F6', paddingBottom: 12 },
  currencySymbol: { fontSize: 32, fontWeight: '900', color: '#000', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 48, fontWeight: '900', color: '#000' },
  useMaxBtn: { marginTop: 12 },
  useMaxText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  destinationCard: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 24, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: '#F3F4F6',
    marginBottom: 32,
  },
  destHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  destTitle: { fontSize: 13, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' },
  bankInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bankName: { fontSize: 16, fontWeight: '800', color: '#000' },
  bankNumber: { fontSize: 16, fontWeight: '700', color: '#6B7280' },
  receipt: { marginBottom: 32 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  receiptLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  receiptValue: { fontSize: 14, fontWeight: '800', color: '#000' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 16 },
  estimateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  transferBtn: { 
    height: 64, 
    backgroundColor: '#000', 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  transferBtnDisabled: { opacity: 0.7 },
  transferBtnText: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  successCard: { width: '100%', borderRadius: 40, padding: 40, alignItems: 'center' },
  successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF10', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 12 },
  successSubtitle: { fontSize: 16, color: '#9CA3AF', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  arrivalBadge: { backgroundColor: '#FFFFFF10', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  arrivalText: { fontSize: 13, fontWeight: '700', color: '#10B981' },
  taxDeclaration: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkIcon: {
    marginTop: 2,
  },
  taxText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    fontWeight: '600',
  },
});

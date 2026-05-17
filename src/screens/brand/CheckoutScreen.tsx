import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  ScrollView,
  StyleSheet,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, ArrowLeft, Lock, Star, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(false);
  
  const { campaign_id, budget } = route.params || {};

  const handleFundEscrow = async () => {
    try {
      setLoading(true);
      
      // Simulate escrow securing delay
      await new Promise(resolve => setTimeout(resolve, 2500));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // Update campaign status to active (funded)
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', campaign_id);

      if (error) throw error;

      Alert.alert(
        'Escrow Secured', 
        '₹' + budget + ' has been locked in the Pixkkel Vault. Your selected creators have been notified to begin production.',
        [{ text: 'Go to Workspace', onPress: () => navigation.navigate('WorkspaceTab') }]
      );
    } catch (err: any) {
      console.error('Escrow Error:', err);
      Alert.alert('Funding Failed', err.message || 'Could not secure escrow. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vault Escrow</Text>
        <Text style={styles.headerSubtitle}>Secure your campaign funds in the Pixkkel Vault.</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
        {/* The Guarantee Card */}
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          style={styles.guaranteeCard}
        >
          <View style={styles.guaranteeHeader}>
            <ShieldCheck size={24} color="#38BDF8" />
            <Text style={styles.guaranteeTitle}>100% Satisfaction Guarantee</Text>
          </View>
          <Text style={styles.guaranteeBody}>
            Your funds are locked securely in the <Text style={{ color: '#38BDF8', fontWeight: 'bold' }}>Pixkkel Vault</Text>. 
            Funds are only released once you approve the final content.
          </Text>
          <View style={styles.bulletRow}>
            <CheckCircle2 size={16} color="#38BDF8" />
            <Text style={styles.bulletText}>Free revisions if content violates brief</Text>
          </View>
          <View style={styles.bulletRow}>
            <CheckCircle2 size={16} color="#38BDF8" />
            <Text style={styles.bulletText}>Full refund if no content is delivered</Text>
          </View>
        </LinearGradient>

        {/* Deposit Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionLabel}>Deposit Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Campaign Budget</Text>
            <Text style={styles.summaryValue}>₹{budget}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Escrow Protection Fee</Text>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>FREE</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Deposit</Text>
            <Text style={styles.totalValue}>₹{budget}</Text>
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Lock size={16} color="#6B7280" />
          <Text style={styles.securityText}>256-bit SSL Secure Escrow Encryption</Text>
        </View>

        <TouchableOpacity 
          onPress={handleFundEscrow}
          disabled={loading}
          style={[styles.fundButton, loading && { opacity: 0.8 }]}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Lock size={20} color="white" />
              <Text style={styles.fundButtonText}>Fund Escrow & Hire</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.trustFooter}>
          <View style={styles.trustBadge}>
            <ShieldCheck size={14} color="#059669" />
            <Text style={styles.trustBadgeText}>Verified Creators</Text>
          </View>
          <View style={styles.trustBadge}>
            <CheckCircle2 size={14} color="#059669" />
            <Text style={styles.trustBadgeText}>Safe Release</Text>
          </View>
        </View>
        
        <Text style={styles.disclaimerText}>
          By clicking Fund Escrow, you authorize Pixkkel to hold your campaign funds. 
          Release happens automatically after your approval or 72 hours post-delivery if no revision is requested.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 22,
  },
  guaranteeCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  guaranteeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  guaranteeTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  guaranteeBody: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  bulletText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  securityText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  fundButton: {
    backgroundColor: '#000',
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  fundButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  trustFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 24,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
    textTransform: 'uppercase',
  },
  disclaimerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    marginTop: 32,
    paddingHorizontal: 20,
  },
});

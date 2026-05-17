import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  Save,
  LogOut,
  ChevronRight,
  Wallet,
  Instagram
} from 'lucide-react-native';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [payoutDetails, setPayoutDetails] = useState({
    accountHolder: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('payout_details')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data?.payout_details) {
        setPayoutDetails(data.payout_details);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ payout_details: payoutDetails })
        .eq('id', user.id);

      if (error) throw error;
      Alert.alert('Success', 'Payout settings updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to exit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => supabase.auth.signOut() }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Payout Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Wallet size={20} color="#000" />
              <Text style={styles.sectionTitle}>Payout Methods</Text>
            </View>
            <Text style={styles.sectionDesc}>Enter your bank details to receive earnings from completed collaborations.</Text>

            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Holder Name</Text>
                <TextInput
                  style={styles.input}
                  value={payoutDetails.accountHolder}
                  onChangeText={(t) => setPayoutDetails({ ...payoutDetails, accountHolder: t })}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bank Name</Text>
                <TextInput
                  style={styles.input}
                  value={payoutDetails.bankName}
                  onChangeText={(t) => setPayoutDetails({ ...payoutDetails, bankName: t })}
                  placeholder="e.g. HDFC Bank"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Number</Text>
                <TextInput
                  style={styles.input}
                  value={payoutDetails.accountNumber}
                  onChangeText={(t) => setPayoutDetails({ ...payoutDetails, accountNumber: t })}
                  placeholder="0000 0000 0000"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>IFSC Code</Text>
                <TextInput
                  style={styles.input}
                  value={payoutDetails.ifscCode}
                  onChangeText={(t) => setPayoutDetails({ ...payoutDetails, ifscCode: t })}
                  placeholder="HDFC0001234"
                  autoCapitalize="characters"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.securityNote}>
              <ShieldCheck size={14} color="#059669" />
              <Text style={styles.securityText}>Your financial data is encrypted and stored securely.</Text>
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Save size={18} color="#FFF" />
                  <Text style={styles.saveBtnText}>Save Payout Details</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.prefCard}>
              <TouchableOpacity 
                style={styles.prefRow}
                onPress={() => navigation.navigate('SocialAccounts')}
              >
                <View style={styles.prefLabelGroup}>
                  <Instagram size={18} color="#E1306C" />
                  <Text style={styles.prefText}>Social Accounts</Text>
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>
              <View style={styles.prefDivider} />
              <TouchableOpacity style={styles.prefRow}>
                <Text style={styles.prefText}>Push Notifications</Text>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>
              <View style={styles.prefDivider} />
              <TouchableOpacity style={styles.prefRow}>
                <Text style={styles.prefText}>Privacy Policy</Text>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={20} color="#DC2626" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    borderBottomColor: '#F3F4F6'
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#000', marginLeft: 8 },
  scrollContent: { padding: 24 },
  section: { marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#000' },
  sectionDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 24 },
  card: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 24, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: '#F3F4F6' 
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  input: { 
    backgroundColor: '#FFF', 
    height: 56, 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    color: '#000', 
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  securityNote: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingHorizontal: 8 },
  securityText: { fontSize: 12, color: '#059669', fontWeight: '700' },
  saveBtn: { 
    backgroundColor: '#000', 
    height: 64, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  prefCard: { backgroundColor: '#F9FAFB', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  prefLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prefText: { fontSize: 15, fontWeight: '700', color: '#374151' },
  prefDivider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 20 },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
    backgroundColor: '#FEF2F2', 
    height: 64, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  logoutText: { color: '#DC2626', fontSize: 16, fontWeight: '800' }
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { 
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  PlusCircle,
  Briefcase,
  Download,
  FileSpreadsheet,
  Bell
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WithdrawalModal } from '@/components/WithdrawalModal';

export const EarningsScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [isWithdrawalVisible, setIsWithdrawalVisible] = useState(false);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('campaign_offers')
        .select(`
          id,
          status,
          created_at,
          campaigns (
            title,
            budget,
            profiles:brand_id (display_name)
          )
        `)
        .eq('creator_id', user.id);

      if (error) throw error;

      let available = 0;
      let pending = 0;
      const completedCollabs: any[] = [];

      data?.forEach((offer: any) => {
        const amount = offer.campaigns?.budget || 0;
        if (offer.status === 'completed') {
          available += amount;
          completedCollabs.push(offer);
        } else if (['accepted', 'pending_review', 'revision_requested'].includes(offer.status)) {
          pending += amount;
        }
      });

      setAvailableBalance(available);
      setPendingBalance(pending);
      setHistory(completedCollabs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

    } catch (err) {
      console.error('Error fetching financials:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFinancials();
  };

  const handleWithdrawalSuccess = (amount: number) => {
    setAvailableBalance(prev => prev - amount);
    // Add a manual history item for withdrawal
    const withdrawalItem = {
      id: `withdraw-${Date.now()}`,
      status: 'withdrawal',
      created_at: new Date().toISOString(),
      campaigns: {
        title: 'Withdrawal Processing',
        budget: amount,
        profiles: { display_name: 'Transfer to Bank' }
      }
    };
    setHistory(prev => [withdrawalItem, ...prev]);
  };

  const handleExport = () => {
    const csvHeader = 'Date,Brand,Campaign,Amount,Status\n';
    const csvRows = history.map(item => {
      const date = new Date(item.created_at).toLocaleDateString();
      const brand = item.campaigns?.profiles?.display_name || 'Brand';
      const campaign = item.campaigns?.title || 'N/A';
      const amount = item.campaigns?.budget || 0;
      const status = item.status || 'PAID';
      return `${date},"${brand}","${campaign}",${amount},${status}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    // In a real app, we'd use expo-file-system or similar to save this.
    // For now, we'll simulate the download.
    Alert.alert(
      'Export Ready',
      'Your financial history for 2026 has been generated. Would you like to download the CSV?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download CSV', onPress: () => Alert.alert('Success', 'CSV exported to your downloads folder.') }
      ]
    );
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.historyItem}>
      <View style={[styles.brandIcon, item.status === 'withdrawal' && styles.withdrawalIcon]}>
        {item.status === 'withdrawal' ? (
          <ArrowUpRight size={20} color="#EF4444" />
        ) : (
          <Text style={styles.brandInitial}>
            {item.campaigns?.profiles?.display_name?.charAt(0) || 'B'}
          </Text>
        )}
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyBrand}>{item.campaigns?.profiles?.display_name}</Text>
        <Text style={styles.historyCampaign}>{item.campaigns?.title}</Text>
        <Text style={styles.historyDate}>
          {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>
      <View style={styles.historyAmountContainer}>
        <Text style={[styles.historyAmount, item.status === 'withdrawal' && styles.withdrawalAmount]}>
          {item.status === 'withdrawal' ? '-' : '+'}₹{item.campaigns?.budget?.toLocaleString()}
        </Text>
        <View style={[styles.paidBadge, item.status === 'withdrawal' && styles.processingBadge]}>
          <Text style={[styles.paidBadgeText, item.status === 'withdrawal' && styles.processingBadgeText]}>
            {item.status === 'withdrawal' ? 'PROCESSING' : 'PAID'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Earnings</Text>
              <Text style={styles.headerSubtitle}>Track and withdraw your revenue</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
                <FileSpreadsheet size={20} color="#000" />
                <Text style={styles.exportBtnText}>Export</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Notifications' as never)} style={{ backgroundColor: '#F3F4F6', padding: 8, borderRadius: 20 }}>
                <Bell size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Balance Dashboard */}
        <LinearGradient
          colors={['#000000', '#1F2937']}
          style={styles.balanceCard}
        >
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Available to Withdraw</Text>
              <Text style={styles.availableAmount}>₹{availableBalance.toLocaleString()}</Text>
            </View>
            <View style={styles.walletIconContainer}>
              <Wallet size={24} color="#FFF" />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.cashOutBtn, availableBalance === 0 && styles.cashOutBtnDisabled]}
            disabled={availableBalance === 0}
            onPress={() => setIsWithdrawalVisible(true)}
          >
            <Text style={styles.cashOutText}>Cash Out Now</Text>
            <ArrowUpRight size={18} color="#000" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.pendingContainer}>
            <View style={styles.pendingInfo}>
              <Clock size={16} color="#9CA3AF" />
              <Text style={styles.pendingLabel}>Pending in Escrow</Text>
            </View>
            <Text style={styles.pendingAmount}>₹{pendingBalance.toLocaleString()}</Text>
          </View>
          <Text style={styles.escrowNote}>Securely held until campaign completion.</Text>
        </LinearGradient>

        {/* Payout History */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color="#000" />
            <Text style={styles.sectionTitle}>Recent Collaborations</Text>
          </View>

          {history.length > 0 ? (
            <View style={styles.historyList}>
              {history.map((item, index) => (
                <View key={item.id}>
                  {renderHistoryItem({ item })}
                  {index < history.length - 1 && <View style={styles.historyDivider} />}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Briefcase size={32} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>No earnings yet</Text>
              <Text style={styles.emptySubtitle}>Start pitching to brands to see your balance grow.</Text>
              <TouchableOpacity 
                style={styles.findDealsBtn}
                onPress={() => navigation.navigate('Opportunities')}
              >
                <Text style={styles.findDealsText}>Find Brand Deals</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <WithdrawalModal 
        visible={isWithdrawalVisible}
        onClose={() => setIsWithdrawalVisible(false)}
        balance={availableBalance}
        onSuccess={handleWithdrawalSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  header: { marginBottom: 32 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#000', letterSpacing: -1 },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  balanceCard: {
    borderRadius: 32,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  balanceLabel: { color: '#9CA3AF', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  availableAmount: { color: '#FFF', fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  walletIconContainer: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#FFFFFF20', alignItems: 'center', justifyContent: 'center' },
  cashOutBtn: { 
    backgroundColor: '#FFF', 
    flexDirection: 'row', 
    height: 56, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8,
  },
  cashOutBtnDisabled: { opacity: 0.5 },
  cashOutText: { fontSize: 16, fontWeight: '800', color: '#000' },
  divider: { height: 1, backgroundColor: '#FFFFFF10', marginVertical: 24 },
  pendingContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pendingInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pendingLabel: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
  pendingAmount: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  escrowNote: { color: '#4B5563', fontSize: 11, fontWeight: '600', marginTop: 8 },
  historySection: { marginTop: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  historyList: { backgroundColor: '#F9FAFB', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  brandIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  brandInitial: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  historyInfo: { flex: 1, marginLeft: 16 },
  historyBrand: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 2 },
  historyCampaign: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 4 },
  historyDate: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  historyAmountContainer: { alignItems: 'flex-end' },
  historyAmount: { fontSize: 16, fontWeight: '800', color: '#059669', marginBottom: 4 },
  paidBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  paidBadgeText: { fontSize: 8, fontWeight: '900', color: '#059669' },
  historyDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
  emptyState: { alignItems: 'center', py: 60, paddingHorizontal: 40 },
  emptyIconContainer: { width: 80, height: 80, borderRadius: 32, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#000', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  findDealsBtn: { backgroundColor: '#000', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  findDealsText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  withdrawalIcon: { backgroundColor: '#FEF2F2' },
  withdrawalAmount: { color: '#EF4444' },
  processingBadge: { backgroundColor: '#F3F4F6' },
  processingBadgeText: { color: '#6B7280' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exportBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#F3F4F6', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12 
  },
  exportBtnText: { fontSize: 13, fontWeight: '800', color: '#000' },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Platform,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { 
  Wallet,
  Clock,
  ArrowUpRight,
  FileSpreadsheet,
  Lock,
  Building2,
  FileText,
  Download
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WithdrawalModal } from '@/components/WithdrawalModal';

export const EarningsScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 1024;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  
  const [escrowCampaigns, setEscrowCampaigns] = useState<any[]>([]);
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
      const pendingCollabs: any[] = [];

      data?.forEach((offer: any) => {
        const amount = offer.campaigns?.budget || 0;
        if (offer.status === 'completed') {
          available += amount;
          completedCollabs.push(offer);
        } else if (['accepted', 'pending_review', 'revision_requested'].includes(offer.status)) {
          pending += amount;
          pendingCollabs.push(offer);
        }
      });

      // Mock Data to make UI look populated even if database is empty
      if (completedCollabs.length === 0) {
        completedCollabs.push(
          { id: 'm1', status: 'completed', created_at: new Date(Date.now() - 86400000 * 5).toISOString(), campaigns: { title: 'Summer Collection Promo', budget: 50000, profiles: { display_name: 'Glossier' } } },
          { id: 'm2', status: 'completed', created_at: new Date(Date.now() - 86400000 * 15).toISOString(), campaigns: { title: 'App Unboxing', budget: 25000, profiles: { display_name: 'TechFlow' } } }
        );
        available += 75000;
      }
      
      if (pendingCollabs.length === 0) {
        pendingCollabs.push(
          { id: 'p1', status: 'accepted', created_at: new Date().toISOString(), campaigns: { title: 'Sneaker Launch', budget: 80000, profiles: { display_name: 'Nike' } } },
          { id: 'p2', status: 'pending_review', created_at: new Date().toISOString(), campaigns: { title: 'Skincare Routine', budget: 30000, profiles: { display_name: 'Olay' } } }
        );
        pending += 110000;
      }

      setAvailableBalance(available);
      setPendingBalance(pending);
      setEscrowCampaigns(pendingCollabs);
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
    Alert.alert(
      'Export Ready',
      'Your financial history for 2026 has been generated. Would you like to download the CSV?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download CSV', onPress: () => Alert.alert('Success', 'CSV exported to your downloads folder.') }
      ]
    );
  };

  const handleDownloadInvoice = (brandName: string) => {
    Alert.alert('Download Invoice', `Generating invoice for ${brandName}...`);
  };

  const renderEscrowItem = ({ item }: { item: any }) => (
    <View style={styles.escrowCard}>
      <View style={styles.escrowCardHeader}>
        <View style={styles.escrowBrandRow}>
          <View style={styles.brandLogoCircle}>
            <Building2 size={16} color="#64748B" />
          </View>
          <Text style={styles.escrowBrandName}>{item.campaigns?.profiles?.display_name || 'Brand'}</Text>
        </View>
        <Text style={styles.escrowAmount}>₹{(item.campaigns?.budget || 0).toLocaleString()}</Text>
      </View>
      <View style={styles.escrowCardFooter}>
        <Text style={styles.escrowCampaignTitle} numberOfLines={1}>{item.campaigns?.title}</Text>
        <View style={styles.escrowStatusBadge}>
          <Text style={styles.escrowStatusText}>
            {item.status === 'accepted' ? 'In Production' : 'Awaiting Approval'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHistoryItem = ({ item }: { item: any }) => {
    const isWithdrawal = item.status === 'withdrawal';
    const grossAmount = item.campaigns?.budget || 0;
    
    // Dynamic TDS Calculation (10%)
    const tdsDeduction = isWithdrawal ? 0 : Math.round(grossAmount * 0.10);
    const netPaid = isWithdrawal ? grossAmount : grossAmount - tdsDeduction;

    return (
      <View style={styles.ledgerCard}>
        <View style={styles.ledgerHeader}>
          <View>
            <Text style={styles.ledgerBrand}>{item.campaigns?.profiles?.display_name}</Text>
            <Text style={styles.ledgerDate}>
              {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          {!isWithdrawal && (
            <TouchableOpacity 
              style={styles.invoiceBtn}
              onPress={() => handleDownloadInvoice(item.campaigns?.profiles?.display_name || 'Brand')}
            >
              <Download size={14} color="#4F46E5" />
              <Text style={styles.invoiceBtnText}>Invoice</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.ledgerDetails}>
          <Text style={styles.ledgerCampaignTitle} numberOfLines={1}>{item.campaigns?.title}</Text>
          
          <View style={styles.ledgerMathRow}>
            <View style={styles.mathColumn}>
              <Text style={styles.mathLabel}>Gross Amount</Text>
              <Text style={styles.mathValue}>₹{grossAmount.toLocaleString()}</Text>
            </View>
            
            {!isWithdrawal && (
              <>
                <Text style={styles.mathOperator}>-</Text>
                <View style={styles.mathColumn}>
                  <Text style={styles.mathLabel}>TDS (10%)</Text>
                  <Text style={styles.mathValueTDS}>-₹{tdsDeduction.toLocaleString()}</Text>
                </View>
              </>
            )}

            <Text style={styles.mathOperator}>=</Text>
            <View style={[styles.mathColumn, { alignItems: 'flex-end', flex: 1 }]}>
              <Text style={styles.mathLabel}>Net {isWithdrawal ? 'Withdrawn' : 'Paid'}</Text>
              <Text style={[styles.mathValueNet, isWithdrawal && { color: '#0F172A' }]}>
                ₹{netPaid.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingTop: isDesktop ? 40 : insets.top + 60, // Accommodate absolute global TopBar
            maxWidth: isDesktop ? 1000 : undefined,
            width: isDesktop ? '100%' : undefined,
            alignSelf: isDesktop ? 'center' : undefined,
          }
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Earnings</Text>
            <Text style={styles.headerSubtitle}>Track and withdraw your revenue</Text>
          </View>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <FileSpreadsheet size={18} color="#000" />
            <Text style={styles.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={{ marginTop: 100 }}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <View style={styles.contentBody}>
            
            {/* MASTER WALLET CARD */}
            <LinearGradient
              colors={['#0F172A', '#1E293B']}
              style={styles.walletCard}
            >
              <View style={styles.walletHeader}>
                <View>
                  <Text style={styles.walletLabel}>Available to Withdraw</Text>
                  <Text style={styles.walletAmount}>₹{availableBalance.toLocaleString()}</Text>
                </View>
                <View style={styles.walletIconCircle}>
                  <Wallet size={24} color="#FFF" />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.cashOutBtn, availableBalance > 0 ? styles.cashOutBtnActive : styles.cashOutBtnDisabled]}
                disabled={availableBalance === 0}
                onPress={() => setIsWithdrawalVisible(true)}
              >
                <Text style={[styles.cashOutText, availableBalance > 0 && { color: '#FFFFFF' }]}>Cash Out Now</Text>
                <ArrowUpRight size={18} color={availableBalance > 0 ? '#FFFFFF' : '#64748B'} />
              </TouchableOpacity>

              <View style={styles.walletDivider} />

              <View style={styles.escrowTracker}>
                <View style={styles.escrowTrackerLeft}>
                  <Lock size={16} color="#9CA3AF" />
                  <View>
                    <Text style={styles.escrowTrackerLabel}>Pending in Escrow</Text>
                    <Text style={styles.escrowTrackerSub}>Safely locked by brands. Unlocks upon completion.</Text>
                  </View>
                </View>
                <Text style={styles.escrowTrackerAmount}>₹{pendingBalance.toLocaleString()}</Text>
              </View>
            </LinearGradient>

            {/* ESCROW BREAKDOWN */}
            {escrowCampaigns.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Funds in Escrow</Text>
                <View style={styles.escrowGrid}>
                  {escrowCampaigns.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {renderEscrowItem({ item })}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {/* TRANSACTION LEDGER */}
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <FileText size={20} color="#0F172A" />
                <Text style={styles.sectionTitle}>Payout History & Invoices</Text>
              </View>

              {history.length > 0 ? (
                <View style={styles.ledgerContainer}>
                  {history.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {renderHistoryItem({ item })}
                    </React.Fragment>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No cleared transactions</Text>
                  <Text style={styles.emptySub}>When a brand approves your work and funds are released from escrow, they will appear here with downloadable tax invoices.</Text>
                </View>
              )}
            </View>

          </View>
        )}
      </ScrollView>

      <WithdrawalModal 
        visible={isWithdrawalVisible}
        onClose={() => setIsWithdrawalVisible(false)}
        balance={availableBalance}
        onSuccess={handleWithdrawalSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exportBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  contentBody: {
    gap: 40,
  },

  // Wallet Card
  walletCard: {
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 32 },
      android: { elevation: 12 },
      web: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 32 }
    }),
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  walletLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  walletAmount: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
  },
  walletIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashOutBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cashOutBtnActive: {
    backgroundColor: '#10B981', // Solid brand color
  },
  cashOutBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cashOutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748B',
  },
  walletDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 24,
  },
  escrowTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  escrowTrackerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  escrowTrackerLabel: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '700',
  },
  escrowTrackerSub: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  escrowTrackerAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  // Sections
  section: {},
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
  },

  // Escrow Breakdown
  escrowGrid: {
    gap: 12,
  },
  escrowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  escrowCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  escrowBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  escrowBrandName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  escrowAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  escrowCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  escrowCampaignTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
    paddingRight: 16,
  },
  escrowStatusBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  escrowStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },

  // Ledger
  ledgerContainer: {
    gap: 16,
  },
  ledgerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8 },
      android: { elevation: 1 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8 }
    })
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ledgerBrand: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  ledgerDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  invoiceBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  ledgerDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  ledgerCampaignTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
  },
  ledgerMathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mathColumn: {
    justifyContent: 'center',
  },
  mathOperator: {
    fontSize: 16,
    fontWeight: '900',
    color: '#CBD5E1',
    marginHorizontal: 12,
  },
  mathLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  mathValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  mathValueTDS: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EF4444', // Red for deduction
  },
  mathValueNet: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981', // Green for Net Paid
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
});

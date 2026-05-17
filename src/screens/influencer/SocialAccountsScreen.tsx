import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { 
  ChevronLeft, 
  Instagram, 
  Youtube, 
  Link2, 
  RefreshCcw, 
  CheckCircle2, 
  Users,
  AlertCircle
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { socialService, SocialAccountData } from '@/services/socialService';
import { supabase } from '@/lib/supabase';

export const SocialAccountsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const data = await socialService.getLinkedAccounts(user.id);
      setAccounts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: 'tiktok' | 'instagram' | 'youtube') => {
    try {
      setConnecting(platform);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const data = await socialService.connectAccount(platform);
      await socialService.saveAccount(user.id, data);
      
      Alert.alert('Success', `Connected ${platform} account: ${data.username}`);
      fetchAccounts();
    } catch (err: any) {
      Alert.alert('Connection Failed', err.message);
    } finally {
      setConnecting(null);
    }
  };

  const getAccountForPlatform = (platform: string) => {
    return accounts.find(a => a.platform === platform);
  };

  const PlatformCard = ({ platform, icon, color }: { platform: 'tiktok' | 'instagram' | 'youtube', icon: any, color: string }) => {
    const account = getAccountForPlatform(platform);
    const isConnecting = connecting === platform;

    return (
      <View style={styles.platformCard}>
        <View style={[styles.platformIcon, { backgroundColor: color + '15' }]}>
          {icon}
        </View>
        
        <View style={styles.platformInfo}>
          <Text style={styles.platformName}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Text>
          {account ? (
            <View style={styles.activeAccount}>
              <Text style={styles.username}>{account.username}</Text>
              <View style={styles.followerRow}>
                <Users size={12} color="#6B7280" />
                <Text style={styles.followerCount}>{account.follower_count.toLocaleString()} followers</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.platformStatus}>Not connected</Text>
          )}
        </View>

        {account ? (
          <View style={styles.linkedBadge}>
            <CheckCircle2 size={16} color="#10B981" />
            <Text style={styles.linkedText}>Linked</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.connectBtn}
            onPress={() => handleConnect(platform)}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.connectBtnText}>Connect</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Linked Accounts</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>Verify Your Reach</Text>
          <Text style={styles.introSubtitle}>
            Connect your socials to prove your influence. Brands only hire creators with verified metrics.
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <PlatformCard 
            platform="instagram" 
            icon={<Instagram size={24} color="#E1306C" />} 
            color="#E1306C" 
          />
          <PlatformCard 
            platform="tiktok" 
            icon={<Link2 size={24} color="#000" />} 
            color="#000000" 
          />
          <PlatformCard 
            platform="youtube" 
            icon={<Youtube size={24} color="#FF0000" />} 
            color="#FF0000" 
          />
        </View>

        <View style={styles.securityBox}>
          <AlertCircle size={20} color="#6B7280" />
          <Text style={styles.securityText}>
            Modus only reads public metrics and profile data. We will never post on your behalf without permission.
          </Text>
        </View>

        <TouchableOpacity style={styles.syncAllBtn} onPress={fetchAccounts}>
          <RefreshCcw size={18} color="#000" />
          <Text style={styles.syncAllText}>Refresh All Metrics</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#000', letterSpacing: -0.5 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  introBox: { marginTop: 10, marginBottom: 32 },
  introTitle: { fontSize: 32, fontWeight: '900', color: '#000', letterSpacing: -1 },
  introSubtitle: { fontSize: 16, color: '#6B7280', fontWeight: '600', marginTop: 8, lineHeight: 24 },
  cardContainer: { gap: 16 },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  platformIcon: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  platformInfo: { flex: 1, marginLeft: 16 },
  platformName: { fontSize: 18, fontWeight: '800', color: '#000' },
  platformStatus: { fontSize: 14, color: '#9CA3AF', fontWeight: '600', marginTop: 2 },
  activeAccount: { marginTop: 2 },
  username: { fontSize: 14, color: '#000', fontWeight: '700' },
  followerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  followerCount: { fontSize: 12, color: '#6B7280', fontWeight: '700' },
  connectBtn: { backgroundColor: '#000', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 },
  connectBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  linkedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  linkedText: { fontSize: 12, fontWeight: '800', color: '#166534' },
  securityBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#F3F4F6', padding: 16, borderRadius: 20, marginTop: 32 },
  securityText: { flex: 1, fontSize: 12, color: '#6B7280', lineHeight: 18, fontWeight: '600' },
  syncAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 40, paddingVertical: 16 },
  syncAllText: { fontSize: 15, fontWeight: '800', color: '#000' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Film, 
  Clock, 
  CheckCircle2, 
  RotateCcw,
  AlertCircle,
  MessageSquare
} from 'lucide-react-native';
import { useProfile } from '@/lib/ProfileContext';

export const CampaignManagementHub = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { campaignId, campaignTitle } = route.params;
  const { profile } = useProfile();
  
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const brandColor = profile?.brand_color || '#8B5CF6';

  useEffect(() => {
    fetchRoster();
  }, []);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaign_offers')
        .select(`
          id,
          status,
          deliverable_url,
          profiles!campaign_offers_creator_id_fkey(display_name, avatar_url)
        `)
        .eq('campaign_id', campaignId)
        .in('status', ['accepted', 'pending_review', 'revision_requested', 'completed']);

      if (error) throw error;
      setRoster(data || []);
    } catch (err) {
      console.error('Error fetching roster:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoster();
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bg: string; icon: any }> = {
      accepted: { 
        label: 'Filming Content', 
        color: '#D97706', 
        bg: '#FEF3C7', 
        icon: Clock 
      },
      pending_review: { 
        label: 'Draft Submitted', 
        color: '#DC2626', 
        bg: '#FEE2E2', 
        icon: AlertCircle 
      },
      revision_requested: { 
        label: 'Revision in Progress', 
        color: '#EA580C', 
        bg: '#FFEDD5', 
        icon: RotateCcw 
      },
      completed: { 
        label: 'Approved & Completed', 
        color: '#059669', 
        bg: '#D1FAE5', 
        icon: CheckCircle2 
      },
    };
    return configs[status] || { label: status, color: '#6B7280', bg: '#F3F4F6', icon: Film };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerSubtitle}>Campaign Management</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{campaignTitle}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brandColor} />}
      >
        <View style={styles.summarySection}>
          <Text style={styles.sectionLabel}>Creator Roster</Text>
          <Text style={styles.summaryText}>{roster.length} Creators Hired</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={brandColor} style={{ marginTop: 40 }} />
        ) : roster.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={48} color="#F3F4F6" />
            <Text style={styles.emptyText}>No creators have been hired for this campaign yet.</Text>
          </View>
        ) : (
          roster.map((item) => {
            const cfg = getStatusConfig(item.status);
            const StatusIcon = cfg.icon;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate('CampaignDetail', { offerId: item.id })}
                style={styles.rosterCard}
              >
                <View style={styles.rosterLeft}>
                  {item.profiles?.avatar_url ? (
                    <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <User size={20} color="#9CA3AF" />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.creatorName}>{item.profiles?.display_name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                      <StatusIcon size={12} color={cfg.color} />
                      <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Chat', { offerId: item.id })}
                  style={styles.chatBtn}
                >
                  <MessageSquare size={18} color="#6B7280" />
                </TouchableOpacity>
                <ChevronRight size={20} color="#D1D5DB" />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  backBtn: { padding: 4 },
  headerSubtitle: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#000', marginTop: 2 },
  scroll: { padding: 24 },
  summarySection: { marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 },
  summaryText: { fontSize: 16, fontWeight: '700', color: '#000' },
  rosterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  rosterLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  creatorName: { fontSize: 16, fontWeight: '800', color: '#000', marginBottom: 4 },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start',
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 10, 
    gap: 6 
  },
  statusText: { fontSize: 11, fontWeight: '900' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginTop: 16, paddingHorizontal: 40 },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  }
});

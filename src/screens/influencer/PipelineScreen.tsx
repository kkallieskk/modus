import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  Bookmark, 
  Send, 
  Eye, 
  XCircle, 
  Briefcase,
  Clock,
  ArrowRight
} from 'lucide-react-native';

export const PipelineScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'saved' | 'pitched'>('saved');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saved, setSaved] = useState<any[]>([]);
  const [pitched, setPitched] = useState<any[]>([]);

  useEffect(() => {
    fetchPipelineData();
  }, [activeTab]);

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (activeTab === 'saved') {
        const { data, error } = await supabase
          .from('saved_campaigns')
          .select(`
            id,
            campaigns (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error && error.code !== 'PGRST116') throw error;
        setSaved(data || []);
      } else {
        const { data, error } = await supabase
          .from('campaign_pitches')
          .select(`
            *,
            campaigns (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error && error.code !== 'PGRST116') throw error;
        setPitched(data || []);
      }
    } catch (err) {
      console.error('Error fetching pipeline:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <View style={[styles.badge, styles.deliveredBadge]}>
            <Send size={12} color="#3B82F6" />
            <Text style={[styles.badgeText, styles.deliveredText]}>Delivered</Text>
          </View>
        );
      case 'viewed':
        return (
          <View style={[styles.badge, styles.viewedBadge]}>
            <Eye size={12} color="#8B5CF6" />
            <Text style={[styles.badgeText, styles.viewedText]}>Viewed by Brand</Text>
          </View>
        );
      case 'declined':
        return (
          <View style={[styles.badge, styles.declinedBadge]}>
            <XCircle size={12} color="#EF4444" />
            <Text style={[styles.badgeText, styles.declinedText]}>Not Selected</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const campaign = item.campaigns;
    if (!campaign) return null;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('JobDetail', { campaignId: campaign.id })}
      >
        <Image 
          source={{ uri: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400` }} 
          style={styles.thumbnail}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.brandName}>Nike • Athletic Wear</Text>
          <Text style={styles.campaignTitle} numberOfLines={1}>{campaign.title}</Text>
          
          <View style={styles.cardFooter}>
            <Text style={styles.budget}>${campaign.budget}</Text>
            {activeTab === 'pitched' && renderStatusBadge(item.status)}
            {activeTab === 'saved' && (
              <View style={styles.savedMeta}>
                <Clock size={12} color="#9CA3AF" />
                <Text style={styles.metaText}>Saved 2d ago</Text>
              </View>
            )}
          </View>
        </View>
        <ArrowRight size={20} color="#E5E7EB" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Pipeline</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          onPress={() => setActiveTab('saved')}
        >
          <Bookmark size={18} color={activeTab === 'saved' ? '#000' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>Saved Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pitched' && styles.activeTab]}
          onPress={() => setActiveTab('pitched')}
        >
          <Send size={18} color={activeTab === 'pitched' ? '#000' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'pitched' && styles.activeTabText]}>Pending Pitches</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'saved' ? saved : pitched}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              fetchPipelineData();
            }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Briefcase size={40} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'saved' ? 'No saved jobs' : 'No pitches yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'saved' 
                  ? 'Bookmark high-value deals to review and pitch them later.'
                  : 'Start pitching to high-growth brands to build your pipeline.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#000' },
  tabBar: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F9FAFB'
  },
  activeTab: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#9CA3AF' },
  activeTabText: { color: '#000', fontWeight: '800' },
  listContent: { padding: 20, paddingBottom: 60 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    backgroundColor: '#F9FAFB', 
    borderRadius: 20, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  thumbnail: { width: 64, height: 64, borderRadius: 12 },
  cardInfo: { flex: 1, marginLeft: 16 },
  brandName: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase' },
  campaignTitle: { fontSize: 16, fontWeight: '800', color: '#000', marginTop: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  budget: { fontSize: 14, fontWeight: '900', color: '#059669' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  deliveredBadge: { backgroundColor: '#EFF6FF' },
  deliveredText: { color: '#3B82F6' },
  viewedBadge: { backgroundColor: '#F5F3FF' },
  viewedText: { color: '#8B5CF6' },
  declinedBadge: { backgroundColor: '#FEF2F2' },
  declinedText: { color: '#EF4444' },
  savedMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#000', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 }
});

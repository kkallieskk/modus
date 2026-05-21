import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { 
  Briefcase,
  PlayCircle,
  FileSearch,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle
} from 'lucide-react-native';

type CampaignStage = 'todo' | 'production' | 'review' | 'approved';

export const PipelineScreen = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 1024;
  
  const [activeTab, setActiveTab] = useState<'active' | 'pitched' | 'saved'>('active');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data for Active Campaigns
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([
    { id: '1', brand: 'Nike', title: 'Summer Running Kit', stage: 'todo', dueDate: 'Oct 12', urgent: true },
    { id: '2', brand: 'Glossier', title: 'Skin Tint Review', stage: 'todo', dueDate: 'Oct 15', urgent: false },
    { id: '3', brand: 'TechFlow', title: 'App Onboarding Video', stage: 'production', dueDate: 'Oct 10', urgent: true },
    { id: '4', brand: 'Nomad', title: 'Leather Case Shoot', stage: 'review', dueDate: 'Oct 05', urgent: false },
    { id: '5', brand: 'Oura', title: 'Sleep Tracking Promo', stage: 'approved', dueDate: 'Sep 30', urgent: false },
  ]);

  const [pitched, setPitched] = useState<any[]>([]);
  const [saved, setSaved] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(res => setTimeout(res, 600));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStageConfig = (stage: CampaignStage) => {
    switch (stage) {
      case 'todo': return { title: 'To Do', icon: <Briefcase size={16} color="#64748B" />, progress: 10, btnText: 'Review Brief' };
      case 'production': return { title: 'In Production', icon: <PlayCircle size={16} color="#3B82F6" />, progress: 40, btnText: 'Upload Draft' };
      case 'review': return { title: 'In Review', icon: <FileSearch size={16} color="#F59E0B" />, progress: 75, btnText: 'View Feedback' };
      case 'approved': return { title: 'Approved / Live', icon: <CheckCircle2 size={16} color="#10B981" />, progress: 100, btnText: 'View Details' };
    }
  };

  const columns: { id: CampaignStage; items: any[] }[] = [
    { id: 'todo', items: activeCampaigns.filter(c => c.stage === 'todo') },
    { id: 'production', items: activeCampaigns.filter(c => c.stage === 'production') },
    { id: 'review', items: activeCampaigns.filter(c => c.stage === 'review') },
    { id: 'approved', items: activeCampaigns.filter(c => c.stage === 'approved') },
  ];

  const ActiveCampaignCard = ({ item }: { item: any }) => {
    const config = getStageConfig(item.stage);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('CampaignWorkspace', { campaignId: item.id })}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardBrand}>{item.brand}</Text>
          <View style={[styles.dueDateBadge, item.urgent && styles.dueDateUrgent]}>
            <Clock size={12} color={item.urgent ? '#EF4444' : '#64748B'} />
            <Text style={[styles.dueDateText, item.urgent && { color: '#EF4444' }]}>
              {item.stage === 'todo' ? 'Brief Due: ' : 'Draft Due: '} {item.dueDate}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${config.progress}%`, backgroundColor: item.stage === 'approved' ? '#10B981' : '#0F172A' }]} />
            </View>
            <Text style={styles.progressText}>{config.progress}%</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>{config.btnText}</Text>
            <ArrowRight size={14} color="#0F172A" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderActiveCampaigns = () => {
    if (isDesktop) {
      // Horizontal Kanban Board
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kanbanContainer}>
          {columns.map(col => {
            const config = getStageConfig(col.id);
            return (
              <View key={col.id} style={styles.kanbanColumn}>
                <View style={styles.columnHeader}>
                  <View style={styles.columnTitleRow}>
                    {config.icon}
                    <Text style={styles.columnTitle}>{config.title}</Text>
                  </View>
                  <View style={styles.columnBadge}>
                    <Text style={styles.columnBadgeText}>{col.items.length}</Text>
                  </View>
                </View>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnList}>
                  {col.items.map(item => <ActiveCampaignCard key={item.id} item={item} />)}
                  {col.items.length === 0 && (
                    <View style={styles.emptyColumn}>
                      <Text style={styles.emptyColumnText}>No campaigns</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
      );
    } else {
      // Vertically Stacked Sections for Mobile
      return (
        <View style={styles.mobileListContainer}>
          {columns.map(col => {
            const config = getStageConfig(col.id);
            if (col.items.length === 0) return null; // Hide empty sections on mobile to save space
            
            return (
              <View key={col.id} style={styles.mobileSection}>
                <View style={styles.mobileSectionHeader}>
                  {config.icon}
                  <Text style={styles.mobileSectionTitle}>{config.title}</Text>
                  <View style={styles.columnBadge}>
                    <Text style={styles.columnBadgeText}>{col.items.length}</Text>
                  </View>
                </View>
                <View style={styles.mobileSectionContent}>
                  {col.items.map(item => <ActiveCampaignCard key={item.id} item={item} />)}
                </View>
              </View>
            );
          })}
          {activeCampaigns.length === 0 && (
            <View style={styles.emptyState}>
              <Briefcase size={40} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No active campaigns</Text>
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={[
        styles.headerContainer, 
        { 
          maxWidth: isDesktop ? 1400 : undefined,
          width: isDesktop ? '100%' : undefined,
          alignSelf: isDesktop ? 'center' : undefined,
        }
      ]}>
        <Text style={styles.pageTitle}>My Campaigns</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            onPress={() => setActiveTab('active')}
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active Campaigns</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('pitched')}
            style={[styles.tab, activeTab === 'pitched' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === 'pitched' && styles.activeTabText]}>Pending Pitches</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('saved')}
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>Saved</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            maxWidth: isDesktop ? 1400 : undefined,
            width: isDesktop ? '100%' : undefined,
            alignSelf: isDesktop ? 'center' : undefined,
          }
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
        ) : (
          activeTab === 'active' ? renderActiveCampaigns() : (
            <View style={styles.emptyState}>
              <AlertCircle size={40} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>
                {activeTab === 'pitched' ? 'No pending pitches' : 'No saved jobs'}
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 24 : 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }
    })
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabText: {
    color: '#0F172A',
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // Kanban Desktop
  kanbanContainer: {
    padding: 24,
    gap: 24,
  },
  kanbanColumn: {
    width: 320,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 16,
    height: '100%',
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  columnTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  columnBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  columnBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  columnList: {
    gap: 12,
  },
  emptyColumn: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyColumnText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Kanban Mobile
  mobileListContainer: {
    padding: 20,
  },
  mobileSection: {
    marginBottom: 32,
  },
  mobileSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  mobileSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  mobileSectionContent: {
    gap: 16,
  },

  // Active Campaign Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 },
      android: { elevation: 1 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 }
    })
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardBrand: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  dueDateUrgent: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
  },
  dueDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  cardBody: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  footerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 16,
  },
});

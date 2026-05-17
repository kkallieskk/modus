import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { 
  Bell, 
  ChevronLeft, 
  Zap, 
  Info, 
  ChevronRight, 
  CheckCircle2,
  AlertTriangle,
  Wallet,
  MessageSquare
} from 'lucide-react-native';

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'action_required' | 'fyi';
  data: any;
  is_read: boolean;
  created_at: string;
};

export const NotificationScreen = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;
      setNotifications(data || []);
      
      // Mark as read after a short delay
      if (data && data.some(n => !n.is_read)) {
        setTimeout(markAllAsRead, 2000);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleNotificationPress = (notification: Notification) => {
    const { screen, params } = notification.data || {};
    if (screen) {
      navigation.navigate(screen, params);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const isAction = item.type === 'action_required';

    return (
      <TouchableOpacity 
        onPress={() => handleNotificationPress(item)}
        style={[
          styles.notificationItem,
          !item.is_read && styles.unreadItem,
          isAction && styles.actionItem
        ]}
      >
        <View style={[styles.iconContainer, isAction ? styles.actionIcon : styles.fyiIcon]}>
          {isAction ? (
            <Zap size={18} color="#EA580C" fill="#EA580C" />
          ) : (
            <Info size={18} color="#3B82F6" />
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.notifHeader}>
            <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
            <Text style={styles.timeText}>
              {formatTimeAgo(new Date(item.created_at))}
            </Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          
          {isAction && (
            <View style={styles.actionPrompt}>
              <Text style={styles.actionPromptText}>Action Required</Text>
              <ChevronRight size={14} color="#EA580C" />
            </View>
          )}
        </View>
        
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Hub</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              fetchNotifications();
            }} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Bell size={40} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>We'll notify you when new deals or updates arrive.</Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 60 },
  notificationItem: { 
    flexDirection: 'row', 
    padding: 16, 
    borderRadius: 24, 
    backgroundColor: '#F9FAFB', 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative'
  },
  unreadItem: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  actionItem: { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' },
  iconContainer: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 16
  },
  actionIcon: { backgroundColor: '#FFEDD5' },
  fyiIcon: { backgroundColor: '#EFF6FF' },
  contentContainer: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: '700', color: '#374151', flex: 1, marginRight: 8 },
  unreadText: { color: '#000', fontWeight: '800' },
  timeText: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },
  message: { fontSize: 13, color: '#6B7280', lineHeight: 18, fontWeight: '500' },
  actionPrompt: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  actionPromptText: { fontSize: 11, fontWeight: '900', color: '#EA580C', textTransform: 'uppercase' },
  unreadDot: { 
    position: 'absolute', 
    top: 16, 
    right: 16, 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#EF4444' 
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', pt: 100 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#000', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 }
});

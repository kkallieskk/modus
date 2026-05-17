import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export const NotificationBell = () => {
  const navigation = useNavigation<any>();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Subscribe to new notifications with a unique channel name to avoid conflicts
    const channelId = `notifications_${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, () => {
        fetchUnreadCount();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications'
      }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnreadCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (!error) {
      setUnreadCount(count || 0);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => navigation.navigate('Notifications')}
    >
      <Bell size={24} color="#000" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginRight: 8,
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF'
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900'
  }
});

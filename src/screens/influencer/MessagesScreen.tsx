import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { 
  Search, 
  MessageCircle, 
  ChevronRight, 
  Circle,
  Filter,
  MoreVertical
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Mock Data for Messaging Center
const MOCK_CHATS = [
  {
    id: '1',
    brandName: 'Glow Recipe',
    lastMessage: 'The lighting in this shot is perfect! Can you just adjust the caption slightly?',
    timestamp: '2m ago',
    unread: true,
    avatar: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200&auto=format&fit=crop',
    campaignTitle: 'Watermelon Glow Launch'
  },
  {
    id: '2',
    brandName: 'Rhode Skin',
    lastMessage: 'Draft approved! Please go live by Friday 10am EST.',
    timestamp: '1h ago',
    unread: false,
    avatar: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=200&auto=format&fit=crop',
    campaignTitle: 'Summer Glaze Campaign'
  },
  {
    id: '3',
    brandName: 'Liquid I.V.',
    lastMessage: 'Hey! Just checking in on the shipment of the samples.',
    timestamp: '3h ago',
    unread: false,
    avatar: 'https://images.unsplash.com/photo-1550133730-695473e544be?q=80&w=200&auto=format&fit=crop',
    campaignTitle: 'Hydration Challenge'
  },
  {
    id: '4',
    brandName: 'Gymshark',
    lastMessage: 'We loved your last post! Sending over the contract for the next one.',
    timestamp: '1d ago',
    unread: false,
    avatar: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200&auto=format&fit=crop',
    campaignTitle: 'Apex Seamless Drop'
  }
];

export const MessagesScreen = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const renderChatItem = ({ item }: { item: typeof MOCK_CHATS[0] }) => (
    <TouchableOpacity 
      style={styles.chatCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.unread && <View style={styles.unreadBadge} />}
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.brandName}>{item.brandName}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        
        <Text style={styles.campaignTag}>{item.campaignTitle}</Text>
        
        <Text 
          style={[styles.lastMessage, item.unread && styles.unreadMessage]} 
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
      
      <ChevronRight size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>Active Collaborations</Text>
        </View>
        <TouchableOpacity style={styles.optionsBtn}>
          <MoreVertical size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search brands or campaigns..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        data={MOCK_CHATS}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageCircle size={64} color="#E5E7EB" strokeWidth={1} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>
              When you accept a job or receive an invite, your conversation will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  optionsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchBox: {
    flex: 1,
    height: 56,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  filterBtn: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  campaignTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  unreadMessage: {
    color: '#000',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontWeight: '500',
  }
});

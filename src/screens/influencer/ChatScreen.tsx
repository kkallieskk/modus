import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  Send, 
  Plus, 
  MapPin, 
  Truck, 
  Package,
  Info,
  Check
} from 'lucide-react-native';

export const ChatScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { offerId } = route.params;

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [offerDetails, setOfferDetails] = useState<any>(null);
  const [showActions, setShowActions] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initChat();
    // Subscribe to real-time messages
    const channel = supabase
      .channel(`chat_${offerId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'collab_messages',
        filter: `offer_id=eq.${offerId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const initChat = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch offer details for header
      const { data: offer, error: offerError } = await supabase
        .from('campaign_offers')
        .select(`
          *,
          campaigns (
            title,
            brand_id,
            profiles:brand_id (display_name)
          )
        `)
        .eq('id', offerId)
        .single();

      if (offerError) throw offerError;
      setOfferDetails(offer);

      // Fetch existing messages
      const { data: msgs, error: msgsError } = await supabase
        .from('collab_messages')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: true });

      if (msgsError) throw msgsError;
      setMessages(msgs || []);
    } catch (err) {
      console.error('Chat init error:', err);
      // Alert.alert('Error', 'Failed to initialize chat. Make sure collab_messages table exists.');
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 500);
    }
  };

  const sendMessage = async (type = 'text', metadata = {}) => {
    if (type === 'text' && !inputText.trim()) return;

    try {
      setSending(true);
      const { error } = await supabase
        .from('collab_messages')
        .insert({
          offer_id: offerId,
          sender_id: currentUser.id,
          content: type === 'text' ? inputText : null,
          type,
          metadata
        });

      if (error) throw error;
      setInputText('');
      setShowActions(false);
      Keyboard.dismiss();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSending(false);
    }
  };

  const handleShareAddress = () => {
    Alert.prompt(
      "Share Shipping Address",
      "Enter your full address for the brand to send products.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Share", 
          onPress: (address) => sendMessage('address', { address }) 
        }
      ]
    );
  };

  const handleSendTracking = () => {
    Alert.prompt(
      "Send Tracking Info",
      "Enter the courier name and tracking number.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Send", 
          onPress: (info) => sendMessage('tracking', { tracking: info }) 
        }
      ]
    );
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === currentUser?.id;

    if (item.type === 'address') {
      return (
        <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
          <View style={[styles.specialCard, { backgroundColor: isMe ? '#000' : '#F3F4F6' }]}>
            <View style={styles.specialHeader}>
              <MapPin size={16} color={isMe ? '#FFF' : '#000'} />
              <Text style={[styles.specialTitle, { color: isMe ? '#FFF' : '#000' }]}>Shipping Address</Text>
            </View>
            <Text style={[styles.specialContent, { color: isMe ? '#D1D5DB' : '#4B5563' }]}>{item.metadata?.address}</Text>
            <View style={styles.specialBadge}>
              <Check size={10} color="#059669" />
              <Text style={styles.specialBadgeText}>SECURELY SHARED</Text>
            </View>
          </View>
        </View>
      );
    }

    if (item.type === 'tracking') {
      return (
        <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
          <View style={[styles.specialCard, { backgroundColor: isMe ? '#000' : '#F3F4F6' }]}>
            <View style={styles.specialHeader}>
              <Truck size={16} color={isMe ? '#FFF' : '#000'} />
              <Text style={[styles.specialTitle, { color: isMe ? '#FFF' : '#000' }]}>Tracking Information</Text>
            </View>
            <Text style={[styles.specialContent, { color: isMe ? '#D1D5DB' : '#4B5563' }]}>{item.metadata?.tracking}</Text>
            <TouchableOpacity style={styles.trackBtn}>
              <Text style={styles.trackBtnText}>Track Package</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const isBrand = currentUser?.id === offerDetails?.campaigns?.brand_id;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{offerDetails?.campaigns?.title}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active Collaboration</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.infoBtn}>
            <Info size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {/* Action Menu */}
        {showActions && (
          <View style={styles.actionMenu}>
            {!isBrand ? (
              <TouchableOpacity onPress={handleShareAddress} style={styles.actionBtn}>
                <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
                  <MapPin size={20} color="#16A34A" />
                </View>
                <Text style={styles.actionText}>Share Address</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSendTracking} style={styles.actionBtn}>
                <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Truck size={20} color="#2563EB" />
                </View>
                <Text style={styles.actionText}>Send Tracking</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity 
            onPress={() => setShowActions(!showActions)}
            style={[styles.plusBtn, showActions && styles.plusBtnActive]}
          >
            <Plus size={24} color={showActions ? '#FFF' : '#6B7280'} />
          </TouchableOpacity>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
          </View>

          <TouchableOpacity 
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || sending}
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Send size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#000' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  statusText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  infoBtn: { padding: 8 },
  messageList: { padding: 20, paddingBottom: 40 },
  messageRow: { marginBottom: 20, maxWidth: '80%' },
  myMessageRow: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherMessageRow: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myBubble: { backgroundColor: '#000', borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: '#F3F4F6', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  myMessageText: { color: '#FFF' },
  otherMessageText: { color: '#000' },
  timestamp: { fontSize: 10, color: '#9CA3AF', marginTop: 4, fontWeight: '500' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  plusBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBtnActive: { backgroundColor: '#000' },
  inputContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: { fontSize: 15, color: '#000', padding: 0 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.3 },
  actionMenu: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 20,
  },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  specialCard: {
    padding: 16,
    borderRadius: 20,
    width: 260,
  },
  specialHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  specialTitle: { fontSize: 14, fontWeight: '800' },
  specialContent: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  specialBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: '#ECFDF5', 
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  specialBadgeText: { fontSize: 10, fontWeight: '900', color: '#059669' },
  trackBtn: {
    backgroundColor: '#FFF',
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBtnText: { color: '#000', fontSize: 12, fontWeight: '800' }
});

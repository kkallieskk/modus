import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  ChevronLeft,
  UploadCloud,
  MessageCircle,
  FileImage,
  CheckCircle2,
  AlertCircle,
  Send,
  MoreVertical,
  Play
} from 'lucide-react-native';

export const CampaignWorkspaceScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { campaignId } = route.params || { campaignId: '1' };
  
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 1024;

  const [uploadedMedia, setUploadedMedia] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi! Looking forward to your draft.', sender: 'brand', time: '10:00 AM' },
    { id: 2, text: 'Thanks! I plan to shoot this weekend.', sender: 'me', time: '10:05 AM' },
  ]);

  const handleUpload = () => {
    // Simulate upload
    setUploadedMedia('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop');
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), text: chatMessage, sender: 'me', time: 'Just now' }]);
    setChatMessage('');
  };

  const GuidelinesColumn = () => (
    <View style={styles.column}>
      <Text style={styles.columnHeader}>The Guidelines</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnScroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Creative Brief</Text>
          <Text style={styles.bodyText}>
            We're launching our new summer collection and need highly engaging short-form content. 
            Showcase the unboxing experience, highlight 2 key features, and end with a strong CTA to use your promo code.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mandatory Requirements</Text>
          <View style={styles.reqList}>
            <Text style={styles.reqText}><Text style={styles.bold}>Mentions:</Text> @Glossier</Text>
            <Text style={styles.reqText}><Text style={styles.bold}>Hashtags:</Text> #GlossierSummer #Ad</Text>
            <Text style={styles.reqText}><Text style={styles.bold}>Promo Code:</Text> SUMMER20</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strict Do's & Don'ts</Text>
          <View style={styles.ruleItem}>
            <CheckCircle2 size={16} color="#10B981" />
            <Text style={styles.ruleText}>Shoot in high natural lighting.</Text>
          </View>
          <View style={styles.ruleItem}>
            <AlertCircle size={16} color="#EF4444" />
            <Text style={styles.ruleText}>Do NOT mention competitors.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visual Mood Board</Text>
          <View style={styles.moodboardRow}>
            <View style={styles.moodPlaceholder}><FileImage size={24} color="#9CA3AF" /></View>
            <View style={styles.moodPlaceholder}><FileImage size={24} color="#9CA3AF" /></View>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const ExecutionColumn = () => (
    <View style={styles.column}>
      <Text style={styles.columnHeader}>Execution Zone</Text>
      
      {!uploadedMedia ? (
        <TouchableOpacity style={styles.uploadZone} onPress={handleUpload}>
          <View style={styles.uploadIconCircle}>
            <UploadCloud size={32} color="#4F46E5" />
          </View>
          <Text style={styles.uploadTitle}>Upload your Draft</Text>
          <Text style={styles.uploadSub}>Drag and drop video files, or click to browse</Text>
          <Text style={styles.uploadMeta}>MP4, MOV up to 500MB</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.mediaPlayerContainer}>
          <Image source={{ uri: uploadedMedia }} style={styles.mediaPreview} />
          <View style={styles.playOverlay}>
            <Play size={48} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <View style={styles.mediaActions}>
            <TouchableOpacity style={styles.mediaActionBtnPrimary}>
              <Text style={styles.mediaActionBtnTextPrimary}>Submit for Review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaActionBtnSecondary} onPress={() => setUploadedMedia(null)}>
              <Text style={styles.mediaActionBtnTextSecondary}>Replace File</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const ChatColumn = () => (
    <View style={[styles.column, { backgroundColor: '#FFFFFF', padding: 0 }]}>
      <View style={styles.chatHeader}>
        <View>
          <Text style={styles.chatHeaderTitle}>Brand Manager</Text>
          <Text style={styles.chatHeaderSub}>Active now</Text>
        </View>
        <TouchableOpacity>
          <MoreVertical size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.chatScroll}
        ref={ref => ref?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageBubbleWrapper, msg.sender === 'me' ? styles.messageMeWrapper : styles.messageBrandWrapper]}>
            <View style={[styles.messageBubble, msg.sender === 'me' ? styles.messageMe : styles.messageBrand]}>
              <Text style={[styles.messageText, msg.sender === 'me' && { color: '#FFFFFF' }]}>{msg.text}</Text>
            </View>
            <Text style={styles.messageTime}>{msg.time}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Type a message..."
          value={chatMessage}
          onChangeText={setChatMessage}
          placeholderTextColor="#9CA3AF"
          {...(Platform.OS === 'web' ? { style: [styles.chatInput, { outlineWidth: 0 } as any] } : {})}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !chatMessage.trim() && styles.sendBtnDisabled]}
          onPress={handleSendMessage}
          disabled={!chatMessage.trim()}
        >
          <Send size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text style={styles.navBrand}>Glossier</Text>
            <Text style={styles.navTitle}>Summer Collection Promo</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>In Production</Text>
        </View>
      </View>

      {/* Workspace Content */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.workspaceContent,
          { 
            maxWidth: isDesktop ? 1600 : undefined,
            width: isDesktop ? '100%' : undefined,
            alignSelf: isDesktop ? 'center' : undefined,
          }
        ]}
      >
        <View style={isDesktop ? styles.threeColumnLayout : styles.stackLayout}>
          <GuidelinesColumn />
          <ExecutionColumn />
          <ChatColumn />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 24 : 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBrand: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  statusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  workspaceContent: {
    padding: 24,
    flexGrow: 1,
  },
  threeColumnLayout: {
    flexDirection: 'row',
    gap: 24,
    flex: 1,
    minHeight: 800,
  },
  stackLayout: {
    flexDirection: 'column',
    gap: 24,
  },
  column: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12 },
      android: { elevation: 2 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12 }
    })
  },
  columnHeader: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 20,
  },
  columnScroll: {
    paddingBottom: 40,
  },
  
  // Guidelines
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },
  reqList: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  reqText: {
    fontSize: 14,
    color: '#0F172A',
  },
  bold: {
    fontWeight: '800',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  moodboardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  moodPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Execution Zone
  uploadZone: {
    flex: 1,
    minHeight: 400,
    borderWidth: 2,
    borderColor: '#E0E7FF',
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  uploadIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16 },
      android: { elevation: 4 },
      web: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16 }
    })
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#312E81',
    marginBottom: 8,
  },
  uploadSub: {
    fontSize: 14,
    color: '#4F46E5',
    textAlign: 'center',
    marginBottom: 16,
  },
  uploadMeta: {
    fontSize: 12,
    color: '#818CF8',
    fontWeight: '600',
  },

  mediaPlayerContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaActions: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  mediaActionBtnPrimary: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  mediaActionBtnTextPrimary: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  mediaActionBtnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  mediaActionBtnTextSecondary: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },

  // Contextual Chat
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  chatHeaderSub: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  chatScroll: {
    padding: 24,
    gap: 16,
  },
  messageBubbleWrapper: {
    maxWidth: '85%',
  },
  messageMeWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageBrandWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  messageMe: {
    backgroundColor: '#0F172A',
    borderBottomRightRadius: 4,
  },
  messageBrand: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
});

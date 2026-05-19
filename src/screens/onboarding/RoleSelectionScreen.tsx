import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  Animated,
  useWindowDimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Briefcase, User, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Subtle Light-Themed UI Mockup for Brand Role ──────────────────────────────
const BrandMockup = () => (
  <View style={s.mockCard}>
    <View style={s.mockHeader}>
      <Text style={s.mockTitle}>Creator Pitch Inbox</Text>
      <View style={s.mockBadge}>
        <Text style={s.mockBadgeText}>3 New</Text>
      </View>
    </View>
    
    {[
      { name: 'Sarah Jenkins', niche: 'Lifestyle & Wellness', followers: '148.2K', verified: true },
      { name: 'David Chen', niche: 'Productivity & Tech', followers: '82.5K', verified: true },
    ].map((c, i) => (
      <View key={i} style={s.mockRow}>
        <View style={s.mockAvatar}>
          <Text style={s.mockAvatarText}>{c.name[0]}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={s.mockName}>{c.name}</Text>
            {c.verified && <CheckCircle2 size={12} color="#3B82F6" fill="#3B82F6" />}
          </View>
          <Text style={s.mockNiche}>{c.niche} · {c.followers}</Text>
        </View>
        <View style={s.mockActionBtn}>
          <Text style={s.mockActionTxt}>Hire</Text>
        </View>
      </View>
    ))}
    
    <View style={s.mockMetrics}>
      {[
        { val: '₹12.4L', lbl: 'Escrowed' },
        { val: '98%', lbl: 'On-Time' },
        { val: '6', lbl: 'Active' }
      ].map((item, idx) => (
        <View key={idx} style={s.mockMetricItem}>
          <Text style={s.mockMetricVal}>{item.val}</Text>
          <Text style={s.mockMetricLabel}>{item.lbl}</Text>
        </View>
      ))}
    </View>
  </View>
);

// ─── Subtle Light-Themed UI Mockup for Creator Role ────────────────────────────
const CreatorMockup = () => (
  <View style={s.mockCard}>
    <View style={s.mockHeader}>
      <Text style={s.mockTitle}>My Deals</Text>
      <View style={[s.mockBadge, { backgroundColor: '#E8F5E9' }]}>
        <Text style={[s.mockBadgeText, { color: '#2E7D32' }]}>₹5K Secured</Text>
      </View>
    </View>
    
    {[
      { brand: 'Glow Recipe', campaign: 'Watermelon Launch', status: 'In Progress', color: '#FFF8E1', text: '#F57F17' },
      { brand: 'Rhode Skin', campaign: 'Summer Glaze', status: 'Draft Approved', color: '#E8F5E9', text: '#2E7D32' },
    ].map((d, i) => (
      <View key={i} style={s.mockRow}>
        <View style={[s.mockAvatar, { backgroundColor: '#F3F4F6' }]}>
          <Text style={[s.mockAvatarText, { color: '#374151' }]}>{d.brand[0]}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.mockName}>{d.brand}</Text>
          <Text style={s.mockNiche}>{d.campaign}</Text>
        </View>
        <View style={[s.mockStatusBadge, { backgroundColor: d.color }]}>
          <Text style={[s.mockStatusText, { color: d.text }]}>{d.status}</Text>
        </View>
      </View>
    ))}
    
    <View style={s.mockEscrowBanner}>
      <ShieldCheck size={14} color="#2E7D32" />
      <Text style={s.mockEscrowText}>
        Funds secured in Modus Escrow Vault
      </Text>
    </View>
  </View>
);

export const RoleSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  const [activeRole, setActiveRole] = useState<'brand' | 'influencer'>('influencer');
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const selectRole = async (role: 'brand' | 'influencer') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update role in profiles and return details to verify if row exists
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id)
        .select();

      if (error) throw error;

      // Self-healing: if the profile row is missing from profiles table, the update affects 0 rows
      if (!data || data.length === 0) {
        console.warn('[RoleSelectionScreen] Profile row was missing from the database. Triggering automatic self-healing...');
        
        // Purge the out-of-sync auth record using SECURITY DEFINER rpc
        const { error: rpcError } = await supabase.rpc('delete_user_account');
        if (rpcError) console.error('[RoleSelectionScreen] RPC delete error:', rpcError);
        
        // Clear auth session
        await supabase.auth.signOut();
        
        const message = "Account Synced. Since you logged in with an existing account whose database profile was not properly initialized, we have automatically reset your session.\n\nPlease register a clean, fully-functioning profile to continue.";
        
        if (Platform.OS === 'web') {
          window.alert(message);
        } else {
          Alert.alert("Account Synced", message);
        }
        
        // Reset navigation to Auth Stack
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
        return;
      }

      if (role === 'brand') {
        navigation.navigate('BrandSetup');
      } else {
        navigation.navigate('CreatorOnboarding');
      }
    } catch (error) {
      console.error('Error selecting role:', error);
    }
  };

  const floatingTransform = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12]
  });

  return (
    <View style={styles.container}>
      {isLargeScreen && (
        <View style={styles.leftPane}>
          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.leftContent}>
            <TouchableOpacity style={styles.brandingHeader} onPress={() => navigation.navigate('Auth', { screen: 'Landing' })}>
              <Text style={styles.brandingLogo}>Modus.</Text>
            </TouchableOpacity>
            
            <View style={styles.visualContainer}>
              <Text style={styles.leftTitle}>
                {activeRole === 'brand' ? 'Scale campaigns with verified elite talent.' : 'Monetize your audience with full escrow safety.'}
              </Text>
              <Text style={styles.leftSubtitle}>
                {activeRole === 'brand' 
                  ? 'Access audited metrics directly from social APIs. Pay only when deliverables match your brief.' 
                  : 'Never chase an invoice again. Funds are deposited securely in escrow before you begin creating.'}
              </Text>
              
              <Animated.View style={[styles.mockupWrapper, { transform: [{ translateY: floatingTransform }] }]}>
                <View style={styles.glassContainer}>
                  {activeRole === 'brand' ? <BrandMockup /> : <CreatorMockup />}
                </View>
              </Animated.View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.rightPane}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>How are you using Modus?</Text>
              <Text style={styles.subtitle}>Choose your path to get started.</Text>
            </View>

            <View style={styles.cardsContainer}>
              {/* Brand Card */}
              <TouchableOpacity 
                onPress={() => selectRole('brand')}
                onMouseEnter={() => setActiveRole('brand')}
                onMouseLeave={() => {}}
                activeOpacity={0.8}
                style={[
                  styles.cardWrapper,
                  activeRole === 'brand' && {
                    shadowColor: '#8B5CF6',
                    shadowOpacity: 0.08,
                    elevation: 12,
                  }
                ]}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F9FAFB']}
                  style={[
                    styles.card,
                    activeRole === 'brand' && { borderColor: '#8B5CF6' }
                  ]}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#8B5CF612' }]}>
                    <Briefcase size={32} color="#8B5CF6" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>I am a Brand</Text>
                    <Text style={styles.cardDescription}>Hire top talent and launch viral campaigns.</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <ChevronRight size={20} color={activeRole === 'brand' ? '#8B5CF6' : "#D1D5DB"} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Creator Card */}
              <TouchableOpacity 
                onPress={() => selectRole('influencer')}
                onMouseEnter={() => setActiveRole('influencer')}
                onMouseLeave={() => {}}
                activeOpacity={0.8}
                style={[
                  styles.cardWrapper,
                  activeRole === 'influencer' && {
                    shadowColor: '#10B981',
                    shadowOpacity: 0.08,
                    elevation: 12,
                  }
                ]}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F9FAFB']}
                  style={[
                    styles.card,
                    activeRole === 'influencer' && { borderColor: '#10B981' }
                  ]}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#10B98112' }]}>
                    <User size={32} color="#10B981" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>I am a Creator</Text>
                    <Text style={styles.cardDescription}>Find exclusive deals and grow your brand.</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <ChevronRight size={20} color={activeRole === 'influencer' ? '#10B981' : "#D1D5DB"} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>You can change this later in settings.</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

// ─── Shared Mockup Components styles ──────────────────────────────────────────
const s = StyleSheet.create({
  mockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  mockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mockTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  mockBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  mockBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
  },
  mockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  mockAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  mockName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  mockNiche: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 1,
  },
  mockActionBtn: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  mockActionTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mockStatusBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  mockStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  mockMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  mockMetricItem: {
    alignItems: 'center',
  },
  mockMetricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  mockMetricLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 1,
  },
  mockEscrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
    gap: 6,
  },
  mockEscrowText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  leftPane: {
    flex: 0.75,
    overflow: 'hidden',
    borderRightWidth: 1,
    borderColor: '#F3F4F6',
  },
  leftContent: {
    flex: 1,
    padding: 48,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  brandingHeader: {
    alignSelf: 'flex-start',
  },
  brandingLogo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  visualContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
  },
  leftTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.75,
    lineHeight: 38,
    marginBottom: 12,
  },
  leftSubtitle: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 36,
  },
  mockupWrapper: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(243, 244, 246, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 3,
    opacity: 0.85,
  },
  rightPane: {
    flex: 1.25,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 48,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.75,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 20,
    marginBottom: 24,
  },
  cardWrapper: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});

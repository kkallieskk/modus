import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  Briefcase, 
  User, 
  ChevronRight, 
  TrendingUp, 
  Camera, 
  CheckCircle2, 
  Shield, 
  Star, 
  Award, 
  Zap, 
  ShieldCheck 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Trust Marquee Component ───────────────────────────────────────────────
const TrustMarquee = () => {
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -SCREEN_WIDTH,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const logos = [
    { Icon: Star, name: 'Vogue' },
    { Icon: Shield, name: 'Nike' },
    { Icon: Award, name: 'Sephora' },
    { Icon: Zap, name: 'Spotify' },
    { Icon: CheckCircle2, name: 'Glossier' },
  ];

  return (
    <View style={styles.marqueeWrapper}>
      <Text style={styles.marqueeTitle}>Trusted by elite brands and top-tier creators</Text>
      <View style={styles.marqueeContainer}>
        <Animated.View style={[styles.marqueeContent, { transform: [{ translateX: scrollX }] }]}>
          {/* Double the logos to create seamless loop */}
          {[...logos, ...logos, ...logos].map((logo, index) => (
            <View key={index} style={styles.marqueeItem}>
              <logo.Icon size={18} color="#9CA3AF" />
              <Text style={styles.marqueeText}>{logo.name}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
};

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

// ─── Role Card Component ────────────────────────────────────────────────────
const RoleCard = ({ 
  title, 
  description, 
  Icon, 
  BackgroundIcon,
  isActive,
  onHoverIn,
  onPress 
}: { 
  title: string, 
  description: string, 
  Icon: any, 
  BackgroundIcon: any,
  isActive: boolean,
  onHoverIn: () => void,
  onPress: () => void 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const isFocused = isHovered || isActive;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1.02 : 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: isFocused ? -5 : 0,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const isBrand = title.includes('Brand');
  const accentColor = isBrand ? '#8B5CF6' : '#10B981';
  const iconBg = isBrand ? '#8B5CF612' : '#10B98112';
  const bgIconColor = isBrand ? 'rgba(139, 92, 246, 0.03)' : 'rgba(16, 185, 129, 0.03)';

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => {
        setIsHovered(true);
        onHoverIn();
      }}
      onHoverOut={() => setIsHovered(false)}
      onPressIn={() => {
        setIsHovered(true);
        onHoverIn();
      }}
      onPressOut={() => setIsHovered(false)}
    >
      <Animated.View style={[
        styles.cardWrapper,
        {
          transform: [{ scale }, { translateY }],
          shadowColor: isFocused ? accentColor : '#000',
          shadowOpacity: isFocused ? 0.08 : 0.04,
          elevation: isFocused ? 12 : 3,
        }
      ]}>
        <LinearGradient
          colors={['#FFFFFF', '#F9FAFB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card, 
            isFocused && { borderColor: accentColor }
          ]}
        >
          {/* Subtle Background Icon */}
          <View style={styles.cardBgIcon}>
            <BackgroundIcon size={120} color={bgIconColor} strokeWidth={1} />
          </View>
          
          <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
            <Icon size={32} color={accentColor} />
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </View>
          
          <View style={styles.arrowContainer}>
            <ChevronRight size={20} color={isFocused ? accentColor : "#D1D5DB"} />
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

// ─── Main Welcome Screen Component ──────────────────────────────────────────
export const WelcomeScreen = () => {
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
            <View style={styles.brandingHeader}>
              <Text style={styles.brandingLogo}>Modus.</Text>
            </View>
            
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
              {!isLargeScreen && <Text style={styles.logoText}>Modus.</Text>}
              <Text style={styles.title}>How are you using Modus?</Text>
              <Text style={styles.subtitle}>Welcome to the elite creator economy. Choose how you want to grow.</Text>
            </View>

            <View style={styles.cardsContainer}>
              <RoleCard
                title="I am a Brand"
                description="Launch campaigns, hire verified creators, and scale UGC."
                Icon={Briefcase}
                BackgroundIcon={TrendingUp}
                isActive={activeRole === 'brand'}
                onHoverIn={() => setActiveRole('brand')}
                onPress={() => {
                  setActiveRole('brand');
                  navigation.navigate('SignUp', { role: 'brand' });
                }}
              />
              
              <RoleCard
                title="I am a Creator"
                description="Access premium brand deals, bypass the noise, and get paid securely."
                Icon={User}
                BackgroundIcon={Camera}
                isActive={activeRole === 'influencer'}
                onHoverIn={() => setActiveRole('influencer')}
                onPress={() => {
                  setActiveRole('influencer');
                  navigation.navigate('SignUp', { role: 'influencer' });
                }}
              />
            </View>

            <View style={styles.bottomSection}>
              <TrustMarquee />
              
              <Pressable 
                onPress={() => navigation.navigate('Login')}
                style={({ pressed }) => [styles.loginLink, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.footerText}>
                  Already have an account? <Text style={styles.loginText}>Log In</Text>
                </Text>
              </Pressable>
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
    marginBottom: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
    marginBottom: 20,
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
    lineHeight: 22,
  },
  cardsContainer: {
    gap: 20,
    marginTop: 10,
    marginBottom: 24,
  },
  cardWrapper: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.04,
        shadowRadius: 24,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.04,
        shadowRadius: 24,
      }
    }),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  cardBgIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.5,
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
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
  },
  marqueeWrapper: {
    width: SCREEN_WIDTH,
    marginBottom: 30,
    alignItems: 'center',
    overflow: 'hidden',
  },
  marqueeTitle: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 16,
  },
  marqueeContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  marqueeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marqueeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    opacity: 0.6,
  },
  marqueeText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  loginLink: {
    padding: 10,
  },
  footerText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  loginText: {
    color: '#000',
    fontWeight: '800',
  },
});

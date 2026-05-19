import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Animated, Easing, Dimensions, Platform, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowRight, ShieldCheck, Lock, Sparkles, Star, Zap
} from 'lucide-react-native';

const { width: W, height: H } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';

// ─── Animated marquee ─────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  'VERIFIED CREATORS', 'ESCROWED PAYMENTS', 'AI-AUDITED METRICS',
  'INSTAGRAM API', 'ZERO AGENCIES', 'REAL-TIME DATA',
];

const Marquee = () => {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(x, { toValue: -W, duration: 22000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);
  return (
    <View style={s.marqueeWrap}>
      <Animated.View style={[s.marqueeRow, { transform: [{ translateX: x }] }]}>
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
          <View key={i} style={s.marqueeItem}>
            <View style={s.marqueeDot} />
            <Text style={s.marqueeText}>{t}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

// ─── 3D Parallax Scroll Reveal Component ──────────────────────────────
const Parallax3DSection = ({ scrollY }: { scrollY: Animated.Value }) => {
  // 3D Vault Parallax Translation and Scale
  const vaultTranslateY = scrollY.interpolate({
    inputRange: [150, 750],
    outputRange: [120, -120], // Moves up as we scroll down
    extrapolate: 'clamp',
  });

  const vaultScale = scrollY.interpolate({
    inputRange: [150, 600],
    outputRange: [0.85, 1.1], // Scales up gracefully
    extrapolate: 'clamp',
  });

  const vaultOpacity = scrollY.interpolate({
    inputRange: [100, 300],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Contextual UI cards floating in
  const cardTranslateXLeft = scrollY.interpolate({
    inputRange: [300, 600],
    outputRange: [-120, 0],
    extrapolate: 'clamp',
  });
  
  const cardTranslateXRight = scrollY.interpolate({
    inputRange: [350, 650],
    outputRange: [120, 0],
    extrapolate: 'clamp',
  });

  const cardsOpacity = scrollY.interpolate({
    inputRange: [300, 500],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={s.parallaxSection}>
      <Text style={s.parallaxSub}>DEEP INSPECTION</Text>
      <Text style={s.parallaxTitle}>The Modus Escrow Vault.</Text>
      <Text style={s.parallaxDesc}>
        A fully transparent, automated escrow system. Funds are locked securely before creation begins and released instantly upon verified delivery.
      </Text>

      <View style={s.parallaxCanvas}>
        {/* The 3D Vault Hero Image */}
        <Animated.Image 
          source={require('../../../assets/images/3d_escrow_vault.png')}
          style={[
            s.vaultImage,
            {
              opacity: vaultOpacity,
              transform: [
                { translateY: vaultTranslateY },
                { scale: vaultScale }
              ]
            }
          ]}
          resizeMode="contain"
        />

        {/* Floating Contextual UI Cards */}
        <Animated.View style={[
          s.floatingCardLeft, 
          { 
            opacity: cardsOpacity, 
            transform: [{ translateX: cardTranslateXLeft }, { translateY: -60 }] 
          }
        ]}>
          <View style={s.floatingCardIcon}><Lock size={16} color="#10B981" /></View>
          <View>
            <Text style={s.floatingCardTitle}>Funds Secured</Text>
            <Text style={s.floatingCardDesc}>100% upfront escrow locking</Text>
          </View>
        </Animated.View>

        <Animated.View style={[
          s.floatingCardRight, 
          { 
            opacity: cardsOpacity, 
            transform: [{ translateX: cardTranslateXRight }, { translateY: 60 }] 
          }
        ]}>
          <View style={[s.floatingCardIcon, { backgroundColor: '#F3E8FF' }]}><Sparkles size={16} color="#9333EA" /></View>
          <View>
            <Text style={s.floatingCardTitle}>Instant Release</Text>
            <Text style={s.floatingCardDesc}>Triggered via API verification</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── Feature block ────────────────────────────────────────────────────────────
const Feature = ({ icon: Icon, stat, title, badgeText }: any) => (
  <View style={s.featureCard}>
    <View style={s.featureHeaderRow}>
      <View style={s.featureIcon}>
        <Icon size={18} color="#09090B" />
      </View>
      {badgeText && (
        <View style={s.featureBadge}>
          <Text style={s.featureBadgeText}>{badgeText}</Text>
        </View>
      )}
    </View>
    <Text style={s.featureStat}>{stat}</Text>
    <Text style={s.featureTitle}>{title}</Text>
  </View>
);

// ─── Testimonial block ────────────────────────────────────────────────────────
const TestimonialCard = ({ quote, author, role, initials }: any) => (
  <View style={s.testimonialCard}>
    <Text style={s.quoteText}>“{quote}”</Text>
    <View style={s.quoteAuthorWrap}>
      <View style={s.avatar}>
        <Text style={s.avatarInitials}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.authorName}>{author}</Text>
        <Text style={s.authorRole}>{role}</Text>
      </View>
      <View style={s.stars}>
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={11} color="#09090B" fill="#09090B" style={{ opacity: 0.8 }} />
        ))}
      </View>
    </View>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
export const LandingScreen = () => {
  const nav = useNavigation<any>();

  // scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;

  // Marquee scroll fade
  const marqueeOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0.6, 1],
    extrapolate: 'clamp'
  });

  // Features scroll reveal (adjusted for offset)
  const featuresOpacity = scrollY.interpolate({
    inputRange: [650, 950],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  const featuresTranslateY = scrollY.interpolate({
    inputRange: [650, 950],
    outputRange: [40, 0],
    extrapolate: 'clamp'
  });

  // Testimonials scroll reveal (adjusted for offset)
  const proofOpacity = scrollY.interpolate({
    inputRange: [1100, 1400],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  const proofTranslateY = scrollY.interpolate({
    inputRange: [1100, 1400],
    outputRange: [40, 0],
    extrapolate: 'clamp'
  });

  // CTA Card scroll reveal (adjusted for offset)
  const ctaOpacity = scrollY.interpolate({
    inputRange: [1550, 1850],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  const ctaScale = scrollY.interpolate({
    inputRange: [1550, 1850],
    outputRange: [0.97, 1],
    extrapolate: 'clamp'
  });
  const ctaTranslateY = scrollY.interpolate({
    inputRange: [1550, 1850],
    outputRange: [30, 0],
    extrapolate: 'clamp'
  });
  
  // entrance animations
  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const slide1 = useRef(new Animated.Value(30)).current;
  const slide2 = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(fade1, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slide1, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fade2, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slide2, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={s.pageWrapper}>
      {/* ── BACKGROUND GRID LINES ── */}
      <View style={s.bgGlowWrap}>
        <View style={s.gridLineV1} />
        <View style={s.gridLineV2} />
        <View style={s.gridLineH1} />
        <View style={s.gridLineH2} />
      </View>

      {/* ── STICKY NAV ── */}
      <View style={s.nav}>
        <Text style={s.logo}>Modus.</Text>
        
        {IS_WEB && (
          <View style={s.navCenter}>
            {['For Brands', 'For Creators', 'Pricing', 'Resources'].map((link) => (
              <Pressable key={link} style={s.navLink}>
                <Text style={s.navLinkText}>{link}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={s.navRight}>
          <Pressable onPress={() => nav.navigate('Login')} style={s.navLogin}>
            <Text style={s.navLoginText}>Log in</Text>
          </Pressable>
          <Pressable onPress={() => nav.navigate('Welcome')} style={s.navCta}>
            <Text style={s.navCtaText}>Get Started</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={s.page} 
        contentContainerStyle={s.pageContent} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >

        {/* ── HERO ── */}
        <View style={[s.hero, { minHeight: Math.min(H * 0.72, 720), justifyContent: 'center' }]}>
          <Animated.View style={{ opacity: fade1, transform: [{ translateY: slide1 }], alignItems: 'center', zIndex: 10 }}>
            <Text style={s.heroHead}>
              Where elite brands{'\n'}meet verified creators.
            </Text>
            <Text style={s.heroSub}>
              No inflated metrics. No middlemen. Modus connects you to real, audited talent — and keeps payments secure with built-in escrow.
            </Text>
          </Animated.View>

          <Animated.View style={[s.heroBtns, { opacity: fade2, transform: [{ translateY: slide2 }] }]}>
            <Pressable
              style={({ pressed }) => [s.btnPrimary, pressed && { opacity: 0.8 }]}
              onPress={() => nav.navigate('SignUp', { role: 'brand' })}
            >
              <Text style={s.btnPrimaryText}>I am a Brand</Text>
              <ArrowRight size={16} color="#FFF" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [s.btnSecondary, pressed && { opacity: 0.8 }]}
              onPress={() => nav.navigate('SignUp', { role: 'influencer' })}
            >
              <Text style={s.btnSecondaryText}>I am a Creator</Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* ── MARQUEE ── */}
        <Animated.View style={{ opacity: marqueeOpacity }}>
          <Marquee />
        </Animated.View>

        {/* ── 3D PARALLAX SCROLL REVEAL ── */}
        <Parallax3DSection scrollY={scrollY} />

        {/* ── FEATURES ── */}
        <Animated.View style={{ opacity: featuresOpacity, transform: [{ translateY: featuresTranslateY }] }}>
          <View style={s.section}>
            <Text style={s.sectionLabel}>The Modus Standard</Text>
            <Text style={s.sectionHead}>Marketplace integrity,{'\n'}by the numbers.</Text>
            <View style={s.featureGrid}>
              <Feature
                icon={ShieldCheck}
                stat="99.2%"
                title="Audited Follower Authenticity"
                badgeText="Verified API"
              />
              <Feature
                icon={Lock}
                stat="0"
                title="Payment Chasing or Invoice Delays"
                badgeText="Automated Escrow"
              />
              <Feature
                icon={Sparkles}
                stat="10s"
                title="To Publish Brief & Match Creators"
                badgeText="Instant Match"
              />
            </View>
          </View>
        </Animated.View>

        {/* ── SOCIAL PROOF ── */}
        <Animated.View style={{ opacity: proofOpacity, transform: [{ translateY: proofTranslateY }] }}>
          <View style={s.proofSection}>
            <Text style={s.proofLabel}>What they're saying</Text>
            <Text style={s.proofHead}>Built for both sides of the table.</Text>
            <View style={s.testimonialGrid}>
              <TestimonialCard
                quote="Audited audience data changed how we recruit talent. No more wasted budget."
                author="Riya S."
                role="Head of Influencer, Glow Recipe"
                initials="R"
              />
              <TestimonialCard
                quote="Escrow payments mean I never worry about getting paid. I focus entirely on my content."
                author="Alex M."
                role="Tech & Lifestyle Creator (180k+)"
                initials="A"
              />
            </View>
          </View>
        </Animated.View>

        {/* ── CTA FOOTER ── */}
        <Animated.View style={{ opacity: ctaOpacity, transform: [{ translateY: ctaTranslateY }, { scale: ctaScale }] }}>
          <View style={s.ctaSection}>
            <View style={s.ctaCard}>
              <Text style={s.ctaHead}>Ready to grow?</Text>
              <Text style={s.ctaSub}>Join elite brands and verified creators building the future of commerce.</Text>
              <Pressable
                style={({ pressed }) => [s.ctaBtn, pressed && { opacity: 0.85 }]}
                onPress={() => nav.navigate('Welcome')}
              >
                <Text style={s.ctaBtnText}>Start for free</Text>
                <ArrowRight size={18} color="#000" />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* ── FOOTER LINKS ── */}
        <View style={s.footer}>
          <Text style={s.footerLogo}>Modus.</Text>
          <View style={s.footerLinks}>
            {['Privacy', 'Terms', 'Contact', 'Twitter / X', 'Instagram'].map(l => (
              <Text key={l} style={s.footerLink}>{l}</Text>
            ))}
          </View>
          <Text style={s.copyright}>© 2026 Modus, Inc. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  pageWrapper: { flex: 1, backgroundColor: '#FAFAFA' },
  page: { flex: 1, backgroundColor: 'transparent' },
  pageContent: { paddingBottom: 40, paddingTop: IS_WEB ? 80 : 0 },

  // NAV
  nav: {
    ...(IS_WEB ? { 
      position: 'fixed', top: 24, left: '50%', transform: [{ translateX: '-50%' }] as any,
      width: '90%', maxWidth: 1100, zIndex: 100, 
      backdropFilter: 'blur(30px) saturate(150%)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
    } : {}),
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: IS_WEB ? 32 : 24, paddingVertical: 14,
    backgroundColor: IS_WEB ? 'rgba(255, 255, 255, 0.7)' : '#FFFFFF', 
    borderWidth: IS_WEB ? 1 : 0, 
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: IS_WEB ? 100 : 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.02, shadowRadius: 20,
  },
  logo: { fontSize: 20, fontWeight: '900', color: '#09090B', letterSpacing: -0.5 },
  navCenter: { flexDirection: 'row', gap: 32, alignItems: 'center' },
  navLink: { paddingVertical: 8 },
  navLinkText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navLogin: { paddingVertical: 10, paddingHorizontal: 16 },
  navLoginText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  navCta: { backgroundColor: '#09090B', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 100 },
  navCtaText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

  hero: {
    alignItems: 'center', paddingHorizontal: 24,
    paddingTop: IS_WEB ? 40 : 60, paddingBottom: 40,
    backgroundColor: 'transparent',
    position: 'relative', overflow: 'hidden'
  },
  
  // Clean Minimal Grid Lines
  bgGlowWrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', pointerEvents: 'none', backgroundColor: '#FAFAFA' },
  gridLineV1: {
    position: 'absolute', left: '18%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(0,0,0,0.02)',
  },
  gridLineV2: {
    position: 'absolute', right: '18%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(0,0,0,0.02)',
  },
  gridLineH1: {
    position: 'absolute', top: '15%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.02)',
  },
  gridLineH2: {
    position: 'absolute', top: '48%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.02)',
  },

  heroHead: {
    fontSize: IS_WEB ? 64 : 40, fontWeight: '900', color: '#09090B',
    textAlign: 'center', letterSpacing: -2, lineHeight: IS_WEB ? 72 : 46, marginBottom: 20,
  },
  heroSub: {
    fontSize: 18, color: '#71717A', textAlign: 'center', lineHeight: 28,
    maxWidth: 580, fontWeight: '400', marginBottom: 40,
  },
  heroBtns: { flexDirection: 'row', gap: 12, marginBottom: 60, flexWrap: 'wrap', justifyContent: 'center' },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#09090B', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 100,
  },
  btnPrimaryText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  btnSecondary: {
    borderWidth: 1, borderColor: '#E4E4E7', backgroundColor: '#FFFFFF', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 100,
  },
  btnSecondaryText: { fontSize: 15, fontWeight: '600', color: '#09090B' },

  // MARQUEE
  marqueeWrap: {
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.03)',
    paddingVertical: 16, overflow: 'hidden', backgroundColor: 'transparent',
  },
  marqueeRow: { flexDirection: 'row', alignItems: 'center' },
  marqueeItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24 },
  marqueeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#D1D5DB', marginRight: 16 },
  marqueeText: { fontSize: 11, fontWeight: '800', color: '#A1A1AA', letterSpacing: 1.5 },

  // PARALLAX 3D SECTION
  parallaxSection: {
    paddingHorizontal: IS_WEB ? 60 : 24,
    paddingVertical: 100,
    alignItems: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  parallaxSub: {
    fontSize: 11,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  parallaxTitle: {
    fontSize: IS_WEB ? 42 : 32,
    fontWeight: '900',
    color: '#09090B',
    textAlign: 'center',
    letterSpacing: -1.5,
    lineHeight: IS_WEB ? 50 : 38,
    marginBottom: 16,
  },
  parallaxDesc: {
    fontSize: 16,
    color: '#71717A',
    textAlign: 'center',
    maxWidth: 620,
    lineHeight: 26,
    marginBottom: 40,
  },
  parallaxCanvas: {
    width: '100%',
    maxWidth: 1000,
    height: IS_WEB ? 600 : 400,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultImage: {
    width: IS_WEB ? 640 : 340,
    height: IS_WEB ? 640 : 340,
    position: 'absolute',
    zIndex: 1,
  },
  floatingCardLeft: {
    position: 'absolute',
    left: IS_WEB ? 80 : 20,
    top: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
    ...(IS_WEB ? { backdropFilter: 'blur(16px)' } : {}),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
  },
  floatingCardRight: {
    position: 'absolute',
    right: IS_WEB ? 80 : 20,
    top: '55%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
    ...(IS_WEB ? { backdropFilter: 'blur(16px)' } : {}),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
  },
  floatingCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090B',
  },
  floatingCardDesc: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
  },

  // FEATURES
  section: {
    paddingHorizontal: IS_WEB ? 60 : 24, paddingVertical: 100,
    backgroundColor: 'transparent',
  },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#71717A', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  sectionHead: {
    fontSize: IS_WEB ? 42 : 32, fontWeight: '900', color: '#09090B',
    letterSpacing: -1.5, lineHeight: IS_WEB ? 50 : 38, marginBottom: 48,
  },
  featureGrid: {
    flexDirection: IS_WEB && W > 768 ? 'row' : 'column',
    flexWrap: 'wrap', gap: 20,
  },
  featureCard: {
    flex: IS_WEB && W > 768 ? 1 : undefined,
    minWidth: IS_WEB && W > 768 ? 260 : undefined,
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32,
    borderWidth: 1, borderColor: '#E4E4E7',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.02, shadowRadius: 16,
    position: 'relative', overflow: 'hidden',
  },
  featureHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
  },
  featureBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1, borderColor: '#E4E4E7', backgroundColor: '#FAFAFA',
  },
  featureBadgeText: {
    fontSize: 9, fontWeight: '850', color: '#09090B', letterSpacing: 0.5, textTransform: 'uppercase',
  },
  featureIcon: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E4E4E7',
  },
  featureStat: { fontSize: 40, fontWeight: '900', color: '#09090B', letterSpacing: -1.5, marginBottom: 8 },
  featureTitle: { fontSize: 16, fontWeight: '750', color: '#09090B', lineHeight: 22 },

  // PROOF
  proofSection: {
    backgroundColor: 'transparent',
    paddingHorizontal: IS_WEB ? 60 : 24, paddingVertical: 100, alignItems: 'center',
  },
  proofLabel: { fontSize: 11, fontWeight: '800', color: '#71717A', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  proofHead: {
    fontSize: IS_WEB ? 38 : 30, fontWeight: '900', color: '#09090B',
    textAlign: 'center', letterSpacing: -1.5, lineHeight: IS_WEB ? 46 : 36,
    maxWidth: 600, marginBottom: 48,
  },
  testimonialGrid: {
    flexDirection: IS_WEB && W > 768 ? 'row' : 'column',
    width: '100%', maxWidth: 1100, gap: 24,
  },
  testimonialCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32,
    borderWidth: 1, borderColor: '#E4E4E7',
    position: 'relative', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.02, shadowRadius: 16,
  },
  quoteText: { fontSize: 17, color: '#3F3F46', lineHeight: 28, fontWeight: '500', marginBottom: 24, fontStyle: 'italic', zIndex: 1 },
  quoteAuthorWrap: { flexDirection: 'row', alignItems: 'center', gap: 14, zIndex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090B' },
  avatarInitials: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  authorName: { fontSize: 15, fontWeight: '800', color: '#09090B' },
  authorRole: { fontSize: 13, color: '#71717A', fontWeight: '500', marginTop: 2 },
  stars: { flexDirection: 'row', gap: 2 },

  // CTA SECTION
  ctaSection: {
    paddingHorizontal: IS_WEB ? 60 : 24, paddingVertical: 100,
    backgroundColor: 'transparent', alignItems: 'center',
  },
  ctaCard: {
    width: '100%', maxWidth: 1100, backgroundColor: '#09090B', borderRadius: 24,
    paddingVertical: 80, paddingHorizontal: 24, alignItems: 'center', position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  ctaHead: {
    fontSize: IS_WEB ? 56 : 38, fontWeight: '900', color: '#FFF',
    letterSpacing: -1.5, marginBottom: 16, textAlign: 'center', zIndex: 2
  },
  ctaSub: {
    fontSize: 18, color: '#A1A1AA', textAlign: 'center', marginBottom: 40,
    fontWeight: '500', maxWidth: 480, lineHeight: 28, zIndex: 2
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 2,
    backgroundColor: '#FFF', paddingVertical: 16, paddingHorizontal: 36, borderRadius: 100,
    shadowColor: '#FFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '800', color: '#000' },

  // FOOTER
  footer: {
    backgroundColor: 'transparent',
    paddingHorizontal: IS_WEB ? 60 : 24, paddingVertical: 60,
    alignItems: IS_WEB ? undefined : 'center',
    borderTopWidth: 1, borderColor: '#F4F4F5',
  },
  footerLogo: { fontSize: 20, fontWeight: '900', color: '#09090B', marginBottom: 20 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 20 },
  footerLink: { fontSize: 14, color: '#71717A', fontWeight: '600' },
  copyright: { fontSize: 13, color: '#A1A1AA', fontWeight: '500' },
});

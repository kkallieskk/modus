import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Animated, Easing, Dimensions, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowRight, ShieldCheck, Banknote, Users,
  CheckCircle2, Star, Zap, TrendingUp,
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
      Animated.timing(x, { toValue: -W, duration: 18000, easing: Easing.linear, useNativeDriver: true })
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




// ─── Hero Abstract Background Illustrations ─────────────────────────────────────
const HeroIllustrations = () => {
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 6000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const y1 = float.interpolate({ inputRange: [0, 1], outputRange: [0, -25] });
  const y2 = float.interpolate({ inputRange: [0, 1], outputRange: [0, 25] });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Animated.View style={{ position: 'absolute', top: '20%', left: '10%', opacity: 0.02, transform: [{ translateY: y1 }, { rotate: '-15deg' }] }}>
        <Zap size={220} color="#000" strokeWidth={1} />
      </Animated.View>
      <Animated.View style={{ position: 'absolute', bottom: '15%', right: '12%', opacity: 0.02, transform: [{ translateY: y2 }, { rotate: '15deg' }] }}>
        <Star size={280} color="#000" strokeWidth={1} />
      </Animated.View>
    </View>
  );
};

// ─── Feature block ────────────────────────────────────────────────────────────
const Feature = ({ icon: Icon, stat, title, accentColor }: any) => (
  <View style={[s.featureCard, { borderColor: accentColor + '30' }]}>
    <View style={[s.featureIcon, { backgroundColor: accentColor + '10' }]}>
      <Icon size={20} color={accentColor} />
    </View>
    <Text style={[s.featureStat, { color: accentColor }]}>{stat}</Text>
    <Text style={s.featureTitle}>{title}</Text>
  </View>
);

// ─── Testimonial block ────────────────────────────────────────────────────────
const TestimonialCard = ({ quote, author, role, accentColor, initials }: any) => (
  <View style={[s.testimonialCard, { borderColor: accentColor + '20' }]}>
    <Text style={s.quoteText}>“{quote}”</Text>
    <View style={s.quoteAuthorWrap}>
      <View style={[s.avatar, { backgroundColor: accentColor }]}>
        <Text style={s.avatarInitials}>{initials}</Text>
      </View>
      <View>
        <Text style={s.authorName}>{author}</Text>
        <Text style={s.authorRole}>{role}</Text>
      </View>
    </View>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
export const LandingScreen = () => {
  const nav = useNavigation<any>();

  // scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const lowerOpacity = scrollY.interpolate({
    inputRange: [0, H * 0.6],
    outputRange: [0.35, 1], // Start much higher so it doesn't look like a sudden rigid fade
    extrapolate: 'clamp'
  });
  const lowerTranslateY = scrollY.interpolate({
    inputRange: [0, H * 0.6],
    outputRange: [20, 0], // Move just 20px instead of 60px to feel less rigid
    extrapolate: 'clamp'
  });
  
  // entrance animations
  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const slide1 = useRef(new Animated.Value(30)).current;
  const slide2 = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Staggered entrance
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
      {/* ── BACKGROUND MESH (Fixed to viewport) ── */}
      <View style={s.bgGlowWrap}>
        <View style={s.bgGlow1} />
        <View style={s.bgGlow2} />
        <View style={s.bgGlow3} />
        <View style={s.bgGlow4} />
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
        <View style={[s.hero, { minHeight: Math.min(H * 0.75, 800), justifyContent: 'center' }]}>
          <HeroIllustrations />

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
            <ArrowRight size={18} color="#FFF" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [s.btnSecondary, pressed && { opacity: 0.8 }]}
            onPress={() => nav.navigate('SignUp', { role: 'influencer' })}
          >
            <Text style={s.btnSecondaryText}>I am a Creator</Text>
          </Pressable>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: lowerOpacity, transform: [{ translateY: lowerTranslateY }] }}>
        {/* ── MARQUEE ── */}
        <Marquee />

      {/* ── FEATURES ── */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>The Modus Standard</Text>
        <Text style={s.sectionHead}>Marketplace integrity,{'\n'}by the numbers.</Text>
        <View style={s.featureGrid}>
          <Feature
            icon={ShieldCheck}
            stat="99.2%"
            title="Audited Follower Authenticity"
            accentColor="#4F46E5"
          />
          <Feature
            icon={Banknote}
            stat="0"
            title="Payment Chasing or Invoice Delays"
            accentColor="#10B981"
          />
          <Feature
            icon={TrendingUp}
            stat="10s"
            title="To Publish Brief & Match Creators"
            accentColor="#8B5CF6"
          />
        </View>
      </View>

      {/* ── SOCIAL PROOF ── */}
      <View style={s.proofSection}>
        <Text style={s.proofLabel}>What they're saying</Text>
        <Text style={s.proofHead}>Built for both sides of the table.</Text>
        <View style={s.testimonialGrid}>
          <TestimonialCard
            quote="Audited audience data changed how we recruit talent. No more wasted budget."
            author="Riya S."
            role="Head of Influencer, Glow Recipe"
            accentColor="#4F46E5"
            initials="R"
          />
          <TestimonialCard
            quote="Escrow payments mean I never worry about getting paid. I focus entirely on my content."
            author="Alex M."
            role="Tech & Lifestyle Creator (180k+)"
            accentColor="#10B981"
            initials="A"
          />
        </View>
      </View>

      {/* ── CTA FOOTER ── */}
      <View style={s.ctaSection}>
        <View style={s.ctaCard}>
          {/* Subtle colored glow inside dark card */}
          <View style={s.ctaCardGlow} />
          <Text style={s.ctaHead}>Ready to grow?</Text>
          <Text style={s.ctaSub}>Join elite brands and verified creators building the future of commerce.</Text>
          <Pressable
            style={({ pressed }) => [s.ctaBtn, pressed && { opacity: 0.85 }]}
            onPress={() => nav.navigate('Welcome')}
          >
            <Text style={s.ctaBtnText}>Start for free</Text>
            <ArrowRight size={20} color="#000" />
          </Pressable>
        </View>
      </View>

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

      </Animated.View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  pageWrapper: { flex: 1, backgroundColor: '#FFFFFF' },
  page: { flex: 1, backgroundColor: 'transparent' },
  pageContent: { paddingBottom: 40, paddingTop: IS_WEB ? 80 : 0 }, // compensate for fixed nav

  // NAV
  nav: {
    ...(IS_WEB ? { 
      position: 'fixed', top: 24, left: '50%', transform: [{ translateX: '-50%' }] as any,
      width: '90%', maxWidth: 1100, zIndex: 100, 
      backdropFilter: 'blur(30px) saturate(150%)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
    } : {}),
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: IS_WEB ? 32 : 24, paddingVertical: 14,
    backgroundColor: IS_WEB ? 'rgba(255, 255, 255, 0.6)' : '#FFFFFF', 
    borderWidth: IS_WEB ? 1 : 0, 
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: IS_WEB ? 100 : 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 20,
  },
  logo: { fontSize: 22, fontWeight: '900', color: '#000', letterSpacing: -0.5 },
  navCenter: { flexDirection: 'row', gap: 32, alignItems: 'center' },
  navLink: { paddingVertical: 8 },
  navLinkText: { fontSize: 14, fontWeight: '600', color: '#4B5563', transition: 'color 0.2s' as any },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navLogin: { paddingVertical: 10, paddingHorizontal: 16 },
  navLoginText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  navCta: { backgroundColor: '#000', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 100 },
  navCtaText: { fontSize: 15, fontWeight: '700', color: '#FFF' },

  hero: {
    alignItems: 'center', paddingHorizontal: 24,
    paddingTop: IS_WEB ? 20 : 60, paddingBottom: 40,
    backgroundColor: 'transparent',
    position: 'relative', overflow: 'hidden'
  },
  bgGlowWrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', pointerEvents: 'none' },
  bgGlow1: {
    position: 'absolute', top: -100, left: -50, width: 700, height: 700,
    backgroundColor: 'rgba(59, 130, 246, 0.18)', borderRadius: 350, // Blue
    filter: 'blur(140px)' as any,
  },
  bgGlow2: {
    position: 'absolute', top: -100, right: -50, width: 700, height: 700,
    backgroundColor: 'rgba(168, 85, 247, 0.18)', borderRadius: 350, // Purple
    filter: 'blur(140px)' as any,
  },
  bgGlow3: {
    position: 'absolute', bottom: -150, left: -100, width: 600, height: 600,
    backgroundColor: 'rgba(236, 72, 153, 0.18)', borderRadius: 300, // Pink
    filter: 'blur(120px)' as any,
  },
  bgGlow4: {
    position: 'absolute', bottom: -150, right: -100, width: 600, height: 600,
    backgroundColor: 'rgba(16, 185, 129, 0.18)', borderRadius: 300, // Green
    filter: 'blur(120px)' as any,
  },

  heroHead: {
    fontSize: IS_WEB ? 64 : 40, fontWeight: '900', color: '#000',
    textAlign: 'center', letterSpacing: -2, lineHeight: IS_WEB ? 72 : 46, marginBottom: 20,
  },
  heroSub: {
    fontSize: 18, color: '#6B7280', textAlign: 'center', lineHeight: 28,
    maxWidth: 560, fontWeight: '400', marginBottom: 40,
  },
  heroBtns: { flexDirection: 'row', gap: 12, marginBottom: 60, flexWrap: 'wrap', justifyContent: 'center' },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#000', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 100,
  },
  btnPrimaryText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  btnSecondary: {
    borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 100,
  },
  btnSecondaryText: { fontSize: 16, fontWeight: '600', color: '#000' },




  // MARQUEE
  marqueeWrap: {
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6',
    paddingVertical: 16, overflow: 'hidden', backgroundColor: '#FAFAFA',
  },
  marqueeRow: { flexDirection: 'row', alignItems: 'center' },
  marqueeItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24 },
  marqueeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#D1D5DB', marginRight: 16 },
  marqueeText: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1.5 },

  // FEATURES
  section: {
    paddingHorizontal: IS_WEB ? 60 : 24, paddingVertical: 60,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  sectionHead: {
    fontSize: IS_WEB ? 40 : 30, fontWeight: '900', color: '#000',
    letterSpacing: -1, lineHeight: IS_WEB ? 48 : 36, marginBottom: 40,
  },
  featureGrid: {
    flexDirection: IS_WEB && W > 768 ? 'row' : 'column',
    flexWrap: 'wrap', gap: 16,
  },
  featureCard: {
    flex: IS_WEB && W > 768 ? 1 : undefined,
    minWidth: IS_WEB && W > 768 ? 260 : undefined,
    backgroundColor: '#FAFAFA', borderRadius: 24, padding: 32,
    borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10,
  },
  featureIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  featureStat: { fontSize: 44, fontWeight: '900', letterSpacing: -1.5, marginBottom: 8 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: '#111827', lineHeight: 22 },

  // PROOF
  proofSection: {
    backgroundColor: '#FAFAFA', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6',
    paddingHorizontal: IS_WEB ? 60 : 24, paddingVertical: 80, alignItems: 'center',
  },
  proofLabel: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  proofHead: {
    fontSize: IS_WEB ? 36 : 28, fontWeight: '900', color: '#000',
    textAlign: 'center', letterSpacing: -1, lineHeight: IS_WEB ? 44 : 34,
    maxWidth: 600, marginBottom: 48,
  },
  testimonialGrid: {
    flexDirection: IS_WEB && W > 768 ? 'row' : 'column',
    width: '100%', maxWidth: 1100, gap: 24,
  },
  testimonialCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32,
    borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 20,
  },
  quoteText: { fontSize: 17, color: '#374151', lineHeight: 28, fontWeight: '500', marginBottom: 24, fontStyle: 'italic' },
  quoteAuthorWrap: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  authorName: { fontSize: 15, fontWeight: '800', color: '#111827' },
  authorRole: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginTop: 2 },

  // CTA SECTION
  ctaSection: {
    paddingHorizontal: IS_WEB ? 60 : 24, paddingVertical: 80,
    backgroundColor: '#FFF', alignItems: 'center',
  },
  ctaCard: {
    width: '100%', maxWidth: 1100, backgroundColor: '#09090B', borderRadius: 32,
    paddingVertical: 80, paddingHorizontal: 24, alignItems: 'center', position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  ctaCardGlow: {
    position: 'absolute', top: -150, width: 400, height: 400,
    backgroundColor: 'rgba(168, 85, 247, 0.15)', borderRadius: 200,
    filter: 'blur(80px)' as any, pointerEvents: 'none'
  },
  ctaHead: {
    fontSize: IS_WEB ? 56 : 38, fontWeight: '900', color: '#FFF',
    letterSpacing: -1.5, marginBottom: 16, textAlign: 'center', zIndex: 2
  },
  ctaSub: {
    fontSize: 18, color: '#9CA3AF', textAlign: 'center', marginBottom: 40,
    fontWeight: '500', maxWidth: 480, lineHeight: 28, zIndex: 2
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 2,
    backgroundColor: '#FFF', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 100,
    shadowColor: '#FFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#000' },

  // FOOTER
  footer: {
    backgroundColor: '#FAFAFA', borderTopWidth: 1, borderTopColor: '#F3F4F6',
    paddingHorizontal: IS_WEB ? 60 : 24, paddingVertical: 40,
    alignItems: IS_WEB ? undefined : 'center',
  },
  footerLogo: { fontSize: 20, fontWeight: '900', color: '#000', marginBottom: 20 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 20 },
  footerLink: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
  copyright: { fontSize: 13, color: '#D1D5DB', fontWeight: '500' },
});

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




// ─── Feature block ────────────────────────────────────────────────────────────
const Feature = ({ icon: Icon, title, body }: any) => (
  <View style={s.featureCard}>
    <View style={s.featureIcon}><Icon size={22} color="#000" /></View>
    <Text style={s.featureTitle}>{title}</Text>
    <Text style={s.featureBody}>{body}</Text>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
export const LandingScreen = () => {
  const nav = useNavigation<any>();

  // scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const lowerOpacity = scrollY.interpolate({
    inputRange: [0, H * 0.4],
    outputRange: [0.08, 1],
    extrapolate: 'clamp'
  });
  const lowerTranslateY = scrollY.interpolate({
    inputRange: [0, H * 0.4],
    outputRange: [60, 0],
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
    <ScrollView 
      style={s.page} 
      contentContainerStyle={s.pageContent} 
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      scrollEventThrottle={16}
    >

      {/* ── NAV ── */}
      <View style={s.nav}>
        <Text style={s.logo}>Modus.</Text>
        <View style={s.navRight}>
          <Pressable onPress={() => nav.navigate('Login')} style={s.navLogin}>
            <Text style={s.navLoginText}>Log in</Text>
          </Pressable>
          <Pressable onPress={() => nav.navigate('Welcome')} style={s.navCta}>
            <Text style={s.navCtaText}>Get Started</Text>
          </Pressable>
        </View>
      </View>

      {/* ── HERO ── */}
      <View style={[s.hero, { minHeight: H * 0.85, justifyContent: 'center' }]}>
        <View style={s.bgGlowWrap}>
          <View style={s.bgGlow1} />
          <View style={s.bgGlow2} />
        </View>

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
        <Text style={s.sectionLabel}>Why Modus</Text>
        <Text style={s.sectionHead}>Everything a marketplace{'\n'}should be.</Text>
        <View style={s.featureGrid}>
          <Feature
            icon={ShieldCheck}
            title="Hire on real data"
            body="Our AI auditing engine pulls live Instagram follower counts and engagement directly from the official API. Zero faking."
          />
          <Feature
            icon={Banknote}
            title="Escrowed payments"
            body="Funds are locked before work starts. Creators get paid the moment deliverables are approved. No chasing invoices."
          />
          <Feature
            icon={TrendingUp}
            title="1-click campaigns"
            body="Publish a brief, review pitches, hire, and track — all in one clean workspace designed for speed."
          />
          <Feature
            icon={Users}
            title="Curated talent"
            body="Every creator is manually reviewed and must connect their social account for verified audience demographics."
          />
        </View>
      </View>

      {/* ── SOCIAL PROOF ── */}
      <View style={s.proofSection}>
        <Text style={s.proofHead}>"The only platform where the data actually matches reality."</Text>
        <View style={s.proofAuthor}>
          <View style={s.proofAvatar}><Text style={{ color: '#FFF', fontWeight: '800' }}>R</Text></View>
          <View>
            <Text style={s.proofName}>Riya S.</Text>
            <Text style={s.proofRole}>Head of Influencer, Glow Recipe IN</Text>
          </View>
          <View style={s.stars}>
            {[1,2,3,4,5].map(i => <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />)}
          </View>
        </View>
      </View>

      {/* ── CTA FOOTER ── */}
      <View style={s.ctaSection}>
        <Text style={s.ctaHead}>Ready to grow?</Text>
        <Text style={s.ctaSub}>Join brands and creators already building on Modus.</Text>
        <Pressable
          style={({ pressed }) => [s.ctaBtn, pressed && { opacity: 0.85 }]}
          onPress={() => nav.navigate('Welcome')}
        >
          <Text style={s.ctaBtnText}>Start for free</Text>
          <ArrowRight size={20} color="#FFF" />
        </Pressable>
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
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFFFF' },
  pageContent: { paddingBottom: 40 },

  // NAV
  nav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: IS_WEB ? 60 : 24, paddingVertical: 20,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: 'transparent',
  },
  logo: { fontSize: 22, fontWeight: '900', color: '#000', letterSpacing: -0.5 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navLogin: { paddingVertical: 10, paddingHorizontal: 16 },
  navLoginText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  navCta: { backgroundColor: '#000', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 100 },
  navCtaText: { fontSize: 15, fontWeight: '700', color: '#FFF' },

  hero: {
    alignItems: 'center', paddingHorizontal: 24,
    paddingTop: IS_WEB ? 80 : 60, paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    position: 'relative', overflow: 'hidden'
  },
  bgGlowWrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', pointerEvents: 'none' },
  bgGlow1: {
    position: 'absolute', top: -100, left: -100, width: 500, height: 500,
    backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: 250,
    filter: 'blur(100px)' as any,
  },
  bgGlow2: {
    position: 'absolute', bottom: -150, right: -150, width: 600, height: 600,
    backgroundColor: 'rgba(16, 185, 129, 0.04)', borderRadius: 300,
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
    minWidth: IS_WEB && W > 768 ? 220 : undefined,
    backgroundColor: '#FAFAFA', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  featureIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  featureTitle: { fontSize: 16, fontWeight: '800', color: '#000', marginBottom: 8 },
  featureBody: { fontSize: 14, color: '#6B7280', lineHeight: 22, fontWeight: '500' },

  // PROOF
  proofSection: {
    backgroundColor: '#F9FAFB', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6',
    paddingHorizontal: IS_WEB ? 60 : 24, paddingVertical: 60, alignItems: 'center',
  },
  proofHead: {
    fontSize: IS_WEB ? 28 : 22, fontWeight: '800', color: '#000',
    textAlign: 'center', letterSpacing: -0.5, lineHeight: IS_WEB ? 36 : 30,
    maxWidth: 600, marginBottom: 32,
  },
  proofAuthor: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  proofAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
  },
  proofName: { fontSize: 15, fontWeight: '800', color: '#000' },
  proofRole: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginTop: 2 },
  stars: { flexDirection: 'row', gap: 2, marginLeft: 8 },

  // CTA SECTION
  ctaSection: {
    alignItems: 'center', paddingHorizontal: 24, paddingVertical: 80,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  ctaHead: {
    fontSize: IS_WEB ? 56 : 40, fontWeight: '900', color: '#000',
    letterSpacing: -1.5, marginBottom: 16, textAlign: 'center',
  },
  ctaSub: {
    fontSize: 17, color: '#6B7280', textAlign: 'center', marginBottom: 36,
    fontWeight: '500', maxWidth: 420,
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#000', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 100,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#FFF' },

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

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

const { width: W } = Dimensions.get('window');
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

// ─── Fake App UI Mockup (Brand Dashboard card) ────────────────────────────────
const BrandMockup = () => (
  <View style={s.mockCard}>
    {/* Header row */}
    <View style={s.mockHeader}>
      <Text style={s.mockTitle}>Creator Pitch Inbox</Text>
      <View style={s.mockBadge}><Text style={s.mockBadgeText}>3 New</Text></View>
    </View>
    {/* Creator rows */}
    {[
      { name: 'Sarah Jenkins', niche: 'Lifestyle & Wellness', followers: '148.2K', verified: true },
      { name: 'David Chen', niche: 'Productivity & Tech', followers: '82.5K', verified: true },
    ].map((c, i) => (
      <View key={i} style={s.mockRow}>
        <View style={s.mockAvatar}>
          <Text style={s.mockAvatarText}>{c.name[0]}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={s.mockName}>{c.name}</Text>
            {c.verified && <CheckCircle2 size={13} color="#3B82F6" fill="#3B82F6" />}
          </View>
          <Text style={s.mockNiche}>{c.niche} · {c.followers}</Text>
        </View>
        <View style={s.mockHireBtn}><Text style={s.mockHireTxt}>Hire</Text></View>
      </View>
    ))}
    {/* Metrics bar */}
    <View style={s.mockMetrics}>
      {[['₹12.4L', 'Escrowed'], ['98%', 'On-Time'], ['6', 'Active']].map(([v, l]) => (
        <View key={l} style={s.mockMetricItem}>
          <Text style={s.mockMetricVal}>{v}</Text>
          <Text style={s.mockMetricLabel}>{l}</Text>
        </View>
      ))}
    </View>
  </View>
);

// ─── Fake App UI Mockup (Creator pipeline card) ───────────────────────────────
const CreatorMockup = () => (
  <View style={s.mockCard}>
    <View style={s.mockHeader}>
      <Text style={s.mockTitle}>My Deals</Text>
      <View style={[s.mockBadge, { backgroundColor: '#DCFCE7' }]}>
        <Text style={[s.mockBadgeText, { color: '#166534' }]}>₹5K Secured</Text>
      </View>
    </View>
    {[
      { brand: 'Glow Recipe', campaign: 'Watermelon Launch', status: 'In Progress', color: '#FEF3C7' },
      { brand: 'Rhode Skin', campaign: 'Summer Glaze', status: 'Draft Approved', color: '#DCFCE7' },
    ].map((d, i) => (
      <View key={i} style={s.mockRow}>
        <View style={[s.mockAvatar, { backgroundColor: '#F3F4F6' }]}>
          <Text style={[s.mockAvatarText, { color: '#000' }]}>{d.brand[0]}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.mockName}>{d.brand}</Text>
          <Text style={s.mockNiche}>{d.campaign}</Text>
        </View>
        <View style={[s.mockStatusBadge, { backgroundColor: d.color }]}>
          <Text style={s.mockStatusText}>{d.status}</Text>
        </View>
      </View>
    ))}
    <View style={[s.mockMetrics, { backgroundColor: '#F0FDF4', borderRadius: 14, padding: 12, marginTop: 12 }]}>
      <ShieldCheck size={16} color="#059669" />
      <Text style={{ fontSize: 13, color: '#166534', fontWeight: '700', marginLeft: 8 }}>
        Funds secured in Modus Escrow Vault
      </Text>
    </View>
  </View>
);

// ─── Stat pill ────────────────────────────────────────────────────────────────
const Stat = ({ value, label }: { value: string; label: string }) => (
  <View style={s.statItem}>
    <Text style={s.statValue}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

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

  // subtle float for mockups
  const float = useRef(new Animated.Value(0)).current;
  
  // entrance animations
  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const fade3 = useRef(new Animated.Value(0)).current;
  const slide1 = useRef(new Animated.Value(30)).current;
  const slide2 = useRef(new Animated.Value(30)).current;
  const slide3 = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

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
      Animated.parallel([
        Animated.timing(fade3, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slide3, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);
  
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });

  return (
    <ScrollView style={s.page} contentContainerStyle={s.pageContent} showsVerticalScrollIndicator={false}>

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
      <View style={s.hero}>
        <Animated.View style={{ opacity: fade1, transform: [{ translateY: slide1 }], alignItems: 'center' }}>
          <View style={s.heroPill}>
            <Zap size={12} color="#000" />
            <Text style={s.heroPillText}>The creator economy, upgraded.</Text>
          </View>

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

        {/* Stats row */}
        <Animated.View style={[s.statsRow, { opacity: fade3, transform: [{ translateY: slide3 }] }]}>
          <Stat value="₹2.4Cr+" label="Creator Payouts" />
          <View style={s.statDivider} />
          <Stat value="1,200+" label="Verified Creators" />
          <View style={s.statDivider} />
          <Stat value="98%" label="On-Time Delivery" />
        </Animated.View>
      </View>

      {/* ── MOCKUPS ── */}
      <View style={s.mockupsSection}>
        <Animated.View style={[s.mockupLeft, { opacity: fade3, transform: [{ translateY: floatY }] }]}>
          <BrandMockup />
        </Animated.View>
        <Animated.View style={[s.mockupRight, { opacity: fade3, transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] }]}>
          <CreatorMockup />
        </Animated.View>
      </View>

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

    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAFAFA' },
  pageContent: { paddingBottom: 40 },

  // NAV
  nav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: IS_WEB ? 60 : 24, paddingVertical: 20,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  logo: { fontSize: 22, fontWeight: '900', color: '#000', letterSpacing: -0.5 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navLogin: { paddingVertical: 10, paddingHorizontal: 16 },
  navLoginText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  navCta: { backgroundColor: '#000', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 100 },
  navCtaText: { fontSize: 15, fontWeight: '700', color: '#FFF' },

  // HERO
  hero: {
    alignItems: 'center', paddingHorizontal: 24,
    paddingTop: IS_WEB ? 80 : 60, paddingBottom: 40,
    backgroundColor: '#FFF',
  },
  heroPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F3F4F6', borderRadius: 100, paddingVertical: 6, paddingHorizontal: 14,
    marginBottom: 24,
  },
  heroPillText: { fontSize: 13, fontWeight: '700', color: '#000' },
  heroHead: {
    fontSize: IS_WEB ? 60 : 40, fontWeight: '900', color: '#000',
    textAlign: 'center', letterSpacing: -1.5, lineHeight: IS_WEB ? 68 : 46, marginBottom: 20,
  },
  heroSub: {
    fontSize: 17, color: '#6B7280', textAlign: 'center', lineHeight: 26,
    maxWidth: 520, fontWeight: '500', marginBottom: 36,
  },
  heroBtns: { flexDirection: 'row', gap: 12, marginBottom: 48, flexWrap: 'wrap', justifyContent: 'center' },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#000', paddingVertical: 16, paddingHorizontal: 28, borderRadius: 100,
  },
  btnPrimaryText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  btnSecondary: {
    borderWidth: 1.5, borderColor: '#E5E7EB', paddingVertical: 16, paddingHorizontal: 28, borderRadius: 100,
  },
  btnSecondaryText: { fontSize: 16, fontWeight: '700', color: '#000' },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 20, paddingVertical: 20, paddingHorizontal: 28,
    borderWidth: 1, borderColor: '#F3F4F6', gap: 0,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', color: '#000', letterSpacing: -0.5 },
  statLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: '#E5E7EB' },

  // MOCKUPS
  mockupsSection: {
    flexDirection: IS_WEB && W > 768 ? 'row' : 'column',
    gap: 20, paddingHorizontal: IS_WEB ? 60 : 20, paddingVertical: 60,
    justifyContent: 'center', alignItems: 'center',
  },
  mockupLeft: { flex: IS_WEB && W > 768 ? 1 : undefined, width: IS_WEB && W > 768 ? undefined : '100%', maxWidth: 460 },
  mockupRight: { flex: IS_WEB && W > 768 ? 1 : undefined, width: IS_WEB && W > 768 ? undefined : '100%', maxWidth: 460 },

  // MOCK CARD
  mockCard: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 4,
  },
  mockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mockTitle: { fontSize: 16, fontWeight: '900', color: '#000' },
  mockBadge: { backgroundColor: '#EFF6FF', borderRadius: 100, paddingVertical: 4, paddingHorizontal: 10 },
  mockBadgeText: { fontSize: 12, fontWeight: '800', color: '#1D4ED8' },
  mockRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#F9FAFB',
  },
  mockAvatar: {
    width: 40, height: 40, borderRadius: 14, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
  },
  mockAvatarText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  mockName: { fontSize: 14, fontWeight: '800', color: '#000' },
  mockNiche: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginTop: 2 },
  mockHireBtn: {
    backgroundColor: '#000', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 14,
  },
  mockHireTxt: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  mockStatusBadge: { borderRadius: 10, paddingVertical: 5, paddingHorizontal: 10 },
  mockStatusText: { fontSize: 11, fontWeight: '800', color: '#374151' },
  mockMetrics: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  mockMetricItem: { alignItems: 'center' },
  mockMetricVal: { fontSize: 18, fontWeight: '900', color: '#000' },
  mockMetricLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginTop: 2 },

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

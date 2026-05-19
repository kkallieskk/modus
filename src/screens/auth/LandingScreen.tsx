import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Animated, Easing, Dimensions, Platform,
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

// ─── Camera Aperture Reveal Shutter Component ──────────────────────────────
const CameraApertureScroll = ({ scrollY }: { scrollY: Animated.Value }) => {
  // Shutter blade translations: slide outwards from center (0 to 180px)
  const openProgress = scrollY.interpolate({
    inputRange: [180, 520],
    outputRange: [0, 190],
    extrapolate: 'clamp',
  });

  // Shutter blade rotation: rotate slightly as they open
  const bladeRotation = scrollY.interpolate({
    inputRange: [180, 520],
    outputRange: ['0deg', '-35deg'],
    extrapolate: 'clamp',
  });

  // Viewport content scale & opacity
  const viewportScale = scrollY.interpolate({
    inputRange: [220, 520],
    outputRange: [0.88, 1],
    extrapolate: 'clamp',
  });

  const viewportOpacity = scrollY.interpolate({
    inputRange: [220, 460],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Side pointer labels reveal
  const labelOpacity = scrollY.interpolate({
    inputRange: [380, 560],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const labelTranslateX = scrollY.interpolate({
    inputRange: [380, 560],
    outputRange: [20, 0],
    extrapolate: 'clamp',
  });

  // 6 blades around 360 degrees (0, 60, 120, 180, 240, 300)
  const blades = [0, 60, 120, 180, 240, 300];

  return (
    <View style={s.apertureSection}>
      <Text style={s.apertureSub}>INSPECT THE MECHANICS</Text>
      <Text style={s.apertureTitle}>Unveiling marketplace transparency.</Text>
      <Text style={s.apertureDesc}>
        Scroll down to open the lens aperture and examine a secure, real-time Modus escrow contract and creator audit feed.
      </Text>

      <View style={s.lensContainer}>
        {/* Behind Shutter: The Mockup Viewport */}
        <Animated.View 
          style={[
            s.lensViewport, 
            { 
              opacity: viewportOpacity,
              transform: [{ scale: viewportScale }]
            }
          ]}
        >
          {/* Beautiful Mockup: Creator Deal with Escrow Vault */}
          <View style={s.dealMockupCard}>
            <View style={s.dealMockupHeader}>
              <View style={s.brandLogoPlaceholder}>
                <Text style={s.brandLogoPlaceholderText}>M</Text>
              </View>
              <View>
                <Text style={s.dealBrandName}>Glow Recipe Campaign</Text>
                <Text style={s.dealCreatorName}>with Alex M. (Creator)</Text>
              </View>
              <View style={s.escrowStatusBadge}>
                <View style={s.statusDot} />
                <Text style={s.statusText}>Escrow Secured</Text>
              </View>
            </View>

            <View style={s.dealMetricsRow}>
              <View style={s.dealMetric}>
                <Text style={s.metricLabel}>CONTRACT VALUE</Text>
                <Text style={s.metricVal}>$4,800.00</Text>
              </View>
              <View style={s.dealMetric}>
                <Text style={s.metricLabel}>VERIFIED FOLLOWER AUTH</Text>
                <Text style={s.metricVal}>99.2%</Text>
              </View>
              <View style={s.dealMetric}>
                <Text style={s.metricLabel}>DELIVERABLES</Text>
                <Text style={s.metricVal}>2x Reels, 1x Story</Text>
              </View>
            </View>

            <View style={s.escrowSealContainer}>
              <Lock size={14} color="#059669" />
              <Text style={s.escrowSealText}>Funds locked in Modus Vault. Release on verified match of brief.</Text>
            </View>
          </View>
        </Animated.View>

        {/* Shutter Blades Layer */}
        <View style={s.shutterContainer} pointerEvents="none">
          {blades.map((angle, index) => (
            <Animated.View
              key={index}
              style={[
                s.bladeWrapper,
                {
                  transform: [
                    { rotate: `${angle}deg` },
                  ]
                }
              ]}
            >
              {/* Each blade slides outwards along its X-axis */}
              <Animated.View
                style={[
                  s.shutterBlade,
                  {
                    transform: [
                      { translateX: openProgress },
                      { rotate: bladeRotation }
                    ]
                  }
                ]}
              />
            </Animated.View>
          ))}
        </View>

        {/* Outer Metallic Camera Lens Bezel */}
        <View style={s.lensBezel} pointerEvents="none">
          <View style={s.lensBezelInner} />
          <View style={s.lensApertureMarkings}>
            <Text style={s.markingText}>MODUS OPTICS f/1.4</Text>
            <Text style={s.markingText}>50MM SECURE</Text>
          </View>
        </View>

        {/* Contextual Pointer Labels floating on left/right */}
        <Animated.View style={[s.pointerLabelLeft, { opacity: labelOpacity, transform: [{ translateX: Animated.multiply(labelTranslateX, -1) }] }]}>
          <Text style={s.pointerTitle}>Escrow Vault Lock</Text>
          <Text style={s.pointerDesc}>Funds are pre-funded before creation starts.</Text>
        </Animated.View>

        <Animated.View style={[s.pointerLabelRight, { opacity: labelOpacity, transform: [{ translateX: labelTranslateX }] }]}>
          <Text style={s.pointerTitle}>Graph API Audits</Text>
          <Text style={s.pointerDesc}>Demographics are pulled directly from social tokens.</Text>
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

        {/* ── CAMERA APERTURE SCROLL REVEAL ── */}
        <CameraApertureScroll scrollY={scrollY} />

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

  // APERTURE SCROLL SECTION
  apertureSection: {
    paddingHorizontal: IS_WEB ? 60 : 24,
    paddingVertical: 100,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  apertureSub: {
    fontSize: 11,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  apertureTitle: {
    fontSize: IS_WEB ? 42 : 32,
    fontWeight: '900',
    color: '#09090B',
    textAlign: 'center',
    letterSpacing: -1.5,
    lineHeight: IS_WEB ? 50 : 38,
    marginBottom: 16,
  },
  apertureDesc: {
    fontSize: 16,
    color: '#71717A',
    textAlign: 'center',
    maxWidth: 620,
    lineHeight: 26,
    marginBottom: 60,
  },
  lensContainer: {
    width: 440,
    height: 440,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 40,
  },
  lensViewport: {
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#FAFAFA',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  shutterContainer: {
    width: 400,
    height: 400,
    borderRadius: 200,
    position: 'absolute',
    overflow: 'hidden',
  },
  bladeWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 400,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterBlade: {
    width: 290,
    height: 190,
    backgroundColor: '#09090B',
    borderColor: '#18181B',
    borderWidth: 1.5,
    borderTopRightRadius: 130,
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -145,
    marginTop: -95,
  },
  lensBezel: {
    width: 440,
    height: 440,
    borderRadius: 220,
    borderWidth: 16,
    borderColor: '#18181B',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  lensBezelInner: {
    width: 406,
    height: 406,
    borderRadius: 203,
    borderWidth: 2,
    borderColor: '#27272A',
    position: 'absolute',
  },
  lensApertureMarkings: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    transform: [{ rotate: '45deg' }],
  },
  markingText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#52525B',
    letterSpacing: 1.5,
  },
  dealMockupCard: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
  },
  dealMockupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  brandLogoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoPlaceholderText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  dealBrandName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090B',
  },
  dealCreatorName: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
    marginTop: 1,
  },
  escrowStatusBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '850',
    color: '#065F46',
    textTransform: 'uppercase',
  },
  dealMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F4F4F5',
    paddingVertical: 14,
    marginBottom: 16,
    gap: 8,
  },
  dealMetric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '850',
    color: '#A1A1AA',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#09090B',
  },
  escrowSealContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  escrowSealText: {
    flex: 1,
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
    lineHeight: 15,
  },
  pointerLabelLeft: {
    position: 'absolute',
    left: -180,
    top: 140,
    width: 160,
    alignItems: 'flex-end',
  },
  pointerLabelRight: {
    position: 'absolute',
    right: -180,
    top: 240,
    width: 160,
    alignItems: 'flex-start',
  },
  pointerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#09090B',
    marginBottom: 4,
  },
  pointerDesc: {
    fontSize: 11,
    color: '#71717A',
    lineHeight: 15,
    textAlign: 'inherit' as any,
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

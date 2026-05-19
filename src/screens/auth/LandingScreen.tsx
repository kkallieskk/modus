import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight, ShieldCheck, Lock, Sparkles, Star } from 'lucide-react-native';

const { width: W, height: H } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';
const MARQUEE_ITEMS = ['VERIFIED CREATORS','ESCROWED PAYMENTS','AI-AUDITED METRICS','INSTAGRAM API','ZERO AGENCIES','REAL-TIME DATA'];

const Marquee = () => {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.timing(x, { toValue: -W, duration: 22000, easing: Easing.linear, useNativeDriver: true })).start(); }, []);
  return (
    <View style={s.marqueeWrap}>
      <Animated.View style={[s.marqueeRow, { transform: [{ translateX: x }] }]}>
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
          <View key={i} style={s.marqueeItem}><View style={s.marqueeDot} /><Text style={s.marqueeText}>{t}</Text></View>
        ))}
      </Animated.View>
    </View>
  );
};

const VaultSection = ({ scrollY }) => {
  const doorRotate = scrollY.interpolate({ inputRange: [300, 900], outputRange: ['0deg', '-75deg'], extrapolate: 'clamp' });
  const innerGlow  = scrollY.interpolate({ inputRange: [300, 900], outputRange: [0, 1], extrapolate: 'clamp' });
  const t1op = scrollY.interpolate({ inputRange: [350, 550], outputRange: [0, 1], extrapolate: 'clamp' });
  const t2op = scrollY.interpolate({ inputRange: [550, 750], outputRange: [0, 1], extrapolate: 'clamp' });
  const t3op = scrollY.interpolate({ inputRange: [750, 950], outputRange: [0, 1], extrapolate: 'clamp' });
  const t1y  = scrollY.interpolate({ inputRange: [350, 550], outputRange: [40, 0], extrapolate: 'clamp' });
  const t2y  = scrollY.interpolate({ inputRange: [550, 750], outputRange: [40, 0], extrapolate: 'clamp' });
  const t3y  = scrollY.interpolate({ inputRange: [750, 950], outputRange: [40, 0], extrapolate: 'clamp' });
  return (
    <View style={s.vaultSection}>
      <Text style={s.vaultLabel}>THE MODUS VAULT</Text>
      <Text style={s.vaultTitle}>Scroll to open.</Text>
      <View style={s.vaultStage}>
        <Animated.View style={[s.vaultInterior, { opacity: innerGlow }]}>
          <View style={s.vaultInteriorLine} /><View style={[s.vaultInteriorLine, { width: '60%' }]} />
          <Text style={s.vaultInteriorText}>$4,800 locked</Text>
          <Text style={[s.vaultInteriorText, { fontSize: 11, opacity: 0.6 }]}>Glow Recipe · Alex M.</Text>
        </Animated.View>
        <Animated.Image source={require('../../../assets/images/modus_vault_door.png')}
          style={[s.vaultDoorImg, { transform: IS_WEB ? [{ perspective: 1200 }, { rotateY: doorRotate }] : [{ rotate: doorRotate }] }]}
          resizeMode="contain" />
      </View>
      {[[t1op,t1y,Lock,'Funds are locked before the creator even starts.'],[t2op,t2y,ShieldCheck,'Released only on verified delivery — no disputes.'],[t3op,t3y,Sparkles,'Zero agencies. Zero hidden fees. Full transparency.']].map(([op, ty, Icon, text], i) => (
        <Animated.View key={i} style={[s.vaultFeature, { opacity: op, transform: [{ translateY: ty }] }]}>
          <Icon size={16} color="#10B981" /><Text style={s.vaultFeatureText}>{text}</Text>
        </Animated.View>
      ))}
    </View>
  );
};

const PhoneSection = ({ scrollY }) => {
  const sc = scrollY.interpolate({ inputRange: [1100, 1600], outputRange: [0.82, 1.05], extrapolate: 'clamp' });
  const op = scrollY.interpolate({ inputRange: [1000, 1300], outputRange: [0, 1], extrapolate: 'clamp' });
  const ty = scrollY.interpolate({ inputRange: [1100, 1600], outputRange: [80, -20], extrapolate: 'clamp' });
  const ho = scrollY.interpolate({ inputRange: [1050, 1250], outputRange: [0, 1], extrapolate: 'clamp' });
  const hy = scrollY.interpolate({ inputRange: [1050, 1250], outputRange: [30, 0], extrapolate: 'clamp' });
  return (
    <View style={s.phoneSection}>
      <Animated.View style={{ opacity: ho, transform: [{ translateY: hy }], alignItems: 'center' }}>
        <Text style={s.phoneSectionLabel}>FOR CREATORS</Text>
        <Text style={s.phoneSectionTitle}>Your verified stats.{'\n'}Your leverage.</Text>
        <Text style={s.phoneSectionSub}>Instagram-verified follower counts, engagement rates, and audience demographics — all in one place brands trust.</Text>
      </Animated.View>
      <Animated.Image source={require('../../../assets/images/modus_phone_mockup.png')}
        style={[s.phoneImg, { opacity: op, transform: [{ scale: sc }, { translateY: ty }] }]} resizeMode="contain" />
    </View>
  );
};

const WORDS = ['No','fake','followers.','No','unpaid','invoices.','No','guesswork.','Just','verified','deals.'];
const WordReveal = ({ scrollY }) => (
  <View style={s.wordRevealSection}>
    <View style={s.wordRow}>
      {WORDS.map((word, i) => {
        const st = 1800 + i * 60;
        const op = scrollY.interpolate({ inputRange: [st, st+120], outputRange: [0.15, 1], extrapolate: 'clamp' });
        const sc = scrollY.interpolate({ inputRange: [st, st+120], outputRange: [0.9, 1], extrapolate: 'clamp' });
        return <Animated.Text key={i} style={[s.wordRevealWord, { opacity: op, transform: [{ scale: sc }] }]}>{word}{' '}</Animated.Text>;
      })}
    </View>
  </View>
);

const TestimonialCard = ({ quote, author, role, initials }) => (
  <View style={s.testimonialCard}>
    <Text style={s.quoteText}>"{quote}"</Text>
    <View style={s.quoteAuthorWrap}>
      <View style={s.avatar}><Text style={s.avatarInitials}>{initials}</Text></View>
      <View style={{ flex: 1 }}><Text style={s.authorName}>{author}</Text><Text style={s.authorRole}>{role}</Text></View>
      <View style={s.stars}>{[1,2,3,4,5].map(i => <Star key={i} size={11} color="#10B981" fill="#10B981" />)}</View>
    </View>
  </View>
);

export const LandingScreen = () => {
  const nav = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroOp = useRef(new Animated.Value(0)).current;
  const heroY  = useRef(new Animated.Value(40)).current;
  const btnsOp = useRef(new Animated.Value(0)).current;
  const btnsY  = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.stagger(180, [
      Animated.parallel([Animated.timing(heroOp, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }), Animated.timing(heroY, { toValue: 0, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true })]),
      Animated.parallel([Animated.timing(btnsOp, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }), Animated.timing(btnsY, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true })]),
    ]).start();
  }, []);
  const proofOp = scrollY.interpolate({ inputRange: [2600, 2900], outputRange: [0, 1], extrapolate: 'clamp' });
  const proofY  = scrollY.interpolate({ inputRange: [2600, 2900], outputRange: [40, 0], extrapolate: 'clamp' });
  const ctaOp   = scrollY.interpolate({ inputRange: [3100, 3400], outputRange: [0, 1], extrapolate: 'clamp' });
  const ctaY    = scrollY.interpolate({ inputRange: [3100, 3400], outputRange: [40, 0], extrapolate: 'clamp' });
  return (
    <View style={s.root}>
      <View style={s.nav}>
        <Text style={s.logo}>Modus.</Text>
        {IS_WEB && <View style={s.navCenter}>{['For Brands','For Creators','Pricing','Resources'].map(l => <Pressable key={l} style={s.navLink}><Text style={s.navLinkText}>{l}</Text></Pressable>)}</View>}
        <View style={s.navRight}>
          <Pressable onPress={() => nav.navigate('Login')} style={s.navLogin}><Text style={s.navLoginText}>Log in</Text></Pressable>
          <Pressable onPress={() => nav.navigate('Welcome')} style={s.navCta}><Text style={s.navCtaText}>Get Started</Text></Pressable>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })} scrollEventThrottle={16}>
        <View style={s.hero}>
          <Animated.View style={{ opacity: heroOp, transform: [{ translateY: heroY }], alignItems: 'center' }}>
            <View style={s.heroBadge}><Text style={s.heroBadgeText}>✦ Invite-only marketplace</Text></View>
            <Text style={s.heroHead}>Where elite brands{'\n'}meet verified creators.</Text>
            <Text style={s.heroSub}>No inflated metrics. No middlemen.{'\n'}Secure escrow. Real results.</Text>
          </Animated.View>
          <Animated.View style={[s.heroBtns, { opacity: btnsOp, transform: [{ translateY: btnsY }] }]}>
            <Pressable style={({ pressed }) => [s.btnPrimary, pressed && { opacity: 0.8 }]} onPress={() => nav.navigate('SignUp', { role: 'brand' })}>
              <Text style={s.btnPrimaryText}>I am a Brand</Text><ArrowRight size={16} color="#000" />
            </Pressable>
            <Pressable style={({ pressed }) => [s.btnSecondary, pressed && { opacity: 0.8 }]} onPress={() => nav.navigate('SignUp', { role: 'influencer' })}>
              <Text style={s.btnSecondaryText}>I am a Creator</Text>
            </Pressable>
          </Animated.View>
        </View>
        <Marquee />
        <VaultSection scrollY={scrollY} />
        <PhoneSection scrollY={scrollY} />
        <WordReveal scrollY={scrollY} />
        <Animated.View style={{ opacity: proofOp, transform: [{ translateY: proofY }] }}>
          <View style={s.proofSection}>
            <Text style={s.proofLabel}>What they say</Text>
            <Text style={s.proofHead}>Built for both{'\n'}sides of the table.</Text>
            <View style={s.testimonialGrid}>
              <TestimonialCard quote="Audited audience data changed how we recruit. No more wasted budget." author="Riya S." role="Head of Influencer, Glow Recipe" initials="R" />
              <TestimonialCard quote="Escrow payments mean I never chase invoices. I focus on my content." author="Alex M." role="Tech & Lifestyle Creator (180k+)" initials="A" />
            </View>
          </View>
        </Animated.View>
        <Animated.View style={{ opacity: ctaOp, transform: [{ translateY: ctaY }] }}>
          <View style={s.ctaSection}>
            <View style={s.ctaCard}>
              <Text style={s.ctaHead}>Ready to grow?</Text>
              <Text style={s.ctaSub}>Join elite brands and verified creators building the future of commerce.</Text>
              <Pressable style={({ pressed }) => [s.ctaBtn, pressed && { opacity: 0.85 }]} onPress={() => nav.navigate('Welcome')}>
                <Text style={s.ctaBtnText}>Start for free</Text><ArrowRight size={18} color="#09090B" />
              </Pressable>
            </View>
          </View>
        </Animated.View>
        <View style={s.footer}>
          <Text style={s.footerLogo}>Modus.</Text>
          <View style={s.footerLinks}>{['Privacy','Terms','Contact','Twitter / X','Instagram'].map(l => <Text key={l} style={s.footerLink}>{l}</Text>)}</View>
          <Text style={s.copyright}>© 2026 Modus, Inc. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080808' },
  content: { paddingTop: IS_WEB ? 80 : 0, paddingBottom: 60 },
  nav: { ...(IS_WEB ? { position: 'fixed', top: 20, left: '50%', transform: [{ translateX: '-50%' }], width: '92%', maxWidth: 1100, zIndex: 100, backdropFilter: 'blur(24px)' } : {}), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: IS_WEB ? 28 : 20, paddingVertical: 14, backgroundColor: 'rgba(12,12,12,0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: IS_WEB ? 100 : 0 },
  logo: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  navCenter: { flexDirection: 'row', gap: 28 },
  navLink: { paddingVertical: 8 },
  navLinkText: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.55)' },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navLogin: { paddingVertical: 9, paddingHorizontal: 14 },
  navLoginText: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.55)' },
  navCta: { backgroundColor: '#FFFFFF', paddingVertical: 9, paddingHorizontal: 20, borderRadius: 100 },
  navCtaText: { fontSize: 14, fontWeight: '700', color: '#09090B' },
  hero: { minHeight: Math.min(H * 0.88, 820), alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: IS_WEB ? 60 : 80, paddingBottom: 60 },
  heroBadge: { borderWidth: 1, borderColor: 'rgba(16,185,129,0.35)', borderRadius: 100, paddingHorizontal: 16, paddingVertical: 7, marginBottom: 32, backgroundColor: 'rgba(16,185,129,0.06)' },
  heroBadgeText: { fontSize: 12, fontWeight: '600', color: '#10B981', letterSpacing: 0.5 },
  heroHead: { fontSize: IS_WEB ? 72 : 44, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', letterSpacing: -2.5, lineHeight: IS_WEB ? 80 : 52, marginBottom: 24 },
  heroSub: { fontSize: IS_WEB ? 20 : 17, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 30, maxWidth: 500, marginBottom: 48 },
  heroBtns: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 100 },
  btnPrimaryText: { fontSize: 15, fontWeight: '700', color: '#09090B' },
  btnSecondary: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.04)', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 100 },
  btnSecondaryText: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  marqueeWrap: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)', paddingVertical: 18, overflow: 'hidden' },
  marqueeRow: { flexDirection: 'row', alignItems: 'center' },
  marqueeItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 28 },
  marqueeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#10B981', marginRight: 20, opacity: 0.6 },
  marqueeText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: 2 },
  vaultSection: { paddingVertical: 100, paddingHorizontal: IS_WEB ? 80 : 24, alignItems: 'center', minHeight: 900 },
  vaultLabel: { fontSize: 11, fontWeight: '700', color: '#10B981', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 },
  vaultTitle: { fontSize: IS_WEB ? 52 : 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: -2, marginBottom: 60, textAlign: 'center' },
  vaultStage: { width: IS_WEB ? 600 : 340, height: IS_WEB ? 440 : 280, position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 60 },
  vaultInterior: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(16,185,129,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)', gap: 10, padding: 24 },
  vaultInteriorLine: { height: 2, width: '80%', backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 1 },
  vaultInteriorText: { fontSize: 18, fontWeight: '700', color: '#10B981' },
  vaultDoorImg: { width: IS_WEB ? 580 : 320, height: IS_WEB ? 420 : 260, position: 'absolute', zIndex: 2 },
  vaultFeature: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.03)', width: '100%', maxWidth: 560 },
  vaultFeatureText: { fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: '500', flex: 1 },
  phoneSection: { paddingVertical: 100, paddingHorizontal: IS_WEB ? 80 : 24, alignItems: 'center', minHeight: 900, backgroundColor: '#0C0C0C' },
  phoneSectionLabel: { fontSize: 11, fontWeight: '700', color: '#10B981', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' },
  phoneSectionTitle: { fontSize: IS_WEB ? 52 : 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: -2, textAlign: 'center', lineHeight: IS_WEB ? 60 : 44, marginBottom: 20 },
  phoneSectionSub: { fontSize: 17, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 28, maxWidth: 540, marginBottom: 60 },
  phoneImg: { width: IS_WEB ? 420 : 280, height: IS_WEB ? 600 : 400 },
  wordRevealSection: { paddingVertical: 140, paddingHorizontal: IS_WEB ? 80 : 28, alignItems: 'center', minHeight: 500 },
  wordRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 },
  wordRevealWord: { fontSize: IS_WEB ? 56 : 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1.5, lineHeight: IS_WEB ? 70 : 48 },
  proofSection: { backgroundColor: '#0C0C0C', paddingHorizontal: IS_WEB ? 80 : 24, paddingVertical: 100, alignItems: 'center' },
  proofLabel: { fontSize: 11, fontWeight: '700', color: '#10B981', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 },
  proofHead: { fontSize: IS_WEB ? 48 : 34, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', letterSpacing: -2, lineHeight: IS_WEB ? 56 : 42, maxWidth: 600, marginBottom: 60 },
  testimonialGrid: { flexDirection: IS_WEB && W > 768 ? 'row' : 'column', width: '100%', maxWidth: 1100, gap: 20 },
  testimonialCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  quoteText: { fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 28, fontWeight: '400', marginBottom: 28, fontStyle: 'italic' },
  quoteAuthorWrap: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981' },
  avatarInitials: { color: '#000', fontWeight: '800', fontSize: 15 },
  authorName: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  authorRole: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: '400', marginTop: 2 },
  stars: { flexDirection: 'row', gap: 2 },
  ctaSection: { paddingHorizontal: IS_WEB ? 80 : 24, paddingVertical: 100, alignItems: 'center' },
  ctaCard: { width: '100%', maxWidth: 1100, borderRadius: 28, paddingVertical: 100, paddingHorizontal: 40, alignItems: 'center', backgroundColor: '#111111', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  ctaHead: { fontSize: IS_WEB ? 64 : 40, fontWeight: '900', color: '#FFFFFF', letterSpacing: -2.5, marginBottom: 20, textAlign: 'center' },
  ctaSub: { fontSize: 18, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: 48, fontWeight: '400', maxWidth: 480, lineHeight: 30 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 100 },
  ctaBtnText: { fontSize: 16, fontWeight: '800', color: '#09090B' },
  footer: { paddingHorizontal: IS_WEB ? 80 : 24, paddingVertical: 60, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  footerLogo: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginBottom: 24 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginBottom: 24 },
  footerLink: { fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: '500' },
  copyright: { fontSize: 13, color: 'rgba(255,255,255,0.2)', fontWeight: '400' },
});

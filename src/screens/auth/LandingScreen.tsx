import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing, Dimensions, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowRight, ShieldCheck, Lock, Sparkles, Star, Zap } from "lucide-react-native";

const { width: W, height: H } = Dimensions.get("window");
const IS_WEB = Platform.OS === "web";

// Scroll-animated section wrapper
const FadeInSection = ({ children, scrollY, triggerAt = 200, style = {} }) => {
  const op = scrollY.interpolate({ inputRange: [triggerAt, triggerAt + 200], outputRange: [0, 1], extrapolate: "clamp" });
  const ty = scrollY.interpolate({ inputRange: [triggerAt, triggerAt + 200], outputRange: [48, 0], extrapolate: "clamp" });
  return <Animated.View style={[{ opacity: op, transform: [{ translateY: ty }] }, style]}>{children}</Animated.View>;
};

const MARQUEE_ITEMS = ["VERIFIED CREATORS","ESCROWED PAYMENTS","AI-AUDITED METRICS","INSTAGRAM API","ZERO AGENCIES","REAL-TIME DATA"];
const Marquee = () => {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.timing(x, { toValue: -W, duration: 28000, easing: Easing.linear, useNativeDriver: true })).start(); }, []);
  return (
    <View style={s.marqueeWrap}>
      <Animated.View style={[s.marqueeRow, { transform: [{ translateX: x }] }]}>
        {[...MARQUEE_ITEMS,...MARQUEE_ITEMS,...MARQUEE_ITEMS].map((t, i) => (
          <View key={i} style={s.marqueeItem}><View style={s.marqueeDot} /><Text style={s.marqueeText}>{t}</Text></View>
        ))}
      </Animated.View>
    </View>
  );
};

const FeatureCard = ({ icon: Icon, stat, title, desc, color }) => (
  <View style={s.featureCard}>
    <View style={[s.featureIconWrap, { backgroundColor: color + "18" }]}><Icon size={20} color={color} /></View>
    <Text style={s.featureStat}>{stat}</Text>
    <Text style={s.featureTitle}>{title}</Text>
    <Text style={s.featureDesc}>{desc}</Text>
  </View>
);

const TestimonialCard = ({ quote, author, role, initials, color }) => (
  <View style={s.testimonialCard}>
    <View style={s.starsRow}>{[1,2,3,4,5].map(i => <Star key={i} size={12} color="#F59E0B" fill="#F59E0B" />)}</View>
    <Text style={s.quoteText}>"{quote}"</Text>
    <View style={s.quoteAuthorWrap}>
      <View style={[s.avatar, { backgroundColor: color }]}><Text style={s.avatarInitials}>{initials}</Text></View>
      <View><Text style={s.authorName}>{author}</Text><Text style={s.authorRole}>{role}</Text></View>
    </View>
  </View>
);

export const LandingScreen = () => {
  const nav = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroOp = useRef(new Animated.Value(0)).current;
  const heroY  = useRef(new Animated.Value(36)).current;
  const btnsOp = useRef(new Animated.Value(0)).current;
  const btnsY  = useRef(new Animated.Value(24)).current;
  const badgeOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(badgeOp, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(heroOp, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(heroY,  { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnsOp, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(btnsY,  { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={s.root}>
      {/* Background orbs */}
      <View style={s.orb1} /><View style={s.orb2} /><View style={s.orb3} /><View style={s.orb4} />

      {/* Navbar */}
      <View style={s.nav}>
        <Text style={s.logo}>Modus.</Text>
        {IS_WEB && <View style={s.navCenter}>{["For Brands","For Creators","Pricing","Resources"].map(l => <Pressable key={l} style={s.navLink}><Text style={s.navLinkText}>{l}</Text></Pressable>)}</View>}
        <View style={s.navRight}>
          <Pressable onPress={() => nav.navigate("Login")} style={s.navLogin}><Text style={s.navLoginText}>Log in</Text></Pressable>
          <Pressable onPress={() => nav.navigate("Welcome")} style={s.navCta}><Text style={s.navCtaText}>Get Started</Text></Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })} scrollEventThrottle={16}>

        {/* Hero */}
        <View style={s.hero}>
          <Animated.View style={{ opacity: badgeOp, marginBottom: 28 }}>
            <View style={s.heroBadge}><Sparkles size={12} color="#6366F1" /><Text style={s.heroBadgeText}>Invite-only marketplace</Text></View>
          </Animated.View>
          <Animated.View style={{ opacity: heroOp, transform: [{ translateY: heroY }], alignItems: "center" }}>
            <Text style={s.heroHead}>Where elite brands{'\n'}meet verified creators.</Text>
            <Text style={s.heroSub}>No inflated metrics. No middlemen. Modus connects real, audited talent with brands that mean business.</Text>
          </Animated.View>
          <Animated.View style={[s.heroBtns, { opacity: btnsOp, transform: [{ translateY: btnsY }] }]}>
            <Pressable style={({ pressed }) => [s.btnPrimary, pressed && { opacity: 0.85 }]} onPress={() => nav.navigate("SignUp", { role: "brand" })}>
              <Text style={s.btnPrimaryText}>I am a Brand</Text><ArrowRight size={15} color="#FFF" />
            </Pressable>
            <Pressable style={({ pressed }) => [s.btnSecondary, pressed && { opacity: 0.85 }]} onPress={() => nav.navigate("SignUp", { role: "influencer" })}>
              <Text style={s.btnSecondaryText}>I am a Creator</Text>
            </Pressable>
          </Animated.View>
          <Animated.View style={{ opacity: btnsOp, marginTop: 48 }}>
            <View style={s.socialProofRow}>
              {["R","A","K","M"].map((i,idx) => <View key={idx} style={[s.proofAvatar, { marginLeft: idx > 0 ? -10 : 0 }]}><Text style={s.proofAvatarText}>{i}</Text></View>)}
              <Text style={s.socialProofText}>2,400+ creators & brands joined</Text>
            </View>
          </Animated.View>
        </View>

        {/* Marquee */}
        <FadeInSection scrollY={scrollY} triggerAt={80}><Marquee /></FadeInSection>

        {/* Stats strip */}
        <FadeInSection scrollY={scrollY} triggerAt={200}>
          <View style={s.statsStrip}>
            {[["99.2%","Follower authenticity"],["zsh","Payment delays"],["10s","To match creators"],["2,400+","Active members"]].map(([val,label],i) => (
              <View key={i} style={s.statItem}>
                <Text style={s.statVal}>{val}</Text>
                <Text style={s.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </FadeInSection>

        {/* Features heading */}
        <FadeInSection scrollY={scrollY} triggerAt={420}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>THE MODUS STANDARD</Text>
            <Text style={s.sectionHead}>Marketplace integrity,{'\n'}engineered.</Text>
            <Text style={s.sectionSub}>Every metric verified. Every payment protected. Every collaboration built on trust.</Text>
          </View>
        </FadeInSection>

        {/* Feature cards */}
        <View style={s.featureGrid}>
          <FadeInSection scrollY={scrollY} triggerAt={600} style={{ flex: 1, minWidth: IS_WEB && W > 768 ? 280 : undefined }}>
            <FeatureCard icon={ShieldCheck} stat="99.2%" title="Audited authenticity" desc="Every follower count verified live via Instagram Graph API. Zero tolerance for fake metrics." color="#6366F1" />
          </FadeInSection>
          <FadeInSection scrollY={scrollY} triggerAt={700} style={{ flex: 1, minWidth: IS_WEB && W > 768 ? 280 : undefined }}>
            <FeatureCard icon={Lock} stat="0 delays" title="Escrow payments" desc="Funds locked upfront, released instantly on verified delivery. No chasing invoices." color="#10B981" />
          </FadeInSection>
          <FadeInSection scrollY={scrollY} triggerAt={800} style={{ flex: 1, minWidth: IS_WEB && W > 768 ? 280 : undefined }}>
            <FeatureCard icon={Zap} stat="10s" title="Instant matching" desc="Publish a brief and get matched with verified creators in seconds, not days." color="#F59E0B" />
          </FadeInSection>
        </View>

        {/* Testimonials */}
        <FadeInSection scrollY={scrollY} triggerAt={1200}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>WHAT THEY SAY</Text>
            <Text style={s.sectionHead}>Built for both{'\n'}sides of the table.</Text>
          </View>
        </FadeInSection>
        <View style={s.testimonialGrid}>
          <FadeInSection scrollY={scrollY} triggerAt={1400} style={{ flex: 1 }}>
            <TestimonialCard quote="Audited audience data changed how we recruit talent. No more wasted budget on fake influencers." author="Riya S." role="Head of Influencer, Glow Recipe" initials="R" color="#6366F1" />
          </FadeInSection>
          <FadeInSection scrollY={scrollY} triggerAt={1500} style={{ flex: 1 }}>
            <TestimonialCard quote="Escrow payments mean I never worry about getting paid. I focus entirely on creating great content." author="Alex M." role="Tech & Lifestyle Creator, 180k+" initials="A" color="#10B981" />
          </FadeInSection>
        </View>

        {/* CTA */}
        <FadeInSection scrollY={scrollY} triggerAt={1800}>
          <View style={s.ctaSection}>
            <View style={s.ctaCard}>
              <View style={s.ctaOrb1} /><View style={s.ctaOrb2} />
              <Text style={s.ctaHead}>Ready to build{'\n'}something real?</Text>
              <Text style={s.ctaSub}>Join elite brands and verified creators already on Modus.</Text>
              <Pressable style={({ pressed }) => [s.ctaBtn, pressed && { opacity: 0.85 }]} onPress={() => nav.navigate("Welcome")}>
                <Text style={s.ctaBtnText}>Start for free</Text><ArrowRight size={17} color="#FFF" />
              </Pressable>
            </View>
          </View>
        </FadeInSection>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerLogo}>Modus.</Text>
          <View style={s.footerLinks}>{["Privacy","Terms","Contact","Twitter / X","Instagram"].map(l => <Text key={l} style={s.footerLink}>{l}</Text>)}</View>
          <Text style={s.copyright}>© 2026 Modus, Inc. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFAFA", overflow: "hidden" },
  content: { paddingTop: IS_WEB ? 90 : 0, paddingBottom: 60 },

  orb1: { position: "absolute", width: 600, height: 600, borderRadius: 300, backgroundColor: "rgba(99,102,241,0.12)", top: -200, left: -200, ...(IS_WEB ? { filter: "blur(80px)" } : {}) },
  orb2: { position: "absolute", width: 500, height: 500, borderRadius: 250, backgroundColor: "rgba(16,185,129,0.10)", top: 100, right: -180, ...(IS_WEB ? { filter: "blur(80px)" } : {}) },
  orb3: { position: "absolute", width: 400, height: 400, borderRadius: 200, backgroundColor: "rgba(245,158,11,0.08)", top: 600, left: "30%", ...(IS_WEB ? { filter: "blur(70px)" } : {}) },
  orb4: { position: "absolute", width: 350, height: 350, borderRadius: 175, backgroundColor: "rgba(236,72,153,0.07)", top: 1400, right: -100, ...(IS_WEB ? { filter: "blur(60px)" } : {}) },

  nav: { ...(IS_WEB ? { position: "fixed", top: 16, left: "50%", transform: [{ translateX: "-50%" }], width: "90%", maxWidth: 1100, zIndex: 100, backdropFilter: "blur(20px) saturate(180%)" } : {}), flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: IS_WEB ? 28 : 20, paddingVertical: 14, backgroundColor: "rgba(255,255,255,0.72)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", borderRadius: IS_WEB ? 100 : 0, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 },
  logo: { fontSize: 20, fontWeight: "900", color: "#09090B", letterSpacing: -0.5 },
  navCenter: { flexDirection: "row", gap: 28 },
  navLink: { paddingVertical: 8 },
  navLinkText: { fontSize: 14, fontWeight: "500", color: "#52525B" },
  navRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  navLogin: { paddingVertical: 9, paddingHorizontal: 14 },
  navLoginText: { fontSize: 14, fontWeight: "500", color: "#52525B" },
  navCta: { backgroundColor: "#09090B", paddingVertical: 9, paddingHorizontal: 20, borderRadius: 100 },
  navCtaText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },

  hero: { minHeight: Math.min(H * 0.85, 800), alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingTop: IS_WEB ? 60 : 80, paddingBottom: 60 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "rgba(99,102,241,0.25)", borderRadius: 100, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "rgba(99,102,241,0.06)" },
  heroBadgeText: { fontSize: 12, fontWeight: "600", color: "#6366F1" },
  heroHead: { fontSize: IS_WEB ? 72 : 42, fontWeight: "900", color: "#09090B", textAlign: "center", letterSpacing: IS_WEB ? -3 : -1.5, lineHeight: IS_WEB ? 82 : 50, marginBottom: 22 },
  heroSub: { fontSize: IS_WEB ? 19 : 16, color: "#71717A", textAlign: "center", lineHeight: 30, maxWidth: 560, marginBottom: 44 },
  heroBtns: { flexDirection: "row", gap: 12, flexWrap: "wrap", justifyContent: "center" },
  btnPrimary: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#09090B", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 100 },
  btnPrimaryText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  btnSecondary: { borderWidth: 1.5, borderColor: "#E4E4E7", backgroundColor: "#FFFFFF", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 100, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
  btnSecondaryText: { fontSize: 15, fontWeight: "600", color: "#09090B" },
  socialProofRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  proofAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#E4E4E7", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FAFAFA" },
  proofAvatarText: { fontSize: 11, fontWeight: "700", color: "#09090B" },
  socialProofText: { fontSize: 13, color: "#71717A", fontWeight: "500" },

  marqueeWrap: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(0,0,0,0.05)", paddingVertical: 16, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.5)" },
  marqueeRow: { flexDirection: "row", alignItems: "center" },
  marqueeItem: { flexDirection: "row", alignItems: "center", marginHorizontal: 24 },
  marqueeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#6366F1", marginRight: 16, opacity: 0.6 },
  marqueeText: { fontSize: 11, fontWeight: "700", color: "#A1A1AA", letterSpacing: 1.8 },

  statsStrip: { flexDirection: IS_WEB && W > 768 ? "row" : "column", justifyContent: "space-around", paddingVertical: 48, paddingHorizontal: IS_WEB ? 80 : 24, backgroundColor: "rgba(255,255,255,0.6)", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(0,0,0,0.05)", gap: 24 },
  statItem: { alignItems: "center" },
  statVal: { fontSize: IS_WEB ? 44 : 36, fontWeight: "900", color: "#09090B", letterSpacing: -1.5, marginBottom: 4 },
  statLabel: { fontSize: 14, color: "#71717A", fontWeight: "500" },

  sectionHeader: { paddingHorizontal: IS_WEB ? 80 : 24, paddingTop: 100, paddingBottom: 56, alignItems: "center" },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: "#6366F1", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 14 },
  sectionHead: { fontSize: IS_WEB ? 48 : 34, fontWeight: "900", color: "#09090B", textAlign: "center", letterSpacing: -1.5, lineHeight: IS_WEB ? 56 : 42, marginBottom: 16 },
  sectionSub: { fontSize: 17, color: "#71717A", textAlign: "center", lineHeight: 28, maxWidth: 540 },

  featureGrid: { flexDirection: IS_WEB && W > 768 ? "row" : "column", paddingHorizontal: IS_WEB ? 80 : 24, gap: 20, paddingBottom: 80 },
  featureCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 20, padding: 32, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 24 },
  featureIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  featureStat: { fontSize: 36, fontWeight: "900", color: "#09090B", letterSpacing: -1, marginBottom: 6 },
  featureTitle: { fontSize: 17, fontWeight: "700", color: "#09090B", marginBottom: 10 },
  featureDesc: { fontSize: 14, color: "#71717A", lineHeight: 22 },

  testimonialGrid: { flexDirection: IS_WEB && W > 768 ? "row" : "column", paddingHorizontal: IS_WEB ? 80 : 24, gap: 20, paddingBottom: 100 },
  testimonialCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 20, padding: 32, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 24 },
  starsRow: { flexDirection: "row", gap: 3, marginBottom: 18 },
  quoteText: { fontSize: 16, color: "#3F3F46", lineHeight: 26, fontWeight: "400", marginBottom: 24, fontStyle: "italic" },
  quoteAuthorWrap: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarInitials: { color: "#FFF", fontWeight: "800", fontSize: 14 },
  authorName: { fontSize: 14, fontWeight: "700", color: "#09090B" },
  authorRole: { fontSize: 12, color: "#71717A", fontWeight: "400", marginTop: 2 },

  ctaSection: { paddingHorizontal: IS_WEB ? 80 : 24, paddingVertical: 40 },
  ctaCard: { borderRadius: 28, paddingVertical: 90, paddingHorizontal: 40, alignItems: "center", backgroundColor: "#09090B", overflow: "hidden", position: "relative" },
  ctaOrb1: { position: "absolute", width: 400, height: 400, borderRadius: 200, backgroundColor: "rgba(99,102,241,0.25)", top: -150, left: -100, ...(IS_WEB ? { filter: "blur(60px)" } : {}) },
  ctaOrb2: { position: "absolute", width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(16,185,129,0.2)", bottom: -100, right: -80, ...(IS_WEB ? { filter: "blur(50px)" } : {}) },
  ctaHead: { fontSize: IS_WEB ? 56 : 38, fontWeight: "900", color: "#FFFFFF", letterSpacing: -2, marginBottom: 18, textAlign: "center", zIndex: 1 },
  ctaSub: { fontSize: 18, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 44, maxWidth: 400, lineHeight: 28, zIndex: 1 },
  ctaBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#6366F1", paddingVertical: 16, paddingHorizontal: 36, borderRadius: 100, zIndex: 1 },
  ctaBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },

  footer: { paddingHorizontal: IS_WEB ? 80 : 24, paddingVertical: 60, borderTopWidth: 1, borderColor: "rgba(0,0,0,0.05)" },
  footerLogo: { fontSize: 20, fontWeight: "900", color: "#09090B", marginBottom: 24 },
  footerLinks: { flexDirection: "row", flexWrap: "wrap", gap: 24, marginBottom: 24 },
  footerLink: { fontSize: 14, color: "#A1A1AA", fontWeight: "500" },
  copyright: { fontSize: 13, color: "#D4D4D8" },
});

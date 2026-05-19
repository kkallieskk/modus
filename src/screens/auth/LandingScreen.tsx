import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight, ShieldCheck, Lock, Sparkles, Star, Zap } from 'lucide-react-native';

const { width: W, height: H } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';

const FadeIn = ({ children, scrollY, at = 200, style = {} }: any) => {
  const op = scrollY.interpolate({ inputRange: [at, at+200], outputRange: [0,1], extrapolate:'clamp' });
  const ty = scrollY.interpolate({ inputRange: [at, at+200], outputRange: [48,0], extrapolate:'clamp' });
  return <Animated.View style={[{opacity:op,transform:[{translateY:ty}]},style]}>{children}</Animated.View>;
};

const FloatingOrb = ({ style: orbStyle, color, size, delay = 0 }: any) => {
  const y = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(y, { toValue: -24, duration: 3200+delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sc, { toValue: 1.08, duration: 3200+delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(y, { toValue: 0, duration: 3200+delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sc, { toValue: 1, duration: 3200+delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ])).start();
  }, []);
  return <Animated.View style={[s.orb, orbStyle, { width:size, height:size, borderRadius:size/2, backgroundColor:color, transform:[{translateY:y},{scale:sc}] }]} />;
};

const SpotlightBeam = () => {
  const op = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(op, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(op, { toValue: 0.4, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={[s.spotlight, { opacity: op }]} />;
};

const MARQUEE_ITEMS = ['VERIFIED CREATORS','ESCROWED PAYMENTS','AI-AUDITED METRICS','INSTAGRAM API','ZERO AGENCIES','REAL-TIME DATA'];
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

export const LandingScreen = () => {
  const nav = useNavigation<any>();
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroOp  = useRef(new Animated.Value(0)).current;
  const heroY   = useRef(new Animated.Value(40)).current;
  const btnsOp  = useRef(new Animated.Value(0)).current;
  const btnsY   = useRef(new Animated.Value(30)).current;
  const badgeOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(badgeOp, { toValue:1, duration:700, easing:Easing.out(Easing.cubic), useNativeDriver:true }),
      Animated.parallel([
        Animated.timing(heroOp, { toValue:1, duration:900, easing:Easing.out(Easing.cubic), useNativeDriver:true }),
        Animated.timing(heroY,  { toValue:0, duration:900, easing:Easing.out(Easing.cubic), useNativeDriver:true }),
      ]),
      Animated.parallel([
        Animated.timing(btnsOp, { toValue:1, duration:700, easing:Easing.out(Easing.cubic), useNativeDriver:true }),
        Animated.timing(btnsY,  { toValue:0, duration:700, easing:Easing.out(Easing.cubic), useNativeDriver:true }),
      ]),
    ]).start();
  }, []);

  const FEATURES = [
    { icon: ShieldCheck, stat: '99.2%', title: 'Audited authenticity', desc: 'Every follower verified via Instagram Graph API. Zero tolerance for fake metrics.', color: '#6366F1' },
    { icon: Lock, stat: '0 delays', title: 'Escrow payments', desc: 'Funds locked upfront, released on verified delivery. No chasing invoices.', color: '#10B981' },
    { icon: Zap, stat: '10s', title: 'Instant matching', desc: 'Publish a brief and get matched with creators in seconds, not days.', color: '#F59E0B' },
  ];

  const TESTIMONIALS = [
    { q: 'Audited audience data changed how we recruit talent. No more wasted budget on fake influencers.', a: 'Riya S.', r: 'Head of Influencer, Glow Recipe', i: 'R', c: '#6366F1' },
    { q: 'Escrow payments mean I never worry about getting paid. I focus entirely on creating great content.', a: 'Alex M.', r: 'Tech & Lifestyle Creator, 180k+', i: 'A', c: '#10B981' },
  ];

  return (
    <View style={s.root}>
      <FloatingOrb orbStyle={{ top:-120, left:-150 }} color="rgba(99,102,241,0.18)" size={500} delay={0} />
      <FloatingOrb orbStyle={{ top:80, right:-160 }} color="rgba(16,185,129,0.14)" size={420} delay={700} />
      <FloatingOrb orbStyle={{ top:520, left:'30%' }} color="rgba(245,158,11,0.10)" size={360} delay={400} />
      <FloatingOrb orbStyle={{ top:1100, right:-80 }} color="rgba(236,72,153,0.09)" size={320} delay={1000} />
      <FloatingOrb orbStyle={{ top:1600, left:-100 }} color="rgba(99,102,241,0.09)" size={280} delay={300} />

      <View style={s.nav}>
        <Text style={s.logo}>Modus.</Text>
        {IS_WEB && <View style={s.navCenter}>{['For Brands','For Creators','Pricing','Resources'].map(l => <Pressable key={l} style={s.navLink}><Text style={s.navLinkText}>{l}</Text></Pressable>)}</View>}
        <View style={s.navRight}>
          <Pressable onPress={() => nav.navigate('Login')} style={s.navLogin}><Text style={s.navLoginText}>Log in</Text></Pressable>
          <Pressable onPress={() => nav.navigate('Welcome')} style={s.navCta}><Text style={s.navCtaText}>Get Started</Text></Pressable>
        </View>
      </View>

      <ScrollView style={{flex:1}} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{nativeEvent:{contentOffset:{y:scrollY}}}],{useNativeDriver:false})} scrollEventThrottle={16}>

        <View style={s.hero}>
          <Animated.View style={{ opacity:badgeOp, marginBottom:28 }}>
            <View style={s.heroBadge}><Sparkles size={12} color="#6366F1" /><Text style={s.heroBadgeText}>Invite-only marketplace</Text></View>
          </Animated.View>
          <Animated.View style={{ opacity:heroOp, transform:[{translateY:heroY}], alignItems:'center' }}>
            <Text style={s.heroHead}>{"Where elite brands\nmeet verified creators."}</Text>
            <Text style={s.heroSub}>No inflated metrics. No middlemen. Modus connects real, audited talent with brands that mean business.</Text>
          </Animated.View>
          <View style={s.spotlightWrap}>
            <SpotlightBeam />
            <Animated.View style={[s.heroBtns, { opacity:btnsOp, transform:[{translateY:btnsY}] }]}>
              <Pressable style={({pressed}: any) => [s.btnPrimary, pressed && {opacity:0.85}]} onPress={() => nav.navigate('SignUp',{role:'brand'})}>
                <Text style={s.btnPrimaryText}>I am a Brand</Text><ArrowRight size={15} color="#FFF" />
              </Pressable>
              <Pressable style={({pressed}: any) => [s.btnSecondary, pressed && {opacity:0.85}]} onPress={() => nav.navigate('SignUp',{role:'influencer'})}>
                <Text style={s.btnSecondaryText}>I am a Creator</Text>
              </Pressable>
            </Animated.View>
          </View>
          <Animated.View style={{ opacity:btnsOp, marginTop:48 }}>
            <View style={s.socialProofRow}>
              {['R','A','K','M'].map((init,idx) => <View key={idx} style={[s.proofAvatar,{marginLeft:idx>0?-10:0}]}><Text style={s.proofAvatarText}>{init}</Text></View>)}
              <Text style={s.socialProofText}>2,400+ creators & brands joined</Text>
            </View>
          </Animated.View>
        </View>

        <FadeIn scrollY={scrollY} at={60}><Marquee /></FadeIn>

        <FadeIn scrollY={scrollY} at={200}>
          <View style={s.statsStrip}>
            {[['99.2%','Follower authenticity'],['$0','Payment delays'],['10s','To match creators'],['2,400+','Active members']].map(([v,l],i) => (
              <View key={i} style={s.statItem}><Text style={s.statVal}>{v}</Text><Text style={s.statLabel}>{l}</Text></View>
            ))}
          </View>
        </FadeIn>

        <FadeIn scrollY={scrollY} at={420}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>THE MODUS STANDARD</Text>
            <Text style={s.sectionHead}>{"Marketplace integrity,\nengineered."}</Text>
            <Text style={s.sectionSub}>Every metric verified. Every payment protected. Every collaboration built on trust.</Text>
          </View>
        </FadeIn>

        <View style={s.featureGrid}>
          {FEATURES.map(({ icon: Icon, stat, title, desc, color }, i) => (
            <FadeIn key={i} scrollY={scrollY} at={600+i*100} style={{flex:1,minWidth:IS_WEB&&W>768?280:undefined}}>
              <View style={[s.featureCard, { borderTopColor:color, borderTopWidth:2 }]}>
                <View style={[s.featureIconWrap, { backgroundColor:color+'22' }]}><Icon size={20} color={color} /></View>
                <Text style={s.featureStat}>{stat}</Text>
                <Text style={s.featureTitle}>{title}</Text>
                <Text style={s.featureDesc}>{desc}</Text>
              </View>
            </FadeIn>
          ))}
        </View>

        <FadeIn scrollY={scrollY} at={1100}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>WHAT THEY SAY</Text>
            <Text style={s.sectionHead}>{"Built for both\nsides of the table."}</Text>
          </View>
        </FadeIn>

        <View style={s.testimonialGrid}>
          {TESTIMONIALS.map(({ q, a, r, i, c }, idx) => (
            <FadeIn key={idx} scrollY={scrollY} at={1300+idx*100} style={{flex:1}}>
              <View style={s.testimonialCard}>
                <View style={s.starsRow}>{[1,2,3,4,5].map(x=><Star key={x} size={12} color="#F59E0B" fill="#F59E0B" />)}</View>
                <Text style={s.quoteText}>"{q}"</Text>
                <View style={s.quoteAuthorWrap}>
                  <View style={[s.avatar,{backgroundColor:c}]}><Text style={s.avatarInitials}>{i}</Text></View>
                  <View><Text style={s.authorName}>{a}</Text><Text style={s.authorRole}>{r}</Text></View>
                </View>
              </View>
            </FadeIn>
          ))}
        </View>

        <FadeIn scrollY={scrollY} at={1700}>
          <View style={s.ctaSection}>
            <View style={s.ctaCard}>
              <FloatingOrb orbStyle={{position:'absolute',top:-100,left:-80}} color="rgba(99,102,241,0.35)" size={300} delay={200} />
              <FloatingOrb orbStyle={{position:'absolute',bottom:-60,right:-60}} color="rgba(16,185,129,0.28)" size={240} delay={900} />
              <Text style={s.ctaHead}>{"Ready to build\nsomething real?"}</Text>
              <Text style={s.ctaSub}>Join elite brands and verified creators already on Modus.</Text>
              <Pressable style={({pressed}: any) => [s.ctaBtn, pressed && {opacity:0.85}]} onPress={() => nav.navigate('Welcome')}>
                <Text style={s.ctaBtnText}>Start for free</Text><ArrowRight size={17} color="#FFF" />
              </Pressable>
            </View>
          </View>
        </FadeIn>

        <View style={s.footer}>
          <Text style={s.footerLogo}>Modus.</Text>
          <View style={s.footerLinks}>{['Privacy','Terms','Contact','Twitter / X','Instagram'].map(l=><Text key={l} style={s.footerLink}>{l}</Text>)}</View>
          <Text style={s.copyright}>© 2026 Modus, Inc. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex:1, backgroundColor:'#F8F8FC', overflow:'hidden' },
  content: { paddingTop:IS_WEB?90:0, paddingBottom:60 },
  orb: { position:'absolute', ...(IS_WEB?{filter:'blur(90px)'}:{}) },
  spotlight: { position:'absolute', width:IS_WEB?680:W*1.2, height:300, borderRadius:150, backgroundColor:'rgba(99,102,241,0.08)', top:-60, alignSelf:'center', ...(IS_WEB?{filter:'blur(50px)'}:{}) },
  spotlightWrap: { position:'relative', alignItems:'center', width:'100%', marginTop:8 },
  nav: { ...(IS_WEB?{position:'fixed',top:16,left:'50%',transform:[{translateX:'-50%'}],width:'90%',maxWidth:1100,zIndex:100,backdropFilter:'blur(20px) saturate(180%)'}:{}), flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:IS_WEB?28:20, paddingVertical:14, backgroundColor:'rgba(255,255,255,0.78)', borderWidth:1, borderColor:'rgba(0,0,0,0.06)', borderRadius:IS_WEB?100:0, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.04, shadowRadius:12 },
  logo: { fontSize:20, fontWeight:'900', color:'#09090B', letterSpacing:-0.5 },
  navCenter: { flexDirection:'row', gap:28 },
  navLink: { paddingVertical:8 },
  navLinkText: { fontSize:14, fontWeight:'500', color:'#52525B' },
  navRight: { flexDirection:'row', alignItems:'center', gap:10 },
  navLogin: { paddingVertical:9, paddingHorizontal:14 },
  navLoginText: { fontSize:14, fontWeight:'500', color:'#52525B' },
  navCta: { backgroundColor:'#09090B', paddingVertical:9, paddingHorizontal:20, borderRadius:100 },
  navCtaText: { fontSize:14, fontWeight:'700', color:'#FFFFFF' },
  hero: { minHeight:Math.min(H*0.88,820), alignItems:'center', justifyContent:'center', paddingHorizontal:24, paddingTop:IS_WEB?60:80, paddingBottom:60 },
  heroBadge: { flexDirection:'row', alignItems:'center', gap:6, borderWidth:1, borderColor:'rgba(99,102,241,0.3)', borderRadius:100, paddingHorizontal:14, paddingVertical:7, backgroundColor:'rgba(99,102,241,0.07)' },
  heroBadgeText: { fontSize:12, fontWeight:'600', color:'#6366F1' },
  heroHead: { fontSize:IS_WEB?72:42, fontWeight:'900', color:'#09090B', textAlign:'center', letterSpacing:IS_WEB?-3:-1.5, lineHeight:IS_WEB?82:50, marginBottom:22 },
  heroSub: { fontSize:IS_WEB?19:16, color:'#71717A', textAlign:'center', lineHeight:30, maxWidth:560, marginBottom:44 },
  heroBtns: { flexDirection:'row', gap:12, flexWrap:'wrap', justifyContent:'center', paddingVertical:28, zIndex:2 },
  btnPrimary: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#09090B', paddingVertical:14, paddingHorizontal:28, borderRadius:100, shadowColor:'#6366F1', shadowOffset:{width:0,height:10}, shadowOpacity:0.35, shadowRadius:24 },
  btnPrimaryText: { fontSize:15, fontWeight:'700', color:'#FFF' },
  btnSecondary: { borderWidth:1.5, borderColor:'#E4E4E7', backgroundColor:'#FFFFFF', paddingVertical:14, paddingHorizontal:28, borderRadius:100, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.05, shadowRadius:12 },
  btnSecondaryText: { fontSize:15, fontWeight:'600', color:'#09090B' },
  socialProofRow: { flexDirection:'row', alignItems:'center', gap:10 },
  proofAvatar: { width:30, height:30, borderRadius:15, backgroundColor:'#E4E4E7', alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:'#F8F8FC' },
  proofAvatarText: { fontSize:11, fontWeight:'700', color:'#09090B' },
  socialProofText: { fontSize:13, color:'#71717A', fontWeight:'500' },
  marqueeWrap: { borderTopWidth:1, borderBottomWidth:1, borderColor:'rgba(0,0,0,0.05)', paddingVertical:16, overflow:'hidden', backgroundColor:'rgba(255,255,255,0.55)' },
  marqueeRow: { flexDirection:'row', alignItems:'center' },
  marqueeItem: { flexDirection:'row', alignItems:'center', marginHorizontal:24 },
  marqueeDot: { width:4, height:4, borderRadius:2, backgroundColor:'#6366F1', marginRight:16, opacity:0.6 },
  marqueeText: { fontSize:11, fontWeight:'700', color:'#A1A1AA', letterSpacing:1.8 },
  statsStrip: { flexDirection:IS_WEB&&W>768?'row':'column', justifyContent:'space-around', paddingVertical:48, paddingHorizontal:IS_WEB?80:24, backgroundColor:'rgba(255,255,255,0.65)', borderTopWidth:1, borderBottomWidth:1, borderColor:'rgba(0,0,0,0.05)', gap:24 },
  statItem: { alignItems:'center' },
  statVal: { fontSize:IS_WEB?44:36, fontWeight:'900', color:'#09090B', letterSpacing:-1.5, marginBottom:4 },
  statLabel: { fontSize:14, color:'#71717A', fontWeight:'500' },
  sectionHeader: { paddingHorizontal:IS_WEB?80:24, paddingTop:100, paddingBottom:56, alignItems:'center' },
  sectionLabel: { fontSize:11, fontWeight:'800', color:'#6366F1', letterSpacing:2.5, textTransform:'uppercase', marginBottom:14 },
  sectionHead: { fontSize:IS_WEB?48:34, fontWeight:'900', color:'#09090B', textAlign:'center', letterSpacing:-1.5, lineHeight:IS_WEB?56:42, marginBottom:16 },
  sectionSub: { fontSize:17, color:'#71717A', textAlign:'center', lineHeight:28, maxWidth:540 },
  featureGrid: { flexDirection:IS_WEB&&W>768?'row':'column', paddingHorizontal:IS_WEB?80:24, gap:20, paddingBottom:80 },
  featureCard: { flex:1, backgroundColor:'rgba(255,255,255,0.92)', borderRadius:20, padding:32, borderWidth:1, borderColor:'rgba(0,0,0,0.06)', shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.05, shadowRadius:24 },
  featureIconWrap: { width:44, height:44, borderRadius:12, alignItems:'center', justifyContent:'center', marginBottom:20 },
  featureStat: { fontSize:36, fontWeight:'900', color:'#09090B', letterSpacing:-1, marginBottom:6 },
  featureTitle: { fontSize:17, fontWeight:'700', color:'#09090B', marginBottom:10 },
  featureDesc: { fontSize:14, color:'#71717A', lineHeight:22 },
  testimonialGrid: { flexDirection:IS_WEB&&W>768?'row':'column', paddingHorizontal:IS_WEB?80:24, gap:20, paddingBottom:100 },
  testimonialCard: { flex:1, backgroundColor:'rgba(255,255,255,0.92)', borderRadius:20, padding:32, borderWidth:1, borderColor:'rgba(0,0,0,0.06)', shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.05, shadowRadius:24 },
  starsRow: { flexDirection:'row', gap:3, marginBottom:18 },
  quoteText: { fontSize:16, color:'#3F3F46', lineHeight:26, fontWeight:'400', marginBottom:24, fontStyle:'italic' },
  quoteAuthorWrap: { flexDirection:'row', alignItems:'center', gap:12 },
  avatar: { width:38, height:38, borderRadius:19, alignItems:'center', justifyContent:'center' },
  avatarInitials: { color:'#FFF', fontWeight:'800', fontSize:14 },
  authorName: { fontSize:14, fontWeight:'700', color:'#09090B' },
  authorRole: { fontSize:12, color:'#71717A', fontWeight:'400', marginTop:2 },
  ctaSection: { paddingHorizontal:IS_WEB?80:24, paddingVertical:40 },
  ctaCard: { borderRadius:28, paddingVertical:90, paddingHorizontal:40, alignItems:'center', backgroundColor:'#09090B', overflow:'hidden', position:'relative' },
  ctaHead: { fontSize:IS_WEB?56:38, fontWeight:'900', color:'#FFFFFF', letterSpacing:-2, marginBottom:18, textAlign:'center', zIndex:1 },
  ctaSub: { fontSize:18, color:'rgba(255,255,255,0.5)', textAlign:'center', marginBottom:44, maxWidth:400, lineHeight:28, zIndex:1 },
  ctaBtn: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#6366F1', paddingVertical:16, paddingHorizontal:36, borderRadius:100, zIndex:1, shadowColor:'#6366F1', shadowOffset:{width:0,height:10}, shadowOpacity:0.55, shadowRadius:28 },
  ctaBtnText: { fontSize:16, fontWeight:'700', color:'#FFFFFF' },
  footer: { paddingHorizontal:IS_WEB?80:24, paddingVertical:60, borderTopWidth:1, borderColor:'rgba(0,0,0,0.05)' },
  footerLogo: { fontSize:20, fontWeight:'900', color:'#09090B', marginBottom:24 },
  footerLinks: { flexDirection:'row', flexWrap:'wrap', gap:24, marginBottom:24 },
  footerLink: { fontSize:14, color:'#A1A1AA', fontWeight:'500' },
  copyright: { fontSize:13, color:'#D4D4D8' },
});

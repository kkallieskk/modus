import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Animated, Easing, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/socialAuth';
import { Mail, Lock, User, Briefcase, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Star } from 'lucide-react-native';

const IS_WEB = Platform.OS === 'web';

// ── Floating orb ─────────────────────────────────────────────────────────────
const Orb = ({ style: os, color, size, delay = 0 }: any) => {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(y, { toValue: -18, duration: 3400 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0,   duration: 3400 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color, transform: [{ translateY: y }], ...(IS_WEB ? { filter: 'blur(80px)' } : {}) }, os]} />;
};

// ── Brand left panel mockup ───────────────────────────────────────────────────
const BrandMockup = () => (
  <View style={m.card}>
    <View style={m.cardHead}>
      <Text style={m.cardTitle}>Creator Pitch Inbox</Text>
      <View style={[m.badge, { backgroundColor: '#EDE9FE' }]}><Text style={[m.badgeText, { color: '#7C3AED' }]}>3 New</Text></View>
    </View>
    {[{ name: 'Sarah Jenkins', niche: 'Lifestyle · 148.2K', color: '#7C3AED' }, { name: 'David Chen', niche: 'Tech · 82.5K', color: '#8B5CF6' }].map((c, i) => (
      <View key={i} style={m.row}>
        <View style={[m.avatar, { backgroundColor: c.color }]}><Text style={m.avatarT}>{c.name[0]}</Text></View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={m.name}>{c.name}</Text>
            <CheckCircle2 size={11} color="#7C3AED" fill="#7C3AED" />
          </View>
          <Text style={m.sub}>{c.niche}</Text>
        </View>
        <View style={[m.btn, { backgroundColor: '#7C3AED' }]}><Text style={m.btnT}>Hire</Text></View>
      </View>
    ))}
    <View style={m.metrics}>
      {[['₹12.4L', 'Escrowed'], ['98%', 'On-Time'], ['6', 'Active']].map(([v, l], i) => (
        <View key={i} style={{ alignItems: 'center' }}>
          <Text style={m.metVal}>{v}</Text>
          <Text style={m.metLbl}>{l}</Text>
        </View>
      ))}
    </View>
  </View>
);

// ── Creator left panel mockup ─────────────────────────────────────────────────
const CreatorMockup = () => (
  <View style={m.card}>
    <View style={m.cardHead}>
      <Text style={m.cardTitle}>My Active Deals</Text>
      <View style={[m.badge, { backgroundColor: '#D1FAE5' }]}><Text style={[m.badgeText, { color: '#065F46' }]}>₹5K Secured</Text></View>
    </View>
    {[{ brand: 'Glow Recipe', camp: 'Watermelon Launch', status: 'In Progress', bg: '#FEF3C7', tc: '#92400E' }, { brand: 'Rhode Skin', camp: 'Summer Glaze', status: 'Approved', bg: '#D1FAE5', tc: '#065F46' }].map((d, i) => (
      <View key={i} style={m.row}>
        <View style={[m.avatar, { backgroundColor: '#10B981' }]}><Text style={m.avatarT}>{d.brand[0]}</Text></View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={m.name}>{d.brand}</Text>
          <Text style={m.sub}>{d.camp}</Text>
        </View>
        <View style={[m.badge, { backgroundColor: d.bg }]}><Text style={[m.badgeText, { color: d.tc }]}>{d.status}</Text></View>
      </View>
    ))}
    <View style={[m.row, { backgroundColor: '#D1FAE5', borderRadius: 10, paddingHorizontal: 10, marginTop: 8, borderTopWidth: 0 }]}>
      <ShieldCheck size={13} color="#065F46" />
      <Text style={{ fontSize: 11, color: '#065F46', fontWeight: '700', marginLeft: 6 }}>Funds secured in Modus Escrow Vault</Text>
    </View>
  </View>
);

// ── Floating stats chip ───────────────────────────────────────────────────────
const Chip = ({ icon: Icon, text, color, style: cs }: any) => (
  <View style={[m.chip, cs, { borderColor: color + '30' }]}>
    <Icon size={12} color={color} />
    <Text style={[m.chipText, { color }]}>{text}</Text>
  </View>
);

// ── Main SignUp ───────────────────────────────────────────────────────────────
export const SignUpScreen = ({ route, navigation }: any) => {
  const initialRole = route.params?.role || 'influencer';
  const { width } = useWindowDimensions();
  const isLarge = width >= 1024;

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState<'brand' | 'influencer'>(initialRole);
  const [loading, setLoading]     = useState(false);
  const [gLoading, setGLoading]   = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [focused, setFocused]     = useState<'email' | 'password' | null>(null);

  const floatY = useRef(new Animated.Value(0)).current;
  const roleAnim = useRef(new Animated.Value(role === 'brand' ? 1 : 0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(floatY, { toValue: -14, duration: 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(floatY, { toValue: 0,   duration: 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);

  const switchRole = (r: 'brand' | 'influencer') => {
    setRole(r);
    Animated.timing(roleAnim, { toValue: r === 'brand' ? 1 : 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  };

  const accentColor  = role === 'brand' ? '#7C3AED' : '#059669';
  const accentLight  = role === 'brand' ? 'rgba(124,58,237,0.08)' : 'rgba(5,150,105,0.08)';
  const accentBorder = role === 'brand' ? 'rgba(124,58,237,0.25)' : 'rgba(5,150,105,0.25)';
  const orb1Color    = role === 'brand' ? 'rgba(124,58,237,0.14)' : 'rgba(5,150,105,0.14)';
  const orb2Color    = role === 'brand' ? 'rgba(167,139,250,0.12)' : 'rgba(52,211,153,0.12)';

  const handleSignUp = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    try {
      setLoading(true); setError(null);
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { role } } });
      if (error) throw error;
    } catch (err: any) { setError(err.message || 'An error occurred');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    try { setGLoading(true); setError(null); await signInWithGoogle(role);
    } catch (err: any) { if (!err.message?.includes('cancelled')) setError(err.message || 'Google sign-in failed');
    } finally { setGLoading(false); }
  };

  const focusBorder = focused ? accentColor : '#E5E7EB';
  const focusBg     = focused ? '#FFFFFF'   : '#F9FAFB';
  const focusBox    = focused && IS_WEB ? { boxShadow: `0 0 0 4px ${accentColor}22` } : {};

  return (
    <View style={st.root}>
      {/* Global background orbs */}
      <Orb os={{ top: -100, left: -120 }} color={orb1Color} size={460} delay={0} />
      <Orb os={{ bottom: -80, right: -100 }} color={orb2Color} size={380} delay={600} />
      <Orb os={{ top: '40%', left: '35%' }} color="rgba(251,191,36,0.06)" size={300} delay={1200} />

      {/* Left pane — only on large screens */}
      {isLarge && (
        <View style={st.left}>
          <Text style={st.logo}>Modus.</Text>
          <View style={st.leftContent}>
            <View style={[st.roleTag, { backgroundColor: accentLight, borderColor: accentBorder }]}>
              {role === 'brand' ? <Briefcase size={12} color={accentColor} /> : <Sparkles size={12} color={accentColor} />}
              <Text style={[st.roleTagText, { color: accentColor }]}>{role === 'brand' ? 'For Brands' : 'For Creators'}</Text>
            </View>
            <Text style={st.leftTitle}>{role === 'brand' ? 'Scale campaigns with\nverified elite talent.' : 'Monetize your audience\nwith full escrow safety.'}</Text>
            <Text style={st.leftSub}>{role === 'brand' ? 'Access audited metrics from social APIs. Pay only when deliverables match your brief.' : 'Never chase an invoice again. Funds secured in escrow before you start creating.'}</Text>

            {/* Floating chips */}
            <View style={st.chipsRow}>
              <Chip icon={ShieldCheck} text="Escrow Protected" color={accentColor} style={{}} />
              <Chip icon={TrendingUp} text="Verified Metrics" color={accentColor} style={{ marginLeft: 8 }} />
            </View>

            {/* Floating mockup */}
            <Animated.View style={[st.mockupWrap, { transform: [{ translateY: floatY }] }]}>
              <View style={st.mockupGlass}>
                {role === 'brand' ? <BrandMockup /> : <CreatorMockup />}
              </View>
            </Animated.View>

            {/* Floating rating */}
            <View style={st.ratingRow}>
              {[1,2,3,4,5].map(i => <Star key={i} size={13} color="#F59E0B" fill="#F59E0B" />)}
              <Text style={st.ratingText}>Trusted by 2,400+ members</Text>
            </View>
          </View>
        </View>
      )}

      {/* Right pane — form */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={st.right}>
        <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
            <ArrowLeft size={18} color="#374151" />
          </TouchableOpacity>

          <View style={st.formCard}>
            <Text style={st.formTitle}>Create Account</Text>
            <Text style={st.formSub}>{role === 'brand' ? 'Join as a partner brand.' : 'Join as a verified creator.'}</Text>

            {/* Role toggle */}
            <View style={st.roleToggle}>
              {(['influencer', 'brand'] as const).map(r => {
                const active = role === r;
                const rc = r === 'brand' ? '#7C3AED' : '#059669';
                return (
                  <TouchableOpacity key={r} onPress={() => switchRole(r)}
                    style={[st.roleBtn, active && { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity:0.08, shadowRadius:8 }]}>
                    {r === 'influencer' ? <User size={13} color={active ? rc : '#9CA3AF'} /> : <Briefcase size={13} color={active ? rc : '#9CA3AF'} />}
                    <Text style={[st.roleBtnText, active && { color: rc, fontWeight: '800' }]}>{r === 'influencer' ? 'Creator' : 'Brand'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Google */}
            <TouchableOpacity onPress={handleGoogle} disabled={gLoading} style={st.googleBtn}>
              {gLoading ? <ActivityIndicator color="#000" /> : (
                <><Text style={st.googleIcon}>G</Text><Text style={st.googleText}>Continue with Google</Text></>
              )}
            </TouchableOpacity>

            <View style={st.divider}>
              <View style={st.divLine} /><Text style={st.divText}>OR</Text><View style={st.divLine} />
            </View>

            {/* Email */}
            <Text style={st.label}>EMAIL ADDRESS</Text>
            <View style={[st.inputWrap, { borderColor: focusBorder, backgroundColor: focusBg }, focusBox as any]}>
              <Mail size={16} color={focused === 'email' ? accentColor : '#9CA3AF'} />
              <TextInput style={st.input} placeholder="you@example.com" value={email} onChangeText={setEmail}
                autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#9CA3AF"
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
            </View>

            {/* Password */}
            <Text style={[st.label, { marginTop: 16 }]}>PASSWORD</Text>
            <View style={[st.inputWrap, { borderColor: focused === 'password' ? accentColor : '#E5E7EB', backgroundColor: focused === 'password' ? '#FFF' : '#F9FAFB' }, focused === 'password' && IS_WEB ? { boxShadow: `0 0 0 4px ${accentColor}22` } as any : {}]}>
              <Lock size={16} color={focused === 'password' ? accentColor : '#9CA3AF'} />
              <TextInput style={st.input} placeholder="••••••••" value={password} onChangeText={setPassword}
                secureTextEntry placeholderTextColor="#9CA3AF"
                onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} />
            </View>

            {error && <View style={st.errorBox}><Text style={st.errorText}>{error}</Text></View>}

            <TouchableOpacity onPress={handleSignUp} disabled={loading}
              style={[st.submitBtn, { backgroundColor: accentColor, shadowColor: accentColor }]}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={st.submitText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={st.loginText}>Already have an account? <Text style={[st.loginHighlight, { color: accentColor }]}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ── Mockup styles ─────────────────────────────────────────────────────────────
const m = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: {width:0,height:4}, shadowOpacity:0.04, shadowRadius:12 },
  cardHead: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  cardTitle: { fontSize:13, fontWeight:'800', color:'#111827' },
  badge: { borderRadius:100, paddingVertical:3, paddingHorizontal:8 },
  badgeText: { fontSize:10, fontWeight:'800' },
  row: { flexDirection:'row', alignItems:'center', paddingVertical:9, borderTopWidth:1, borderTopColor:'#F3F4F6' },
  avatar: { width:32, height:32, borderRadius:10, alignItems:'center', justifyContent:'center' },
  avatarT: { color:'#FFF', fontWeight:'800', fontSize:13 },
  name: { fontSize:12, fontWeight:'700', color:'#111827' },
  sub: { fontSize:10, color:'#9CA3AF', fontWeight:'500', marginTop:1 },
  btn: { borderRadius:8, paddingVertical:5, paddingHorizontal:10 },
  btnT: { fontSize:10, fontWeight:'700', color:'#FFF' },
  metrics: { flexDirection:'row', justifyContent:'space-around', marginTop:12, paddingTop:12, borderTopWidth:1, borderTopColor:'#F3F4F6' },
  metVal: { fontSize:14, fontWeight:'900', color:'#111827', textAlign:'center' },
  metLbl: { fontSize:9, color:'#9CA3AF', fontWeight:'600', marginTop:1, textAlign:'center' },
  chip: { flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:12, paddingVertical:6, borderRadius:100, borderWidth:1, backgroundColor:'rgba(255,255,255,0.8)', ...(IS_WEB?{backdropFilter:'blur(8px)'}:{}) },
  chipText: { fontSize:11, fontWeight:'700' },
});

// ── Screen styles ─────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex:1, flexDirection:'row', backgroundColor:'#F8F8FC', overflow:'hidden' },
  left: { flex:1, padding:48, justifyContent:'space-between', borderRightWidth:1, borderColor:'rgba(0,0,0,0.05)', overflow:'hidden' },
  logo: { fontSize:20, fontWeight:'900', color:'#09090B', letterSpacing:-0.5 },
  leftContent: { flex:1, justifyContent:'center', paddingTop:16 },
  roleTag: { flexDirection:'row', alignItems:'center', gap:6, alignSelf:'flex-start', paddingHorizontal:12, paddingVertical:6, borderRadius:100, borderWidth:1, marginBottom:20 },
  roleTagText: { fontSize:12, fontWeight:'700' },
  leftTitle: { fontSize:32, fontWeight:'900', color:'#09090B', letterSpacing:-1, lineHeight:40, marginBottom:14 },
  leftSub: { fontSize:15, color:'#52525B', lineHeight:24, fontWeight:'400', marginBottom:24 },
  chipsRow: { flexDirection:'row', marginBottom:28 },
  mockupWrap: { width:'100%', maxWidth:380 },
  mockupGlass: { backgroundColor:'rgba(255,255,255,0.55)', borderRadius:22, padding:10, borderWidth:1, borderColor:'rgba(0,0,0,0.06)', shadowColor:'#000', shadowOffset:{width:0,height:12}, shadowOpacity:0.06, shadowRadius:28, ...(IS_WEB?{backdropFilter:'blur(12px)'}:{}) },
  ratingRow: { flexDirection:'row', alignItems:'center', gap:5, marginTop:20 },
  ratingText: { fontSize:12, color:'#71717A', fontWeight:'500' },
  right: { flex:1.2, backgroundColor:'transparent' },
  scrollContent: { flexGrow:1, padding:48, justifyContent:'center' },
  backBtn: { width:36, height:36, borderRadius:18, backgroundColor:'rgba(0,0,0,0.05)', alignItems:'center', justifyContent:'center', marginBottom:32 },
  formCard: { backgroundColor:'rgba(255,255,255,0.85)', borderRadius:24, padding:36, borderWidth:1, borderColor:'rgba(0,0,0,0.06)', shadowColor:'#000', shadowOffset:{width:0,height:16}, shadowOpacity:0.06, shadowRadius:40, maxWidth:460, width:'100%', alignSelf:'center', ...(IS_WEB?{backdropFilter:'blur(20px)'}:{}) },
  formTitle: { fontSize:28, fontWeight:'900', color:'#09090B', letterSpacing:-0.75, marginBottom:6 },
  formSub: { fontSize:15, color:'#71717A', fontWeight:'400', marginBottom:24 },
  roleToggle: { flexDirection:'row', backgroundColor:'#F3F4F6', borderRadius:14, padding:3, marginBottom:24 },
  roleBtn: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, paddingVertical:10, borderRadius:11 },
  roleBtnText: { fontSize:13, fontWeight:'600', color:'#9CA3AF' },
  googleBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', height:50, borderRadius:14, borderWidth:1, borderColor:'#E5E7EB', backgroundColor:'#FFFFFF', marginBottom:16 },
  googleIcon: { fontSize:17, fontWeight:'800', marginRight:8, color:'#000' },
  googleText: { fontSize:14, fontWeight:'600', color:'#374151' },
  divider: { flexDirection:'row', alignItems:'center', marginVertical:16 },
  divLine: { flex:1, height:1, backgroundColor:'#F3F4F6' },
  divText: { marginHorizontal:12, fontSize:10, color:'#9CA3AF', fontWeight:'700', letterSpacing:1 },
  label: { fontSize:10, fontWeight:'800', color:'#52525B', letterSpacing:1.2, textTransform:'uppercase', marginBottom:7 },
  inputWrap: { flexDirection:'row', alignItems:'center', borderWidth:1.5, borderRadius:14, paddingHorizontal:14, height:50, ...(IS_WEB?{transition:'all 0.2s ease'}:{}) },
  input: { flex:1, marginLeft:10, fontSize:15, color:'#09090B', ...(IS_WEB?{outlineStyle:'none'}:{}) },
  errorBox: { backgroundColor:'#FEF2F2', padding:12, borderRadius:10, borderWidth:1, borderColor:'#FEE2E2', marginTop:16 },
  errorText: { color:'#DC2626', fontSize:13, fontWeight:'500' },
  submitBtn: { height:52, borderRadius:14, alignItems:'center', justifyContent:'center', marginTop:22, shadowOffset:{width:0,height:8}, shadowOpacity:0.35, shadowRadius:20 },
  submitText: { color:'#FFF', fontSize:15, fontWeight:'800' },
  loginText: { color:'#71717A', fontSize:14, fontWeight:'400' },
  loginHighlight: { fontWeight:'700' },
});

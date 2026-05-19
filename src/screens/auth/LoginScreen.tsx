import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Animated, Easing, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/socialAuth';
import { Mail, Lock, User, Briefcase, ArrowLeft } from 'lucide-react-native';

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
  return <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color, transform: [{ translateY: y }], ...(IS_WEB ? { filter: 'blur(90px)' } : {}) }, os]} />;
};

export const LoginScreen = ({ route, navigation }: any) => {
  const initialRole = route.params?.role || 'influencer';

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState<'brand' | 'influencer'>(initialRole);
  const [loading, setLoading]     = useState(false);
  const [gLoading, setGLoading]   = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [focused, setFocused]     = useState<'email' | 'password' | null>(null);

  const accentColor  = role === 'brand' ? '#7C3AED' : '#059669';
  const orb1Color    = role === 'brand' ? 'rgba(124,58,237,0.18)' : 'rgba(5,150,105,0.18)';
  const orb2Color    = role === 'brand' ? 'rgba(167,139,250,0.14)' : 'rgba(52,211,153,0.14)';

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    try {
      setLoading(true); setError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
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

  return (
    <View style={st.root}>
      {/* Global background orbs */}
      <Orb os={{ top: '10%', left: '15%' }} color={orb1Color} size={460} delay={0} />
      <Orb os={{ bottom: '10%', right: '15%' }} color={orb2Color} size={380} delay={600} />

      {/* Top Left Logo */}
      <View style={st.navBar}>
        <Text style={st.logo}>Modus.</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={st.container}>
        <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={st.formCard}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
              <ArrowLeft size={18} color="#374151" />
            </TouchableOpacity>

            <Text style={st.formTitle}>Welcome Back</Text>
            <Text style={st.formSub}>{role === 'brand' ? 'Sign in as partner brand.' : 'Sign in as verified creator.'}</Text>

            {/* Role toggle */}
            <View style={st.roleToggle}>
              {(['influencer', 'brand'] as const).map(r => {
                const active = role === r;
                const rc = r === 'brand' ? '#7C3AED' : '#059669';
                return (
                  <TouchableOpacity key={r} onPress={() => setRole(r)}
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
            <View style={[st.inputWrap, { borderColor: focusBorder, backgroundColor: focusBg }]}>
              <Mail size={16} color={focused === 'email' ? accentColor : '#9CA3AF'} />
              <TextInput style={st.input} placeholder="you@example.com" value={email} onChangeText={setEmail}
                autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#9CA3AF"
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
            </View>

            {/* Password */}
            <Text style={[st.label, { marginTop: 16 }]}>PASSWORD</Text>
            <View style={[st.inputWrap, { borderColor: focused === 'password' ? accentColor : '#E5E7EB', backgroundColor: focused === 'password' ? '#FFF' : '#F9FAFB' }]}>
              <Lock size={16} color={focused === 'password' ? accentColor : '#9CA3AF'} />
              <TextInput style={st.input} placeholder="••••••••" value={password} onChangeText={setPassword}
                secureTextEntry placeholderTextColor="#9CA3AF"
                onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} />
            </View>

            {error && <View style={st.errorBox}><Text style={st.errorText}>{error}</Text></View>}

            <TouchableOpacity onPress={handleLogin} disabled={loading}
              style={[st.submitBtn, { backgroundColor: accentColor, shadowColor: accentColor }]}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={st.submitText}>Sign In</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('SignUp', { role })} style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={st.loginText}>Don't have an account? <Text style={[st.loginHighlight, { color: accentColor }]}>Apply to join Modus</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA', overflow: 'hidden' },
  navBar: { position: 'absolute', top: 32, left: 32, zIndex: 10 },
  logo: { fontSize: 24, fontWeight: '900', color: '#09090B', letterSpacing: -0.5 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  formCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 24, padding: 40, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', shadowColor: '#000', shadowOffset: {width:0,height:16}, shadowOpacity: 0.05, shadowRadius: 40, maxWidth: 440, width: '100%', ...(IS_WEB ? { backdropFilter: 'blur(24px)' } : {}) },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  formTitle: { fontSize: 28, fontWeight: '900', color: '#09090B', letterSpacing: -0.75, marginBottom: 6 },
  formSub: { fontSize: 15, color: '#71717A', fontWeight: '400', marginBottom: 24 },
  roleToggle: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 14, padding: 3, marginBottom: 24 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 11 },
  roleBtnText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', marginBottom: 16 },
  googleIcon: { fontSize: 17, fontWeight: '800', marginRight: 8, color: '#000' },
  googleText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: '#F3F4F6' },
  divText: { marginHorizontal: 12, fontSize: 10, color: '#9CA3AF', fontWeight: '700', letterSpacing: 1 },
  label: { fontSize: 10, fontWeight: '800', color: '#52525B', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 7 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, height: 50, ...(IS_WEB ? { transition: 'all 0.2s ease' } : {}) },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#09090B', ...(IS_WEB ? { outlineStyle: 'none' } : {}) },
  errorBox: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FEE2E2', marginTop: 16 },
  errorText: { color: '#DC2626', fontSize: 13, fontWeight: '500' },
  submitBtn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 22, shadowOffset: {width:0,height:8}, shadowOpacity: 0.3, shadowRadius: 20 },
  submitText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  loginText: { color: '#71717A', fontSize: 14, fontWeight: '400' },
  loginHighlight: { fontWeight: '700' },
});

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Animated, Easing, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Briefcase, User, ChevronRight, TrendingUp, Camera } from 'lucide-react-native';

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

// ─── Role Card Component ────────────────────────────────────────────────────
const RoleCard = ({ 
  title, description, Icon, BackgroundIcon, isActive, onHoverIn, onPress 
}: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const isFocused = isHovered || isActive;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: isFocused ? 1.02 : 1, friction: 5, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: isFocused ? -3 : 0, friction: 5, useNativeDriver: true }),
    ]).start();
  }, [isFocused]);

  const isBrand = title.includes('Brand');
  const accentColor = isBrand ? '#7C3AED' : '#059669';
  const iconBg = isBrand ? 'rgba(124,58,237,0.1)' : 'rgba(5,150,105,0.1)';
  const bgIconColor = isBrand ? 'rgba(124,58,237,0.03)' : 'rgba(5,150,105,0.03)';

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => { setIsHovered(true); onHoverIn(); }}
      onHoverOut={() => setIsHovered(false)}
      onPressIn={() => { setIsHovered(true); onHoverIn(); }}
      onPressOut={() => setIsHovered(false)}
    >
      <Animated.View style={[
        st.roleCardWrap,
        { transform: [{ scale }, { translateY }], shadowColor: isFocused ? accentColor : '#000', shadowOpacity: isFocused ? 0.08 : 0.03, elevation: isFocused ? 12 : 2 }
      ]}>
        <View style={[st.roleCard, isFocused && { borderColor: accentColor }]}>
          <View style={st.cardBgIcon}><BackgroundIcon size={120} color={bgIconColor} strokeWidth={1} /></View>
          <View style={[st.iconBox, { backgroundColor: iconBg }]}><Icon size={28} color={accentColor} /></View>
          <View style={st.cardContent}>
            <Text style={st.cardTitle}>{title}</Text>
            <Text style={st.cardDesc}>{description}</Text>
          </View>
          <ChevronRight size={20} color={isFocused ? accentColor : "#D1D5DB"} />
        </View>
      </Animated.View>
    </Pressable>
  );
};

export const WelcomeScreen = () => {
  const navigation = useNavigation<any>();
  const [activeRole, setActiveRole] = useState<'brand' | 'influencer'>('brand');

  const accentColor  = activeRole === 'brand' ? '#7C3AED' : '#059669';
  const orb1Color    = activeRole === 'brand' ? 'rgba(124,58,237,0.18)' : 'rgba(5,150,105,0.18)';
  const orb2Color    = activeRole === 'brand' ? 'rgba(167,139,250,0.14)' : 'rgba(52,211,153,0.14)';

  return (
    <View style={st.root}>
      <Orb os={{ top: '10%', left: '15%' }} color={orb1Color} size={460} delay={0} />
      <Orb os={{ bottom: '10%', right: '15%' }} color={orb2Color} size={380} delay={600} />

      <TouchableOpacity style={st.navBar} onPress={() => navigation.navigate('Landing')}>
        <Text style={st.logo}>Modus.</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={st.container}>
        <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={st.formCard}>
            <Text style={st.formTitle}>How are you using Modus?</Text>
            <Text style={st.formSub}>Welcome to the elite creator economy. Choose how you want to grow.</Text>

            <View style={st.cardsContainer}>
              <RoleCard
                title="I am a Brand"
                description="Launch campaigns, hire verified creators, and scale UGC."
                Icon={Briefcase}
                BackgroundIcon={TrendingUp}
                isActive={activeRole === 'brand'}
                onHoverIn={() => setActiveRole('brand')}
                onPress={() => { setActiveRole('brand'); navigation.navigate('SignUp', { role: 'brand' }); }}
              />
              
              <RoleCard
                title="I am a Creator"
                description="Access premium brand deals, bypass the noise, and get paid securely."
                Icon={User}
                BackgroundIcon={Camera}
                isActive={activeRole === 'influencer'}
                onHoverIn={() => setActiveRole('influencer')}
                onPress={() => { setActiveRole('influencer'); navigation.navigate('SignUp', { role: 'influencer' }); }}
              />
            </View>

            <View style={st.bottomSection}>
              <Pressable onPress={() => navigation.navigate('Login')} style={({ pressed }) => [st.loginLink, pressed && { opacity: 0.7 }]}>
                <Text style={st.footerText}>Already have an account? <Text style={[st.loginText, { color: accentColor }]}>Log In</Text></Text>
              </Pressable>
            </View>
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
  formCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 24, padding: 40, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', shadowColor: '#000', shadowOffset: {width:0,height:16}, shadowOpacity: 0.05, shadowRadius: 40, maxWidth: 500, width: '100%', ...(IS_WEB ? { backdropFilter: 'blur(24px)' } : {}) },
  formTitle: { fontSize: 28, fontWeight: '900', color: '#09090B', letterSpacing: -0.75, marginBottom: 6 },
  formSub: { fontSize: 15, color: '#71717A', fontWeight: '400', marginBottom: 32 },
  cardsContainer: { gap: 16, marginBottom: 32 },
  roleCardWrap: { borderRadius: 16, backgroundColor: '#FFFFFF', shadowOffset: { width:0, height:8 }, shadowRadius: 20 },
  roleCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1.5, borderColor: '#F3F4F6', overflow: 'hidden' },
  cardBgIcon: { position: 'absolute', right: -20, bottom: -20, opacity: 0.8 },
  iconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1, marginLeft: 16 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18, fontWeight: '500', paddingRight: 10 },
  bottomSection: { alignItems: 'center', width: '100%' },
  loginLink: { padding: 10 },
  footerText: { fontSize: 14, color: '#71717A', fontWeight: '500' },
  loginText: { fontWeight: '700' },
});

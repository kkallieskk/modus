import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  useWindowDimensions,
  Animated,
  StyleSheet
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/socialAuth';
import { Mail, Lock, User, Briefcase, ArrowLeft, CheckCircle2, ShieldCheck, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Subtle Light-Themed UI Mockup for Brand Role ──────────────────────────────
const BrandMockup = () => (
  <View style={s.mockCard}>
    <View style={s.mockHeader}>
      <Text style={s.mockTitle}>Creator Pitch Inbox</Text>
      <View style={s.mockBadge}>
        <Text style={s.mockBadgeText}>3 New</Text>
      </View>
    </View>
    
    {[
      { name: 'Sarah Jenkins', niche: 'Lifestyle & Wellness', followers: '148.2K', verified: true },
      { name: 'David Chen', niche: 'Productivity & Tech', followers: '82.5K', verified: true },
    ].map((c, i) => (
      <View key={i} style={s.mockRow}>
        <View style={s.mockAvatar}>
          <Text style={s.mockAvatarText}>{c.name[0]}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={s.mockName}>{c.name}</Text>
            {c.verified && <CheckCircle2 size={12} color="#3B82F6" fill="#3B82F6" />}
          </View>
          <Text style={s.mockNiche}>{c.niche} · {c.followers}</Text>
        </View>
        <View style={s.mockActionBtn}>
          <Text style={s.mockActionTxt}>Hire</Text>
        </View>
      </View>
    ))}
    
    <View style={s.mockMetrics}>
      {[
        { val: '₹12.4L', lbl: 'Escrowed' },
        { val: '98%', lbl: 'On-Time' },
        { val: '6', lbl: 'Active' }
      ].map((item, idx) => (
        <View key={idx} style={s.mockMetricItem}>
          <Text style={s.mockMetricVal}>{item.val}</Text>
          <Text style={s.mockMetricLabel}>{item.lbl}</Text>
        </View>
      ))}
    </View>
  </View>
);

// ─── Subtle Light-Themed UI Mockup for Creator Role ────────────────────────────
const CreatorMockup = () => (
  <View style={s.mockCard}>
    <View style={s.mockHeader}>
      <Text style={s.mockTitle}>My Deals</Text>
      <View style={[s.mockBadge, { backgroundColor: '#E8F5E9' }]}>
        <Text style={[s.mockBadgeText, { color: '#2E7D32' }]}>₹5K Secured</Text>
      </View>
    </View>
    
    {[
      { brand: 'Glow Recipe', campaign: 'Watermelon Launch', status: 'In Progress', color: '#FFF8E1', text: '#F57F17' },
      { brand: 'Rhode Skin', campaign: 'Summer Glaze', status: 'Draft Approved', color: '#E8F5E9', text: '#2E7D32' },
    ].map((d, i) => (
      <View key={i} style={s.mockRow}>
        <View style={[s.mockAvatar, { backgroundColor: '#F3F4F6' }]}>
          <Text style={[s.mockAvatarText, { color: '#374151' }]}>{d.brand[0]}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.mockName}>{d.brand}</Text>
          <Text style={s.mockNiche}>{d.campaign}</Text>
        </View>
        <View style={[s.mockStatusBadge, { backgroundColor: d.color }]}>
          <Text style={[s.mockStatusText, { color: d.text }]}>{d.status}</Text>
        </View>
      </View>
    ))}
    
    <View style={s.mockEscrowBanner}>
      <ShieldCheck size={14} color="#2E7D32" />
      <Text style={s.mockEscrowText}>
        Funds secured in Modus Escrow Vault
      </Text>
    </View>
  </View>
);

export const SignUpScreen = ({ route, navigation }: any) => {
  const initialRole = route.params?.role || 'influencer';
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'brand' | 'influencer'>(initialRole);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
          },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      await signInWithGoogle(role);
    } catch (err: any) {
      if (!err.message?.includes('cancelled')) {
        setError(err.message || 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const floatingTransform = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12]
  });

  const glowColor1 = role === 'brand' ? 'rgba(139, 92, 246, 0.09)' : 'rgba(16, 185, 129, 0.09)';
  const glowColor2 = role === 'brand' ? 'rgba(139, 92, 246, 0.06)' : 'rgba(16, 185, 129, 0.08)';

  return (
    <View style={styles.container}>
      {isLargeScreen && (
        <View style={styles.leftPane}>
          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.leftBgGlowWrap}>
            <View style={[styles.leftBgGlow1, { backgroundColor: glowColor1 }]} />
            <View style={[styles.leftBgGlow2, { backgroundColor: glowColor2 }]} />
          </View>
          <View style={styles.leftContent}>
            <View style={styles.brandingHeader}>
              <Text style={styles.brandingLogo}>Modus.</Text>
            </View>
            
            <View style={styles.visualContainer}>
              <Text style={styles.leftTitle}>
                {role === 'brand' ? 'Scale campaigns with verified elite talent.' : 'Monetize your audience with full escrow safety.'}
              </Text>
              <Text style={styles.leftSubtitle}>
                {role === 'brand' 
                  ? 'Access audited metrics directly from social APIs. Pay only when deliverables match your brief.' 
                  : 'Never chase an invoice again. Funds are deposited securely in escrow before you begin creating.'}
              </Text>
              
              <Animated.View style={[styles.mockupWrapper, { transform: [{ translateY: floatingTransform }] }]}>
                <View style={styles.glassContainer}>
                  {role === 'brand' ? <BrandMockup /> : <CreatorMockup />}
                </View>
              </Animated.View>
            </View>
          </View>
        </View>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.rightPane}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                {role === 'brand' ? 'Join as a partner brand.' : 'Join as a verified creator.'}
              </Text>
            </View>

            {/* Role Selector Segmented Control */}
            <View style={styles.roleSelector}>
              <TouchableOpacity 
                onPress={() => setRole('influencer')}
                style={[styles.roleOption, role === 'influencer' && styles.roleOptionActive]}
              >
                <User size={15} color={role === 'influencer' ? '#10B981' : '#6B7280'} style={{ marginRight: 6 }} />
                <Text style={[styles.roleText, role === 'influencer' && { color: '#10B981', fontWeight: '800' }]}>Creator</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setRole('brand')}
                style={[styles.roleOption, role === 'brand' && styles.roleOptionActive]}
              >
                <Briefcase size={15} color={role === 'brand' ? '#8B5CF6' : '#6B7280'} style={{ marginRight: 6 }} />
                <Text style={[styles.roleText, role === 'brand' && { color: '#8B5CF6', fontWeight: '800' }]}>Brand</Text>
              </TouchableOpacity>
            </View>

            {/* Google Sign-In Button */}
            <TouchableOpacity 
              onPress={handleGoogleSignUp}
              disabled={googleLoading}
              style={styles.googleButton}
            >
              {googleLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email / Password Form */}
            <View style={styles.inputGroup}>
              <View>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'email' && [
                    styles.inputContainerFocused,
                    {
                      borderColor: role === 'brand' ? '#8B5CF6' : '#10B981',
                      ...(Platform.OS === 'web' ? {
                        boxShadow: role === 'brand' ? '0 0 0 4px rgba(139, 92, 246, 0.12)' : '0 0 0 4px rgba(16, 185, 129, 0.12)'
                      } : {})
                    }
                  ]
                ]}>
                  <Mail size={18} color={focusedInput === 'email' ? (role === 'brand' ? '#8B5CF6' : '#10B981') : '#9CA3AF'} />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#9CA3AF"
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <View style={{ marginTop: 16 }}>
                <Text style={styles.inputLabel}>Create Password</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'password' && [
                    styles.inputContainerFocused,
                    {
                      borderColor: role === 'brand' ? '#8B5CF6' : '#10B981',
                      ...(Platform.OS === 'web' ? {
                        boxShadow: role === 'brand' ? '0 0 0 4px rgba(139, 92, 246, 0.12)' : '0 0 0 4px rgba(16, 185, 129, 0.12)'
                      } : {})
                    }
                  ]
                ]}>
                  <Lock size={18} color={focusedInput === 'password' ? (role === 'brand' ? '#8B5CF6' : '#10B981') : '#9CA3AF'} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#9CA3AF"
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity 
              onPress={handleSignUp}
              disabled={loading}
              style={[
                styles.submitButton,
                { backgroundColor: role === 'brand' ? '#8B5CF6' : '#10B981' }
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Shared Mockup Components styles ──────────────────────────────────────────
const s = StyleSheet.create({
  mockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  mockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mockTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  mockBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  mockBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
  },
  mockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  mockAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  mockName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  mockNiche: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 1,
  },
  mockActionBtn: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  mockActionTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mockStatusBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  mockStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  mockMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  mockMetricItem: {
    alignItems: 'center',
  },
  mockMetricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  mockMetricLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 1,
  },
  mockEscrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
    gap: 6,
  },
  mockEscrowText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  leftPane: {
    flex: 0.75, // Decreased size from 1 to make the visual container smaller
    overflow: 'hidden',
    borderRightWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  leftBgGlowWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  leftBgGlow1: {
    position: 'absolute',
    top: -150,
    left: -150,
    width: 500,
    height: 500,
    backgroundColor: 'rgba(139, 92, 246, 0.09)', // Purple
    borderRadius: 250,
    filter: 'blur(100px)' as any,
  },
  leftBgGlow2: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 450,
    height: 450,
    backgroundColor: 'rgba(16, 185, 129, 0.08)', // Green
    borderRadius: 225,
    filter: 'blur(90px)' as any,
  },
  leftContent: {
    flex: 1,
    padding: 48,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  brandingHeader: {
    alignSelf: 'flex-start',
  },
  brandingLogo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  visualContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
  },
  leftTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.75,
    lineHeight: 38,
    marginBottom: 12,
  },
  leftSubtitle: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 36,
  },
  mockupWrapper: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Soft glassmorphism background
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(243, 244, 246, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04, // Low, subtle opacity for visual element focus
    shadowRadius: 24,
    elevation: 3,
    opacity: 0.85, // Keeping visual subtle and not main focus
  },
  rightPane: {
    flex: 1.25, // Enlarged right pane modal form to be more prominent
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 48,
    paddingVertical: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 440, // Expanded modal width to be larger and highly readable
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.75,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 3,
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
  },
  roleOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  roleTextActive: {
    color: '#000000',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
    color: '#000000',
  },
  googleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.2s ease-in-out'
    } : {}),
  },
  inputContainerFocused: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
    ...(Platform.OS === 'web' ? {
      outlineStyle: 'none'
    } : {}),
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#000000', // Changed to premium black button to match new homepage design style
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  loginLinkHighlight: {
    color: '#000000',
    fontWeight: '700',
  },
});

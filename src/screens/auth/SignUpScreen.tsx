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
  Image,
  StyleSheet
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/socialAuth';
import { Mail, Lock, User, Briefcase, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
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
      const sessionData = await signInWithGoogle(role);
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
    outputRange: [0, -20]
  });

  return (
    <View style={styles.container}>
      {isLargeScreen && (
        <View style={styles.leftPane}>
          <LinearGradient
            colors={['#0A0A0A', '#1F2937']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.leftContent}>
            <Text style={styles.leftTitle}>
              {role === 'brand' ? 'Scale your campaigns with elite talent.' : 'Monetize your audience securely.'}
            </Text>
            <Text style={styles.leftSubtitle}>
              Join the fastest growing creator economy marketplace.
            </Text>
            
            <Animated.View style={[styles.mockupContainer, { transform: [{ translateY: floatingTransform }] }]}>
              <View style={styles.glassMockup}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070' }}
                  style={styles.mockupImage}
                />
              </View>
            </Animated.View>
          </View>
        </View>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.rightPane}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                {role === 'brand' ? 'Set up your brand profile.' : 'Join as a creator.'}
              </Text>
            </View>

            {/* Role Selector Segmented Control */}
            <View style={styles.roleSelector}>
              <TouchableOpacity 
                onPress={() => setRole('influencer')}
                style={[styles.roleOption, role === 'influencer' && styles.roleOptionActive]}
              >
                <User size={16} color={role === 'influencer' ? '#000' : '#6B7280'} style={{ marginRight: 8 }} />
                <Text style={[styles.roleText, role === 'influencer' && styles.roleTextActive]}>Creator</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setRole('brand')}
                style={[styles.roleOption, role === 'brand' && styles.roleOptionActive]}
              >
                <Briefcase size={16} color={role === 'brand' ? '#000' : '#6B7280'} style={{ marginRight: 8 }} />
                <Text style={[styles.roleText, role === 'brand' && styles.roleTextActive]}>Brand</Text>
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
                <View style={styles.inputContainer}>
                  <Mail size={20} color="#9CA3AF" />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={{ marginTop: 16 }}>
                <Text style={styles.inputLabel}>Create Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#9CA3AF" />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
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
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color="black" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  leftPane: {
    flex: 1,
    overflow: 'hidden',
  },
  leftContent: {
    flex: 1,
    padding: 60,
    justifyContent: 'center',
    zIndex: 10,
  },
  leftTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
    marginBottom: 16,
  },
  leftSubtitle: {
    fontSize: 20,
    color: '#9CA3AF',
    marginBottom: 60,
  },
  mockupContainer: {
    width: '100%',
    aspectRatio: 16/9,
  },
  glassMockup: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    padding: 8,
  },
  mockupImage: {
    flex: 1,
    borderRadius: 16,
    opacity: 0.9,
  },
  rightPane: {
    flex: 1,
    maxWidth: 600,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  backButton: {
    marginBottom: 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#000',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  roleOptionActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  roleTextActive: {
    color: '#000',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 10,
    color: '#000',
  },
  googleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 24,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#A3E635',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#6B7280',
    fontSize: 15,
  },
  loginLinkHighlight: {
    color: '#000',
    fontWeight: '800',
  },
});

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/socialAuth';
import { Mail, Lock } from 'lucide-react-native';

export const SignUpScreen = ({ route, navigation }: any) => {
  const initialRole = route.params?.role || 'influencer';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState<'brand' | 'influencer'>(initialRole);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-20 pb-10">
        <View className="mb-8">
          <Text className="text-4xl font-bold text-black mb-2">Get Started</Text>
          <Text className="text-gray-500 text-lg">
            {role === 'brand' ? 'Set up your brand account.' : 'Join as a creator.'}
          </Text>
        </View>

        {/* Google Sign-In Button */}
        <TouchableOpacity 
          onPress={handleGoogleSignUp}
          disabled={googleLoading}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: 56,
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: '#E5E7EB',
            backgroundColor: '#FFF',
            marginBottom: 16,
          }}
        >
          {googleLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text style={{ fontSize: 20, fontWeight: '700', marginRight: 10 }}>G</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#F3F4F6' }} />
          <Text style={{ marginHorizontal: 14, fontSize: 13, color: '#9CA3AF', fontWeight: '500' }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#F3F4F6' }} />
        </View>

        {/* Email / Password Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Email Address</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
              <Mail size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-black text-base"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Create Password</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
              <Lock size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-black text-base"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {error && (
          <View className="mt-6 bg-red-50 p-4 rounded-xl border border-red-100">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        <TouchableOpacity 
          onPress={handleSignUp}
          disabled={loading}
          className="mt-8 bg-black h-16 rounded-2xl items-center justify-center shadow-lg"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
          className="mt-6 py-2"
        >
          <Text className="text-gray-500 text-center">
            Already have an account? <Text className="text-black font-bold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

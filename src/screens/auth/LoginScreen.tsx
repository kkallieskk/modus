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
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/socialAuth';
import { Mail, Lock } from 'lucide-react-native';

export const LoginScreen = ({ route, navigation }: any) => {
  const role = route.params?.role;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      await signInWithGoogle(role);
      // RootNavigator will pick up the session
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
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-24">
        <View className="mb-10">
          <Text className="text-4xl font-bold text-black mb-2">
            {role === 'brand' ? 'Welcome, Brand.' : role === 'influencer' ? 'Welcome, Creator.' : 'Welcome Back'}
          </Text>
          <Text className="text-gray-500 text-lg">
            {role === 'brand' ? "Let's grow." : role === 'influencer' ? "Let's build." : 'Sign in to manage your deals.'}
          </Text>
        </View>

        {/* Google Sign-In Button */}
        <TouchableOpacity 
          onPress={handleGoogleLogin}
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
            <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Password</Text>
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
          onPress={handleLogin}
          disabled={loading}
          className="mt-8 bg-black h-16 rounded-2xl items-center justify-center shadow-lg"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('SignUp', { role })}
          className="mt-6 py-2"
        >
          <Text className="text-gray-500 text-center">
            Don't have an account? <Text className="text-black font-bold">Apply to join Modus</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

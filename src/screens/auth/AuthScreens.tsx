import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';

export const PendingScreen = () => (
  <View className="flex-1 items-center justify-center bg-white p-6">
    <Text className="text-2xl font-bold text-black mb-2">Approval Pending</Text>
    <Text className="text-gray-500 text-center">
      Your account is currently under review by our admins. You will be notified once you are approved.
    </Text>
    <TouchableOpacity 
      onPress={() => supabase.auth.signOut()}
      className="mt-8 bg-black px-6 py-3 rounded-full"
    >
      <Text className="text-white font-semibold">Sign Out</Text>
    </TouchableOpacity>
  </View>
);

export const AuthPlaceholder = () => (
  <View className="flex-1 items-center justify-center bg-white p-6">
    <Text className="text-2xl font-bold text-black mb-4">Welcome to Modus</Text>
    <Text className="text-gray-500 mb-8">Please sign in to continue.</Text>
    {/* We will build the real Auth screen later */}
  </View>
);

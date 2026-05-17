import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { User, Link as LinkIcon, FileText, Camera, Save, AlertTriangle, LogOut, Star } from 'lucide-react-native';

export const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    display_name: '',
    bio: '',
    social_link: '',
    avatar_url: '',
    role: '',
  });
  const [reputation, setReputation] = useState({
    avgRating: 0,
    reviewCount: 0,
    topTags: [] as string[]
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, bio, social_link, avatar_url, role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          display_name: data.display_name || '',
          bio: data.bio || '',
          social_link: data.social_link || '',
          avatar_url: data.avatar_url || '',
          role: data.role || '',
        });
      }

      // Fetch Reputation Metrics
      const { data: reviews, error: revError } = await supabase
        .from('collab_reviews')
        .select('rating, tags')
        .eq('reviewee_id', user.id);

      if (!revError && reviews && reviews.length > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = totalRating / reviews.length;
        
        // Count tags
        const tagCounts: Record<string, number> = {};
        reviews.forEach(r => {
          r.tags?.forEach((t: string) => {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
          });
        });
        
        const sortedTags = Object.entries(tagCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([tag]) => tag);

        setReputation({
          avgRating: avg,
          reviewCount: reviews.length,
          topTags: sortedTags
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('modus-assets')
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('modus-assets')
        .getPublicUrl(filePath);

      setProfile({ ...profile, avatar_url: publicUrl });
      
      // Immediately update profile table too
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      Alert.alert('Success', 'Avatar updated!');
    } catch (err: any) {
      console.error('Upload error:', err);
      Alert.alert('Upload Failed', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.display_name.trim()) {
      Alert.alert('Required Field', 'Please enter a display name.');
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
          bio: profile.bio,
          social_link: profile.social_link,
          avatar_url: profile.avatar_url,
        })
        .eq('id', user.id);

      if (error) throw error;
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to permanently delete your account? This action cannot be undone and all your data will be erased.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase.rpc('delete_user_account');
              if (error) throw error;
              await supabase.auth.signOut();
            } catch (err: any) {
              setLoading(false);
              Alert.alert('Error', err.message || 'Could not delete account.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        {/* Header Section with Avatar Upload */}
        <View className="items-center mb-8">
          <TouchableOpacity 
            onPress={pickImage}
            disabled={uploading}
            className="relative"
          >
            <View className="w-28 h-28 rounded-full bg-gray-100 items-center justify-center overflow-hidden border-4 border-gray-50 shadow-sm">
              {uploading ? (
                <ActivityIndicator color="#000" />
              ) : profile.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
              ) : (
                <User size={48} color="#9CA3AF" />
              )}
            </View>
            <View className="absolute bottom-0 right-1 bg-black p-2.5 rounded-full border-2 border-white shadow-md">
              <Camera size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black mt-4">{profile.display_name || 'My Profile'}</Text>
          <View className="bg-gray-100 px-3 py-1 rounded-full mt-1">
            <Text className="text-gray-500 text-[10px] font-bold uppercase">{profile.role}</Text>
          </View>

          {/* Reputation Summary */}
          {reputation.reviewCount > 0 && (
            <View className="flex-row items-center mt-6 bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100">
              <View className="flex-row items-center border-r border-amber-200 pr-4 mr-4">
                <Star size={18} color="#F59E0B" fill="#F59E0B" />
                <Text className="text-amber-900 font-black text-lg ml-1.5">{reputation.avgRating.toFixed(1)}</Text>
              </View>
              <View className="flex-1 flex-row flex-wrap gap-2">
                {reputation.topTags.map((tag, i) => (
                  <View key={i} className="bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                    <Text className="text-amber-800 text-[10px] font-bold uppercase">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Form Section */}
        <View className="space-y-6">
          <View>
            <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Display Name</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
              <User size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-black text-base"
                placeholder="Name or Company"
                value={profile.display_name}
                onChangeText={(text) => setProfile({ ...profile, display_name: text })}
              />
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Bio</Text>
            <View className="flex-row items-start bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 min-h-[100px]">
              <FileText size={20} color="#9CA3AF" style={{ marginTop: 2 }} />
              <TextInput
                className="flex-1 ml-3 text-black text-base"
                placeholder="Tell others about yourself..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={profile.bio}
                onChangeText={(text) => setProfile({ ...profile, bio: text })}
              />
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Social Link</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
              <LinkIcon size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-black text-base"
                placeholder="https://instagram.com/..."
                value={profile.social_link}
                onChangeText={(text) => setProfile({ ...profile, social_link: text })}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving || uploading}
          className={`mt-10 bg-black h-16 rounded-2xl flex-row items-center justify-center shadow-lg ${saving || uploading ? 'opacity-50' : ''}`}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Save size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Save Profile</Text>
            </>
          )}
        </TouchableOpacity>

        <View className="mt-8 pt-6 border-t border-gray-100 space-y-4">
          <Text className="text-red-600 font-bold uppercase text-xs mb-2">Danger Zone</Text>
          
          <TouchableOpacity 
            onPress={handleLogout}
            className="bg-white border-2 border-red-100 h-14 rounded-2xl flex-row items-center justify-center"
          >
            <LogOut size={20} color="#DC2626" />
            <Text className="text-red-600 font-bold text-base ml-2">Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleDeleteAccount}
            className="bg-white border-2 border-red-100 h-14 rounded-2xl flex-row items-center justify-center"
          >
            <AlertTriangle size={20} color="#DC2626" />
            <Text className="text-red-600 font-bold text-base ml-2">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

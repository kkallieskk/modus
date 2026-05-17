import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  Camera, 
  Save, 
  Plus, 
  X,
  Type,
  AlignLeft,
  Link as LinkIcon
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    display_name: '',
    bio: '',
    social_link: '',
    avatar_url: '',
    niches: [] as string[],
  });
  const [newNiche, setNewNiche] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, bio, social_link, avatar_url, niches')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          display_name: data.display_name || '',
          bio: data.bio || '',
          social_link: data.social_link || '',
          avatar_url: data.avatar_url || '',
          niches: data.niches || [],
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id);

      if (error) throw error;
      Alert.alert('Success', 'Profile updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const addNiche = () => {
    if (newNiche.trim() && !profile.niches.includes(newNiche.trim())) {
      setProfile({ ...profile, niches: [...profile.niches, newNiche.trim()] });
      setNewNiche('');
    }
  };

  const removeNiche = (tag: string) => {
    setProfile({ ...profile, niches: profile.niches.filter(n => n !== tag) });
  };

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
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('modus-assets')
        .upload(filePath, blob, { contentType: blob.type, upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('modus-assets')
        .getPublicUrl(filePath);

      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={saving}
          style={[styles.saveAction, saving && { opacity: 0.5 }]}
        >
          <Text style={styles.saveActionText}>Done</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Avatar Upload */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                {profile.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
                ) : (
                  <Camera size={32} color="#9CA3AF" />
                )}
              </View>
              <View style={styles.cameraBadge}>
                <Camera size={14} color="#FFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarNote}>Tap to change avatar</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Type size={14} color="#9CA3AF" />
                <Text style={styles.label}>Display Name</Text>
              </View>
              <TextInput
                style={styles.input}
                value={profile.display_name}
                onChangeText={(t) => setProfile({ ...profile, display_name: t })}
                placeholder="How you appear to brands"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <AlignLeft size={14} color="#9CA3AF" />
                <Text style={styles.label}>Professional Bio</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profile.bio}
                onChangeText={(t) => setProfile({ ...profile, bio: t })}
                placeholder="Pitch yourself to potential partners..."
                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <LinkIcon size={14} color="#9CA3AF" />
                <Text style={styles.label}>Social Connection</Text>
              </View>
              <TextInput
                style={styles.input}
                value={profile.social_link}
                onChangeText={(t) => setProfile({ ...profile, social_link: t })}
                placeholder="instagram.com/yourhandle"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Plus size={14} color="#9CA3AF" />
                <Text style={styles.label}>Niches & Categories</Text>
              </View>
              <View style={styles.nicheInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={newNiche}
                  onChangeText={setNewNiche}
                  placeholder="Add a niche (e.g. Comedy)"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={addNiche} style={styles.addNicheBtn}>
                  <Plus size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.tagCloud}>
                {profile.niches.map((tag) => (
                  <TouchableOpacity 
                    key={tag} 
                    onPress={() => removeNiche(tag)}
                    style={styles.tag}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                    <X size={12} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  saveAction: { backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveActionText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  scrollContent: { padding: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarWrapper: { position: 'relative' },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  avatarImg: { width: '100%', height: '100%' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#000', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFF' },
  avatarNote: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginTop: 12 },
  form: { gap: 24 },
  inputGroup: { gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 4 },
  label: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase' },
  input: { backgroundColor: '#F9FAFB', height: 56, borderRadius: 16, paddingHorizontal: 16, fontSize: 16, color: '#000', fontWeight: '600', borderWidth: 1, borderColor: '#F3F4F6' },
  textArea: { height: 120, paddingTop: 16 },
  nicheInputRow: { flexDirection: 'row', gap: 12 },
  addNicheBtn: { backgroundColor: '#000', width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  tagText: { fontSize: 14, fontWeight: '700', color: '#374151' }
});

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
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { Building2, Globe, FileText, Camera, Save, Sparkles, CheckCircle2 } from 'lucide-react-native';

const INDUSTRIES_LIST = [
  'Premium Retail',
  'Fashion & Apparel',
  'Skincare & Beauty',
  'Tech & Gadgets',
  'Food & Beverage',
  'Other'
];

const BRAND_VIBES = [
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Ocean', hex: '#0EA5E9' },
  { name: 'Sunset', hex: '#F97316' },
  { name: 'Midnight', hex: '#0F172A' },
  { name: 'Forest', hex: '#22C55E' },
  { name: 'Rose', hex: '#F43F5E' },
];

export const EditProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);
  const [customIndustry, setCustomIndustry] = useState('');

  const [profile, setProfile] = useState({
    company_name: '',
    bio: '',
    website_url: '',
    avatar_url: '',
    industry: '',
    brand_color: '#8B5CF6',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email || '');

      const { data, error } = await supabase
        .from('profiles')
        .select('company_name, bio, website_url, avatar_url, industry, brand_color')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        const ind = data.industry || '';
        const isStandard = INDUSTRIES_LIST.filter(i => i !== 'Other').includes(ind);
        setProfile({
          company_name: data.company_name || '',
          bio: data.bio || '',
          website_url: data.website_url || '',
          avatar_url: data.avatar_url || '',
          industry: isStandard ? ind : (ind ? 'Other' : ''),
          brand_color: data.brand_color || '#8B5CF6',
        });
        if (!isStandard && ind) {
          setCustomIndustry(ind);
        }
      }
    } catch (err: any) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileExt === 'png' ? 'image/png' : 'image/jpeg';
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`;

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: `logo.${fileExt}`,
        type: mimeType,
      } as any);

      const { error: uploadError } = await supabase.storage
        .from('modus-assets')
        .upload(filePath, formData, { contentType: mimeType, upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('modus-assets')
        .getPublicUrl(filePath);

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

      Alert.alert('✅ Logo Updated', 'Your brand logo has been saved.');
    } catch (err: any) {
      console.error('Upload error:', err);
      Alert.alert('Upload Failed', err.message || 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.company_name.trim()) {
      Alert.alert('Required', 'Company name cannot be empty.');
      return;
    }
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: profile.company_name.trim(),
          bio: profile.bio.trim(),
          website_url: profile.website_url.trim(),
          industry: profile.industry === 'Other' ? customIndustry.trim() : profile.industry.trim(),
          brand_color: profile.brand_color,
        })
        .eq('id', user.id);

      if (error) throw error;
      Alert.alert('✅ Saved', 'Your profile has been updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save changes.');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── HEADER ──────────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.headerLabel}>Profile</Text>
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>

          {/* ── AVATAR ──────────────────────────────────────────────────────── */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                {uploading ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : profile.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <Building2 size={40} color="#9CA3AF" />
                )}
              </View>
              <View style={styles.cameraChip}>
                <Camera size={14} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarName}>{profile.company_name || 'Your Brand'}</Text>
            <Text style={styles.avatarEmail}>{userEmail}</Text>
          </View>

          {/* ── FORM ────────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Brand Identity</Text>

            <View style={styles.card}>
              {/* Company Name */}
              <View style={styles.fieldRow}>
                <View style={styles.fieldIcon}>
                  <Building2 size={18} color="#6B7280" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Company Name</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="e.g. Acme Brands Pvt Ltd"
                    placeholderTextColor="#D1D5DB"
                    value={profile.company_name}
                    onChangeText={t => setProfile(p => ({ ...p, company_name: t }))}
                  />
                </View>
              </View>

              <View style={styles.divider} />

              {/* Website */}
              <View style={styles.fieldRow}>
                <View style={styles.fieldIcon}>
                  <Globe size={18} color="#6B7280" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Website / Instagram</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="https://yourbrand.com"
                    placeholderTextColor="#D1D5DB"
                    value={profile.website_url}
                    onChangeText={t => setProfile(p => ({ ...p, website_url: t }))}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>

              <View style={styles.divider} />

              {/* Industry / Niche */}
              <View style={styles.fieldRow}>
                <View style={styles.fieldIcon}>
                  <Sparkles size={18} color="#6B7280" />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Industry / Niche</Text>
                  <TouchableOpacity
                    onPress={() => setShowIndustryPicker(!showIndustryPicker)}
                    style={[styles.fieldInput, { justifyContent: 'center' }]}
                  >
                    <Text style={{ color: profile.industry ? '#000' : '#D1D5DB', fontSize: 15, fontWeight: '500' }}>
                      {profile.industry || 'Select your industry'}
                    </Text>
                  </TouchableOpacity>

                  {showIndustryPicker && (
                    <View style={styles.pickerDropdown}>
                      {INDUSTRIES_LIST.map((item, idx) => (
                        <TouchableOpacity
                          key={item}
                          onPress={() => {
                            setProfile(p => ({ ...p, industry: item }));
                            setShowIndustryPicker(false);
                          }}
                          style={{
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            borderBottomWidth: idx < INDUSTRIES_LIST.length - 1 ? 1 : 0,
                            borderBottomColor: '#F3F4F6',
                            backgroundColor: profile.industry === item ? '#F9FAFB' : 'white',
                          }}
                        >
                          <Text style={{ color: profile.industry === item ? '#000' : '#374151', fontWeight: profile.industry === item ? '700' : '400' }}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {profile.industry === 'Other' && (
                    <TextInput
                      style={[styles.fieldInput, { marginTop: 8 }]}
                      placeholder="Type your industry..."
                      placeholderTextColor="#D1D5DB"
                      value={customIndustry}
                      onChangeText={setCustomIndustry}
                    />
                  )}
                </View>
              </View>
            </View>
          </View>
          
          {/* Brand Vibe Picker */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Brand Vibe</Text>
            <View style={styles.card}>
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 12 }}>
                  Theme Color
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                >
                  {BRAND_VIBES.map((vibe) => (
                    <TouchableOpacity
                      key={vibe.hex}
                      onPress={() => setProfile(p => ({ ...p, brand_color: vibe.hex }))}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: vibe.hex },
                        profile.brand_color === vibe.hex && styles.colorCircleSelected
                      ]}
                    >
                      {profile.brand_color === vibe.hex && (
                        <CheckCircle2 size={20} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Company Description</Text>
            <View style={[styles.card, styles.bioCard]}>
              <View style={styles.fieldRow}>
                <View style={styles.fieldIcon}>
                  <FileText size={18} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.bioInput}
                  placeholder="Describe your brand..."
                  placeholderTextColor="#D1D5DB"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  value={profile.bio}
                  onChangeText={t => setProfile(p => ({ ...p, bio: t }))}
                />
              </View>
            </View>
          </View>

        </ScrollView>

        {/* ── SAVE BUTTON (PINNED) ─────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || uploading}
          style={[styles.saveBtn, (saving || uploading) && styles.saveBtnDisabled]}
        >
          {saving
            ? <ActivityIndicator color="white" />
            : <>
                <Save size={20} color="white" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
          }
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  scroll: { paddingBottom: 20 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#000', marginTop: 2 },
  avatarSection: { alignItems: 'center', paddingVertical: 32, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 3, borderColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  avatarImage: { width: '100%', height: '100%' },
  cameraChip: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#000', borderRadius: 16, padding: 7, borderWidth: 2, borderColor: 'white' },
  avatarName: { fontSize: 20, fontWeight: '800', color: '#000' },
  avatarEmail: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  bioCard: { paddingVertical: 4 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  fieldIcon: { width: 36, alignItems: 'center' },
  fieldContent: { flex: 1, marginLeft: 4 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  fieldInput: { fontSize: 15, color: '#000', fontWeight: '500', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F9FAFB', borderRadius: 8, marginTop: 4 },
  bioInput: { flex: 1, fontSize: 15, color: '#000', paddingVertical: 12, paddingHorizontal: 12, minHeight: 100, backgroundColor: '#F9FAFB', borderRadius: 8, lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#F9FAFB', marginLeft: 52 },
  pickerDropdown: { backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, overflow: 'hidden' },
  saveBtn: { marginHorizontal: 20, marginBottom: 20, backgroundColor: '#000', borderRadius: 18, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: '#000',
  },
});

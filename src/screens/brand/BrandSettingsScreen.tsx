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
import {
  Building2, Globe, FileText, Camera, Save,
  LogOut, ChevronRight, Shield, Bell, HelpCircle, AlertTriangle, Sparkles
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '@/lib/ProfileContext';

const INDUSTRIES_LIST = [
  'Premium Retail',
  'Fashion & Apparel',
  'Skincare & Beauty',
  'Tech & Gadgets',
  'Food & Beverage',
  'Other'
];

export const BrandSettingsScreen = () => {
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);
  const [customIndustry, setCustomIndustry] = useState('');

  const [localProfile, setLocalProfile] = useState({
    company_name: '',
    bio: '',
    website_url: '',
    avatar_url: '',
    industry: '',
  });

  const brandColor = profile?.brand_color || '#8B5CF6';
  const softAuraTop = `${brandColor}2E`; // 0.18 opacity
  const softAuraBottom = `${brandColor}05`; // 0.02 opacity


  // ─── FETCH ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (profile) {
      setUserEmail(profile.id); // Or fetch email separately if needed, but profile context should ideally have it
      const ind = profile.industry || '';
      const isStandard = INDUSTRIES_LIST.filter(i => i !== 'Other').includes(ind);
      setLocalProfile({
        company_name: profile.display_name || '',
        bio: profile.bio || '',
        website_url: profile.avatar_url || '', // website_url was missing in my Profile type? Wait.
        avatar_url: profile.avatar_url || '',
        industry: isStandard ? ind : (ind ? 'Other' : ''),
      });
      if (!isStandard && ind) {
        setCustomIndustry(ind);
      }
    }
  }, [profile]);

  // Actually, I should probably update the Profile type in ProfileContext to include website_url.


  // ─── AVATAR UPLOAD ────────────────────────────────────────────────────────
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

      // Determine file extension and mime type
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileExt === 'png' ? 'image/png' : 'image/jpeg';
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`;

      // Use FormData — the only reliable method for local file:// URIs in React Native
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

      setLocalProfile(prev => ({ ...prev, avatar_url: publicUrl }));

      // Also persist to DB immediately
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      refreshProfile(); // Sync global state

      Alert.alert('✅ Logo Updated', 'Your brand logo has been saved.');
    } catch (err: any) {
      console.error('Upload error:', err);
      Alert.alert('Upload Failed', err.message || 'Could not upload image. Check that the modus-assets storage bucket exists in Supabase.');
    } finally {
      setUploading(false);
    }
  };


  // ─── SAVE CHANGES ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!localProfile.company_name.trim()) {
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
          company_name: localProfile.company_name.trim(),
          bio: localProfile.bio.trim(),
          website_url: localProfile.website_url.trim(),
          industry: localProfile.industry === 'Other' ? customIndustry.trim() : localProfile.industry.trim(),
        })
        .eq('id', user.id);

      if (error) throw error;
      refreshProfile(); // Sync global state
      Alert.alert('✅ Saved', 'Your account settings have been updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your brand account?',
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

  // ─── DELETE ACCOUNT ───────────────────────────────────────────────────────
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
              setSaving(true);
              const { error } = await supabase.rpc('delete_user_account');
              if (error) throw error;
              await supabase.auth.signOut();
            } catch (err: any) {
              setSaving(false);
              Alert.alert('Error', err.message || 'Could not delete account.');
            }
          },
        },
      ]
    );
  };

  // ─── DEV TOOLS ────────────────────────────────────────────────────────────
  const handleTempBackfill = async () => {
    setIsBackfilling(true);
    try {
      const { data, error } = await supabase.functions.invoke('backfill-embeddings');
      if (error) throw new Error(error.message || 'Failed to execute Edge Function');
      
      Alert.alert('God Mode Success', data.message || 'Backfill complete.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsBackfilling(false);
    }
  };

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={brandColor} />
      </View>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── HEADER AURA ─────────────────────────────────────────────────── */}
          <LinearGradient
            colors={[softAuraTop, softAuraBottom]}
            style={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 24,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
            }}
          >
            <Text style={styles.headerLabel}>Brand Account</Text>
            <Text style={styles.headerTitle}>Account Settings</Text>
          </LinearGradient>

        {/* ── AVATAR ──────────────────────────────────────────────────────── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {uploading ? (
                <ActivityIndicator color={brandColor} size="large" />
              ) : localProfile.avatar_url ? (
                <Image source={{ uri: localProfile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Building2 size={40} color="#9CA3AF" />
              )}
            </View>
            <View style={[styles.cameraChip, { backgroundColor: brandColor }]}>
              <Camera size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarName}>{localProfile.company_name || 'Your Brand'}</Text>
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
                  value={localProfile.company_name}
                  onChangeText={t => setLocalProfile(p => ({ ...p, company_name: t }))}
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
                  value={localProfile.website_url}
                  onChangeText={t => setLocalProfile(p => ({ ...p, website_url: t }))}
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
                  <Text style={{ color: localProfile.industry ? '#000' : '#D1D5DB', fontSize: 15, fontWeight: '500' }}>
                    {localProfile.industry || 'Select your industry'}
                  </Text>
                </TouchableOpacity>

                {showIndustryPicker && (
                  <View style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    marginTop: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                    overflow: 'hidden',
                  }}>
                    {INDUSTRIES_LIST.map((item, idx) => (
                      <TouchableOpacity
                        key={item}
                        onPress={() => {
                          setLocalProfile(p => ({ ...p, industry: item }));
                          setShowIndustryPicker(false);
                        }}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderBottomWidth: idx < INDUSTRIES_LIST.length - 1 ? 1 : 0,
                          borderBottomColor: '#F3F4F6',
                          backgroundColor: localProfile.industry === item ? '#F9FAFB' : 'white',
                        }}
                      >
                        <Text style={{ color: localProfile.industry === item ? '#000' : '#374151', fontWeight: localProfile.industry === item ? '700' : '400' }}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {localProfile.industry === 'Other' && (
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
                placeholder="Describe your brand, what you sell, and the kind of creators you're looking for..."
                placeholderTextColor="#D1D5DB"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={localProfile.bio}
                onChangeText={t => setLocalProfile(p => ({ ...p, bio: t }))}
              />
            </View>
          </View>
        </View>

        {/* ── QUICK LINKS ─────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>More</Text>
          <View style={styles.card}>
            {[
              { icon: <Bell size={18} color="#6B7280" />, label: 'Notifications' },
              { icon: <Shield size={18} color="#6B7280" />, label: 'Privacy & Security' },
              { icon: <HelpCircle size={18} color="#6B7280" />, label: 'Help & Support' },
            ].map((item, i, arr) => (
              <View key={item.label}>
                <TouchableOpacity
                  style={styles.quickRow}
                  onPress={() => Alert.alert('Coming Soon', `${item.label} settings will be available soon.`)}
                >
                  <View style={styles.fieldIcon}>{item.icon}</View>
                  <Text style={styles.quickLabel}>{item.label}</Text>
                  <ChevronRight size={16} color="#D1D5DB" />
                </TouchableOpacity>
                {i < arr.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* ── DANGER ZONE ─────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: '#DC2626' }]}>Danger Zone</Text>
          <View style={[styles.card, { borderColor: '#FEE2E2', borderWidth: 1.5 }]}>
            <TouchableOpacity onPress={handleLogout} style={styles.dangerRow}>
              <View style={styles.fieldIcon}><LogOut size={20} color="#DC2626" /></View>
              <Text style={styles.dangerText}>Log Out</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity onPress={handleDeleteAccount} style={styles.dangerRow}>
              <View style={styles.fieldIcon}><AlertTriangle size={20} color="#DC2626" /></View>
              <Text style={styles.dangerText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── DEVELOPER/ADMIN TOOLS ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Developer / Admin Tools</Text>
          <TouchableOpacity
            onPress={handleTempBackfill}
            disabled={isBackfilling}
            style={[styles.card, { padding: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: isBackfilling ? '#F3F4F6' : 'white' }]}
          >
            {isBackfilling ? <ActivityIndicator size="small" color={brandColor} /> : <Sparkles size={20} color={brandColor} />}
            <Text style={{ marginLeft: 12, fontWeight: '700', color: isBackfilling ? '#9CA3AF' : brandColor }}>
              {isBackfilling ? 'Backfilling Vectors...' : 'Run AI Backfill'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Modus v1.0.0 · Brand Portal</Text>
        </ScrollView>

        {/* ── SAVE BUTTON (PINNED) ─────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || uploading}
          style={[styles.saveBtn, { backgroundColor: brandColor }, (saving || uploading) && styles.saveBtnDisabled]}
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

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  scroll: { paddingBottom: 20 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20, // Reduced since we use SafeAreaView
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#000', marginTop: 2, letterSpacing: -0.5 },

  avatarSection: { alignItems: 'center', paddingVertical: 32, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3, borderColor: 'white',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  avatarImage: { width: '100%', height: '100%' },
  cameraChip: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#000', borderRadius: 16, padding: 7,
    borderWidth: 2, borderColor: 'white',
  },
  avatarName: { fontSize: 20, fontWeight: '800', color: '#000' },
  avatarEmail: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },

  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  bioCard: { paddingVertical: 4 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  fieldIcon: { width: 36, alignItems: 'center' },
  fieldContent: { flex: 1, marginLeft: 4 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  fieldInput: { 
    fontSize: 15, 
    color: '#000', 
    fontWeight: '500', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    backgroundColor: '#F9FAFB', 
    borderRadius: 8,
    marginTop: 4
  },
  bioInput: { 
    flex: 1, 
    fontSize: 15, 
    color: '#000', 
    paddingVertical: 12, 
    paddingHorizontal: 12, 
    minHeight: 100, 
    backgroundColor: '#F9FAFB', 
    borderRadius: 8,
    lineHeight: 22 
  },
  divider: { height: 1, backgroundColor: '#F9FAFB', marginLeft: 52 },

  quickRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  quickLabel: { flex: 1, fontSize: 15, color: '#374151', fontWeight: '500', marginLeft: 12 },

  dangerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 18 },
  dangerText: { flex: 1, fontSize: 16, fontWeight: '700', color: '#DC2626', marginLeft: 12 },

  saveBtn: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: '#000',
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },

  version: { textAlign: 'center', color: '#D1D5DB', fontSize: 12, marginTop: 32 },
});

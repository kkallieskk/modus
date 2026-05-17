import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { Briefcase, Globe, ChevronDown, ChevronRight, Camera, ChevronLeft, ImagePlus, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { useProfile } from '@/lib/ProfileContext';

const { width } = Dimensions.get('window');

const INDUSTRIES = [
  'Fashion & Beauty',
  'Tech & Gaming',
  'Food & Beverage',
  'Fitness',
  'Lifestyle',
  'Other',
];

const STEP_TITLES = [
  { title: 'Identity', subtitle: 'The basics.' },
  { title: 'Brand Vibe', subtitle: 'Choose your aesthetic.' },
  { title: 'Your Mark', subtitle: 'First impressions matter.' },
  { title: 'Your Story', subtitle: 'In your own words.' },
];

const BRAND_VIBES = [
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Ocean', hex: '#0EA5E9' },
  { name: 'Sunset', hex: '#F97316' },
  { name: 'Midnight', hex: '#0F172A' },
  { name: 'Forest', hex: '#22C55E' },
  { name: 'Rose', hex: '#F43F5E' },
];

export const BrandOnboardingScreen = () => {
  const [step, setStep] = useState(1);
  const { refreshProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedColor, setSelectedColor] = useState(BRAND_VIBES[0].hex);
  const [bio, setBio] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const nextStep = () => {
    if (step === 1 && (!company.trim() || !industry)) {
      if (Platform.OS === 'web') {
        window.alert('Company name and industry are required.');
      } else {
        Alert.alert('Hold on', 'Company name and industry are required.');
      }
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (Platform.OS === 'web') {
        window.alert('We need access to your photo library.');
      } else {
        Alert.alert('Permission Required', 'We need access to your photo library.');
      }
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) uploadAvatar(result.assets[0].uri);
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
      formData.append('file', { uri, name: `logo.${fileExt}`, type: mimeType } as any);

      const { error: uploadError } = await supabase.storage
        .from('modus-assets')
        .upload(filePath, formData, { contentType: mimeType, upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('modus-assets')
        .getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(err.message || 'Could not upload image.');
      } else {
        Alert.alert('Upload Failed', err.message || 'Could not upload image.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No session found');

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: company.trim(),
          company_name: company.trim(),
          niche_industry: industry,
          industry: industry,
          social_link: website.trim(),
          website_url: website.trim(),
          avatar_url: avatarUrl,
          brand_color: selectedColor,
          bio: bio.trim(),
          onboarding_completed: true,
        })
        .eq('id', user.id);
      if (error) throw error;

      await refreshProfile();
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(err.message || 'Something went wrong.');
      } else {
        Alert.alert('Setup Failed', err.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  const currentStep = STEP_TITLES[step - 1];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.container}
    >
      {/* Soft floating accents */}
      <View style={[s.blob, { top: -60, right: -40 }]} />
      <View style={[s.blob, s.blobSmall, { bottom: 120, left: -30 }]} />

      {/* Top section */}
      <View style={s.header}>
        {/* Progress dots */}
        <View style={s.progressRow}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[s.dot, i <= step && s.dotActive]} />
          ))}
        </View>

        <Text style={s.stepLabel}>Step {step}/4</Text>
        <Text style={s.title}>{currentStep.title}</Text>
        <Text style={s.subtitle}>{currentStep.subtitle}</Text>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── STEP 1: Identity ─── */}
        {step === 1 && (
          <>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Company Name</Text>
              <TextInput
                style={s.textInput}
                placeholder="Acme Inc."
                placeholderTextColor="#C5C8CD"
                value={company}
                onChangeText={setCompany}
              />
            </View>

            <View style={s.field}>
              <Text style={s.fieldLabel}>Industry</Text>
              <TouchableOpacity
                onPress={() => setShowPicker(!showPicker)}
                style={s.textInput}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 16, color: industry ? '#000' : '#C5C8CD' }}>
                  {industry || 'Choose one'}
                </Text>
              </TouchableOpacity>
              {showPicker && (
                <View style={s.picker}>
                  {INDUSTRIES.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => { setIndustry(item); setShowPicker(false); }}
                      style={[s.pickerItem, industry === item && s.pickerItemActive]}
                    >
                      <Text style={{ fontSize: 15, fontWeight: industry === item ? '600' : '400', color: '#000' }}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={s.field}>
              <Text style={s.fieldLabel}>Website <Text style={{ color: '#C5C8CD', fontWeight: '400' }}>(optional)</Text></Text>
              <TextInput
                style={s.textInput}
                placeholder="https://..."
                placeholderTextColor="#C5C8CD"
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </>
        )}

        {/* ─── STEP 2: Brand Vibe ─── */}
        {step === 2 && (
          <View style={s.field}>
            <Text style={s.fieldLabel}>Select your primary theme color</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 16, paddingVertical: 10 }}
            >
              {BRAND_VIBES.map((vibe) => (
                <TouchableOpacity
                  key={vibe.hex}
                  onPress={() => setSelectedColor(vibe.hex)}
                  style={[
                    s.colorCircle,
                    { backgroundColor: vibe.hex },
                    selectedColor === vibe.hex && s.colorCircleSelected
                  ]}
                >
                  {selectedColor === vibe.hex && (
                    <View style={s.checkIcon}>
                      <CheckCircle2 size={24} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={s.helperText}>This will tint your dashboard and buttons.</Text>
          </View>
        )}

        {/* ─── STEP 3: Logo ─── */}
        {step === 3 && (
          <View style={s.logoStep}>
            <TouchableOpacity onPress={pickImage} disabled={uploading} activeOpacity={0.8} style={s.logoCircle}>
              {uploading ? (
                <ActivityIndicator color="#000" />
              ) : avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={s.logoImage} />
              ) : (
                <Camera size={28} color="#B0B3B8" />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage} disabled={uploading} style={s.uploadBtn}>
              <ImagePlus size={16} color="#000" />
              <Text style={s.uploadBtnText}>
                {avatarUrl ? 'Change Logo' : 'Choose from Gallery'}
              </Text>
            </TouchableOpacity>

            <Text style={s.helperText}>Square image, at least 400×400px</Text>
          </View>
        )}

        {/* ─── STEP 4: Bio ─── */}
        {step === 4 && (
          <>
            <View style={s.field}>
              <Text style={s.fieldLabel}>About your brand</Text>
              <TextInput
                style={[s.textInput, s.textArea]}
                placeholder="What do you do? What kind of creators are you looking for?"
                placeholderTextColor="#C5C8CD"
                multiline
                textAlignVertical="top"
                value={bio}
                onChangeText={setBio}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        {step > 1 ? (
          <TouchableOpacity onPress={prevStep} style={s.backBtn}>
            <ChevronLeft size={22} color="#000" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 48 }} />
        )}

        {step < 4 ? (
          <TouchableOpacity onPress={nextStep} style={s.primaryBtn} activeOpacity={0.85}>
            <Text style={s.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={[s.primaryBtn, loading && { opacity: 0.6 }]} activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={s.primaryBtnText}>Launch Dashboard →</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },

  // Floating background accents
  blob: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: '#F5F6F7', zIndex: 0 },
  blobSmall: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#F9FAFB' },

  // Header
  header: { paddingTop: 68, paddingHorizontal: 28, paddingBottom: 8, zIndex: 1 },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB' },
  dotActive: { backgroundColor: '#000', width: 24 },
  stepLabel: { fontSize: 12, fontWeight: '600', color: '#B0B3B8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '800', color: '#000', letterSpacing: -0.3 },
  subtitle: { fontSize: 15, color: '#9CA3AF', marginTop: 4 },

  // Scroll
  scrollContent: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 28, paddingBottom: 20, zIndex: 1 },

  // Fields
  field: { marginBottom: 22 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  textInput: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EDEDEF',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    color: '#000',
    justifyContent: 'center',
  },
  textArea: { height: 140, paddingTop: 16, textAlignVertical: 'top' },

  // Picker
  picker: { marginTop: 6, backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#EDEDEF', overflow: 'hidden' },
  pickerItem: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  pickerItemActive: { backgroundColor: '#F9FAFB' },

  // Logo step
  logoStep: { alignItems: 'center', paddingTop: 20 },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F5F6F7',
    borderWidth: 1,
    borderColor: '#EDEDEF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  logoImage: { width: '100%', height: '100%' },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EDEDEF',
  },
  uploadBtnText: { fontSize: 14, fontWeight: '600', color: '#000' },
  helperText: { fontSize: 12, color: '#B0B3B8', marginTop: 12 },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 16,
    zIndex: 1,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F6F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    flex: 1,
    height: 52,
    marginLeft: 12,
    backgroundColor: '#000',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  colorCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkIcon: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

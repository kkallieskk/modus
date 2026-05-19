import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, Animated, Easing, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Briefcase, Globe, ChevronDown } from 'lucide-react-native';

const IS_WEB = Platform.OS === 'web';
const INDUSTRIES = ['Premium Retail', 'Fashion & Apparel', 'Skincare & Beauty', 'Tech & Gadgets', 'Food & Beverage'];

const Orb = ({ style: os, color, size, delay = 0 }: any) => {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(y, { toValue: -18, duration: 3400 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0,   duration: 3400 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color, transform: [{ translateY: y }], ...(IS_WEB ? { filter: 'blur(90px)' } : {}) }, os]} />;
};

export const BrandSetupScreen = () => {
  const navigation = useNavigation<any>();
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [focused, setFocused] = useState<'company' | 'website' | null>(null);

  const accentColor = '#7C3AED';
  const orb1Color = 'rgba(124,58,237,0.18)';
  const orb2Color = 'rgba(167,139,250,0.14)';

  const handleSubmit = async () => {
    if (!company.trim() || !industry) { Alert.alert('Required Fields', 'Please enter your company name and select an industry.'); return; }
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No session found');
      const { error } = await supabase.from('profiles').update({ company_name: company.trim(), industry, website_url: website.trim() }).eq('id', user.id);
      if (error) throw error;
      navigation.replace('BrandRoot');
    } catch (err: any) { Alert.alert('Setup Failed', err.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <View style={st.root}>
      <Orb os={{ top: '10%', left: '15%' }} color={orb1Color} size={460} delay={0} />
      <Orb os={{ bottom: '10%', right: '15%' }} color={orb2Color} size={380} delay={600} />

      <View style={st.navBar}><Text style={st.logo}>Modus.</Text></View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={st.container}>
        <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={st.formCard}>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 24, height: 4, backgroundColor: '#111827', borderRadius: 2 }} />
              <View style={{ width: 4, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginLeft: 6 }} />
              <View style={{ width: 4, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginLeft: 6 }} />
            </View>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>STEP 1/3</Text>
            
            <Text style={st.formTitle}>Identity</Text>
            <Text style={st.formSub}>The basics.</Text>

            {/* Company Name */}
            <Text style={st.label}>Company Name</Text>
            <View style={[st.inputWrap, { borderColor: focused === 'company' ? accentColor : '#E5E7EB', backgroundColor: focused === 'company' ? '#FFF' : '#F9FAFB' }]}>
              <TextInput style={st.input} placeholder="Acme Inc." value={company} onChangeText={setCompany}
                placeholderTextColor="#9CA3AF" onFocus={() => setFocused('company')} onBlur={() => setFocused(null)} />
            </View>

            {/* Industry */}
            <Text style={[st.label, { marginTop: 16 }]}>Industry</Text>
            <TouchableOpacity onPress={() => setShowPicker(!showPicker)} 
              style={[st.inputWrap, { backgroundColor: showPicker ? '#FFF' : '#F9FAFB', borderColor: showPicker ? accentColor : '#E5E7EB' }]}>
              <Text style={[st.input, { color: industry ? '#09090B' : '#9CA3AF' }]}>{industry || 'Choose one'}</Text>
              <ChevronDown size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
            </TouchableOpacity>

            {showPicker && (
              <View style={st.pickerBox}>
                {INDUSTRIES.map((item, idx) => (
                  <TouchableOpacity key={item} onPress={() => { setIndustry(item); setShowPicker(false); }}
                    style={[st.pickerItem, industry === item && { backgroundColor: '#F9FAFB' }, idx < INDUSTRIES.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }]}>
                    <Text style={{ fontSize: 14, color: industry === item ? '#000' : '#374151', fontWeight: industry === item ? '700' : '400' }}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Website */}
            <Text style={[st.label, { marginTop: 16 }]}>Website <Text style={{ color: '#9CA3AF', fontWeight: '500' }}>(optional)</Text></Text>
            <View style={[st.inputWrap, { borderColor: focused === 'website' ? accentColor : '#E5E7EB', backgroundColor: focused === 'website' ? '#FFF' : '#F9FAFB' }]}>
              <TextInput style={st.input} placeholder="https://..." value={website} onChangeText={setWebsite} autoCapitalize="none" keyboardType="url"
                placeholderTextColor="#9CA3AF" onFocus={() => setFocused('website')} onBlur={() => setFocused(null)} />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 32, gap: 12 }}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
                <Text style={{ fontWeight: '700', fontSize: 16, color: '#374151' }}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} disabled={loading} style={st.submitBtn}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={st.submitText}>Continue</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA', overflow: 'hidden' },
  navBar: { position: 'absolute', top: 32, left: 32, zIndex: 10 },
  logo: { fontSize: 24, fontWeight: '900', color: '#09090B', letterSpacing: -0.5 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  formCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 24, padding: 40, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', shadowColor: '#000', shadowOffset: {width:0,height:16}, shadowOpacity: 0.05, shadowRadius: 40, maxWidth: 440, width: '100%', ...(IS_WEB ? { backdropFilter: 'blur(24px)' } : {}) },
  formTitle: { fontSize: 28, fontWeight: '900', color: '#09090B', letterSpacing: -0.75, marginBottom: 4 },
  formSub: { fontSize: 15, color: '#71717A', fontWeight: '400', marginBottom: 28 },
  label: { fontSize: 11, fontWeight: '700', color: '#52525B', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, height: 50, ...(IS_WEB ? { transition: 'all 0.2s ease' } : {}) },
  input: { flex: 1, paddingHorizontal: 14, fontSize: 15, color: '#09090B', ...(IS_WEB ? { outlineStyle: 'none' } : {}) },
  pickerBox: { backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 8, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: {width:0,height:4} },
  pickerItem: { paddingVertical: 14, paddingHorizontal: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  submitBtn: { flex: 1, height: 44, borderRadius: 12, backgroundColor: '#09090B', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width:0,height:4}, shadowOpacity: 0.2, shadowRadius: 8 },
  submitText: { color: '#FFF', fontSize: 15, fontWeight: '700' }
});

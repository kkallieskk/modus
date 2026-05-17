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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Briefcase, Globe, ChevronDown, Building2, ChevronRight } from 'lucide-react-native';

const INDUSTRIES = [
  'Premium Retail',
  'Fashion & Apparel',
  'Skincare & Beauty',
  'Tech & Gadgets',
  'Food & Beverage',
];

export const BrandSetupScreen = () => {
  const navigation = useNavigation<any>();
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!company.trim() || !industry) {
      Alert.alert('Required Fields', 'Please enter your company name and select an industry.');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No session found');

      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: company.trim(),
          industry,
          website_url: website.trim(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Navigate to main Brand screen — RootNavigator will pick it up
      navigation.replace('BrandRoot');
    } catch (err: any) {
      Alert.alert('Setup Failed', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View
          style={{
            backgroundColor: '#000',
            paddingHorizontal: 28,
            paddingTop: 80,
            paddingBottom: 40,
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <Building2 size={28} color="white" />
          </View>
          <Text style={{ color: 'white', fontSize: 32, fontWeight: '800', lineHeight: 38 }}>
            Set up your{'\n'}Brand Profile
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, marginTop: 10, lineHeight: 22 }}>
            This helps us curate the best creators for you.
          </Text>
        </View>

        <View style={{ padding: 28 }}>
          {/* Company Name */}
          <View style={{ marginBottom: 20 }}>
            <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">
              Company Name *
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
              <Briefcase size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-black text-base"
                placeholder="e.g. Nike India"
                value={company}
                onChangeText={setCompany}
              />
            </View>
          </View>

          {/* Industry Dropdown */}
          <View style={{ marginBottom: 20 }}>
            <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">
              Industry *
            </Text>
            <TouchableOpacity
              onPress={() => setShowPicker(!showPicker)}
              className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14"
            >
              <Briefcase size={20} color="#9CA3AF" />
              <Text className={`flex-1 ml-3 text-base ${industry ? 'text-black' : 'text-gray-400'}`}>
                {industry || 'Select your industry'}
              </Text>
              <ChevronDown size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {showPicker && (
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  marginTop: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 4,
                  overflow: 'hidden',
                }}
              >
                {INDUSTRIES.map((item, idx) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      setIndustry(item);
                      setShowPicker(false);
                    }}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      borderBottomWidth: idx < INDUSTRIES.length - 1 ? 1 : 0,
                      borderBottomColor: '#F3F4F6',
                      backgroundColor: industry === item ? '#F9FAFB' : 'white',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: industry === item ? '700' : '400',
                        color: industry === item ? '#000' : '#374151',
                      }}
                    >
                      {item}
                    </Text>
                    {industry === item && (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: '#000',
                          borderRadius: 10,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Website / Instagram */}
          <View style={{ marginBottom: 40 }}>
            <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">
              Website / Instagram URL
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
              <Globe size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-black text-base"
                placeholder="https://instagram.com/yourbrand"
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: '#000',
              height: 60,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 17 }}>
                  Explore Creators
                </Text>
                <ChevronRight size={20} color="white" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>

          <Text
            style={{
              textAlign: 'center',
              color: '#9CA3AF',
              fontSize: 11,
              marginTop: 16,
              lineHeight: 16,
            }}
          >
            You can always update these details from your Profile tab.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

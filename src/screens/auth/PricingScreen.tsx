import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';

export const PricingScreen = () => {
  const nav = useNavigation<any>();
  
  return (
    <View style={s.container}>
      {/* Nav */}
      <View style={s.nav}>
        <Text style={s.logo}>Modus.</Text>
        <View style={s.navRight}>
          <Pressable onPress={() => nav.navigate('Landing')} style={s.navCta}>
            <Text style={s.navCtaText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
      
      <View style={s.content}>
        <Pressable onPress={() => nav.navigate('Landing')} style={s.backBtn}>
          <ArrowLeft size={20} color="#000" />
          <Text style={s.backText}>Back to Home</Text>
        </Pressable>
        
        <Text style={s.title}>Pricing</Text>
        <Text style={s.subtitle}>This page is currently under construction. Stay tuned for updates on our Modus features!</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 60 : 20,
    height: 80,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF'
  },
  logo: { fontSize: 24, fontWeight: '900', letterSpacing: -1, color: '#0F172A' },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  navCta: { backgroundColor: '#000', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 100 },
  navCtaText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  content: { padding: Platform.OS === 'web' ? 80 : 24, maxWidth: 1200, alignSelf: 'center', width: '100%' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 40 },
  backText: { fontSize: 16, fontWeight: '600', color: '#000' },
  title: { fontSize: 48, fontWeight: '900', letterSpacing: -2, color: '#0F172A', marginBottom: 20 },
  subtitle: { fontSize: 18, color: '#64748B', lineHeight: 28 }
});

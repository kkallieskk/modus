import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Wallet, Globe, FileSignature, TrendingUp } from 'lucide-react-native';

export const ForCreatorsScreen = () => {
  const nav = useNavigation<any>();
  return (
    <View style={s.container}>
      <View style={{ position: 'absolute', top: 32, right: 32, zIndex: 99999, pointerEvents: 'box-none', alignItems: 'flex-end', justifyContent: 'flex-start' }}><LanguageSwitcher /></View>
      
      
      <View style={s.nav}>
        <Text style={s.logo}>Modus.</Text>
        <View style={s.navRight}>
          
          <Pressable onPress={() => nav.navigate('Landing')} style={s.navCta}>
            <Text style={s.navCtaText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.hero}>
          <View style={[s.badge, { backgroundColor: '#ECFCCB' }]}><Text style={[s.badgeText, { color: '#4D7C0F' }]}>FOR CREATORS</Text></View>
          <Text style={s.heroTitle}>Your Talent. Your Rules. Guaranteed Pay.</Text>
          <Text style={s.heroSub}>Stop waiting months for agencies to pay you. Get direct access to top D2C brands with Escrow-backed security.</Text>
          <Pressable onPress={() => nav.navigate('SignUp')} style={s.primaryBtn}><Text style={s.primaryBtnText}>Claim Your Profile</Text></Pressable>
        </View>
        <View style={s.grid}>
          <View style={s.card}>
            <View style={s.iconWrap}><Wallet size={24} color="#0F172A" /></View>
            <Text style={s.cardTitle}>Guaranteed Payouts</Text>
            <Text style={s.cardText}>No more chasing invoices. Brands lock the funds in Modus Escrow before you even start recording.</Text>
          </View>
          <View style={s.card}>
            <View style={s.iconWrap}><Globe size={24} color="#0F172A" /></View>
            <Text style={s.cardTitle}>Vernacular First</Text>
            <Text style={s.cardText}>English is not required here. Create content in Hindi, Tamil, Telugu, or Marathi and get matched with brands targeting your audience.</Text>
          </View>
          <View style={s.card}>
            <View style={s.iconWrap}><FileSignature size={24} color="#0F172A" /></View>
            <Text style={s.cardTitle}>Income Proof</Text>
            <Text style={s.cardText}>Every payout comes with a formal tax invoice and TDS certificate, building your financial footprint for future loans.</Text>
          </View>
          <View style={s.card}>
            <View style={s.iconWrap}><TrendingUp size={24} color="#0F172A" /></View>
            <Text style={s.cardTitle}>Direct Brand Access</Text>
            <Text style={s.cardText}>Skip the shady middleman agencies taking 40% cuts. Keep 100% of your negotiated rate with transparent tracking.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 60 : 20,
    height: 80,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    ...Platform.select({ web: { position: 'sticky', top: 0, zIndex: 50 } })
  },
  logo: { fontSize: 24, fontWeight: '900', letterSpacing: -1, color: '#0F172A' },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  navCta: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
  navCtaText: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  
  scroll: { padding: Platform.OS === 'web' ? 80 : 24, maxWidth: 1200, alignSelf: 'center', width: '100%', paddingBottom: 120 },
  
  hero: { alignItems: 'center', marginVertical: 40, paddingHorizontal: 20 },
  badge: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, marginBottom: 20 },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#4F46E5', letterSpacing: 1 },
  heroTitle: { fontSize: Platform.OS === 'web' ? 56 : 40, fontWeight: '900', letterSpacing: -2, color: '#0F172A', textAlign: 'center', lineHeight: Platform.OS === 'web' ? 64 : 48 },
  heroSub: { fontSize: 18, color: '#64748B', textAlign: 'center', marginTop: 16, maxWidth: 700, lineHeight: 28 },
  primaryBtn: { backgroundColor: '#0F172A', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 100, marginTop: 32 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  outlineBtn: { backgroundColor: 'transparent', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 100, marginTop: 'auto', borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center' },
  outlineBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 16 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 40, justifyContent: 'center' },
  card: { flex: 1, minWidth: Platform.OS === 'web' ? 320 : '100%', backgroundColor: '#FFFFFF', padding: 32, borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', ...Platform.select({ web: { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' } }) },
  iconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  cardText: { fontSize: 15, color: '#64748B', lineHeight: 24 },
  
  tierName: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  tierPrice: { fontSize: 40, fontWeight: '900', color: '#0F172A', marginBottom: 16, letterSpacing: -1 },
  tierMonth: { fontSize: 16, color: '#64748B', fontWeight: '600' },
  featureList: { marginTop: 24, marginBottom: 32, gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { fontSize: 15, fontWeight: '600', color: '#334155' }
});

import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check } from 'lucide-react-native';

export const PricingScreen = () => {
  const nav = useNavigation<any>();
  return (
    <View style={s.container}>
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
          <Text style={s.heroTitle}>Simple, Transparent Pricing</Text>
          <Text style={s.heroSub}>No hidden agency fees. Pay for software, not gatekeepers. Creators join for free.</Text>
        </View>
        
        <View style={s.grid}>
          <View style={s.card}>
            <Text style={s.tierName}>Starter</Text>
            <Text style={s.tierPrice}>₹4,999<Text style={s.tierMonth}>/mo</Text></Text>
            <Text style={s.cardText}>Perfect for small D2C brands doing a few campaigns.</Text>
            <View style={s.featureList}>
              {['Up to 5 active campaigns', 'Basic creator discovery', 'Chat & Negotiation', 'Standard Escrow'].map(f => (
                <View key={f} style={s.featureRow}><Check size={16} color="#10B981" /><Text style={s.featureText}>{f}</Text></View>
              ))}
            </View>
            <Pressable style={s.outlineBtn}><Text style={s.outlineBtnText}>Start Free Trial</Text></Pressable>
          </View>
          
          <View style={[s.card, { backgroundColor: '#0F172A', borderColor: '#0F172A' }]}>
            <View style={[s.badge, { backgroundColor: '#38BDF8', position: 'absolute', top: -16, alignSelf: 'center' }]}><Text style={s.badgeText}>MOST POPULAR</Text></View>
            <Text style={[s.tierName, { color: '#FFF' }]}>Pro</Text>
            <Text style={[s.tierPrice, { color: '#FFF' }]}>₹14,999<Text style={[s.tierMonth, { color: '#94A3B8' }]}>/mo</Text></Text>
            <Text style={[s.cardText, { color: '#94A3B8' }]}>For growing consumer brands scaling their creator network.</Text>
            <View style={s.featureList}>
              {['Unlimited campaigns', '194R TDS Automation', 'ASCI Compliance Engine', 'Advanced ROI Analytics'].map(f => (
                <View key={f} style={s.featureRow}><Check size={16} color="#38BDF8" /><Text style={[s.featureText, { color: '#FFF' }]}>{f}</Text></View>
              ))}
            </View>
            <Pressable style={[s.primaryBtn, { width: '100%', marginTop: 'auto' }]}><Text style={s.primaryBtnText}>Upgrade to Pro</Text></Pressable>
          </View>

          <View style={s.card}>
            <Text style={s.tierName}>Enterprise</Text>
            <Text style={s.tierPrice}>Custom</Text>
            <Text style={s.cardText}>For large agencies and enterprise marketing teams.</Text>
            <View style={s.featureList}>
              {['Dedicated Account Manager', 'Custom API Access', 'Whitelabel Reporting', 'Volume Escrow Discounts'].map(f => (
                <View key={f} style={s.featureRow}><Check size={16} color="#10B981" /><Text style={s.featureText}>{f}</Text></View>
              ))}
            </View>
            <Pressable style={s.outlineBtn}><Text style={s.outlineBtnText}>Contact Sales</Text></Pressable>
          </View>
        </View>
        <Text style={{textAlign: 'center', marginTop: 40, color: '#64748B', fontSize: 14}}>* A 5% platform GMV fee applies to all Escrow transactions.</Text>
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

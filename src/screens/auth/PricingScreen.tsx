import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check, X } from 'lucide-react-native';

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
          <View style={s.badge}><Text style={s.badgeText}>THE COMPLIANCE OS</Text></View>
          <Text style={s.heroTitle}>Stop paying 25% agency markups.</Text>
          <Text style={s.heroSub}>Traditional SaaS platforms charge ₹3 Lakhs/year. Agencies hide 25% markups. Modus is a Financial OS: you only pay for Escrow Trust and automated 194R Tax Compliance.</Text>
        </View>
        
        <View style={s.grid}>
          {/* Card 1 */}
          <View style={s.card}>
            <Text style={s.tierName}>Pay As You Go</Text>
            <Text style={s.tierPrice}>₹0<Text style={s.tierMonth}>/mo</Text></Text>
            <Text style={s.cardText}>For D2C brands running episodic campaigns (under ₹50k/mo).</Text>
            
            <View style={s.feeBox}>
              <Text style={s.feeLabel}>ESCROW & COMPLIANCE FEE</Text>
              <Text style={s.feeValue}>10% <Text style={s.feeSub}>per transaction</Text></Text>
            </View>

            <View style={s.featureList}>
              {['Creator Discovery Engine', 'Modus Escrow Protection', 'Automated 194R TDS Generation', 'Standard Analytics'].map(f => (
                <View key={f} style={s.featureRow}><Check size={16} color="#10B981" /><Text style={s.featureText}>{f}</Text></View>
              ))}
            </View>
            <Pressable style={s.outlineBtn}><Text style={s.outlineBtnText}>Start Free</Text></Pressable>
          </View>
          
          {/* Card 2 */}
          <View style={[s.card, { backgroundColor: '#0F172A', borderColor: '#0F172A' }]}>
            <View style={[s.badge, { backgroundColor: '#38BDF8', position: 'absolute', top: -16, alignSelf: 'center' }]}><Text style={[s.badgeText, {color: '#0369A1'}]}>MOST POPULAR</Text></View>
            <Text style={[s.tierName, { color: '#FFF' }]}>Growth</Text>
            <Text style={[s.tierPrice, { color: '#FFF' }]}>₹2,999<Text style={[s.tierMonth, { color: '#94A3B8' }]}>/mo</Text></Text>
            <Text style={[s.cardText, { color: '#94A3B8' }]}>For scaling brands spending over ₹75,000/month on creators.</Text>
            
            <View style={[s.feeBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={[s.feeLabel, { color: '#94A3B8' }]}>ESCROW & COMPLIANCE FEE</Text>
              <Text style={[s.feeValue, { color: '#FFF' }]}>6% <Text style={[s.feeSub, { color: '#94A3B8' }]}>per transaction</Text></Text>
            </View>

            <View style={s.featureList}>
              {['Unlimited Campaign Posts', 'Bulk Escrow Payouts (1-Click)', 'Real-time ROI Tracking', 'Priority Support'].map(f => (
                <View key={f} style={s.featureRow}><Check size={16} color="#38BDF8" /><Text style={[s.featureText, { color: '#FFF' }]}>{f}</Text></View>
              ))}
            </View>
            <Pressable style={[s.primaryBtn, { width: '100%', marginTop: 'auto', backgroundColor: '#FFF' }]}><Text style={[s.primaryBtnText, {color: '#0F172A'}]}>Upgrade to Growth</Text></Pressable>
          </View>

          {/* Card 3 */}
          <View style={s.card}>
            <Text style={s.tierName}>Agency / Enterprise</Text>
            <Text style={s.tierPrice}>Custom</Text>
            <Text style={s.cardText}>For high-volume marketing teams scaling across India.</Text>
            
            <View style={s.feeBox}>
              <Text style={s.feeLabel}>ESCROW & COMPLIANCE FEE</Text>
              <Text style={s.feeValue}>~3.5% <Text style={s.feeSub}>volume based</Text></Text>
            </View>

            <View style={s.featureList}>
              {['Dedicated Trust Officer', 'Custom API Access', 'Whitelabel PDF Reports', 'Custom Legal Contracts'].map(f => (
                <View key={f} style={s.featureRow}><Check size={16} color="#10B981" /><Text style={s.featureText}>{f}</Text></View>
              ))}
            </View>
            <Pressable style={s.outlineBtn}><Text style={s.outlineBtnText}>Contact Sales</Text></Pressable>
          </View>
        </View>

        <View style={s.creatorBanner}>
          <Text style={s.creatorBannerTitle}>What do Creators pay?</Text>
          <Text style={s.creatorBannerText}>Absolutely ₹0. Modus takes zero commission from creator earnings. Our mission is to empower Bharat's creators, ensuring they keep 100% of their negotiated rates.</Text>
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
  heroSub: { fontSize: 18, color: '#64748B', textAlign: 'center', marginTop: 16, maxWidth: 800, lineHeight: 28 },
  primaryBtn: { backgroundColor: '#0F172A', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 100, marginTop: 32, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  outlineBtn: { backgroundColor: 'transparent', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 100, marginTop: 'auto', borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center' },
  outlineBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 16 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 40, justifyContent: 'center' },
  card: { flex: 1, minWidth: Platform.OS === 'web' ? 320 : '100%', backgroundColor: '#FFFFFF', padding: 32, borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', ...Platform.select({ web: { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' } }) },
  
  tierName: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  tierPrice: { fontSize: 48, fontWeight: '900', color: '#0F172A', marginBottom: 8, letterSpacing: -2 },
  tierMonth: { fontSize: 16, color: '#64748B', fontWeight: '600', letterSpacing: 0 },
  cardText: { fontSize: 15, color: '#64748B', lineHeight: 22, marginBottom: 24 },
  
  feeBox: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, marginBottom: 24 },
  feeLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 1, marginBottom: 4 },
  feeValue: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  feeSub: { fontSize: 14, fontWeight: '600', color: '#64748B' },

  featureList: { marginBottom: 32, gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { fontSize: 15, fontWeight: '600', color: '#334155' },

  creatorBanner: { marginTop: 60, backgroundColor: '#ECFCCB', padding: 40, borderRadius: 24, alignItems: 'center' },
  creatorBannerTitle: { fontSize: 24, fontWeight: '900', color: '#3F6212', marginBottom: 12 },
  creatorBannerText: { fontSize: 16, color: '#4D7C0F', textAlign: 'center', maxWidth: 800, lineHeight: 24, fontWeight: '500' }
});

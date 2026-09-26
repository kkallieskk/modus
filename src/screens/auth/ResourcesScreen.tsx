import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookOpen, FileText, PlayCircle, Download } from 'lucide-react-native';

export const ResourcesScreen = () => {
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
          <Text style={s.heroTitle}>The Creator Economy Hub</Text>
          <Text style={s.heroSub}>Master compliance, discover growth strategies, and read case studies on how to scale influencer marketing in India.</Text>
        </View>
        <View style={s.grid}>
          <View style={s.card}>
            <View style={s.iconWrap}><FileText size={24} color="#0F172A" /></View>
            <Text style={s.badgeText}>COMPLIANCE GUIDE</Text>
            <Text style={[s.cardTitle, {marginTop: 8}]}>The Ultimate 194R Tax Guide for D2C Brands</Text>
            <Text style={s.cardText}>Understand when to deduct 10% TDS on creator payments and free product seeding under the new Income Tax guidelines.</Text>
            <Pressable onPress={() => alert('Feature coming soon!')} style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20}}>
              <Download size={16} color="#4F46E5" /><Text style={{color: '#4F46E5', fontWeight: 'bold'}}>Download PDF</Text>
            </Pressable>
          </View>
          <View style={s.card}>
            <View style={s.iconWrap}><BookOpen size={24} color="#0F172A" /></View>
            <Text style={s.badgeText}>CASE STUDY</Text>
            <Text style={[s.cardTitle, {marginTop: 8}]}>How Millet Magic Scaled with 50 Nano-Creators</Text>
            <Text style={s.cardText}>Learn how this organic food startup achieved a 4.5x ROAS by tapping into Tier 2 health influencers instead of expensive metro creators.</Text>
            <Pressable onPress={() => alert('Feature coming soon!')} style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20}}>
              <Text style={{color: '#4F46E5', fontWeight: 'bold'}}>Read Story</Text>
            </Pressable>
          </View>
          <View style={s.card}>
            <View style={s.iconWrap}><PlayCircle size={24} color="#0F172A" /></View>
            <Text style={s.badgeText}>CREATOR ACADEMY</Text>
            <Text style={[s.cardTitle, {marginTop: 8}]}>How to Price Your First Brand Collaboration</Text>
            <Text style={s.cardText}>A video masterclass for rural and regional creators on structuring rate cards, negotiating rights, and spotting bad contracts.</Text>
            <Pressable onPress={() => alert('Feature coming soon!')} style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20}}>
              <Text style={{color: '#4F46E5', fontWeight: 'bold'}}>Watch Video</Text>
            </Pressable>
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

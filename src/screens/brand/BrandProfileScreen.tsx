import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Building2, Settings, Sparkles, LogOut, ChevronRight, Edit2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '@/lib/ProfileContext';

export const BrandProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { profile, loading, refreshProfile } = useProfile();

  const brandColor = profile?.brand_color || '#8B5CF6';
  const softAuraTop = `${brandColor}2E`; // 0.18 opacity
  const softAuraBottom = `${brandColor}05`; // 0.02 opacity

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={brandColor} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Header Aura */}
        <LinearGradient
          colors={[softAuraTop, softAuraBottom]}
          style={styles.profileCard}
        >
          <View style={styles.avatarWrapper}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Building2 size={40} color="#9CA3AF" />
              </View>
            )}
          </View>
          <Text style={styles.companyName}>{profile?.display_name || 'Your Brand'}</Text>
          <Text style={[styles.industry, { color: brandColor }]}>{profile?.industry || 'No Industry Set'}</Text>
          <Text style={styles.bio}>{profile?.bio || 'No bio added yet.'}</Text>

          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: brandColor }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Edit2 size={16} color="white" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Menu */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AccountSettings')}
          >
            <Settings size={20} color="#374151" />
            <Text style={styles.menuLabel}>Account Settings</Text>
            <ChevronRight size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AccountSettings')}
          >
            <Sparkles size={20} color="#374151" />
            <Text style={styles.menuLabel}>Developer Tools</Text>
            <ChevronRight size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#DC2626" />
            <Text style={[styles.menuLabel, { color: '#DC2626' }]}>Log Out</Text>
            <ChevronRight size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  scroll: { padding: 20 },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 100, height: 100, borderRadius: 50, overflow: 'hidden', backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  avatar: { width: '100%', height: '100%' },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  companyName: { fontSize: 24, fontWeight: '800', color: '#000', marginBottom: 4, letterSpacing: -0.5 },
  industry: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
  bio: { fontSize: 15, color: '#4B5563', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#000', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 16,
  },
  editBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1F2937' },
});

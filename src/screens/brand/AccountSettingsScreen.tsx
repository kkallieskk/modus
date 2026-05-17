import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Bell, Shield, HelpCircle, LogOut, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react-native';

export const AccountSettingsScreen = () => {
  const [isBackfilling, setIsBackfilling] = useState(false);

  const handleTempBackfill = async () => {
    setIsBackfilling(true);
    try {
      const { data, error } = await supabase.functions.invoke('backfill-embeddings');
      if (error) throw new Error(error.message || 'Failed to execute Edge Function');
      Alert.alert('Success', data.message || 'Backfill complete.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsBackfilling(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => await supabase.auth.signOut() },
    ]);
  };

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
              const { error } = await supabase.rpc('delete_user_account');
              if (error) throw error;
              await supabase.auth.signOut();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not delete account.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Account</Text>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.card}>
            {[
              { icon: <Bell size={18} color="#6B7280" />, label: 'Notifications' },
              { icon: <Shield size={18} color="#6B7280" />, label: 'Privacy & Security' },
              { icon: <HelpCircle size={18} color="#6B7280" />, label: 'Help & Support' },
            ].map((item, i, arr) => (
              <View key={item.label}>
                <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Coming Soon', `${item.label} settings will be available soon.`)}>
                  <View style={styles.iconWrapper}>{item.icon}</View>
                  <Text style={styles.label}>{item.label}</Text>
                  <ChevronRight size={16} color="#D1D5DB" />
                </TouchableOpacity>
                {i < arr.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Dev Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Developer / Admin Tools</Text>
          <TouchableOpacity onPress={handleTempBackfill} disabled={isBackfilling} style={styles.devCard}>
            {isBackfilling ? <ActivityIndicator size="small" color="#8B5CF6" /> : <Sparkles size={20} color="#8B5CF6" />}
            <Text style={[styles.devLabel, { color: isBackfilling ? '#9CA3AF' : '#8B5CF6' }]}>
              {isBackfilling ? 'Backfilling Vectors...' : 'Run AI Backfill'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: '#DC2626' }]}>Danger Zone</Text>
          <View style={[styles.card, { borderColor: '#FEE2E2', borderWidth: 1.5 }]}>
            <TouchableOpacity onPress={handleLogout} style={styles.row}>
              <LogOut size={20} color="#DC2626" />
              <Text style={[styles.label, { color: '#DC2626', fontWeight: '700' }]}>Log Out</Text>
            </TouchableOpacity>
            
            <View style={{ height: 1, backgroundColor: '#FEE2E2' }} />
            
            <TouchableOpacity onPress={handleDeleteAccount} style={styles.row}>
              <AlertTriangle size={20} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={[styles.label, { color: '#DC2626', fontWeight: '700' }]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingBottom: 20 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#000', marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconWrapper: { width: 32, alignItems: 'center' },
  label: { flex: 1, fontSize: 15, color: '#374151', fontWeight: '500', marginLeft: 8 },
  divider: { height: 1, backgroundColor: '#F9FAFB', marginLeft: 48 },
  devCard: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', padding: 16, flexDirection: 'row', alignItems: 'center' },
  devLabel: { marginLeft: 12, fontWeight: '700' },
});

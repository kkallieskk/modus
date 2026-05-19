import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Briefcase, User, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const RoleSelectionScreen = () => {
  const navigation = useNavigation<any>();

  const selectRole = async (role: 'brand' | 'influencer') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update role in profiles and return details to verify if row exists
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id)
        .select();

      if (error) throw error;

      // Self-healing: if the profile row is missing from profiles table, the update affects 0 rows
      if (!data || data.length === 0) {
        console.warn('[RoleSelectionScreen] Profile row was missing from the database. Triggering automatic self-healing...');
        
        // Purge the out-of-sync auth record using SECURITY DEFINER rpc
        const { error: rpcError } = await supabase.rpc('delete_user_account');
        if (rpcError) console.error('[RoleSelectionScreen] RPC delete error:', rpcError);
        
        // Clear auth session
        await supabase.auth.signOut();
        
        const message = "Account Synced. Since you logged in with an existing account whose database profile was not properly initialized, we have automatically reset your session.\n\nPlease register a clean, fully-functioning profile to continue.";
        
        if (Platform.OS === 'web') {
          window.alert(message);
        } else {
          Alert.alert("Account Synced", message);
        }
        
        // Reset navigation to Auth Stack
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
        return;
      }

      if (role === 'brand') {
        navigation.navigate('BrandSetup');
      } else {
        navigation.navigate('CreatorOnboarding');
      }
    } catch (error) {
      console.error('Error selecting role:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How are you using Modus?</Text>
        <Text style={styles.subtitle}>Choose your path to get started.</Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* Brand Card */}
        <TouchableOpacity 
          onPress={() => selectRole('brand')}
          activeOpacity={0.8}
          style={styles.cardWrapper}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={styles.card}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#8B5CF615' }]}>
              <Briefcase size={32} color="#8B5CF6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I am a Brand</Text>
              <Text style={styles.cardDescription}>Hire top talent and launch viral campaigns.</Text>
            </View>
            <View style={styles.arrowContainer}>
              <ChevronRight size={20} color="#D1D5DB" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Creator Card */}
        <TouchableOpacity 
          onPress={() => selectRole('influencer')}
          activeOpacity={0.8}
          style={styles.cardWrapper}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={styles.card}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#10B98115' }]}>
              <User size={32} color="#10B981" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I am a Creator</Text>
              <Text style={styles.cardDescription}>Find exclusive deals and grow your brand.</Text>
            </View>
            <View style={styles.arrowContainer}>
              <ChevronRight size={20} color="#D1D5DB" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>You can change this later in settings.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 20,
  },
  cardWrapper: {
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: 12,
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});

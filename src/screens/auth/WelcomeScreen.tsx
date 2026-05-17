import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Briefcase, User, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const WelcomeScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.logoText}>Modus.</Text>
          <Text style={styles.title}>How are you using Modus?</Text>
          <Text style={styles.subtitle}>The elite creator economy platform.</Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Brand Card */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('SignUp', { role: 'brand' })}
            activeOpacity={0.8}
            style={styles.cardWrapper}
          >
            <LinearGradient
              colors={['#000000', '#1F2937']}
              style={styles.card}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF20' }]}>
                <Briefcase size={32} color="#FFFFFF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: '#FFF' }]}>I am a Brand</Text>
                <Text style={[styles.cardDescription, { color: '#9CA3AF' }]}>Hire elite talent and scale your content.</Text>
              </View>
              <View style={styles.arrowContainer}>
                <ChevronRight size={20} color="#4B5563" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Creator Card */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('SignUp', { role: 'influencer' })}
            activeOpacity={0.8}
            style={styles.cardWrapper}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F9FAFB']}
              style={styles.card}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#00000008' }]}>
                <User size={32} color="#000000" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>I am a Creator</Text>
                <Text style={styles.cardDescription}>Find brand deals and monetize your audience.</Text>
              </View>
              <View style={styles.arrowContainer}>
                <ChevronRight size={20} color="#D1D5DB" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.loginText}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    marginTop: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 20,
    marginTop: -40,
  },
  cardWrapper: {
    borderRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 28,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    marginBottom: 6,
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
    alignItems: 'center',
  },
  loginLink: {
    padding: 10,
  },
  footerText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  loginText: {
    color: '#000',
    fontWeight: '800',
  },
});

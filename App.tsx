import 'react-native-gesture-handler';
import "./global.css";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { 
  Platform, 
  View, 
  Text, 
  useWindowDimensions, 
  StyleSheet, 
  StatusBar 
} from 'react-native';
import { Sparkles, Shield, Compass, Cpu } from 'lucide-react-native';

import { ProfileProvider } from './src/lib/ProfileContext';

const linking = {
  prefixes: ['modus://', 'https://modus-kk-modus.vercel.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
          Login: 'login',
          SignUp: 'signup',
        },
      },
      RoleSelection: 'role-selection',
      BrandSetup: 'brand/setup',
      CreatorOnboarding: 'creator/onboarding',
      BrandRoot: 'brand',
      InfluencerRoot: 'creator',
      AdminRoot: 'admin',
    },
  },
};

export default function App() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWebDesktop = Platform.OS === 'web' && windowWidth > 768;

  const appContent = (
    <SafeAreaProvider>
      <ProfileProvider>
        <NavigationContainer linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </ProfileProvider>
    </SafeAreaProvider>
  );

  if (isWebDesktop) {
    return (
      <GestureHandlerRootView style={styles.webContainer}>
        {/* Animated Background Mesh Auras */}
        <View style={styles.meshTopRight} />
        <View style={styles.meshBottomLeft} />

        <View style={styles.webWrapper}>
          {/* Left Panel: Desktop Marketing & Features */}
          <View style={styles.infoPanel}>
            <View style={styles.logoRow}>
              <Text style={styles.logoText}>MODUS</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>PRODUCTION v1.2</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              Linking Creators &amp; Brands with High-Fidelity Precision.
            </Text>

            <Text style={styles.heroSub}>
              Experience secure automated escrows, live verified influencer metrics, and campaign brief builders compiled natively for both Web &amp; Mobile.
            </Text>

            {/* Premium Feature List */}
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconWrapper}>
                  <Shield size={18} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={styles.featureName}>Escrow-Protected Contracts</Text>
                  <Text style={styles.featureDesc}>Safeguarded creator milestones and brand campaign pools.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconWrapper}>
                  <Compass size={18} color="#0EA5E9" />
                </View>
                <View>
                  <Text style={styles.featureName}>Verified Performance Audits</Text>
                  <Text style={styles.featureDesc}>Real-time API metrics directly from verified platforms.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconWrapper}>
                  <Cpu size={18} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.featureName}>Unified Navigation Engine</Text>
                  <Text style={styles.featureDesc}>Dynamic browser-native deep-linking and state sync.</Text>
                </View>
              </View>
            </View>

            {/* Bottom Tag */}
            <View style={styles.footerRow}>
              <Sparkles size={16} color="#A78BFA" />
              <Text style={styles.footerText}>Secure SSL Authenticated Environment</Text>
            </View>
          </View>

          {/* Right Panel: Simulated Phone Viewport */}
          <View style={styles.phoneContainer}>
            <View style={styles.phoneGlow} />
            <View style={styles.bezelFrame}>
              <View style={styles.notch} />
              <View style={styles.phoneContent}>
                {appContent}
              </View>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }

  // Standard Render for Mobile/Tablet Web and Native Platforms
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {appContent}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#0b0d19',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  meshTopRight: {
    position: 'absolute',
    top: -150,
    right: -100,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    filter: 'blur(100px)',
  },
  meshBottomLeft: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    filter: 'blur(80px)',
  },
  webWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 80,
    width: '100%',
    maxWidth: 1280,
    paddingHorizontal: 40,
  },
  infoPanel: {
    flex: 1,
    maxWidth: 500,
    gap: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  badge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A78BFA',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 52,
    letterSpacing: -1.5,
  },
  heroSub: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
  },
  featureList: {
    gap: 20,
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A78BFA',
  },
  phoneContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneGlow: {
    position: 'absolute',
    width: 440,
    height: 870,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    filter: 'blur(30px)',
    zIndex: -1,
  },
  bezelFrame: {
    width: 420,
    height: 850,
    borderRadius: 38,
    backgroundColor: '#0F172A',
    borderWidth: 10,
    borderColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
  },
  notch: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -60 }],
    width: 120,
    height: 28,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#1E293B',
    zIndex: 9999,
  },
  phoneContent: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});


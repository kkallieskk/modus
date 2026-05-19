import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
  Animated,
  Easing,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Sparkles, ShieldCheck, Banknote, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Marquee = () => {
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -SCREEN_WIDTH,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const items = [
    'META INTEGRATED', 'INSTAGRAM VERIFIED', 'TIKTOK CREATORS',
    '$2.4M+ PAYOUTS', '1-CLICK AUDITS', 'NO AGENCIES',
  ];

  return (
    <View style={styles.marqueeContainer}>
      <Animated.View style={[styles.marqueeContent, { transform: [{ translateX: scrollX }] }]}>
        {[...items, ...items, ...items].map((text, i) => (
          <View key={i} style={styles.marqueeItem}>
            <Text style={styles.marqueeText}>{text}</Text>
            <View style={styles.marqueeDot} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const FeatureBlock = ({ reverse, title, subtitle, imageUrl, icon: Icon }: any) => {
  return (
    <View style={[styles.featureBlock, reverse && styles.featureBlockReverse]}>
      <View style={styles.featureTextContainer}>
        <View style={styles.featureIconContainer}>
          <Icon size={24} color="#A3E635" />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.featureImageContainer}>
        <View style={styles.glassCard}>
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.featureImage} 
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
};

export const LandingScreen = () => {
  const navigation = useNavigation<any>();
  const [heroHovered, setHeroHovered] = useState(false);
  const heroTilt = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heroTilt, {
      toValue: heroHovered ? 1 : 0,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [heroHovered]);

  const dashboardRotateX = heroTilt.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });
  const dashboardRotateY = heroTilt.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-5deg'],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      
      {/* SECTION 1: HERO */}
      <View style={styles.heroSection}>
        <View style={styles.heroHeader}>
          <Text style={styles.logo}>Modus.</Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Log In</Text>
          </Pressable>
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroHeadline}>The new standard for creator commerce.</Text>
          <Text style={styles.heroSubheadline}>
            Modus connects elite brands with verified creators. No agencies. No inflated metrics. Just pure performance.
          </Text>

          <View style={styles.heroButtons}>
            <Pressable 
              style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.8 }]}
              onPress={() => navigation.navigate('SignUp', { role: 'brand' })}
            >
              <Text style={styles.primaryButtonText}>I am a Brand</Text>
              <ChevronRight size={20} color="#000" />
            </Pressable>

            <Pressable 
              style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.8 }]}
              onPress={() => navigation.navigate('SignUp', { role: 'influencer' })}
            >
              <Text style={styles.secondaryButtonText}>I am a Creator</Text>
              <ChevronRight size={20} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* Dashboard 3D Mockup */}
        <Pressable
          onHoverIn={() => setHeroHovered(true)}
          onHoverOut={() => setHeroHovered(false)}
          onPressIn={() => setHeroHovered(true)}
          onPressOut={() => setHeroHovered(false)}
          style={styles.heroMockupContainer}
        >
          <Animated.View style={[
            styles.heroMockupWrapper,
            { transform: [{ perspective: 1000 }, { rotateX: dashboardRotateX }, { rotateY: dashboardRotateY }] }
          ]}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070' }} 
              style={styles.heroDashboardImage} 
            />
            <LinearGradient
              colors={['transparent', '#0A0A0A']}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        </Pressable>
      </View>

      {/* SECTION 2: SOCIAL PROOF MARQUEE */}
      <Marquee />

      {/* SECTION 3: DUAL ENGINE FEATURES */}
      <View style={styles.featuresSection}>
        <FeatureBlock 
          title="Hire on verified data, not vibes."
          subtitle="Our 1-Click AI Auditing Engine pulls real Instagram API follower counts and engagement metrics. Say goodbye to fake influence."
          icon={ShieldCheck}
          imageUrl="https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=2070"
          reverse={false}
        />
        <FeatureBlock 
          title="Stop chasing invoices. Get Escrowed."
          subtitle="Funds are secured upfront. Once deliverables are met, the smart contract pays out instantly. Zero payment anxiety."
          icon={Banknote}
          imageUrl="https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070"
          reverse={true}
        />
      </View>

      {/* SECTION 4: KINETIC FOOTER */}
      <View style={styles.footerSection}>
        <Text style={styles.footerHeadline}>Ready to scale?</Text>
        <Pressable 
          style={({ pressed }) => [styles.glowingButton, pressed && { opacity: 0.8 }]}
          onPress={() => navigation.navigate('Welcome')}
        >
          <Text style={styles.glowingButtonText}>Start Building</Text>
          <ArrowRight size={24} color="#000" style={{ marginLeft: 8 }} />
        </Pressable>
        
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>Privacy Policy</Text>
          <Text style={styles.footerLink}>Terms of Service</Text>
          <Text style={styles.footerLink}>Contact</Text>
          <Text style={styles.footerLink}>Twitter / X</Text>
          <Text style={styles.footerLink}>Instagram</Text>
        </View>
        <Text style={styles.copyright}>© 2026 Modus, Inc.</Text>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  // HERO
  heroSection: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    minHeight: SCREEN_HEIGHT * 0.9,
  },
  heroHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 60,
    maxWidth: 1200,
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  loginText: {
    color: '#A3E635',
    fontSize: 16,
    fontWeight: '600',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 800,
    zIndex: 10,
  },
  heroHeadline: {
    fontSize: Platform.OS === 'web' ? 72 : 48,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: -2,
    lineHeight: Platform.OS === 'web' ? 80 : 54,
    marginBottom: 24,
  },
  heroSubheadline: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
    maxWidth: 600,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#A3E635',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
  },
  secondaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  heroMockupContainer: {
    marginTop: -40,
    width: '100%',
    maxWidth: 1000,
    height: 400,
    zIndex: 1,
    alignItems: 'center',
  },
  heroMockupWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroDashboardImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  // MARQUEE
  marqueeContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 20,
    backgroundColor: '#0A0A0A',
    overflow: 'hidden',
    marginTop: 40,
  },
  marqueeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marqueeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marqueeText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  marqueeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#374151',
    marginHorizontal: 32,
  },
  // FEATURES
  featuresSection: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  featureBlock: {
    flexDirection: Platform.OS === 'web' && SCREEN_WIDTH > 768 ? 'row' : 'column',
    alignItems: 'center',
    maxWidth: 1200,
    width: '100%',
    marginBottom: 80,
    gap: 40,
  },
  featureBlockReverse: {
    flexDirection: Platform.OS === 'web' && SCREEN_WIDTH > 768 ? 'row-reverse' : 'column',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -1,
    marginBottom: 16,
  },
  featureSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
  },
  featureImageContainer: {
    flex: 1,
    width: '100%',
    aspectRatio: 4/3,
  },
  glassCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    padding: 8,
  },
  featureImage: {
    flex: 1,
    borderRadius: 16,
    opacity: 0.8,
  },
  // FOOTER
  footerSection: {
    minHeight: SCREEN_HEIGHT * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#050505',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerHeadline: {
    fontSize: Platform.OS === 'web' ? 80 : 48,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -2,
    marginBottom: 40,
    textAlign: 'center',
  },
  glowingButton: {
    backgroundColor: '#A3E635',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 48,
    borderRadius: 100,
    shadowColor: '#A3E635',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 80,
  },
  glowingButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '800',
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
  },
  footerLink: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  copyright: {
    color: '#4B5563',
    fontSize: 12,
  },
});

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Briefcase, User, ChevronRight, TrendingUp, Camera, CheckCircle2, Shield, Star, Award, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const TrustMarquee = () => {
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -SCREEN_WIDTH,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const logos = [
    { Icon: Star, name: 'Vogue' },
    { Icon: Shield, name: 'Nike' },
    { Icon: Award, name: 'Sephora' },
    { Icon: Zap, name: 'Spotify' },
    { Icon: CheckCircle2, name: 'Glossier' },
  ];

  return (
    <View style={styles.marqueeWrapper}>
      <Text style={styles.marqueeTitle}>Trusted by elite brands and top-tier creators</Text>
      <View style={styles.marqueeContainer}>
        <Animated.View style={[styles.marqueeContent, { transform: [{ translateX: scrollX }] }]}>
          {/* Double the logos to create seamless loop */}
          {[...logos, ...logos, ...logos].map((logo, index) => (
            <View key={index} style={styles.marqueeItem}>
              <logo.Icon size={20} color="#9CA3AF" />
              <Text style={styles.marqueeText}>{logo.name}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
};

const RoleCard = ({ 
  title, 
  description, 
  Icon, 
  BackgroundIcon,
  onPress 
}: { 
  title: string, 
  description: string, 
  Icon: any, 
  BackgroundIcon: any,
  onPress: () => void 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isHovered ? 1.02 : 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: isHovered ? -5 : 0,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isHovered]);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPressIn={() => setIsHovered(true)}
      onPressOut={() => setIsHovered(false)}
    >
      <Animated.View style={[
        styles.cardWrapper,
        {
          transform: [{ scale }, { translateY }],
          shadowColor: isHovered ? '#6366f1' : '#000',
          shadowOpacity: isHovered ? 0.3 : 0.1,
          elevation: isHovered ? 12 : 6,
        }
      ]}>
        <LinearGradient
          colors={['#111827', '#1F2937']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, isHovered && styles.cardHovered]}
        >
          {/* Subtle Background Icon */}
          <View style={styles.cardBgIcon}>
            <BackgroundIcon size={120} color="#FFFFFF08" strokeWidth={1} />
          </View>
          
          <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF15' }]}>
            <Icon size={32} color="#FFFFFF" />
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </View>
          
          <View style={styles.arrowContainer}>
            <ChevronRight size={20} color={isHovered ? "#FFFFFF" : "#6B7280"} />
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

export const WelcomeScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Subtle Animated Mesh-like Background using Multiple Gradients */}
      <LinearGradient
        colors={['#f8fafc', '#e0e7ff', '#f3e8ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.glassContainer}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.logoText}>Modus.</Text>
            <Text style={styles.title}>How are you using Modus?</Text>
            <Text style={styles.subtitle}>Welcome to the elite creator economy. Choose how you want to grow.</Text>
          </View>

          <View style={styles.cardsContainer}>
            <RoleCard
              title="I am a Brand"
              description="Launch campaigns, hire verified creators, and scale UGC."
              Icon={Briefcase}
              BackgroundIcon={TrendingUp}
              onPress={() => navigation.navigate('SignUp', { role: 'brand' })}
            />
            
            <RoleCard
              title="I am a Creator"
              description="Access premium brand deals, bypass the noise, and get paid securely."
              Icon={User}
              BackgroundIcon={Camera}
              onPress={() => navigation.navigate('SignUp', { role: 'influencer' })}
            />
          </View>

          <View style={styles.bottomSection}>
            <TrustMarquee />
            
            <Pressable 
              onPress={() => navigation.navigate('Login')}
              style={({ pressed }) => [styles.loginLink, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.footerText}>
                Already have an account? <Text style={styles.loginText}>Log In</Text>
              </Text>
            </Pressable>
          </View>
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
  glassContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
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
    color: '#4B5563',
    marginTop: 12,
    fontWeight: '500',
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 20,
    marginTop: 20,
  },
  cardWrapper: {
    borderRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  cardHovered: {
    borderColor: '#4F46E5',
  },
  cardBgIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: 12,
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
  },
  marqueeWrapper: {
    width: SCREEN_WIDTH,
    marginBottom: 30,
    alignItems: 'center',
    overflow: 'hidden',
  },
  marqueeTitle: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 16,
  },
  marqueeContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  marqueeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marqueeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    opacity: 0.6,
  },
  marqueeText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  loginLink: {
    padding: 10,
  },
  footerText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  loginText: {
    color: '#000',
    fontWeight: '800',
  },
});

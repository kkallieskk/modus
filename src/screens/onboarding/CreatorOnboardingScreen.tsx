import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { 
  Instagram, 
  Video, 
  Check, 
  Image as ImageIcon, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  Star,
  AlertCircle
} from 'lucide-react-native';
import { Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '@/lib/ProfileContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NICHES = ['Fashion', 'Tech', 'Comedy', 'Fitness', 'UGC', 'Beauty', 'Gaming', 'Travel', 'Food'];

export const CreatorOnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const { refreshProfile } = useProfile();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Form State
  const [socials, setSocials] = useState({
    instagram: false,
    tiktok: false,
  });
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<(string | null)[]>([null, null, null]);
  const [isFinishing, setIsFinishing] = useState(false);

  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter(n => n !== niche));
    } else if (selectedNiches.length < 3) {
      setSelectedNiches([...selectedNiches, niche]);
    }
  };

  const mockConnect = (platform: 'instagram' | 'tiktok') => {
    setSocials({ ...socials, [platform]: true });
  };

  const handleFinish = async () => {
    try {
      setIsFinishing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update profile with onboarding data
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          niche_industry: selectedNiches.join(', '),
          // For now we just mock the rest
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile to trigger RootNavigator re-render
      await refreshProfile();
    } catch (error) {
      console.error('Error finishing onboarding:', error);
    } finally {
      setIsFinishing(false);
    }
  };

  const handlePortfolioTap = (index: number) => {
    Alert.alert(
      "Portfolio Slot " + (index + 1),
      "In a real app, this would open your camera roll. For this demo, let's assume you've selected a high-quality asset!",
      [{ text: "Verified", style: "default" }]
    );
    // Mock setting an image
    const newPortfolio = [...portfolio];
    newPortfolio[index] = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format";
    setPortfolio(newPortfolio);
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Connect Your Platforms</Text>
        <Text style={styles.stepSubtitle}>Verify your influence and let brands see your reach.</Text>
      </View>

      <View style={styles.socialContainer}>
        <TouchableOpacity 
          onPress={() => mockConnect('instagram')}
          style={[styles.socialButton, socials.instagram && styles.socialButtonActive]}
        >
          <Instagram size={24} color={socials.instagram ? '#E1306C' : '#000'} />
          <View style={styles.socialContent}>
            <Text style={styles.socialLabel}>Instagram</Text>
            {socials.instagram ? (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color="#059669" />
                <Text style={styles.verifiedText}>15.2K Followers Verified</Text>
              </View>
            ) : (
              <Text style={styles.socialSubtext}>Tap to connect</Text>
            )}
          </View>
          {socials.instagram && <Check size={20} color="#059669" />}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => mockConnect('tiktok')}
          style={[styles.socialButton, socials.tiktok && styles.socialButtonActive]}
        >
          <Video size={24} color={socials.tiktok ? '#EE1D52' : '#000'} />
          <View style={styles.socialContent}>
            <Text style={styles.socialLabel}>TikTok</Text>
            {socials.tiktok ? (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color="#059669" />
                <Text style={styles.verifiedText}>84.1K Followers Verified</Text>
              </View>
            ) : (
              <Text style={styles.socialSubtext}>Tap to connect</Text>
            )}
          </View>
          {socials.tiktok && <Check size={20} color="#059669" />}
        </TouchableOpacity>
      </View>

      <View style={styles.securityNote}>
        <ShieldCheck size={16} color="#6B7280" />
        <Text style={styles.securityNoteText}>We use read-only access to verify metrics. Your credentials are never stored.</Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Define Your Style</Text>
        <Text style={styles.stepSubtitle}>Select up to 3 categories that best describe your content.</Text>
      </View>

      <View style={styles.nichesGrid}>
        {NICHES.map(niche => {
          const isSelected = selectedNiches.includes(niche);
          return (
            <TouchableOpacity
              key={niche}
              onPress={() => toggleNiche(niche)}
              activeOpacity={0.7}
              style={[
                styles.nichePill,
                isSelected && styles.nichePillActive
              ]}
            >
              <Text style={[
                styles.nicheText,
                isSelected && styles.nicheTextActive
              ]}>{niche}</Text>
              {isSelected && <Check size={14} color="#FFF" style={{ marginLeft: 6 }} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Show Us Your Best Work</Text>
        <Text style={styles.stepSubtitle}>Upload your top 3 pieces of content to showcase your portfolio.</Text>
      </View>

      <View style={styles.portfolioGrid}>
        {portfolio.map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.portfolioSlot}
            activeOpacity={0.8}
            onPress={() => handlePortfolioTap(index)}
          >
            {item ? (
              <Image source={{ uri: item }} style={styles.portfolioImage} />
            ) : (
              <View style={styles.slotEmpty}>
                <Plus size={24} color="#9CA3AF" />
                <Text style={styles.slotText}>Slot {index + 1}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tipBox}>
        <Star size={18} color="#F59E0B" />
        <Text style={styles.tipText}>Pro Tip: Creators with video portfolios get 3x more hires.</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${(step / totalSteps) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>Step {step} of {totalSteps}</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.navigation}>
        {step > 1 && (
          <TouchableOpacity 
            onPress={() => setStep(step - 1)}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={() => {
            if (step < totalSteps) {
              setStep(step + 1);
            } else {
              handleFinish();
            }
          }}
          disabled={isFinishing}
          style={[styles.nextButton, step === 1 && { marginLeft: 'auto' }]}
        >
          {isFinishing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.nextText}>
                {step === totalSteps ? 'Launch My Profile' : 'Next Step'}
              </Text>
              <ArrowRight size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stepContainer: {
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 22,
    fontWeight: '500',
  },
  socialContainer: {
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  socialButtonActive: {
    borderColor: '#000',
    backgroundColor: '#FFFFFF',
  },
  socialContent: {
    flex: 1,
    marginLeft: 16,
  },
  socialLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  socialSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 4,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
  },
  securityNoteText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
    lineHeight: 16,
  },
  nichesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nichePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  nichePillActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  nicheText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  nicheTextActive: {
    color: '#FFF',
  },
  portfolioGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  portfolioSlot: {
    flex: 1,
    aspectRatio: 3/4,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  slotEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 8,
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  tipText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  backButton: {
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  nextButton: {
    flex: 1,
    height: 64,
    backgroundColor: '#000',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  nextText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
});

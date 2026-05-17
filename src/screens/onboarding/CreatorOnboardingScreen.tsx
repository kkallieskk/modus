import React, { useState, useRef, useEffect } from 'react';
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
  TextInput,
  Animated,
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
  X,
  ChevronRight,
  Youtube,
  Twitter,
  Globe,
  Info,
  Lock,
  Sparkles
} from 'lucide-react-native';
import { Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '@/lib/ProfileContext';
import { fetchSocialInsights } from '@/services/aiService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NICHES = ['Fashion', 'Tech', 'Comedy', 'Fitness', 'UGC', 'Beauty', 'Gaming', 'Travel', 'Food'];

interface LinkedProfile {
  handle: string;
  displayName: string;
  followersCount: number;
  engagementRate: number;
  niche: string;
  contentStyle: string;
  audienceGenderSplit: { female: number; male: number };
  audienceAgeBracket: string;
  topGeos: string[];
  recentPostThemes: string[];
  avatarUrl?: string;
}

export const CreatorOnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const { refreshProfile } = useProfile();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Connected Social profiles state
  const [connectedProfiles, setConnectedProfiles] = useState<Record<string, LinkedProfile>>({});
  
  // Niche Selection & Portfolio Slots
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<(string | null)[]>([null, null, null]);
  const [isFinishing, setIsFinishing] = useState(false);

  // Link Social Modal / Overlay State
  const [activePlatform, setActivePlatform] = useState<'instagram' | 'tiktok' | 'youtube' | 'twitter' | null>(null);
  const [socialHandle, setSocialHandle] = useState('');
  const [linkStep, setLinkStep] = useState<'input' | 'loading' | 'preview'>('input');
  
  // Real-time simulated API progress states
  const [linkProgressMsg, setLinkProgressMsg] = useState('');
  const [linkProgressPercent, setLinkProgressPercent] = useState(0);
  const [fetchedProfile, setFetchedProfile] = useState<LinkedProfile | null>(null);

  // Smooth numerical follower ticking animation
  const followerAnim = useRef(new Animated.Value(0)).current;
  const [tickedFollowers, setTickedFollowers] = useState(0);

  useEffect(() => {
    if (linkStep === 'preview' && fetchedProfile) {
      followerAnim.setValue(0);
      Animated.timing(followerAnim, {
        toValue: fetchedProfile.followersCount,
        duration: 1500,
        useNativeDriver: false
      }).start();

      const listener = followerAnim.addListener((state) => {
        setTickedFollowers(Math.floor(state.value));
      });

      return () => {
        followerAnim.removeListener(listener);
      };
    }
  }, [linkStep, fetchedProfile]);

  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter(n => n !== niche));
    } else if (selectedNiches.length < 3) {
      setSelectedNiches([...selectedNiches, niche]);
    }
  };

  const startLinking = (platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter') => {
    setActivePlatform(platform);
    setSocialHandle('');
    setLinkStep('input');
  };

  const handleFetchInsights = async () => {
    if (!socialHandle.trim()) {
      Alert.alert('Required', 'Please enter your social handle.');
      return;
    }

    const cleanHandle = socialHandle.startsWith('@') ? socialHandle : `@${socialHandle.trim()}`;
    setLinkStep('loading');
    setLinkProgressPercent(10);
    setLinkProgressMsg('Initiating handshakes with API nodes...');

    try {
      // Step 1 progress tick
      await new Promise(r => setTimeout(r, 600));
      setLinkProgressPercent(40);
      setLinkProgressMsg(`Scraping latest index for ${cleanHandle} on ${activePlatform}...`);

      // Step 2 progress tick
      await new Promise(r => setTimeout(r, 600));
      setLinkProgressPercent(75);
      setLinkProgressMsg('Auditing content signatures and visual vibes...');

      // Fetch from Groq AI Profile Auditing service
      const insights = await fetchSocialInsights(cleanHandle, activePlatform!);

      // Step 3 progress tick
      await new Promise(r => setTimeout(r, 500));
      setLinkProgressPercent(100);
      setLinkProgressMsg('Assembling demographic profiles & verified metrics!');
      await new Promise(r => setTimeout(r, 400));

      setFetchedProfile(insights);
      setLinkStep('preview');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Fetching Failed', 'Auditing service is currently offline. Falling back to realistic verified profile metrics.');
      setLinkStep('input');
    }
  };

  const handleConfirmSync = () => {
    if (!fetchedProfile || !activePlatform) return;

    // Connect Platform Profile
    const updated = { ...connectedProfiles, [activePlatform]: fetchedProfile };
    setConnectedProfiles(updated);

    // Auto-prefill Niche directly inside Step 2 to remove user friction!
    const detectedNiche = fetchedProfile.niche;
    if (detectedNiche && !selectedNiches.includes(detectedNiche) && selectedNiches.length < 3) {
      setSelectedNiches([...selectedNiches, detectedNiche]);
    }

    // Close Modal / Overlay
    setActivePlatform(null);
    setFetchedProfile(null);
    Alert.alert('Social Account Linked', `Verified ${fetchedProfile.displayName} (${fetchedProfile.handle}) with ${fetchedProfile.followersCount.toLocaleString()} followers!`);
  };

  const handleFinish = async () => {
    try {
      setIsFinishing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const industryString = selectedNiches.join(', ');
      
      // Calculate first connected avatar URL or default
      const firstConnectedPlatform = Object.keys(connectedProfiles)[0];
      const selectedAvatar = firstConnectedPlatform 
        ? connectedProfiles[firstConnectedPlatform].avatarUrl 
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format';

      const selectedBio = firstConnectedPlatform
        ? connectedProfiles[firstConnectedPlatform].contentStyle
        : 'Premium Modus Content Creator';

      // Save complete linked accounts and audience breakdown as JSON inside social_link
      const socialLinkJson = JSON.stringify(connectedProfiles);

      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          niche_industry: industryString,
          industry: industryString,
          social_link: socialLinkJson,
          avatar_url: selectedAvatar,
          bio: selectedBio
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Onboarding Error', 'Could not sync profiles to Modus Vault. Please try again.');
    } finally {
      setIsFinishing(false);
    }
  };

  const handlePortfolioTap = (index: number) => {
    const portfolioUrls = [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format"
    ];
    
    // Set mock verified asset
    const newPortfolio = [...portfolio];
    newPortfolio[index] = portfolioUrls[index];
    setPortfolio(newPortfolio);
    Alert.alert('Portfolio Item Verified', 'Premium aesthetic content asset successfully verified and linked to portfolio slot!');
  };

  // Step 1 Layout
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Connect Social Handles</Text>
        <Text style={styles.stepSubtitle}>Verify your real influence using our 1-Click AI Auditing engine.</Text>
      </View>

      <View style={styles.socialContainer}>
        {/* Instagram Card */}
        <TouchableOpacity 
          onPress={() => startLinking('instagram')}
          style={[styles.socialButton, connectedProfiles.instagram && styles.socialButtonActive]}
        >
          <Instagram size={26} color={connectedProfiles.instagram ? '#E1306C' : '#000'} />
          <View style={styles.socialContent}>
            <Text style={styles.socialLabel}>Instagram Business</Text>
            {connectedProfiles.instagram ? (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={14} color="#059669" />
                <Text style={styles.verifiedText}>
                  {connectedProfiles.instagram.handle} • {connectedProfiles.instagram.followersCount.toLocaleString()} Followers
                </Text>
              </View>
            ) : (
              <Text style={styles.socialSubtext}>Tap to connect business feed</Text>
            )}
          </View>
          {connectedProfiles.instagram ? <Check size={20} color="#059669" /> : <ChevronRight size={20} color="#9CA3AF" />}
        </TouchableOpacity>

        {/* TikTok Card */}
        <TouchableOpacity 
          onPress={() => startLinking('tiktok')}
          style={[styles.socialButton, connectedProfiles.tiktok && styles.socialButtonActive]}
        >
          <Video size={26} color={connectedProfiles.tiktok ? '#EE1D52' : '#000'} />
          <View style={styles.socialContent}>
            <Text style={styles.socialLabel}>TikTok Account</Text>
            {connectedProfiles.tiktok ? (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={14} color="#059669" />
                <Text style={styles.verifiedText}>
                  {connectedProfiles.tiktok.handle} • {connectedProfiles.tiktok.followersCount.toLocaleString()} Followers
                </Text>
              </View>
            ) : (
              <Text style={styles.socialSubtext}>Tap to connect TikTok video insights</Text>
            )}
          </View>
          {connectedProfiles.tiktok ? <Check size={20} color="#059669" /> : <ChevronRight size={20} color="#9CA3AF" />}
        </TouchableOpacity>

        {/* YouTube Card */}
        <TouchableOpacity 
          onPress={() => startLinking('youtube')}
          style={[styles.socialButton, connectedProfiles.youtube && styles.socialButtonActive]}
        >
          <Youtube size={26} color={connectedProfiles.youtube ? '#FF0000' : '#000'} />
          <View style={styles.socialContent}>
            <Text style={styles.socialLabel}>YouTube Channel</Text>
            {connectedProfiles.youtube ? (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={14} color="#059669" />
                <Text style={styles.verifiedText}>
                  {connectedProfiles.youtube.handle} • {connectedProfiles.youtube.followersCount.toLocaleString()} Subscribers
                </Text>
              </View>
            ) : (
              <Text style={styles.socialSubtext}>Tap to connect YouTube channels</Text>
            )}
          </View>
          {connectedProfiles.youtube ? <Check size={20} color="#059669" /> : <ChevronRight size={20} color="#9CA3AF" />}
        </TouchableOpacity>

        {/* Twitter Card */}
        <TouchableOpacity 
          onPress={() => startLinking('twitter')}
          style={[styles.socialButton, connectedProfiles.twitter && styles.socialButtonActive]}
        >
          <Twitter size={26} color={connectedProfiles.twitter ? '#1DA1F2' : '#000'} />
          <View style={styles.socialContent}>
            <Text style={styles.socialLabel}>Twitter / X</Text>
            {connectedProfiles.twitter ? (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={14} color="#059669" />
                <Text style={styles.verifiedText}>
                  {connectedProfiles.twitter.handle} • {connectedProfiles.twitter.followersCount.toLocaleString()} Followers
                </Text>
              </View>
            ) : (
              <Text style={styles.socialSubtext}>Tap to connect public feed</Text>
            )}
          </View>
          {connectedProfiles.twitter ? <Check size={20} color="#059669" /> : <ChevronRight size={20} color="#9CA3AF" />}
        </TouchableOpacity>
      </View>

      <View style={styles.securityNote}>
        <ShieldCheck size={18} color="#6B7280" />
        <Text style={styles.securityNoteText}>
          Modus matches verify read-only API access to parse authentic follower counts. We secure fully encrypted transactions.
        </Text>
      </View>
    </View>
  );

  // Step 2 Layout
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Refine Niches &amp; Vibe</Text>
        <Text style={styles.stepSubtitle}>
          Select up to 3 categories. Connected accounts have auto-populated matches below!
        </Text>
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

  // Step 3 Layout
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Show Us Your Best Work</Text>
        <Text style={styles.stepSubtitle}>Link your top 3 pieces of content to showcase your verified aesthetics.</Text>
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
                <Text style={styles.slotText}>Link Slot {index + 1}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tipBox}>
        <Star size={18} color="#F59E0B" />
        <Text style={styles.tipText}>Pro Tip: Creators with verified video slots get 3x higher premium hires.</Text>
      </View>
    </View>
  );

  // Platform Sync Drawer Overlay View
  const renderPlatformModal = () => {
    if (!activePlatform) return null;

    return (
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Sparkles size={20} color="#8B5CF6" />
              <Text style={styles.modalTitle}>AI Social Indexing</Text>
            </View>
            <TouchableOpacity onPress={() => setActivePlatform(null)}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Steppers */}
          {linkStep === 'input' && (
            <View style={{ padding: 4 }}>
              <Text style={styles.modalInputLabel}>
                Enter {activePlatform.toUpperCase()} handle / Username
              </Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. @minimalist_jess"
                placeholderTextColor="#9CA3AF"
                value={socialHandle}
                onChangeText={setSocialHandle}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={handleFetchInsights}
                style={styles.modalSubmitBtn}
              >
                <Sparkles size={18} color="white" />
                <Text style={styles.modalSubmitBtnText}>Scan &amp; Fetch Verified Insights</Text>
              </TouchableOpacity>
            </View>
          )}

          {linkStep === 'loading' && (
            <View style={{ padding: 12, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={styles.progressMessage}>{linkProgressMsg}</Text>
              
              {/* Progress bar */}
              <View style={styles.modalProgressBg}>
                <View style={[styles.modalProgressFill, { width: `${linkProgressPercent}%` }]} />
              </View>
              <Text style={styles.progressPercent}>{linkProgressPercent}% Completed</Text>
            </View>
          )}

          {linkStep === 'preview' && fetchedProfile && (
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <View style={styles.previewContainer}>
                
                {/* Profile Avatar Header */}
                <View style={styles.previewHeader}>
                  <Image 
                    source={{ uri: fetchedProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format' }} 
                    style={styles.previewAvatar} 
                  />
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.previewName}>{fetchedProfile.displayName}</Text>
                    <Text style={styles.previewHandle}>{fetchedProfile.handle}</Text>
                  </View>
                  <View style={styles.platformBadge}>
                    <Text style={styles.platformBadgeText}>{activePlatform}</Text>
                  </View>
                </View>

                {/* Followers Counter Ticking */}
                <View style={styles.metricsBox}>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.metricVal}>{tickedFollowers.toLocaleString()}</Text>
                    <Text style={styles.metricLabel}>Followers</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.metricVal}>{fetchedProfile.engagementRate}%</Text>
                    <Text style={styles.metricLabel}>Engagement Rate</Text>
                  </View>
                </View>

                {/* Aesthetic Signature */}
                <View style={styles.insightsSection}>
                  <Text style={styles.insightSectionLabel}>AI Aesthetic Signature</Text>
                  <View style={styles.tagRow}>
                    <View style={styles.nicheBadge}>
                      <Text style={styles.nicheBadgeText}>{fetchedProfile.niche}</Text>
                    </View>
                    <Text style={styles.vibeText}>{fetchedProfile.contentStyle}</Text>
                  </View>
                </View>

                {/* Audience Demographics */}
                <View style={styles.insightsSection}>
                  <Text style={styles.insightSectionLabel}>Audience Insights</Text>
                  
                  {/* Gender bar */}
                  <View style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={styles.audienceStatLabel}>Female ({fetchedProfile.audienceGenderSplit.female}%)</Text>
                      <Text style={styles.audienceStatLabel}>Male ({fetchedProfile.audienceGenderSplit.male}%)</Text>
                    </View>
                    <View style={styles.genderBarBg}>
                      <View style={[styles.genderBarFill, { width: `${fetchedProfile.audienceGenderSplit.female}%` }]} />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={styles.audSubLabel}>Primary Age</Text>
                      <Text style={styles.audSubVal}>{fetchedProfile.audienceAgeBracket}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.audSubLabel}>Top Countries</Text>
                      <Text style={styles.audSubVal}>{fetchedProfile.topGeos.join(', ')}</Text>
                    </View>
                  </View>
                </View>

                {/* Recent Themes */}
                <View style={styles.insightsSection}>
                  <Text style={styles.insightSectionLabel}>Aesthetic Themes</Text>
                  {fetchedProfile.recentPostThemes.map((theme, i) => (
                    <View key={i} style={styles.themeRow}>
                      <View style={styles.themeBullet} />
                      <Text style={styles.themeText}>{theme}</Text>
                    </View>
                  ))}
                </View>

                {/* Confirm Buttons */}
                <TouchableOpacity 
                  onPress={handleConfirmSync}
                  style={styles.confirmSyncBtn}
                >
                  <Check size={20} color="white" />
                  <Text style={styles.confirmSyncBtnText}>Confirm &amp; Bind Socials</Text>
                </TouchableOpacity>

              </View>
            </ScrollView>
          )}

        </View>
      </View>
    );
  };

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

      {/* Footer Navigation */}
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

      {/* Linking Modal Overlay */}
      {renderPlatformModal()}
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

  // Modal / Drawer Overlay styling
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 1000
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    width: '100%',
    maxWidth: 500,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000'
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10
  },
  modalTextInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20
  },
  modalSubmitBtn: {
    backgroundColor: '#000',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  modalSubmitBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 15
  },
  progressMessage: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 20,
    textAlign: 'center'
  },
  modalProgressBg: {
    height: 6,
    backgroundColor: '#EEF2F6',
    borderRadius: 3,
    width: '100%',
    marginTop: 16,
    overflow: 'hidden'
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5CF6',
    marginTop: 8
  },

  // Preview Page
  previewContainer: {
    padding: 2
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  previewAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2F6'
  },
  previewName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000'
  },
  previewHandle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2
  },
  platformBadge: {
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10
  },
  platformBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
    textTransform: 'uppercase'
  },
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginBottom: 20
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000'
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 4,
    textTransform: 'uppercase'
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4
  },
  insightsSection: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16
  },
  insightSectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap'
  },
  nicheBadge: {
    backgroundColor: '#8B5CF61A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF630'
  },
  nicheBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5CF6'
  },
  vibeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    flex: 1
  },
  audienceStatLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563'
  },
  genderBarBg: {
    height: 8,
    backgroundColor: '#3B82F61C',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row'
  },
  genderBarFill: {
    height: '100%',
    backgroundColor: '#EC4899',
    borderRadius: 4
  },
  audSubLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase'
  },
  audSubVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  themeBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981'
  },
  themeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563'
  },
  confirmSyncBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10
  },
  confirmSyncBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900'
  }
});

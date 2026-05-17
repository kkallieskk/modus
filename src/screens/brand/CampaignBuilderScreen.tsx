import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
  StyleSheet,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  X, 
  Sparkles, 
  Wand2, 
  Brain, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft,
  Check,
  Target,
  Layers,
  Shield,
  Clock,
  Instagram,
  Youtube,
  Link2,
  Users,
  Camera,
  Tv
} from 'lucide-react-native';
import { parseCampaignSummary } from '@/services/aiService';
import { useProfile } from '@/lib/ProfileContext';
import { supabase } from '@/lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ShimmerSkeleton = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={{ gap: 12 }}>
      <Animated.View style={{ height: 16, width: '100%', backgroundColor: '#E5E7EB', borderRadius: 4, opacity }} />
      <Animated.View style={{ height: 16, width: '90%', backgroundColor: '#E5E7EB', borderRadius: 4, opacity }} />
      <Animated.View style={{ height: 16, width: '95%', backgroundColor: '#E5E7EB', borderRadius: 4, opacity }} />
    </View>
  );
};

export const CampaignBuilderScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const brandColor = profile?.brand_color || '#8B5CF6';

  // Wizard state: step 0 (Fork selection) to step 4
  const [step, setStep] = useState(0);
  const [campaignType, setCampaignType] = useState<'ugc' | 'influencer' | null>(null);
  
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // STEP 1 State: Objectives & Audience
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('Brand Awareness');
  const [audience, setAudience] = useState('');

  // STEP 2 State A: UGC (Content Only) dynamic fields
  const [ugcQuantity, setUgcQuantity] = useState(2);
  const [ugcAspectRatio, setUgcAspectRatio] = useState('9:16 Vertical');
  const [includeRawFootage, setIncludeRawFootage] = useState(true);
  const [hookVariations, setHookVariations] = useState(true);
  const [usageRights, setUsageRights] = useState('Digital Ads for 30 Days');

  // STEP 2 State B: Influencer Collab (Post to Feed) dynamic fields
  const [platforms, setPlatforms] = useState<string[]>(['Instagram']);
  const [format, setFormat] = useState('Reel');
  const [influencerTier, setInfluencerTier] = useState('Micro');
  const [linkInBioRequired, setLinkInBioRequired] = useState(false);
  const [linkInBioDuration, setLinkInBioDuration] = useState('24 Hours');
  const [discountCode, setDiscountCode] = useState('');

  // STEP 3 State: Creative Guardrails (Shared)
  const [hooks, setHooks] = useState('');
  const [talkingPoints, setTalkingPoints] = useState('');
  const [dos, setDos] = useState('');
  const [donts, setDonts] = useState('');

  // STEP 4 State: Legal, Logistics, Visibility & Escrow Budget (Shared)
  const [productLogistics, setProductLogistics] = useState('Shipping product directly');
  const [draftDeadline, setDraftDeadline] = useState('7 Days');
  const [goLiveDeadline, setGoLiveDeadline] = useState('14 Days');
  const [budget, setBudget] = useState('15000');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [isSaving, setIsSaving] = useState(false);

  // Suggested budget ranges calculation
  useEffect(() => {
    if (campaignType === 'ugc') {
      // Suggest flat rate per video asset (suggesting ₹7,500 per video standard)
      const baseSuggest = ugcQuantity * 7500;
      setBudget(String(baseSuggest));
    } else if (campaignType === 'influencer') {
      // Minimum suggested budget based on influencer creator tiers
      if (influencerTier === 'Nano') setBudget('5000');
      else if (influencerTier === 'Micro') setBudget('15000');
      else if (influencerTier === 'Mid-Tier') setBudget('50000');
    }
  }, [campaignType, ugcQuantity, influencerTier]);

  const togglePlatform = (p: string) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter(x => x !== p));
      }
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const nextStep = () => {
    if (step === 0) {
      if (!campaignType) {
        Alert.alert('Required', 'Please select a campaign type to continue.');
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!title.trim()) {
        Alert.alert('Required', 'Please enter a campaign name.');
        return;
      }
      if (!audience.trim()) {
        Alert.alert('Required', 'Please target demographics for the creators.');
        return;
      }
    }

    if (step === 3) {
      if (!hooks.trim()) {
        Alert.alert('Required', 'Hook direction is mandatory for creative guardrails.');
        return;
      }
      if (!talkingPoints.trim()) {
        Alert.alert('Required', 'Talking points are mandatory for creative guardrails.');
        return;
      }
    }

    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleAiFastTrack = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAiLoading(true);
    setAiError(null);
    try {
      const result = await parseCampaignSummary(aiPrompt);
      
      // Auto-determine campaign type fork
      if (result.campaignType === 'ugc' || result.campaignType === 'influencer') {
        setCampaignType(result.campaignType);
      } else {
        setCampaignType('influencer'); // fallback default
      }

      // Shared fields prefill
      if (result.title) setTitle(result.title);
      if (result.goal) setGoal(result.goal);
      if (result.audience) setAudience(result.audience);
      if (result.hooks) setHooks(result.hooks);
      if (result.talkingPoints) setTalkingPoints(result.talkingPoints);
      if (result.dos) setDos(result.dos);
      if (result.donts) setDonts(result.donts);
      if (result.draftDeadline) setDraftDeadline(result.draftDeadline);
      if (result.goLiveDeadline) setGoLiveDeadline(result.goLiveDeadline);

      // UGC prefill
      if (result.ugcQuantity) setUgcQuantity(result.ugcQuantity);
      if (result.ugcAspectRatio) setUgcAspectRatio(result.ugcAspectRatio);
      if (typeof result.includeRawFootage === 'boolean') setIncludeRawFootage(result.includeRawFootage);
      if (typeof result.hookVariations === 'boolean') setHookVariations(result.hookVariations);
      if (result.usageRights) setUsageRights(result.usageRights);

      // Influencer prefill
      if (result.platforms && Array.isArray(result.platforms)) setPlatforms(result.platforms);
      if (result.format) setFormat(result.format);
      if (result.influencerTier) setInfluencerTier(result.influencerTier);
      if (typeof result.linkInBioRequired === 'boolean') setLinkInBioRequired(result.linkInBioRequired);
      if (result.linkInBioDuration) setLinkInBioDuration(result.linkInBioDuration);
      if (result.discountCode) setDiscountCode(result.discountCode);

      if (result.budget) setBudget(String(result.budget));

      setShowAiInput(false);
      Alert.alert('AI Prefill Success', `Identified as a premium ${result.campaignType === 'ugc' ? 'UGC Video' : 'Influencer Collab'} campaign. We populated the entire wizard!`);
    } catch (err: any) {
      console.error('AI Fast-Track parsing error:', err);
      setAiError(err.message || "AI parsing failed. Try clarifying the goal or platforms.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!budget) {
      Alert.alert('Required', 'Please enter your campaign budget.');
      return;
    }

    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication session closed');

      // Save complete parameters into metadata brand_guidelines text object
      const structuredGuidelines = JSON.stringify({
        campaignType,
        goal,
        audience,
        hooks,
        talkingPoints,
        dos,
        donts,
        productLogistics,
        draftDeadline,
        goLiveDeadline,
        // UGC parameters
        ugcQuantity,
        ugcAspectRatio,
        includeRawFootage,
        hookVariations,
        usageRights,
        // Influencer parameters
        platforms,
        format,
        influencerTier,
        linkInBioRequired,
        linkInBioDuration,
        discountCode
      });

      const deliverable_type = campaignType === 'ugc'
        ? `${ugcQuantity}x UGC Video Assets (${ugcAspectRatio})`
        : `${format} on ${platforms.join(', ')} (${influencerTier} tier)`;

      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          brand_id: user.id,
          title: title,
          brand_guidelines: structuredGuidelines,
          budget: parseInt(budget),
          deliverable_type,
          guardrails: [hooks, talkingPoints],
          status: 'draft',
          visibility,
          vibe: goal
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      navigation.navigate('CreatorSelection', { 
        campaign_id: campaign.id, 
        campaign_title: campaign.title,
        budget: campaign.budget 
      });

    } catch (err: any) {
      console.error('Error saving campaign:', err);
      Alert.alert('Save Failed', err.message || 'Could not compile campaign. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 0: The Initial Campaign Fork
  const renderStep0 = () => (
    <View>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Choose Campaign Pathway</Text>
        <Text style={styles.stepSubtitle}>Hit this fork in the road to adapt your dynamic fields.</Text>
      </View>

      <View style={{ gap: 20 }}>
        {/* Card A: UGC (Content Only) */}
        <TouchableOpacity
          onPress={() => {
            setCampaignType('ugc');
            setStep(1);
          }}
          style={[
            styles.forkCard,
            campaignType === 'ugc' && { borderColor: brandColor, backgroundColor: brandColor + '08' }
          ]}
        >
          <View style={[styles.forkIconContainer, { backgroundColor: '#EEF2F6' }]}>
            <Camera size={26} color="#000" />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.forkTitle}>UGC (Content Only)</Text>
            <Text style={styles.forkSubtitle}>"I need videos to use on my own ads and website."</Text>
            <View style={styles.forkTag}>
              <Sparkles size={12} color="#4F46E5" />
              <Text style={styles.forkTagText}>Follower count doesn't matter. Buying the video asset.</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Card B: Influencer Collab (Post to Feed) */}
        <TouchableOpacity
          onPress={() => {
            setCampaignType('influencer');
            setStep(1);
          }}
          style={[
            styles.forkCard,
            campaignType === 'influencer' && { borderColor: brandColor, backgroundColor: brandColor + '08' }
          ]}
        >
          <View style={[styles.forkIconContainer, { backgroundColor: '#EEF2F6' }]}>
            <Tv size={26} color="#000" />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.forkTitle}>Influencer Collab (Post to Feed)</Text>
            <Text style={styles.forkSubtitle}>"I want creators to post on their own social media."</Text>
            <View style={styles.forkTag}>
              <Users size={12} color="#059669" />
              <Text style={[styles.forkTagText, { color: '#047857' }]}>Reach new audiences. Buying access to followers.</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 1: Objectives & Audience
  const renderStep1 = () => (
    <View>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Objectives &amp; Audience</Text>
        <Text style={styles.stepSubtitle}>Identify what objectives and target demographics this strategy tackles.</Text>
      </View>

      {!showAiInput ? (
        <TouchableOpacity 
          onPress={() => setShowAiInput(true)}
          style={[styles.aiToggleCard, { backgroundColor: brandColor + '0A', borderColor: brandColor + '1E' }]}
        >
          <View style={[styles.aiIconBadge, { backgroundColor: brandColor }]}>
            <Sparkles size={18} color="white" />
          </View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={{ color: '#000', fontWeight: '900', fontSize: 15 }}>AI Fast-Track Drafter</Text>
            <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>Describe in 2 sentences to prefill both pathway fields.</Text>
          </View>
          <ChevronRight size={20} color={brandColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.aiCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Brain size={22} color={brandColor} />
              <Text style={{ fontWeight: '900', marginLeft: 10, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1, color: brandColor }}>AI Fast-Track Drafter</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAiInput(false)}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.aiTextarea}
            placeholder="Type 2 sentences, e.g., 'We want to promote our sleep mist on TikTok with raw routine Reels. Target audience is busy professionals who struggle to sleep.'"
            placeholderTextColor="#9CA3AF"
            value={aiPrompt}
            onChangeText={(val) => {
              setAiPrompt(val);
              if (aiError) setAiError(null);
            }}
            multiline
          />

          {aiError && (
            <Text style={styles.errorText}>{aiError}</Text>
          )}
          
          <TouchableOpacity 
            onPress={handleAiFastTrack}
            disabled={isAiLoading}
            style={[styles.aiSubmitBtn, { opacity: isAiLoading ? 0.7 : 1 }]}
          >
            <Sparkles size={18} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '900', marginLeft: 10, fontSize: 16 }}>AI Fast-Track Prefill</Text>
          </TouchableOpacity>
        </View>
      )}

      {isAiLoading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={brandColor} />
          <Text style={{ fontSize: 14, fontWeight: '800', color: brandColor, marginLeft: 10 }}>AI is parsing and structuring your brief...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Campaign Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Lavender Sleep Mist Launch"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Campaign Goal</Text>
        <View style={styles.dropdownContainer}>
          {['Brand Awareness', 'User Acquisition', 'Engagement', 'Sales Conversion'].map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGoal(g)}
              style={[
                styles.dropdownItem,
                goal === g && { backgroundColor: brandColor + '10', borderColor: brandColor }
              ]}
            >
              <Target size={16} color={goal === g ? brandColor : '#6B7280'} />
              <Text style={[styles.dropdownItemText, goal === g && { color: brandColor, fontWeight: '800' }]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Target Audience Demographics</Text>
        <TextInput
          style={[styles.textInput, { minHeight: 100, textAlignVertical: 'top' }]}
          placeholder="e.g. Gen Z skincare enthusiasts, busy working professionals aged 25-40."
          multiline
          value={audience}
          onChangeText={setAudience}
        />
      </View>
    </View>
  );

  // Step 2 A: UGC Dynamic Fields Setup
  const renderUgcStep2 = () => (
    <View>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>UGC Asset Requirements</Text>
        <Text style={styles.stepSubtitle}>Identify what content assets you are purchasing from the creator.</Text>
      </View>

      {/* Asset Quantity */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Asset Quantity</Text>
        <View style={styles.stepperContainer}>
          <TouchableOpacity 
            onPress={() => setUgcQuantity(Math.max(1, ugcQuantity - 1))}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{ugcQuantity}</Text>
          <TouchableOpacity 
            onPress={() => setUgcQuantity(ugcQuantity + 1)}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>+</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 14, color: '#6B7280', fontWeight: '600', marginLeft: 8 }}>
            Videos Purchased
          </Text>
        </View>
      </View>

      {/* Aspect Ratio */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Aspect Ratio</Text>
        <View style={styles.dropdownContainer}>
          {['9:16 Vertical', '16:9 Horizontal', '1:1 Square'].map((ratio) => (
            <TouchableOpacity
              key={ratio}
              onPress={() => setUgcAspectRatio(ratio)}
              style={[
                styles.dropdownItem,
                ugcAspectRatio === ratio && { backgroundColor: brandColor + '10', borderColor: brandColor }
              ]}
            >
              <Layers size={16} color={ugcAspectRatio === ratio ? brandColor : '#6B7280'} />
              <Text style={[styles.dropdownItemText, ugcAspectRatio === ratio && { color: brandColor, fontWeight: '800' }]}>
                {ratio}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* UGC Add-ons Checklist */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>UGC Specific Add-Ons</Text>
        
        {/* Raw Footage */}
        <View style={styles.switchContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Include Raw B-Roll / Footage</Text>
            <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>So your team editors can chop it up later for ad variants.</Text>
          </View>
          <Switch
            value={includeRawFootage}
            onValueChange={setIncludeRawFootage}
            trackColor={{ false: '#D1D5DB', true: brandColor }}
            thumbColor="#FFF"
          />
        </View>

        {/* Hook Variations */}
        <View style={styles.switchContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Hook Variations (A/B Test intros)</Text>
            <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Shoot 1 main video, but film 3 different 5-second intros.</Text>
          </View>
          <Switch
            value={hookVariations}
            onValueChange={setHookVariations}
            trackColor={{ false: '#D1D5DB', true: brandColor }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      {/* Usage Rights */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Usage Rights License</Text>
        <View style={{ gap: 12 }}>
          {['Digital Ads for 30 Days', 'Digital Ads for 90 Days', 'Perpetual / Full Buyout'].map((right) => (
            <TouchableOpacity
              key={right}
              onPress={() => setUsageRights(right)}
              style={[
                styles.visibilityCard,
                usageRights === right && { borderColor: '#000', backgroundColor: '#F9FAFB' }
              ]}
            >
              <View style={[
                styles.radioDot,
                usageRights === right && { borderColor: brandColor, backgroundColor: brandColor }
              ]}>
                {usageRights === right && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' }} />}
              </View>
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={styles.visibilityLabel}>{right}</Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  {right === 'Perpetual / Full Buyout' ? 'Brand owns the creative asset completely forever.' : 'Rights to distribute on social ad accounts for specified duration.'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Suggested Flat-Rate budget ranges */}
      <View style={styles.suggestionBanner}>
        <Text style={styles.suggestionTitle}>💰 Suggested UGC Flat-Rate Escrow</Text>
        <Text style={styles.suggestionSubtitle}>
          UGC asset values are flat rates. We suggest ₹7,500 - ₹15,000 per asset. Recommended: ₹{(ugcQuantity * 7500).toLocaleString()} - ₹{(ugcQuantity * 15000).toLocaleString()}.
        </Text>
      </View>
    </View>
  );

  // Step 2 B: Influencer Collab Dynamic Fields Setup
  const renderInfluencerStep2 = () => (
    <View>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Influencer Reach &amp; Platform</Text>
        <Text style={styles.stepSubtitle}>Identify where the campaign goes live to build direct audiences.</Text>
      </View>

      {/* Platforms */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Target Platforms</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[
            { name: 'Instagram', icon: <Instagram size={18} color="#E1306C" /> },
            { name: 'TikTok', icon: <Link2 size={18} color="#000" /> },
            { name: 'YouTube', icon: <Youtube size={18} color="#FF0000" /> }
          ].map((p) => {
            const active = platforms.includes(p.name);
            return (
              <TouchableOpacity
                key={p.name}
                onPress={() => togglePlatform(p.name)}
                style={[
                  styles.platformBtn,
                  active && { borderColor: '#000', backgroundColor: '#F9FAFB' }
                ]}
              >
                {p.icon}
                <Text style={[styles.platformText, active && { fontWeight: '800', color: '#000' }]}>{p.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Format */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Format</Text>
        <View style={styles.dropdownContainer}>
          {['Reel', 'Short', 'Video', 'Story', 'Static Post'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFormat(f)}
              style={[
                styles.dropdownItem,
                format === f && { backgroundColor: brandColor + '10', borderColor: brandColor }
              ]}
            >
              <Layers size={16} color={format === f ? brandColor : '#6B7280'} />
              <Text style={[styles.dropdownItemText, format === f && { color: brandColor, fontWeight: '800' }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Creator Reach Tier */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Target Creator Tier</Text>
        <View style={{ gap: 12 }}>
          {[
            { type: 'Nano', label: 'Nano Tier (1k-10k followers)', desc: 'Extremely high niche engagement & micro-trust conversions.' },
            { type: 'Micro', label: 'Micro Tier (10k-50k followers)', desc: 'Perfect balance of reach, affordability, and high trust.' },
            { type: 'Mid-Tier', label: 'Mid-Tier (50k+ followers)', desc: 'High visual velocity, huge audience expansion, and visual scale.' }
          ].map((tier) => (
            <TouchableOpacity
              key={tier.type}
              onPress={() => setInfluencerTier(tier.type)}
              style={[
                styles.visibilityCard,
                influencerTier === tier.type && { borderColor: '#000', backgroundColor: '#F9FAFB' }
              ]}
            >
              <View style={[
                styles.radioDot,
                influencerTier === tier.type && { borderColor: brandColor, backgroundColor: brandColor }
              ]}>
                {influencerTier === tier.type && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' }} />}
              </View>
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={styles.visibilityLabel}>{tier.label}</Text>
                <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{tier.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Link & Bio logistics */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Link &amp; Bio Logistics</Text>
        
        {/* Link in bio Switch */}
        <View style={styles.switchContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Required Tracking Link in Bio</Text>
            <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Does creator need to host your discount referral link in bio?</Text>
          </View>
          <Switch
            value={linkInBioRequired}
            onValueChange={setLinkInBioRequired}
            trackColor={{ false: '#D1D5DB', true: brandColor }}
            thumbColor="#FFF"
          />
        </View>

        {linkInBioRequired && (
          <View style={{ paddingLeft: 12, paddingBottom: 16 }}>
            <Text style={styles.inputLabel}>Link Duration</Text>
            <View style={styles.dropdownContainer}>
              {['24 Hours', '7 Days', '30 Days'].map((dur) => (
                <TouchableOpacity
                  key={dur}
                  onPress={() => setLinkInBioDuration(dur)}
                  style={[
                    styles.dropdownItem,
                    linkInBioDuration === dur && { backgroundColor: brandColor + '10', borderColor: brandColor }
                  ]}
                >
                  <Clock size={14} color={linkInBioDuration === dur ? brandColor : '#6B7280'} />
                  <Text style={[styles.dropdownItemText, linkInBioDuration === dur && { color: brandColor, fontWeight: '800' }]}>{dur}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Promo code input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Dedicated Promo Code</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. LAVENDER15 (Assigned to creators to say in videos)"
            value={discountCode}
            onChangeText={setDiscountCode}
          />
        </View>
      </View>

      {/* Suggested minimum budgeting based on creator tiers */}
      <View style={[styles.suggestionBanner, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
        <Text style={[styles.suggestionTitle, { color: '#1D4ED8' }]}>💰 Suggested Influencer Escrow Minimum</Text>
        <Text style={[styles.suggestionSubtitle, { color: '#1E40AF' }]}>
          {influencerTier === 'Nano' && "Nano tier suggested minimum: ₹5,000 - ₹15,000 per post."}
          {influencerTier === 'Micro' && "Micro tier suggested minimum: ₹15,000 - ₹45,000 per post."}
          {influencerTier === 'Mid-Tier' && "Mid-Tier suggested minimum: ₹50,000+ per post."}
        </Text>
      </View>
    </View>
  );

  // Step 3: Creative Guardrails
  const renderStep3 = () => (
    <View>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Creative Guardrails</Text>
        <Text style={styles.stepSubtitle}>Establish rules and directions (mandatory fields).</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Required Hook Idea *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Show product application within first 3 seconds with text overlay."
          value={hooks}
          onChangeText={setHooks}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Key Talking Points *</Text>
        <TextInput
          style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
          placeholder="e.g. Lavender essential oil helps with natural relaxation, lightweight mist formula."
          multiline
          value={talkingPoints}
          onChangeText={setTalkingPoints}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Do's (Highly Encouraged)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Speak naturally, showcase aesthetic lighting."
          value={dos}
          onChangeText={setDos}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Don'ts (Forbidden Rules)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Don't show competitors' bottles or messy desks."
          value={donts}
          onChangeText={setDonts}
        />
      </View>
    </View>
  );

  // Step 4: Product Logistics & Deadlines
  const renderStep4 = () => (
    <View>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Logistics &amp; Deadlines</Text>
        <Text style={styles.stepSubtitle}>Identify product logistics and due dates.</Text>
      </View>

      {/* Product Delivery logistics */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Product Handshake</Text>
        <View style={{ gap: 12 }}>
          {[
            'Shipping product directly',
            'Providing free pickup promo code',
            'No physical product needed'
          ].map((way) => (
            <TouchableOpacity
              key={way}
              onPress={() => setProductLogistics(way)}
              style={[
                styles.dropdownItem,
                productLogistics === way && { backgroundColor: brandColor + '10', borderColor: brandColor }
              ]}
            >
              <Text style={[styles.dropdownItemText, productLogistics === way && { color: brandColor, fontWeight: '800' }]}>{way}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Draft Review Deadline */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Draft Review Deadline</Text>
        <View style={styles.dropdownContainer}>
          {['3 Days', '7 Days', '14 Days'].map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDraftDeadline(d)}
              style={[
                styles.dropdownItem,
                draftDeadline === d && { backgroundColor: brandColor + '10', borderColor: brandColor }
              ]}
            >
              <Clock size={16} color={draftDeadline === d ? brandColor : '#6B7280'} />
              <Text style={[styles.dropdownItemText, draftDeadline === d && { color: brandColor, fontWeight: '800' }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Go Live Deadline */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Campaign Go-Live Deadline</Text>
        <View style={styles.dropdownContainer}>
          {['7 Days', '14 Days', '30 Days'].map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGoLiveDeadline(g)}
              style={[
                styles.dropdownItem,
                goLiveDeadline === g && { backgroundColor: brandColor + '10', borderColor: brandColor }
              ]}
            >
              <Clock size={16} color={goLiveDeadline === g ? brandColor : '#6B7280'} />
              <Text style={[styles.dropdownItemText, goLiveDeadline === g && { color: brandColor, fontWeight: '800' }]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: 24 }} />

      <View style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 24 }}>
        <Text style={styles.stepTitle}>Visibility &amp; Investment</Text>
        <Text style={styles.stepSubtitle}>Determine how creators find and charge your brief.</Text>
      </View>

      {/* Visibility */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Campaign Visibility</Text>
        <View style={{ gap: 12 }}>
          {[
            { type: 'private', label: 'Private Campaign', desc: 'Only creators you explicitly invite can participate.' },
            { type: 'public', label: 'Public Casting Call', desc: 'Publish to the Casting Board marketplace for applications.' }
          ].map((v) => {
            const active = visibility === v.type;
            return (
              <TouchableOpacity
                key={v.type}
                onPress={() => setVisibility(v.type as 'public' | 'private')}
                style={[
                  styles.visibilityCard,
                  active && { borderColor: '#000', backgroundColor: '#000' }
                ]}
              >
                <View style={[
                  styles.radioDot,
                  active && { borderColor: brandColor, backgroundColor: brandColor }
                ]}>
                  {active && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' }} />}
                </View>
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={[styles.visibilityLabel, active && { color: '#FFF' }]}>{v.label}</Text>
                  <Text style={{ fontSize: 13, color: active ? '#9CA3AF' : '#6B7280', marginTop: 2 }}>{v.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ESCROW BUDGET INPUT */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Escrow Budget Allocation (₹)</Text>
        <View style={styles.budgetInputContainer}>
          <Text style={styles.budgetCurrencySymbol}>₹</Text>
          <TextInput
            style={styles.budgetInput}
            placeholder="15000"
            placeholderTextColor="#D1D5DB"
            keyboardType="numeric"
            value={budget}
            onChangeText={setBudget}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          onPress={() => {
            if (step === 0) navigation.goBack();
            else prevStep();
          }}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color="#000" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>
            {campaignType === 'ugc' && 'UGC Brief Creator'}
            {campaignType === 'influencer' && 'Influencer Brief Creator'}
            {!campaignType && 'Create New Campaign'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Modern Horizontal Progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { backgroundColor: brandColor, width: `${((step + 1)/5)*100}%` }]} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            padding: 24, 
            paddingBottom: 120, 
            maxWidth: SCREEN_WIDTH > 768 ? 800 : undefined, 
            alignSelf: SCREEN_WIDTH > 768 ? 'center' : undefined, 
            width: '100%' 
          }}
        >
          {step === 0 && renderStep0()}
          {step === 1 && renderStep1()}
          {step === 2 && (campaignType === 'ugc' ? renderUgcStep2() : renderInfluencerStep2())}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Navigation Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {step > 0 && (
          <TouchableOpacity 
            onPress={prevStep}
            disabled={isSaving}
            style={styles.prevBtn}
          >
            <ChevronLeft size={20} color="#000" />
            <Text style={{ color: '#000', fontWeight: '900', marginLeft: 6 }}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={step === 4 ? handleFinish : nextStep}
          disabled={isSaving}
          style={[styles.nextBtn, { backgroundColor: '#000' }]}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={{ color: '#FFF', fontWeight: '900', marginRight: 6 }}>
                {step === 0 ? 'Select & Continue' : step === 4 ? 'Find Creators' : 'Next Step'}
              </Text>
              <ChevronRight size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    paddingBottom: 20, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#000' },
  progressBarBg: { height: 4, backgroundColor: '#F3F4F6', flexDirection: 'row' },
  progressBarFill: { height: '100%' },
  stepHeader: { marginBottom: 32 },
  stepTitle: { fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  stepSubtitle: { fontSize: 15, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  inputContainer: { marginBottom: 24 },
  inputLabel: { fontSize: 12, fontWeight: '900', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    fontWeight: '600',
    color: '#000'
  },
  dropdownContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    gap: 8,
    backgroundColor: '#FFF',
  },
  dropdownItemText: { fontSize: 14, color: '#4B5563', fontWeight: '700' },
  aiToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1.5,
  },
  aiIconBadge: { padding: 8, borderRadius: 10 },
  aiCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  aiTextarea: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#000',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  aiSubmitBtn: {
    backgroundColor: '#000',
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16
  },
  errorText: { color: '#B91C1C', fontSize: 13, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  loadingBox: {
    marginBottom: 32,
    padding: 18,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center'
  },
  platformBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF'
  },
  platformText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepperBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  stepperBtnText: { fontSize: 20, fontWeight: '900', color: '#000' },
  stepperValue: { fontSize: 20, fontWeight: '900', color: '#000', minWidth: 20, textAlign: 'center' },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  switchLabel: { fontSize: 15, fontWeight: '800', color: '#111827' },
  visibilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  radioDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visibilityLabel: { fontSize: 16, fontWeight: '800', color: '#000' },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 72,
    borderWidth: 1.5,
    borderColor: '#F3F4F6'
  },
  budgetCurrencySymbol: { fontSize: 24, fontWeight: '900', color: '#000', marginRight: 10 },
  budgetInput: { flex: 1, fontSize: 28, fontWeight: '900', color: '#000' },
  footer: {
    paddingTop: 20, 
    paddingHorizontal: 24, 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFF',
    flexDirection: 'row'
  },
  prevBtn: {
    height: 60,
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  nextBtn: {
    height: 60,
    flex: 2,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  forkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3
  },
  forkIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  forkTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000'
  },
  forkSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 4
  },
  forkTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: 'flex-start'
  },
  forkTagText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '800'
  },
  suggestionBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    padding: 16,
    borderRadius: 20,
    marginTop: 12
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#15803D',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '700',
    marginTop: 4,
    lineHeight: 18
  }
});

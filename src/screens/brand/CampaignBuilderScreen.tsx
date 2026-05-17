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
import { useNavigation, useRoute } from '@react-navigation/native';
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
  Link2
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

  const [step, setStep] = useState(1);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // STEP 1 State: Objectives & Audience
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('Brand Awareness');
  const [audience, setAudience] = useState('');

  // STEP 2 State: Deliverables
  const [platforms, setPlatforms] = useState<string[]>(['Instagram']);
  const [format, setFormat] = useState('Reel');
  const [quantity, setQuantity] = useState(1);

  // STEP 3 State: Creative Guardrails
  const [hooks, setHooks] = useState('');
  const [talkingPoints, setTalkingPoints] = useState('');
  const [dos, setDos] = useState('');
  const [donts, setDonts] = useState('');

  // STEP 4 State: Legal & Logistics
  const [usageRights, setUsageRights] = useState('Organic');
  const [ftcCompliance, setFtcCompliance] = useState(true);
  const [draftDeadline, setDraftDeadline] = useState('7 Days');
  const [goLiveDeadline, setGoLiveDeadline] = useState('14 Days');

  // Budget and visibility
  const [budget, setBudget] = useState('5000');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [isSaving, setIsSaving] = useState(false);

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
    // Basic validation
    if (step === 1) {
      if (!title.trim()) {
        Alert.alert('Required', 'Please enter a campaign title.');
        return;
      }
      if (!audience.trim()) {
        Alert.alert('Required', 'Please specify the target audience demographics.');
        return;
      }
    } else if (step === 3) {
      if (!hooks.trim()) {
        Alert.alert('Required', 'Hook instruction is mandatory for creative guardrails.');
        return;
      }
      if (!talkingPoints.trim()) {
        Alert.alert('Required', 'Key talking points are mandatory for creative guardrails.');
        return;
      }
    }

    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleAiFastTrack = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAiLoading(true);
    setAiError(null);
    try {
      const result = await parseCampaignSummary(aiPrompt);
      
      // Auto-fill all 4 steps using extracted structured parameters
      if (result.title) setTitle(result.title);
      if (result.goal) setGoal(result.goal);
      if (result.audience) setAudience(result.audience);
      if (result.platforms && Array.isArray(result.platforms)) setPlatforms(result.platforms);
      if (result.format) setFormat(result.format);
      if (result.quantity) setQuantity(result.quantity);
      if (result.hooks) setHooks(result.hooks);
      if (result.talkingPoints) setTalkingPoints(result.talkingPoints);
      if (result.dos) setDos(result.dos);
      if (result.donts) setDonts(result.donts);
      if (result.usageRights) setUsageRights(result.usageRights);
      if (typeof result.ftcCompliance === 'boolean') setFtcCompliance(result.ftcCompliance);
      if (result.draftDeadline) setDraftDeadline(result.draftDeadline);
      if (result.goLiveDeadline) setGoLiveDeadline(result.goLiveDeadline);

      setShowAiInput(false);
      Alert.alert('AI Prefill Success', 'We populated all steps of the wizard from your summary. Review and adjust below!');
    } catch (err: any) {
      console.error('AI Fast-Track error:', err);
      setAiError(err.message || "AI parsing failed. Please try a simpler sentence.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!budget) {
      Alert.alert('Required', 'Please enter a campaign budget.');
      return;
    }

    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Compile detailed structured parameters into brand_guidelines for perfect layout representation
      const structuredGuidelines = JSON.stringify({
        goal,
        audience,
        platforms,
        format,
        quantity,
        hooks,
        talkingPoints,
        dos,
        donts,
        usageRights,
        ftcCompliance,
        draftDeadline,
        goLiveDeadline
      });

      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          brand_id: user.id,
          title: title,
          brand_guidelines: structuredGuidelines,
          budget: parseInt(budget),
          deliverable_type: `${quantity}x ${format} on ${platforms.join(', ')}`,
          guardrails: [hooks, talkingPoints],
          status: 'draft',
          visibility: visibility,
          vibe: goal
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      navigation.navigate('CreatorSelection', { 
        campaign_id: campaign.id, 
        budget: campaign.budget 
      });

    } catch (err: any) {
      console.error('Error saving campaign:', err);
      Alert.alert('Save Failed', err.message || 'Could not save your campaign. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderAiFastTrack = () => (
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
        placeholder="Type 2 sentences, e.g., 'We want to promote our skincare mist on Instagram with soothing GRWM Reels. Target audience is busy moms.'"
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
  );

  const renderStep1 = () => (
    <View>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Objectives &amp; Audience</Text>
        <Text style={styles.stepSubtitle}>Define your strategy and targets for this campaign.</Text>
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
            <Text style={{ color: '#000', fontWeight: '900', fontSize: 15 }}>AI Fast-Track Entry</Text>
            <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>Describe in 2 sentences to prefill all steps.</Text>
          </View>
          <ChevronRight size={20} color={brandColor} />
        </TouchableOpacity>
      ) : renderAiFastTrack()}

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

  const renderStep2 = () => (
    <View>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Content Deliverables</Text>
        <Text style={styles.stepSubtitle}>Identify what content you expect from creators.</Text>
      </View>

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

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Format</Text>
        <View style={styles.dropdownContainer}>
          {['Reel', 'Short', 'Video', 'Story'].map((f) => (
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

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Exact Quantity</Text>
        <View style={styles.stepperContainer}>
          <TouchableOpacity 
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{quantity}</Text>
          <TouchableOpacity 
            onPress={() => setQuantity(quantity + 1)}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Creative Guardrails</Text>
        <Text style={styles.stepSubtitle}>Provide creative focus areas (mandatory fields).</Text>
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

  const renderStep4 = () => (
    <View>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Legal &amp; Logistics</Text>
        <Text style={styles.stepSubtitle}>Establish rules and calendar goals.</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Usage Rights</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {['Organic', 'Paid Ads'].map((u) => (
            <TouchableOpacity
              key={u}
              onPress={() => setUsageRights(u)}
              style={[
                styles.dropdownItem,
                { flex: 1 },
                usageRights === u && { backgroundColor: brandColor + '10', borderColor: brandColor }
              ]}
            >
              <Shield size={16} color={usageRights === u ? brandColor : '#6B7280'} />
              <Text style={[styles.dropdownItemText, usageRights === u && { color: brandColor, fontWeight: '800' }]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.switchContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchLabel}>FTC Compliance Badge Required</Text>
          <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Auto-attaches #ad disclosure tag inside workspace.</Text>
        </View>
        <Switch
          value={ftcCompliance}
          onValueChange={setFtcCompliance}
          trackColor={{ false: '#D1D5DB', true: brandColor }}
          thumbColor="#FFF"
        />
      </View>

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

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Total Budget (₹)</Text>
        <View style={styles.budgetInputContainer}>
          <Text style={styles.budgetCurrencySymbol}>₹</Text>
          <TextInput
            style={styles.budgetInput}
            placeholder="5000"
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
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color="#000" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Campaign Builder</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Modern Horizontal Progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { backgroundColor: brandColor, width: `${(step/4)*100}%` }]} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24, paddingBottom: 120, maxWidth: SCREEN_WIDTH > 768 ? 800 : undefined, alignSelf: SCREEN_WIDTH > 768 ? 'center' : undefined, width: '100%' }}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Navigation Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {step > 1 && (
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
                {step === 4 ? 'Find Creators' : 'Next Step'}
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
  }
});

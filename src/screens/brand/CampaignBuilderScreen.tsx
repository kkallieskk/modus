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
  ArrowLeft
} from 'lucide-react-native';
import { generateCampaignBrief } from '@/services/aiService';
import { useProfile } from '@/lib/ProfileContext';
import { supabase } from '@/lib/supabase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  // Form State
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [budget, setBudget] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [isSaving, setIsSaving] = useState(false);

  // Typing effect state
  const [isTyping, setIsTyping] = useState(false);

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleAiDraft = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAiLoading(true);
    setAiError(null);
    try {
      const result = await generateCampaignBrief(aiPrompt);
      
      if (result.title) setTitle(result.title);
      
      if (result.deliverables && Array.isArray(result.deliverables)) {
        setDeliverables(result.deliverables.map((d: string) => `• ${d}`).join('\n'));
      } else if (result.deliverables) {
        setDeliverables(result.deliverables);
      }

      // If we have guardrails, append them to the brief for now since there's no separate DB column
      if (result.guardrails && Array.isArray(result.guardrails) && result.brief) {
        const guardrailsText = "\n\nGuardrails:\n" + result.guardrails.map((g: string) => `• ${g}`).join('\n');
        // We set the typing effect for the whole thing
        const fullText = result.brief + guardrailsText;
        startTypingEffect(fullText);
      } else if (result.brief) {
        startTypingEffect(result.brief);
      }
      
      setShowAiInput(false);
    } catch (err: any) {
      console.error('AI generation error:', err);
      setAiError(err.message || "AI service encountered an issue. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const startTypingEffect = (fullText: string) => {
    setIsTyping(true);
    let currentText = '';
    const words = fullText.split(' ');
    
    let wordIndex = 0;
    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        setBrief(currentText);
        wordIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
  };

  const handleFinish = async () => {
    if (!title || !budget) {
      nextStep();
      return;
    }

    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          brand_id: user.id,
          title: title,
          brand_guidelines: brief,
          budget: parseInt(budget),
          deliverable_type: deliverables,
          guardrails: [], // Will be updated if we add specific guardrail input
          status: 'draft',
          visibility: visibility
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

  const renderStep1 = () => (
    <View>
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -0.5 }}>The Vision</Text>
        <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 4 }}>Define the strategy for your campaign.</Text>
      </View>
      
      {!showAiInput ? (
        <TouchableOpacity 
          onPress={() => setShowAiInput(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: brandColor + '10',
            padding: 20,
            borderRadius: 24,
            marginBottom: 32,
            borderWidth: 2,
            borderColor: brandColor + '20',
          }}
        >
          <View style={{ backgroundColor: brandColor, padding: 10, borderRadius: 12 }}>
            <Sparkles size={20} color="white" />
          </View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={{ color: '#000', fontWeight: '900', fontSize: 16 }}>Draft Strategy with AI</Text>
            <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>Describe your goals and let AI generate your brief & rules.</Text>
          </View>
          <ChevronRight size={20} color={brandColor} />
        </TouchableOpacity>
      ) : (
        <View style={{
          backgroundColor: '#FFF',
          padding: 20,
          borderRadius: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: brandColor + '40',
          shadowColor: brandColor,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Wand2 size={18} color={brandColor} />
              <Text style={{ fontWeight: '900', marginLeft: 10, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, color: brandColor }}>AI Campaign Drafter</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAiInput(false)}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 16,
              padding: 16,
              fontSize: 16,
              color: '#000',
              minHeight: 100,
              textAlignVertical: 'top',
              borderWidth: 1,
              borderColor: '#F3F4F6'
            }}
            placeholder="Describe your goals..."
            placeholderTextColor="#9CA3AF"
            value={aiPrompt}
            onChangeText={(val) => {
              setAiPrompt(val);
              if (aiError) setAiError(null);
            }}
            multiline
            autoFocus
          />

          {aiError && (
            <Text style={{ color: '#B91C1C', fontSize: 13, fontWeight: '700', marginTop: 12, textAlign: 'center' }}>{aiError}</Text>
          )}
          
          <TouchableOpacity 
            onPress={handleAiDraft}
            disabled={isAiLoading || isTyping}
            style={{
              backgroundColor: '#000',
              flexDirection: 'row',
              height: 56,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 16,
              opacity: isAiLoading || isTyping ? 0.7 : 1
            }}
          >
            <Brain size={20} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '900', marginLeft: 10, fontSize: 16 }}>Generate Strategy</Text>
          </TouchableOpacity>
        </View>
      )}

      {isAiLoading && (
        <View style={{ marginBottom: 32, padding: 20, backgroundColor: '#F9FAFB', borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <ActivityIndicator size="small" color={brandColor} />
            <Text style={{ fontSize: 15, fontWeight: '800', color: brandColor, marginLeft: 10 }}>AI is drafting your strategy...</Text>
          </View>
          <ShimmerSkeleton />
        </View>
      )}
      
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 12, fontWeight: '900', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Campaign Title</Text>
        <TextInput
          style={{
            backgroundColor: '#FFF',
            borderWidth: 1.5,
            borderColor: '#F3F4F6',
            borderRadius: 18,
            padding: 18,
            fontSize: 16,
            fontWeight: '600',
            color: '#000'
          }}
          placeholder="e.g. Coffee Launch"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 12, fontWeight: '900', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>The Brief</Text>
        <TextInput
          style={{
            backgroundColor: '#FFF',
            borderWidth: 1.5,
            borderColor: '#F3F4F6',
            borderRadius: 18,
            padding: 18,
            fontSize: 16,
            lineHeight: 24,
            color: '#000',
            minHeight: 200,
            textAlignVertical: 'top'
          }}
          placeholder=" ओवर आर्किंग स्टोरी, वाइब और गोल्स बताएं..."
          multiline
          value={brief}
          onChangeText={setBrief}
          scrollEnabled={false}
        />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <View style={{ 
        paddingTop: insets.top + 10, 
        paddingBottom: 20, 
        paddingHorizontal: 20, 
        flexDirection: 'row', 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
      }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={22} color="#000" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#000' }}>Campaign Builder</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ height: 4, backgroundColor: '#F3F4F6', flexDirection: 'row' }}>
        <View style={{ height: '100%', backgroundColor: brandColor, width: `${(step/3)*100}%` }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        >
          {step === 1 && renderStep1()}
          
          {step === 2 && (
            <View>
              <View style={{ marginBottom: 32 }}>
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -0.5 }}>Deliverables</Text>
                <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 4 }}>What exactly do you need from the creators?</Text>
              </View>
              
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Required Content</Text>
              <TextInput
                style={{
                  backgroundColor: '#FFF',
                  borderWidth: 1.5,
                  borderColor: '#F3F4F6',
                  borderRadius: 18,
                  padding: 18,
                  fontSize: 16,
                  color: '#000',
                  minHeight: 180,
                  textAlignVertical: 'top'
                }}
                placeholder="e.g. 2x Instagram Reels..."
                multiline
                value={deliverables}
                onChangeText={setDeliverables}
              />
            </View>
          )}

          {step === 3 && (
            <View>
              <View style={{ marginBottom: 32 }}>
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -0.5 }}>Investment & Visibility</Text>
                <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 4 }}>Finalize your budget and choose how creators find you.</Text>
              </View>
              
              <View style={{ marginBottom: 32 }}>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 }}>Campaign Visibility</Text>
                <View style={{ gap: 12 }}>
                  <TouchableOpacity 
                    onPress={() => setVisibility('private')}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: visibility === 'private' ? '#000' : '#FFF',
                      padding: 20,
                      borderRadius: 24,
                      borderWidth: 1.5,
                      borderColor: visibility === 'private' ? '#000' : '#F3F4F6',
                    }}
                  >
                    <View style={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: 12, 
                      borderWidth: 2, 
                      borderColor: visibility === 'private' ? brandColor : '#D1D5DB',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: visibility === 'private' ? brandColor : 'transparent'
                    }}>
                      {visibility === 'private' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'white' }} />}
                    </View>
                    <View style={{ marginLeft: 16, flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: visibility === 'private' ? '#FFF' : '#000' }}>Private Campaign</Text>
                      <Text style={{ fontSize: 13, color: visibility === 'private' ? '#9CA3AF' : '#6B7280', marginTop: 2 }}>Only creators you explicitly invite can see and participate.</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setVisibility('public')}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: visibility === 'public' ? '#000' : '#FFF',
                      padding: 20,
                      borderRadius: 24,
                      borderWidth: 1.5,
                      borderColor: visibility === 'public' ? '#000' : '#F3F4F6',
                    }}
                  >
                    <View style={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: 12, 
                      borderWidth: 2, 
                      borderColor: visibility === 'public' ? brandColor : '#D1D5DB',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: visibility === 'public' ? brandColor : 'transparent'
                    }}>
                      {visibility === 'public' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'white' }} />}
                    </View>
                    <View style={{ marginLeft: 16, flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: visibility === 'public' ? '#FFF' : '#000' }}>Public Casting Call</Text>
                      <Text style={{ fontSize: 13, color: visibility === 'public' ? '#9CA3AF' : '#6B7280', marginTop: 2 }}>Publish to the marketplace for any creator to apply.</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={{ fontSize: 12, fontWeight: '900', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Total Budget (₹)</Text>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: '#F9FAFB', 
                borderRadius: 20, 
                paddingHorizontal: 20, 
                height: 72,
                borderWidth: 1.5,
                borderColor: '#F3F4F6'
              }}>
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#000', marginRight: 10 }}>₹</Text>
                <TextInput
                  style={{ flex: 1, fontSize: 28, fontWeight: '900', color: '#000' }}
                  placeholder="0"
                  placeholderTextColor="#D1D5DB"
                  keyboardType="numeric"
                  value={budget}
                  onChangeText={setBudget}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Persistent Bottom Actions */}
      <View style={{ 
        paddingBottom: insets.bottom + 20, 
        paddingTop: 20, 
        paddingHorizontal: 24, 
        borderTopWidth: 1, 
        borderTopColor: '#F3F4F6',
        backgroundColor: '#FFF',
        flexDirection: 'row'
      }}>
        {step > 1 && (
          <TouchableOpacity 
            onPress={prevStep}
            disabled={isSaving}
            style={{
              height: 60,
              flex: 1,
              backgroundColor: '#F3F4F6',
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              opacity: isSaving ? 0.5 : 1
            }}
          >
            <ChevronLeft size={20} color="#000" />
            <Text style={{ color: '#000', fontWeight: '900', marginLeft: 6 }}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={step === 3 ? handleFinish : nextStep}
          disabled={isSaving}
          style={{
            height: 60,
            flex: 2,
            backgroundColor: '#000',
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={{ color: '#FFF', fontWeight: '900', marginRight: 6 }}>
                {step === 3 ? 'Find Creators' : 'Next Step'}
              </Text>
              <ChevronRight size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

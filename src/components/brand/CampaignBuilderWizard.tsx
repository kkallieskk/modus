import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  BackHandler,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { X, ChevronRight, ChevronLeft, Plus, Trash2, Calendar, DollarSign, Sparkles, Wand2, Brain } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generateCampaignBrief } from '../../services/aiService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ShimmerSkeleton = () => {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ gap: 12, marginTop: 8 }}>
      <Animated.View style={[{ height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, width: '90%', opacity: animatedValue }]} />
      <Animated.View style={[{ height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, width: '100%', opacity: animatedValue }]} />
      <Animated.View style={[{ height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, width: '70%', opacity: animatedValue }]} />
    </View>
  );
};

export const CampaignBuilderWizard = ({ visible, onClose, brandColor }: any) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [shouldRender, setShouldRender] = useState(visible);
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Form State
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [deliverables, setDeliverables] = useState(['']);
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [mustMentions, setMustMentions] = useState('');
  const [restrictedWords, setRestrictedWords] = useState('');

  // AI Drafting State
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [typedBrief, setTypedBrief] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Sync visible prop with animation
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setStep(1);
      
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: SCREEN_HEIGHT * 0.1,
          useNativeDriver: true,
          tension: 50,
          friction: 8
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible]);

  // Android Back Button Intercept
  useEffect(() => {
    const backAction = () => {
      if (visible) {
        if (step > 1) {
          setStep(prev => prev - 1);
          return true;
        } else {
          handleClose();
          return true;
        }
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [visible, step]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      setShouldRender(false);
      onClose();
    });
  }, [onClose]);

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const addDeliverable = () => setDeliverables([...deliverables, '']);
  const updateDeliverable = (val: string, index: number) => {
    const newD = [...deliverables];
    newD[index] = val;
    setDeliverables(newD);
  };
  const removeDeliverable = (index: number) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter((_, i) => i !== index));
    }
  };

  const simulateStreaming = async (fullText: string) => {
    setIsTyping(true);
    setTypedBrief('');
    const words = fullText.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i];
      setTypedBrief(currentText);
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    setIsTyping(false);
    setBrief(fullText);
  };

  const handleAiDraft = async () => {
    setAiError(null);
    if (!aiPrompt.trim()) {
      setAiError('Please describe your campaign first.');
      return;
    }

    setIsAiLoading(true);
    setTypedBrief('');
    try {
      const data = await generateCampaignBrief(aiPrompt);
      
      // Instantly set metadata
      setTitle(data.title);
      if (data.deliverables) setDeliverables(data.deliverables);
      if (data.guardrails) setGuidelines(data.guardrails.join('\n'));

      // Start the "typing" effect for the brief
      setIsAiLoading(false); // Stop shimmering
      await simulateStreaming(data.brief);

      setShowAiInput(false);
      setAiPrompt('');
    } catch (error: any) {
      const errorMsg = error.message || 'AI network is congested. Please try again.';
      setAiError(errorMsg);
      setIsAiLoading(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          { 
            backgroundColor: 'rgba(0,0,0,0.2)', // Much lighter, premium feel
            opacity: backdropOpacity 
          }
        ]} 
      >
        <TouchableOpacity activeOpacity={1} onPress={handleClose} style={{ flex: 1 }} />
      </Animated.View>
      
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#000', letterSpacing: -0.5 }}>Create Campaign</Text>
            <TouchableOpacity 
              onPress={handleClose} 
              disabled={isAiLoading || isTyping}
              style={{ padding: 4 }}
            >
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
            {[1, 2, 3].map((s) => (
              <View 
                key={s} 
                style={{ 
                  width: step === s ? 36 : 12, 
                  height: 6, 
                  borderRadius: 3, 
                  backgroundColor: step === s ? brandColor : '#F3F4F6',
                  marginHorizontal: 3,
                }} 
              />
            ))}
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {step === 1 && (
                <View>
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>The Vision</Text>
                    <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Define the strategy for your campaign.</Text>
                  </View>
                  
                  {!showAiInput ? (
                    <TouchableOpacity 
                      onPress={() => setShowAiInput(true)}
                      style={styles.aiButton}
                    >
                      <Sparkles size={18} color={brandColor} />
                      <Text style={{ color: '#000', fontWeight: '700', marginLeft: 8 }}>Draft Strategy with AI</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.aiContainer}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Wand2 size={16} color={brandColor} />
                          <Text style={{ fontWeight: '800', marginLeft: 8, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>AI Campaign Drafter</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowAiInput(false)}>
                          <X size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>
                      
                      <TextInput
                        style={[styles.input, styles.aiInput]}
                        placeholder="Describe your campaign goals..."
                        placeholderTextColor="#9CA3AF"
                        value={aiPrompt}
                        onChangeText={(val) => {
                          setAiPrompt(val);
                          if (aiError) setAiError(null);
                        }}
                        multiline
                        numberOfLines={3}
                        autoFocus
                      />

                      {aiError && (
                        <View style={styles.errorContainer}>
                          <Text style={styles.errorText}>{aiError}</Text>
                        </View>
                      )}
                      
                      <TouchableOpacity 
                        onPress={handleAiDraft}
                        disabled={isAiLoading || isTyping}
                        style={[styles.generateButton, { opacity: isAiLoading || isTyping ? 0.7 : 1 }]}
                      >
                        <Brain size={18} color="#FFF" />
                        <Text style={{ color: '#FFF', fontWeight: '800', marginLeft: 8 }}>Generate Strategy</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {isAiLoading && (
                    <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#F9FAFB', borderRadius: 16 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: brandColor, marginBottom: 12 }}>AI is analyzing market trends...</Text>
                      <ShimmerSkeleton />
                    </View>
                  )}
                  
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Campaign Title</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Summer Glow Collection 2026"
                      value={title}
                      onChangeText={setTitle}
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>The Brief</Text>
                    <TextInput
                      style={[styles.input, { minHeight: 160, textAlignVertical: 'top' }]}
                      placeholder="Describe the overarching story, vibe, and goals..."
                      multiline
                      value={brief}
                      onChangeText={setBrief}
                      scrollEnabled={false} // Let the parent ScrollView handle it
                    />
                    {isTyping && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -10, marginBottom: 10, paddingLeft: 4 }}>
                        <ActivityIndicator size="small" color={brandColor} />
                        <Text style={{ fontSize: 12, color: brandColor, marginLeft: 8, fontWeight: '700', fontStyle: 'italic' }}>AI is drafting content...</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

            {step === 2 && (
              <View>
                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>The Ask</Text>
                <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>Deliverables and logistics.</Text>

                <Text style={styles.label}>Deliverables</Text>
                {deliverables.map((d, index) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      placeholder="e.g. 1x TikTok, 15-60s"
                      value={d}
                      onChangeText={(v) => updateDeliverable(v, index)}
                    />
                    {deliverables.length > 1 && (
                      <TouchableOpacity onPress={() => removeDeliverable(index)} style={{ marginLeft: 12 }}>
                        <Trash2 size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity 
                  onPress={addDeliverable}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 4 }}
                >
                  <Plus size={18} color={brandColor} />
                  <Text style={{ color: brandColor, fontWeight: '700', marginLeft: 8 }}>Add Deliverable</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.label}>Budget</Text>
                    <View style={styles.inputWithIcon}>
                      <DollarSign size={16} color="#6B7280" />
                      <TextInput
                        style={styles.innerInput}
                        placeholder="500"
                        keyboardType="numeric"
                        value={budget}
                        onChangeText={setBudget}
                      />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Deadline</Text>
                    <View style={styles.inputWithIcon}>
                      <Calendar size={16} color="#6B7280" />
                      <TextInput
                        style={styles.innerInput}
                        placeholder="YYYY-MM-DD"
                        value={deadline}
                        onChangeText={setDeadline}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>The Rulebook</Text>
                <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>Guidelines and guardrails.</Text>

                <Text style={styles.label}>Brand Guidelines</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Link to mood boards, or 'Dos and Don'ts'..."
                  multiline
                  value={guidelines}
                  onChangeText={setGuidelines}
                />

                <Text style={styles.label}>Must Mentions</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mandatory hashtags or phrases..."
                  value={mustMentions}
                  onChangeText={setMustMentions}
                />

                <Text style={styles.label}>Restricted Words</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Competitors to avoid..."
                  value={restrictedWords}
                  onChangeText={setRestrictedWords}
                />
              </View>
            )}
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Fixed Footer Actions */}
          <View style={{ 
            flexDirection: 'row', 
            paddingTop: 16, 
            borderTopWidth: 1, 
            borderTopColor: '#F3F4F6',
            backgroundColor: '#FFF'
          }}>
            {step > 1 && (
              <TouchableOpacity 
                onPress={prevStep}
                style={[styles.button, { backgroundColor: '#F3F4F6', marginRight: 12, flex: 1 }]}
              >
                <ChevronLeft size={20} color="#000" />
                <Text style={{ color: '#000', fontWeight: '800', marginLeft: 4 }}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={step === 3 ? handleClose : nextStep}
              style={[styles.button, { backgroundColor: '#000', flex: 2 }]}
            >
              <Text style={{ color: 'white', fontWeight: '800', marginRight: 4 }}>
                {step === 3 ? 'Finish Brief' : 'Next Step'}
              </Text>
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.9,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 25
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  innerInput: {
    flex: 1,
    padding: 16,
    fontSize: 16
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  aiButton: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F3F4F6', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed'
  },
  aiContainer: {
    backgroundColor: '#F9FAFB', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 24, 
    borderWidth: 1, 
    borderColor: '#E5E7EB'
  },
  generateButton: {
    backgroundColor: '#000', 
    paddingVertical: 14, 
    borderRadius: 14, 
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  aiDraftBox: {
    marginBottom: 24, 
    backgroundColor: '#F0F9FF', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#BAE6FD'
  },
  aiDraftLabel: {
    fontSize: 12, 
    fontWeight: '800', 
    color: '#0369A1', 
    marginLeft: 6, 
    textTransform: 'uppercase'
  },
  aiDraftText: {
    fontSize: 15, 
    color: '#0C4A6E', 
    lineHeight: 22
  },
  typingCursor: {
    width: 2, 
    height: 18, 
    backgroundColor: '#0369A1', 
    marginLeft: 2
  },
  aiInput: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: '#1F2937'
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center'
  },
  fieldGroup: {
    marginBottom: 20
  }
});

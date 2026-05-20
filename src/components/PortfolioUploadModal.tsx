import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { Image as ImageIcon, Link, X, Send, Eye, BarChart2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface PortfolioUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const PortfolioUploadModal = ({ visible, onClose, onSubmit }: PortfolioUploadModalProps) => {
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [views, setViews] = useState('');
  const [conversions, setConversions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
      setMediaUrl('');
    }
  };

  const handleUrlChange = (text: string) => {
    setMediaUrl(text);
    if (text.length > 5) {
      setMediaUri(null);
    }
  };

  const handleSubmit = async () => {
    if ((!mediaUri && !mediaUrl) || !brandName.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate backend processing
    setTimeout(() => {
      onSubmit({
        mediaUri,
        mediaUrl,
        brandName,
        description,
        views,
        conversions
      });
      setIsSubmitting(false);
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setMediaUri(null);
    setMediaUrl('');
    setBrandName('');
    setDescription('');
    setViews('');
    setConversions('');
    onClose();
  };

  const isValid = (mediaUri || mediaUrl.length > 5) && brandName.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={resetForm}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation?.()}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Past Work</Text>
              <TouchableOpacity onPress={resetForm} style={styles.closeBtn}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
              
              <Text style={styles.sectionLabel}>1. Media or Link</Text>
              <View style={styles.mediaContainer}>
                {mediaUri ? (
                  <View style={styles.previewContainer}>
                    <img src={mediaUri} style={styles.previewImg} alt="Preview" />
                    <TouchableOpacity style={styles.removeMedia} onPress={() => setMediaUri(null)}>
                      <X size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadBtn} onPress={pickMedia}>
                    <ImageIcon size={24} color="#64748B" />
                    <Text style={styles.uploadBtnText}>Upload Photo/Video</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.urlInputContainer}>
                  <Link size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.urlInput}
                    placeholder="Paste YouTube or Instagram URL..."
                    placeholderTextColor="#9CA3AF"
                    value={mediaUrl}
                    onChangeText={handleUrlChange}
                    {...(Platform.OS === 'web' ? { style: [styles.urlInput, { outlineWidth: 0 } as any] } : {})}
                  />
                </View>
              </View>

              <Text style={styles.sectionLabel}>2. Campaign Details</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Brand Name *</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="e.g., Nike, Spotify"
                  placeholderTextColor="#9CA3AF"
                  value={brandName}
                  onChangeText={setBrandName}
                  {...(Platform.OS === 'web' ? { style: [styles.input, { outlineWidth: 0 } as any] } : {})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g., Promoted the new running shoe line..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  value={description}
                  onChangeText={setDescription}
                  {...(Platform.OS === 'web' ? { style: [styles.input, styles.textArea, { outlineWidth: 0 } as any] } : {})}
                />
              </View>

              <Text style={styles.sectionLabel}>3. Results (Optional)</Text>
              <View style={styles.resultsRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <View style={styles.labelWithIcon}>
                    <Eye size={14} color="#64748B" />
                    <Text style={styles.label}>Total Views</Text>
                  </View>
                  <TextInput 
                    style={styles.input}
                    placeholder="e.g., 125K"
                    placeholderTextColor="#9CA3AF"
                    value={views}
                    onChangeText={setViews}
                    {...(Platform.OS === 'web' ? { style: [styles.input, { outlineWidth: 0 } as any] } : {})}
                  />
                </View>
                <View style={{ width: 16 }} />
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <View style={styles.labelWithIcon}>
                    <BarChart2 size={14} color="#64748B" />
                    <Text style={styles.label}>Conversions</Text>
                  </View>
                  <TextInput 
                    style={styles.input}
                    placeholder="e.g., 2.5K Clicks"
                    placeholderTextColor="#9CA3AF"
                    value={conversions}
                    onChangeText={setConversions}
                    {...(Platform.OS === 'web' ? { style: [styles.input, { outlineWidth: 0 } as any] } : {})}
                  />
                </View>
              </View>

            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
                disabled={!isValid || isSubmitting}
                onPress={handleSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Send size={18} color="#FFF" />
                    <Text style={styles.submitBtnText}>Add to Portfolio</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    flex: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
  },
  form: {
    padding: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    marginTop: 8,
  },
  mediaContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  uploadBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  uploadBtnText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  previewContainer: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeMedia: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  urlInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

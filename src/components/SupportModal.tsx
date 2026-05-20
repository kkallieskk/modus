import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Headphones, X, Send, AlertCircle } from 'lucide-react-native';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SupportModal = ({ visible, onClose }: SupportModalProps) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate backend submission for now
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        setSubject('');
        setMessage('');
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation?.()}>
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <View style={styles.iconBox}>
                  <Headphones size={20} color="#000" />
                </View>
                <Text style={styles.title}>Priority Support</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {isSuccess ? (
              <View style={styles.successState}>
                <View style={styles.successIcon}>
                  <Send size={32} color="#10B981" />
                </View>
                <Text style={styles.successTitle}>Message Sent</Text>
                <Text style={styles.successText}>Our elite support team will get back to you within 24 hours.</Text>
              </View>
            ) : (
              <View style={styles.form}>
                <View style={styles.alertBox}>
                  <AlertCircle size={16} color="#3B82F6" />
                  <Text style={styles.alertText}>Modus Escrow Support is available 24/7 for urgent dispute resolutions.</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Subject</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="E.g., Payment dispute with Brand X"
                    placeholderTextColor="#9CA3AF"
                    value={subject}
                    onChangeText={setSubject}
                    {...(Platform.OS === 'web' ? { style: [styles.input, { outlineWidth: 0 } as any] } : {})}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Message</Text>
                  <TextInput 
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your issue in detail..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    value={message}
                    onChangeText={setMessage}
                    {...(Platform.OS === 'web' ? { style: [styles.input, styles.textArea, { outlineWidth: 0 } as any] } : {})}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, (!subject.trim() || !message.trim()) && styles.submitBtnDisabled]}
                  disabled={!subject.trim() || !message.trim() || isSubmitting}
                  onPress={handleSubmit}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Send Message</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
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
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
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
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
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
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  alertText: {
    flex: 1,
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#0F172A',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
});

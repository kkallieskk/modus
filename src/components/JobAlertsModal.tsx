import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, Pressable, Platform } from 'react-native';
import { X, BellRing, Check, Tag, Video } from 'lucide-react-native';

interface JobAlertsModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const JobAlertsModal = ({ visible, onClose, onSubmit }: JobAlertsModalProps) => {
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const niches = ['Tech & Apps', 'Fashion', 'Finance', 'Lifestyle'];
  const deliverables = ['Reels / Shorts', 'Static Posts', 'Long-Form YouTube', 'UGC Ads'];

  const handleSubmit = () => {
    if (!selectedNiche || !selectedDeliverable) return;
    
    setIsSubmitting(true);
    
    // Simulate backend submission
    setTimeout(() => {
      onSubmit({ niche: selectedNiche, deliverable: selectedDeliverable });
      setIsSubmitting(false);
      resetForm();
    }, 1200);
  };

  const resetForm = () => {
    setSelectedNiche(null);
    setSelectedDeliverable(null);
    onClose();
  };

  const isValid = selectedNiche && selectedDeliverable;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={resetForm}>
        <Pressable style={styles.modalContent} onPress={e => e.stopPropagation?.()}>
          
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconContainer}>
                <BellRing size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.title}>Set up Job Alerts</Text>
            </View>
            <TouchableOpacity onPress={resetForm} style={styles.closeBtn}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.subtitle}>
              We'll notify you the moment a brand posts a campaign that matches your criteria.
            </Text>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Tag size={16} color="#475569" />
                <Text style={styles.sectionTitle}>What's your primary niche?</Text>
              </View>
              <View style={styles.optionsGrid}>
                {niches.map(niche => (
                  <TouchableOpacity
                    key={niche}
                    style={[styles.optionBtn, selectedNiche === niche && styles.optionBtnSelected]}
                    onPress={() => setSelectedNiche(niche)}
                  >
                    {selectedNiche === niche && <Check size={14} color="#8B5CF6" style={styles.checkIcon} />}
                    <Text style={[styles.optionText, selectedNiche === niche && styles.optionTextSelected]}>
                      {niche}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Video size={16} color="#475569" />
                <Text style={styles.sectionTitle}>What do you shoot best?</Text>
              </View>
              <View style={styles.optionsGrid}>
                {deliverables.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.optionBtn, selectedDeliverable === item && styles.optionBtnSelected]}
                    onPress={() => setSelectedDeliverable(item)}
                  >
                    {selectedDeliverable === item && <Check size={14} color="#8B5CF6" style={styles.checkIcon} />}
                    <Text style={[styles.optionText, selectedDeliverable === item && styles.optionTextSelected]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
              disabled={!isValid || isSubmitting}
              onPress={handleSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Turn On Alerts</Text>
              )}
            </TouchableOpacity>
          </View>

        </Pressable>
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
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 450,
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
    paddingBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },
  optionBtnSelected: {
    backgroundColor: '#F5F3FF',
    borderColor: '#8B5CF6',
  },
  checkIcon: {
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  optionTextSelected: {
    color: '#6D28D9',
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  submitBtn: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

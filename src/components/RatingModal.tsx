import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Star, X, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  offerId: string;
  reviewerId: string;
  revieweeId: string;
  role: 'brand' | 'influencer';
  campaignTitle: string;
  onSuccess?: () => void;
}

export const RatingModal = ({ 
  visible, 
  onClose, 
  offerId, 
  reviewerId, 
  revieweeId, 
  role,
  campaignTitle,
  onSuccess 
}: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const brandTags = ['Followed Brief', 'High Quality', 'Fast Communicator', 'Creative', 'Professional'];
  const creatorTags = ['Clear Instructions', 'Fair Expectations', 'Fast Approvals', 'Polite', 'Great Pay'];

  const tags = role === 'brand' ? brandTags : creatorTags;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Selection Required', 'Please select a star rating.');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('collab_reviews')
        .insert({
          offer_id: offerId,
          reviewer_id: reviewerId,
          reviewee_id: revieweeId,
          rating,
          tags: selectedTags,
          comment: comment.trim() || null
        });

      if (error) throw error;
      
      if (onSuccess) onSuccess();
      onClose();
      Alert.alert('Thank You', 'Your feedback helps maintain platform trust.');
    } catch (err: any) {
      console.error('Rating error:', err);
      Alert.alert('Error', 'Failed to submit review. It might already exist or the table is missing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.headerTitle}>Rate Collaboration</Text>
            <Text style={styles.headerSubtitle}>{campaignTitle}</Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                  <Star 
                    size={40} 
                    color={star <= rating ? '#F59E0B' : '#E5E7EB'} 
                    fill={star <= rating ? '#F59E0B' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Select Feedback Tags</Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity 
                    key={tag} 
                    onPress={() => toggleTag(tag)}
                    style={[styles.tag, isSelected && styles.tagSelected]}
                  >
                    <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{tag}</Text>
                    {isSelected && <Check size={12} color="#FFF" style={{ marginLeft: 4 }} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Optional Comments</Text>
            <TextInput
              style={styles.input}
              placeholder="What was it like working together?"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
            />

            <TouchableOpacity 
              style={[styles.submitBtn, (rating === 0 || submitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={rating === 0 || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Feedback</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    maxHeight: '90%',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 32,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  starBtn: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tagSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  tagTextSelected: {
    color: '#FFF',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    fontSize: 15,
    color: '#000',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 32,
    height: 100,
  },
  submitBtn: {
    backgroundColor: '#000',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

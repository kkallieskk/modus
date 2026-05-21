import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Clock, Video, Building2, MapPin, Users, CheckCircle2 } from 'lucide-react-native';

export interface CampaignData {
  id: string;
  brandName: string;
  title: string;
  deliverables: string;
  requirements: string[];
  compensationType: 'paid' | 'barter';
  payoutAmount?: number;
  barterValue?: number;
  timeLeftDays: number;
  hasApplied?: boolean;
}

interface CampaignCardProps {
  campaign: CampaignData;
  onPress: (campaign: CampaignData) => void;
}

export const CampaignCard = ({ campaign, onPress }: CampaignCardProps) => {
  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.brandInfo}>
          <View style={styles.brandLogo}>
            <Building2 size={14} color="#64748B" />
          </View>
          <Text style={styles.brandName}>{campaign.brandName}</Text>
        </View>
        <View style={styles.timeLeftBadge}>
          <Clock size={12} color="#D97706" />
          <Text style={styles.timeLeftText}>Closes in {campaign.timeLeftDays} days</Text>
        </View>
      </View>

      {/* TITLE */}
      <Text style={styles.title} numberOfLines={2}>{campaign.title}</Text>

      {/* DELIVERABLES */}
      <View style={styles.deliverablesBox}>
        <Video size={16} color="#4F46E5" />
        <Text style={styles.deliverablesText}>{campaign.deliverables}</Text>
      </View>

      {/* REQUIREMENTS */}
      <View style={styles.requirementsRow}>
        {campaign.requirements.map((req, index) => (
          <View key={index} style={styles.reqTag}>
            <Text style={styles.reqTagText}>{req}</Text>
          </View>
        ))}
      </View>

      {/* FOOTER */}
      <View style={styles.footerRow}>
        <View style={styles.compensationBox}>
          {campaign.compensationType === 'paid' ? (
            <Text style={styles.payoutText}>₹{campaign.payoutAmount?.toLocaleString()}</Text>
          ) : (
            <Text style={styles.payoutTextBarter}>Barter: ₹{campaign.barterValue?.toLocaleString()} Value</Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.actionBtn, campaign.hasApplied && styles.actionBtnApplied]}
          onPress={() => onPress(campaign)}
          disabled={campaign.hasApplied}
        >
          {campaign.hasApplied ? (
            <>
              <CheckCircle2 size={14} color="#9CA3AF" />
              <Text style={styles.actionBtnTextApplied}>Applied</Text>
            </>
          ) : (
            <Text style={styles.actionBtnText}>View Brief</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      }
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  timeLeftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  timeLeftText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 16,
  },
  deliverablesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  deliverablesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  requirementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  reqTag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reqTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  compensationBox: {
    flex: 1,
  },
  payoutText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  payoutTextBarter: {
    fontSize: 15,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  actionBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnApplied: {
    backgroundColor: '#F1F5F9',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnTextApplied: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
  },
});

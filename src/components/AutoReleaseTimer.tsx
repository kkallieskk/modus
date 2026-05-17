import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Clock, ShieldCheck, Info } from 'lucide-react-native';

interface AutoReleaseTimerProps {
  submittedAt: string;
  status: string;
}

export const AutoReleaseTimer: React.FC<AutoReleaseTimerProps> = ({ submittedAt, status }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (status !== 'pending_review' || !submittedAt) {
      setTimeLeft('');
      return;
    }

    const calculateTime = () => {
      const submissionDate = new Date(submittedAt);
      const releaseDate = new Date(submissionDate.getTime() + 72 * 60 * 60 * 1000); // 72 hours
      const now = new Date();
      const diff = releaseDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [submittedAt, status]);

  if (status !== 'pending_review' || !submittedAt) return null;

  return (
    <View style={styles.container}>
      <View style={styles.timerRow}>
        <View style={styles.clockIconContainer}>
          <Clock size={20} color="#EA580C" />
        </View>
        <View>
          <Text style={styles.timerLabel}>Auto-Release Countdown</Text>
          <Text style={[styles.timeText, isExpired && styles.expiredText]}>
            {timeLeft || 'Calculating...'}
          </Text>
        </View>
        <View style={styles.protectionBadge}>
          <ShieldCheck size={14} color="#059669" />
          <Text style={styles.protectionText}>Anti-Ghosting Protected</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <Info size={14} color="#9CA3AF" />
        <Text style={styles.infoText}>
          If the brand does not review this submission before the timer ends, funds will automatically be released to the creator's wallet.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF7ED',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: 20,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  clockIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9A3412',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timeText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  expiredText: {
    color: '#059669',
  },
  protectionBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  protectionText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#059669',
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
    paddingTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#9A3412',
    lineHeight: 16,
    fontWeight: '600',
  },
});
